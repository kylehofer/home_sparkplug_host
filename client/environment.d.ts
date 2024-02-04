declare global {
  namespace NodeJS {
    interface ProcessEnv {
      WEBSOCKET_PORT: number;
      NODE_ENV: 'development' | 'production';
      SPARKPLUG_HOST: string;
    }
  }
}

export {};