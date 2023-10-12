import React, { useState } from 'react';
import { httpGet, httpPost } from '../api';
import { Device } from '../api/types';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

export const Push: React.FC = () => {
  const { data } = useQuery({
    queryKey: ['devices'],
    queryFn: () => httpGet<Device[]>('devices'),
  });
  const { register, handleSubmit, reset } = useForm<{
    device: string;
    title: string;
    body: string;
  }>({
    defaultValues: {
      title: 'push.farm',
    },
  });

  if (!data?.[0]) {
    return (
      <>
        <p>Push is not available, no devices added.</p>
      </>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(async values => {
          const { title, body, device } = values;
          httpPost(
            'push',
            { title, body },
            undefined,
            device && device !== 'ALL'
              ? { authorization: `Device ${device}` }
              : undefined
          );
          reset();
        })}
      >
        <label>
          Device:
          <select {...register('device', { required: true })}>
            <option value="ALL">All</option>
            {data?.map(device => (
              <option key={device.id} value={device.token}>
                {device.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Title:
          <input
            autoComplete="off"
            type="text"
            {...register('title', { required: true })}
          />
        </label>
        <label>
          Body:
          <input
            autoComplete="off"
            type="text"
            {...register('body', { required: true })}
          />
        </label>
        <button type="submit">Send</button>
      </form>
    </>
  );
};
