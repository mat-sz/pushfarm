import { useKreds } from '@kreds/react';
import React from 'react';

export const LandingPage: React.FC = () => {
  const kreds = useKreds();

  return (
    <div className="landing-page">
      Please log in to continue.{' '}
      <button onClick={() => kreds.open()}>Log in</button>
    </div>
  );
};
