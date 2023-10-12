export interface InfoConfig {
  vapid: {
    publicKey: string;
  };
}

export interface PushBody {
  title: string;
  body: string;
}

export type PushResult = {
  deviceId: number;
}[];

export interface DeviceBody {
  name?: string;
  subscription?: PushSubscriptionJSON;
}

export interface Device {
  id: number;
  name: string;
  token: string;
  createdAt: string;
  updatedAt: string;
  subscription?: string;
  expiresAt?: string;
}
