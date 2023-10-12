import React from 'react';
import { Accordion } from './Accordion';

export const TechInfo: React.FC = () => {
  return (
    <Accordion title="Technical details">
      <table>
        <tbody>
          <tr>
            <td>'serviceWorker' in navigator</td>
            <td>{String('serviceWorker' in navigator)}</td>
          </tr>
          <tr>
            <td>'PushManager' in window</td>
            <td>{String('PushManager' in window)}</td>
          </tr>
          <tr>
            <td>'Notification' in window</td>
            <td>{String('Notification' in window)}</td>
          </tr>
          <tr>
            <td>'showNotification' in ServiceWorkerRegistration.prototype</td>
            <td>
              {String(
                window.ServiceWorkerRegistration &&
                  'showNotification' in
                    window.ServiceWorkerRegistration.prototype
              )}
            </td>
          </tr>
          <tr>
            <td>'standalone' in navigator</td>
            <td>{String('standalone' in navigator)}</td>
          </tr>
          <tr>
            <td>'standalone'</td>
            <td>{String((navigator as any).standalone)}</td>
          </tr>
          <tr>
            <td>standalone match-media</td>
            <td>
              {String(window.matchMedia('(display-mode: standalone)').matches)}
            </td>
          </tr>
          <tr>
            <td>Notification permission</td>
            <td>{window.Notification && Notification.permission}</td>
          </tr>
        </tbody>
      </table>
    </Accordion>
  );
};
