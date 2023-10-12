import fs from 'fs/promises';

export interface Config {
  kreds: {
    redirectUrl: string;
    strategies: any[];
  };
  pushfarm: {
    useProxy: boolean;
    vapid: {
      subject: string;
      publicKey: string;
      privateKey: string;
    };
  };
}

export const config: Config = JSON.parse(
  await fs.readFile('../data/.config.json', 'utf-8')
);
