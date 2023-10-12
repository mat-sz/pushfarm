import React, { useEffect, useState } from 'react';
import { httpDelete, httpGet, httpPatch, httpPost } from '../api';
import { Device, InfoConfig } from '../api/types';
import { defaultDeviceName, iOSVersion } from '../common';
import { useQuery } from '@tanstack/react-query';

export const Status: React.FC = () => {
  const [registration, setRegistration] = useState<
    ServiceWorkerRegistration | undefined
  >(undefined);
  const [subscription, setSubscription] = useState<
    PushSubscription | undefined
  >(undefined);
  const [deviceName, setDeviceName] = useState<string>();
  const { data, refetch } = useQuery({
    queryKey: ['devices'],
    queryFn: () => httpGet<Device[]>('devices'),
  });

  const subscribe = async () => {
    const config = await httpGet<InfoConfig>('info/config');

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return;
    }

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: config.vapid.publicKey,
      });

      setSubscription(subscription);

      await httpPost('devices', {
        name: deviceName || defaultDeviceName(),
        subscription,
      });
      refetch();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.getRegistration().then(async registration => {
      setRegistration(registration);

      if (registration?.pushManager) {
        setSubscription(
          (await registration.pushManager.getSubscription()) || undefined
        );
      }
    });
  }, [setRegistration, setSubscription]);

  const ios = iOSVersion();
  if (ios) {
    if (ios[0] < 16 || (ios[0] === 16 && ios[1] < 4)) {
      return <p>Web Push API is not supported in iOS versions under 16.4.</p>;
    } else if (!('standalone' in navigator) || !navigator.standalone) {
      return (
        <p>To use Web Push API you must add this website to homescreen.</p>
      );
    }
  }

  if (
    !('serviceWorker' in navigator) ||
    !('ServiceWorkerRegistration' in window)
  ) {
    return <p>Your browser does not support service workers.</p>;
  }

  if (!('Notification' in window)) {
    return <p>Your browser does not support notifications.</p>;
  }

  const permission = Notification.permission;

  if (permission === 'denied') {
    return <p>You have denied the notification permission.</p>;
  }

  if (!('PushManager' in window)) {
    return <p>Your browser does not support PushManager.</p>;
  }

  if (!registration) {
    return <p>Service worker is not registered.</p>;
  }

  if (!subscription) {
    return (
      <>
        <p>Not subscribed.</p>
        <p>
          Device name:{' '}
          <input
            className="single-line"
            type="text"
            value={
              typeof deviceName === 'undefined'
                ? defaultDeviceName()
                : deviceName
            }
            onChange={e => setDeviceName(e.target.value)}
          />
        </p>
        <button onClick={subscribe}>Subscribe</button>
      </>
    );
  }

  const device = data?.find(device => {
    if (!device.subscription) {
      return false;
    }

    const sub = JSON.parse(device.subscription);
    return sub.endpoint === subscription?.endpoint;
  });

  if (!device) {
    return (
      <>
        <p>Unable to find active entry for device.</p>
        <button onClick={subscribe}>Resubscribe</button>
      </>
    );
  }

  return (
    <>
      <p>
        Subscribed.{' '}
        <button
          onClick={async () => {
            subscription?.unsubscribe();
            setSubscription(undefined);
            await httpDelete(`devices/${device?.id}`);
            refetch();
          }}
        >
          Unsubscribe
        </button>
      </p>
      <form
        className="single-line"
        onSubmit={async e => {
          e.preventDefault();
          await httpPatch(`devices/${device?.id}`, { name: deviceName });
          refetch();
        }}
      >
        <label>
          Device name:
          <input
            type="text"
            value={typeof deviceName === 'undefined' ? device.name : deviceName}
            onChange={e => setDeviceName(e.target.value)}
          />
        </label>
        <button type="submit">Update</button>
      </form>
    </>
  );
};
