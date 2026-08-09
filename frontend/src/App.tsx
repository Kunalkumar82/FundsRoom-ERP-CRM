import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { ProductsPage } from './pages/ProductsPage';
import { StockLogsPage } from './pages/StockLogsPage';
import { SalesChallansPage } from './pages/SalesChallansPage';
import { ChallanCreatePage } from './pages/ChallanCreatePage';

const MainLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-dark)',
        color: 'var(--text-muted)'
      }}>
        Initializing Mini ERP + CRM Portal...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Operations Dashboard';
      case 'customers': return 'Customer CRM Management';
      case 'products': return 'Products & Inventory Catalog';
      case 'stock-logs': return 'Inventory Stock Logs & Audits';
      case 'challans': return 'Sales Delivery Challans';
      case 'create-challan': return 'Create Sales Challan';
      default: return 'Portal';
    }
  };

  return (
    <div className="app-container">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <div className="main-content">
        <Header 
          title={getPageTitle()} 
          onQuickAction={currentTab !== 'create-challan' && ['Admin', 'Sales'].includes(user.role) ? () => setCurrentTab('create-challan') : undefined}
        />

        <main className="page-body">
          {currentTab === 'dashboard' && <DashboardPage onNavigate={setCurrentTab} />}
          {currentTab === 'customers' && <CustomersPage />}
          {currentTab === 'products' && <ProductsPage />}
          {currentTab === 'stock-logs' && <StockLogsPage />}
          {currentTab === 'challans' && <SalesChallansPage onNavigate={setCurrentTab} />}
          {currentTab === 'create-challan' && <ChallanCreatePage onNavigate={setCurrentTab} />}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

export default App;
