import React from 'react';
import ChatSidebar from './components/ChatSidebar';
import CalendarRail from './components/CalendarRail';
import LivePreview from './components/LivePreview';
import ImportEngine from './components/ImportEngine';
import BillingDashboard from './components/BillingDashboard';
import EnterpriseDashboard from './components/EnterpriseDashboard';
import './App.css';

export default function App() {
  return (
    <div className='app-container'>
      <ChatSidebar />
      <CalendarRail />
      <LivePreview />
      <ImportEngine />
      <BillingDashboard />
      <EnterpriseDashboard />
    </div>
  );
}
