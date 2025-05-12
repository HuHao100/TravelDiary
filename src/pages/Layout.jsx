import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '../componets/footer/Footer';
export default function Layout() {
  return (
    <div>
      <Outlet />
        <Footer />
    </div>
  );
}