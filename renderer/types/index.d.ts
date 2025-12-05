declare global {
  interface Window {
    goApi: {
      vpnOn: () => void;
      vpnOff: () => void;
      vpnStatusEventListener: (callback: (event: VPNStatusEvent) => void) => () => void;
    };
  }
}

type VPNStatusEvent = {
  type: 'vpn_status';
  command: 'vpn_on' | 'vpn_off' | 'vpn_status';
  status: boolean;
  timestamp: number;
};

export {};
