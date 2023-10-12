import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Accordion } from './Accordion';
import { httpDelete, httpGet } from '../api';
import { Device } from '../api/types';
import { Modal } from './Modal';
import { copy } from '../common';

export const DeviceList: React.FC = () => {
  const { data, refetch } = useQuery({
    queryKey: ['devices'],
    queryFn: () => httpGet<Device[]>('devices'),
  });
  const [viewTokenId, setViewTokenId] = useState<number>();
  const viewTokenDevice = viewTokenId
    ? data?.find(device => device.id === viewTokenId)
    : undefined;

  return (
    <>
      <Modal
        isOpen={!!viewTokenDevice}
        onClose={() => setViewTokenId(undefined)}
        title="Viewing token"
      >
        Token:{' '}
        <input
          value={viewTokenDevice?.token}
          readOnly
          onClick={e => (e.target as HTMLInputElement).select()}
        />
        <button onClick={() => copy(viewTokenDevice?.token || '')}>Copy</button>
      </Modal>
      <Accordion title="Device list">
        <table>
          <tbody>
            {data?.map(device => (
              <tr key={device.id}>
                <td>{device.name}</td>
                <td>
                  <button onClick={() => setViewTokenId(device.id)}>
                    View token
                  </button>
                  <button
                    onClick={async () => {
                      await httpDelete(`devices/${device.id}`);
                      refetch();
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Accordion>
    </>
  );
};
