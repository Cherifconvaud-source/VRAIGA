/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { ClientView } from './components/client/ClientView';
import { TechnicianView } from './components/technician/TechnicianView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DualView } from './components/simulator/DualView';
import { NotificationToast } from './components/common/NotificationToast';

const MainContent: React.FC = () => {
  const { currentView } = useApp();

  switch (currentView) {
    case 'CLIENT':
      return (
        <main className="min-h-screen bg-[#F0F4F8] flex justify-center">
          <div className="w-full max-w-md shadow-lg min-h-screen bg-[#F0F4F8]">
            <ClientView />
          </div>
        </main>
      );
    case 'TECHNICIAN':
      return (
        <main className="min-h-screen bg-[#F0F4F8] flex justify-center">
          <div className="w-full max-w-md shadow-lg min-h-screen bg-[#F0F4F8]">
            <TechnicianView />
          </div>
        </main>
      );
    case 'ADMIN':
      return (
        <main className="min-h-screen bg-[#F0F4F8]">
          <AdminDashboard />
        </main>
      );
    case 'DUAL':
      return (
        <main className="min-h-screen bg-[#E5ECF4]">
          <DualView />
        </main>
      );
    default:
      return <ClientView />;
  }
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col font-sans bg-[#F0F4F8] text-[#1B2A4A] relative">
        <NotificationToast />
        <Navbar />
        <MainContent />
      </div>
    </AppProvider>
  );
}

