import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, PlusCircle } from 'lucide-react';

interface HeaderProps {
  title: string;
  onQuickAction?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onQuickAction }) => {
  const { user } = useAuth();

  return (
    <header style={{
      height: '64px',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #2d2d38',
      background: '#1e1e24',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
    }}>
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>{title}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.3rem 0.75rem',
          borderRadius: 'var(--radius-md)',
          background: '#292934',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          fontSize: '0.8125rem'
        }}>
          <ShieldCheck size={15} color="#f59e0b" />
          <span style={{ color: '#a1a1aa' }}>Active Role:</span>
          <strong style={{ color: '#fbbf24', fontWeight: 600 }}>{user?.role}</strong>
        </div>

        {onQuickAction && (
          <button className="btn btn-primary btn-sm" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#16161a', fontWeight: 600, border: 'none' }} onClick={onQuickAction}>
            <PlusCircle size={15} color="#16161a" />
            <span>New Challan</span>
          </button>
        )}
      </div>
    </header>
  );
};
