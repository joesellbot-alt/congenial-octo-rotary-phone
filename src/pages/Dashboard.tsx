import React, { useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Tabs from '../components/Tabs';

function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div>
          <Card title="Welcome" description={`Hello, ${user?.name || 'Guest'}!`}>
            <p>This is your dashboard overview.</p>
          </Card>
        </div>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      content: (
        <div>
          <Card title="Theme" description={`Current theme: ${theme}`}>
            <Button ref={buttonRef} onClick={toggleTheme}>
              Toggle Theme
            </Button>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className={`dashboard theme-${theme}`}>
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </header>
      <main className="dashboard-main">
        <Tabs tabs={tabs} defaultTab="overview" />
      </main>
    </div>
  );
}

export default Dashboard;
