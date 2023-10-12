import React from 'react';
import { apiUrl, kreds } from './common';

export const Devices: React.FC = () => {
  const subscribe = async () => {
    // TODO: Display status
    if (!('serviceWorker' in navigator)) {
      console.log('no serviceworker');
      return;
    }
    if (!('PushManager' in window)) {
      console.log('no PushManager');
      return;
    }
    if (!('Notification' in window)) {
      console.log('no Notification');
      return;
    }
    if (!('showNotification' in ServiceWorkerRegistration?.prototype)) {
      console.log('no showNotification');
      return;
    }

    const configRes = await fetch(apiUrl + 'info/config');
    const config = await configRes.json();

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      console.log('no registration');
      return;
    }

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: config.vapid.publicKey,
      });

      console.log(subscription);

      await fetch(apiUrl + 'devices', {
        method: 'POST',
        headers: {
          ...kreds?.getRequestHeaders(),
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'test', subscription }),
      });
    } catch (e) {
      console.log(e);
    }
  };

  const req = async () => {
    const res = await Notification.requestPermission();
    alert(res);
  };

  return (
    <div className="devices">
      <button onClick={subscribe}>Subscribe</button>
      <button onClick={req}>request</button>
    </div>
  );
};
