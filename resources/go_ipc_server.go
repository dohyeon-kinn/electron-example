package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"time"
)

// Event 구조체: Node.js로 보낼 모든 데이터의 기본 형식
type Event struct {
	Type      string `json:"type"`      // status, ping, pong
	Command   string `json:"command"`   // 명령 이름 (response 시 사용)
	Message   string `json:"message"`   // 데이터 내용
	Timestamp string `json:"timestamp"`
}

// 1. 상태 스트리밍 고루틴 (백그라운드 이벤트 리스너)
func startStatusStream() {
	i := 0
	// 3초마다 스트리밍 이벤트를 Node.js로 보냅니다.
	for {
		i++
		event := Event{
			Type:      "status",
			Message:   fmt.Sprintf("Go IPC Server is running #%d", i),
			Timestamp: time.Now().Format("2006/01/02 15:04:05"),
		}
		sendEvent(event)
		time.Sleep(3 * time.Second)
	}
}

// 2. 명령 리스너 고루틴 (Node.js의 Stdin 명령 처리)
func startCommandListener() {
	scanner := bufio.NewScanner(os.Stdin)
	
	for scanner.Scan() {
		command := scanner.Text() // Node.js가 보낸 명령어를 한 줄 읽어옴
		
		// 명령 처리 및 응답 이벤트 생성
		response := handleCommand(command)
		sendEvent(response)
	}
}

// 3. 명령어 처리 및 응답 생성
func handleCommand(command string) Event {
	event := Event{
		Type:      "response",
		Command:   command,
		Timestamp: time.Now().Format("2006/01/02 15:04:05"),
	}

	switch command {
		case "ping":
			event.Type = "pong"
			event.Message = "pong from go"
		default:
			event.Message = "unknown command"
	}
	return event
}

// 4. 이벤트 전송 함수 (JSON 출력)
func sendEvent(event Event) {
	jsonBytes, err := json.Marshal(event)
	if err != nil {
		fmt.Fprintf(os.Stderr, "JSON 인코딩 오류: %v\n", err)
		return
	}
	// Node.js가 읽을 수 있도록 표준 출력(stdout)으로 한 줄 출력
	fmt.Println(string(jsonBytes))
}

func main() {
	// 1. 상태 스트리밍 시작 (백그라운드)
	go startStatusStream()
	
	// 2. 명령 리스너 시작 (메인 고루틴 유지)
	startCommandListener()
}

// 빌드 명령어 (macOS/Linux): go build -o go_ipc_server go_ipc_server.go