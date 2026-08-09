import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  PlusCircle, 
  History, 
  LogOut, 
  Shield 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout, hasRole } = useAuth();

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'Admin': return 'badge-amber';
      case 'Sales': return 'badge-amber';
      case 'Warehouse': return 'badge-amber';
      case 'Accounts': return 'badge-amber';
      default: return 'badge-slate';
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Sales', 'Warehouse', 'Accounts'] },
    { id: 'customers', label: 'Customers CRM', icon: Users, roles: ['Admin', 'Sales', 'Warehouse', 'Accounts'] },
    { id: 'products', label: 'Products & Inventory', icon: Package, roles: ['Admin', 'Sales', 'Warehouse', 'Accounts'] },
    { id: 'stock-logs', label: 'Stock Movement Logs', icon: History, roles: ['Admin', 'Sales', 'Warehouse', 'Accounts'] },
    { id: 'challans', label: 'Sales Challans', icon: FileText, roles: ['Admin', 'Sales', 'Warehouse', 'Accounts'] },
    { id: 'create-challan', label: 'Create Challan', icon: PlusCircle, roles: ['Admin', 'Sales'] },
  ];

  return (
    <aside style={{
      width: '260px',
      background: '#1e1e24',
      borderRight: '1px solid #2d2d38',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      boxShadow: '2px 0 10px rgba(0, 0, 0, 0.08)'
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '1.25rem 1.25rem',
        borderBottom: '1px solid #2d2d38',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: '#16161a'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '1.15rem',
          color: '#16161a',
          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
        }}>
          E
        </div>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', lineHeight: '1.2' }}>Nexus ERP</h2>
          <p style={{ fontSize: '0.725rem', color: '#fbbf24', fontWeight: 500 }}>Operations Portal</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '1rem 0.625rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {navItems.map((item) => {
          if (!hasRole(item.roles as any)) return null;
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                background: isActive ? '#292934' : 'transparent',
                color: isActive ? '#fbbf24' : '#a1a1aa',
                borderLeft: isActive ? '3px solid #f59e0b' : '3px solid transparent',
                borderTop: '1px solid transparent',
                borderRight: '1px solid transparent',
                borderBottom: '1px solid transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.875rem',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={17} color={isActive ? '#f59e0b' : '#71717a'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logged User Info */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid #2d2d38',
        background: '#16161a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-full)',
            background: '#292934',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #3d3d4e'
          }}>
            <Shield size={16} color="#f59e0b" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {user?.name || 'User'}
            </p>
            <span className={`badge ${getRoleBadgeColor(user?.role)}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              {user?.role}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'center', background: '#292934', borderColor: '#3d3d4e', color: '#f8fafc' }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
