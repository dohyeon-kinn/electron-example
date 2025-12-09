import { RpcResponse, VPNStatus } from '@/main/rpc';

declare global {
  interface Window {
    goApi: {
      vpnOn: () => Promise<RpcResponse<VPNStatus>>;
      vpnOff: () => Promise<RpcResponse<VPNStatus>>;
      vpnStatusNotificationListener: (callback: (notification: VPNStatus) => void) => () => void;
    };
  }
}
