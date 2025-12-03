package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"sync"
	"time"
)

// Event 구조체: Node.js로 보낼 데이터 포맷
type Event struct {
	Type      string `json:"type"`      // "status"
	Command   string `json:"command"`   // vpn_on, vpn_off, vpn_status
	Status    bool   `json:"status"`    // true / false (boolean)
	Timestamp string `json:"timestamp"` // YYYY/MM/DD HH:MM:SS
}

// VPN 상태를 관리하는 전역 변수 (시뮬레이션용)
var (
	vpnEnabled bool
	vpnMu      sync.RWMutex
)

func setVPN(enabled bool) {
	vpnMu.Lock()
	defer vpnMu.Unlock()
	vpnEnabled = enabled
}

func getVPN() bool {
	vpnMu.RLock()
	defer vpnMu.RUnlock()
	return vpnEnabled
}

// 공통으로 status Event 만드는 헬퍼
func makeStatusEvent(command string) *Event {
	return &Event{
		Type:      "status",
		Command:   command,
		Status:    getVPN(), // boolean 값으로 저장
		Timestamp: time.Now().Format("2006/01/02 15:04:05"),
	}
}

// 1. 상태 스트리밍 고루틴
// 3초마다 현재 VPN 상태를 보내줌
func startStatusStream() {
	for {
		event := makeStatusEvent("vpn_status")
		sendEvent(event)

		time.Sleep(3 * time.Second)
	}
}

// 2. 명령 리스너 (Node.js stdin 명령 처리)
func startCommandListener() {
	scanner := bufio.NewScanner(os.Stdin)

	for scanner.Scan() {
		command := scanner.Text() // Node.js가 보낸 명령어 한 줄 읽기

		if response := handleCommand(command); response != nil {
			sendEvent(response)
		}
	}

	if err := scanner.Err(); err != nil {
		fmt.Fprintf(os.Stderr, "stdin 읽기 오류: %v\n", err)
	}
}

// 3. 명령어 처리 및 응답 생성
func handleCommand(command string) *Event {
	switch command {
	case "vpn_on":
		setVPN(true)
		return makeStatusEvent("vpn_on")

	case "vpn_off":
		setVPN(false)
		return makeStatusEvent("vpn_off")

	case "vpn_status":
		return makeStatusEvent("vpn_status")

	default:
		// default는 아무 이벤트도 보내지 않음
		return nil
	}
}

// 4. 이벤트 전송 함수 (JSON 출력)
func sendEvent(event *Event) {
	jsonBytes, err := json.Marshal(event)
	if err != nil {
		fmt.Fprintf(os.Stderr, "JSON 인코딩 오류: %v\n", err)
		return
	}
	fmt.Println(string(jsonBytes))
}

func main() {
	// 초기 상태: VPN 꺼짐(false)
	setVPN(false)

	// 1. 상태 스트리밍 시작
	go startStatusStream()

	// 2. 명령 리스너 시작
	startCommandListener()
}



// 빌드 명령어 (macOS/Linux): go build -o go_ipc_server go_ipc_server.go
