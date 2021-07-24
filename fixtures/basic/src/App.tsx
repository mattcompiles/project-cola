import React from 'react';
import { Link } from '@cola/core/link';

export default function App({ children }) {
  return (
    <>
      <div>
        <Link to="/">Home</Link>
        <Link to="/away">Away</Link>
      </div>
      {children}
      <div>Footer</div>
    </>
  );
}

export const Home = {
  path: '/',
  component: () => <div>Home</div>,
};

export const Away = {
  path: '/away',
  component: () => <div>Away</div>,
};
