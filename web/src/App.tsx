import React from 'react';
import { useKreds } from '@kreds/react';

import './App.scss';
import { Home } from './screens/Home';
import { LandingPage } from './screens/LandingPage';
import { NavBar } from './components/NavBar';

export const App: React.FC = () => {
  const kreds = useKreds();

  return (
    <div className="App">
      <NavBar />
      {kreds.user ? <Home /> : <LandingPage />}
    </div>
  );
};
