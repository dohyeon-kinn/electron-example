declare global {
  interface Window {
    goApi: {
      ping: () => void;
      pongEventListener: (callback: (event: object) => void) => () => void;
      statusEventListener: (callback: (event: object) => void) => () => void;
    };
  }
}

export {};
