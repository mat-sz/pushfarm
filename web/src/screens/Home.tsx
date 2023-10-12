import React from 'react';
import { TechInfo } from '../components/TechInfo';
import { DeviceList } from '../components/DeviceList';
import { Status } from '../components/Status';
import { Push } from '../components/Push';

export const Home: React.FC = () => {
  return (
    <div className="home">
      <TechInfo />
      <DeviceList />
      <div className="home-grid">
        <div>
          <h2>Status</h2>
          <Status />
        </div>
        <div>
          <h2>Push</h2>
          <Push />
        </div>
      </div>
    </div>
  );
};
