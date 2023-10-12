/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('push', e => {
  try {
    const body = e.data.json();

    e.waitUntil(self.registration.showNotification(body.title, body));
  } catch {
    e.waitUntil(
      self.registration.showNotification('push.farm', { body: '(empty)' })
    );
  }
});

self.addEventListener('notificationclick', event => {
  const eventAction = event.action;
  if (eventAction !== 'explore') {
    return;
  }

  event.notification.close(); // Android needs explicit close.
  // event.waitUntil(
  //   clients.matchAll({ type: 'window' }).then(windowClients => {
  //     // Check if there is already a window/tab open with the target URL
  //     for (var i = 0; i < windowClients.length; i++) {
  //       var client = windowClients[i];
  //       // If so, just focus it.
  //       if (client.url === url && 'focus' in client) {
  //         return client.focus();
  //       }
  //     }
  //     // If not, then open the target URL in a new window/tab.
  //     if (clients.openWindow) {
  //       return clients.openWindow(url);
  //     }
  //   })
  // );
});
