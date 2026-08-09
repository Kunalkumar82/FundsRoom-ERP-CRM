import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, User, UserPlus, LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('admin@erp.com');
  const [loginPassword, setLoginPassword] = useState('Password123!');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Sales');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await login(loginEmail, loginPassword);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await register(regName, regEmail, regPassword, regRole);
      setSuccess('Account created successfully in MySQL database!');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const demoAccounts = [
    { name: 'Admin User', email: 'admin@erp.com', role: 'Admin', color: '#fbbf24' },
    { name: 'Sales Manager', email: 'sales@erp.com', role: 'Sales', color: '#f59e0b' },
    { name: 'Warehouse Inspector', email: 'warehouse@erp.com', role: 'Warehouse', color: '#fbbf24' },
    { name: 'Accounts Specialist', email: 'accounts@erp.com', role: 'Accounts', color: '#f59e0b' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#16161a',
      backgroundImage: `
        radial-gradient(at 10% 10%, rgba(245, 158, 11, 0.09) 0px, transparent 50%),
        radial-gradient(at 90% 90%, rgba(217, 119, 6, 0.08) 0px, transparent 50%),
        radial-gradient(at 50% 50%, rgba(180, 83, 9, 0.05) 0px, transparent 50%)
      `,
      padding: '1.5rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '920px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '2.5rem'
      }}>
        {/* Left Hero */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            background: '#292934',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            color: '#fbbf24',
            fontSize: '0.8125rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
            width: 'fit-content'
          }}>
            <Shield size={15} color="#f59e0b" /> Enterprise Operations & CRM Portal
          </div>

          <h1 style={{ fontSize: '2.4rem', lineHeight: '1.2', marginBottom: '1rem', color: '#f8fafc', letterSpacing: '-0.025em' }}>
            Full Stack Operations & <span style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Nexus ERP Platform</span>
          </h1>

          <p style={{ color: '#a1a1aa', fontSize: '0.9375rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            Production-grade CRM customer follow-ups, real-time inventory management, user registration, and sales delivery challan operations with MySQL ACID stock controls.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: '#d4d4d8' }}>
              <CheckCircle2 size={17} color="#f59e0b" />
              <span>Full User Registration & MySQL Account Management</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: '#d4d4d8' }}>
              <CheckCircle2 size={17} color="#f59e0b" />
              <span>Role-Based Access Control (Admin, Sales, Warehouse, Accounts)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: '#d4d4d8' }}>
              <CheckCircle2 size={17} color="#f59e0b" />
              <span>MySQL ACID Transactions & Stock Movement Logs</span>
            </div>
          </div>
        </div>

        {/* Right Auth Card (Sign In & Sign Up Toggle) */}
        <div style={{
          padding: '2rem',
          background: '#1e1e24',
          border: '1px solid #2d2d38',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.4)'
        }}>
          {/* Tab Switcher */}
          <div style={{
            display: 'flex',
            background: '#16161a',
            borderRadius: 'var(--radius-md)',
            padding: '0.25rem',
            marginBottom: '1.5rem',
            border: '1px solid #2d2d38'
          }}>
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'login' ? '#292934' : 'transparent',
                color: activeTab === 'login' ? '#fbbf24' : '#a1a1aa',
                fontWeight: activeTab === 'login' ? 600 : 400,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                transition: 'all 0.15s ease'
              }}
            >
              <LogIn size={15} /> Sign In
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setError(''); setSuccess(''); }}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'register' ? '#292934' : 'transparent',
                color: activeTab === 'register' ? '#fbbf24' : '#a1a1aa',
                fontWeight: activeTab === 'register' ? 600 : 400,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                transition: 'all 0.15s ease'
              }}
            >
              <UserPlus size={15} /> Create Account
            </button>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* SIGN IN FORM */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#a1a1aa' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', background: '#16161a', borderColor: '#2d2d38', color: '#f8fafc' }}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                  />
                  <Mail size={16} color="#71717a" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ color: '#a1a1aa' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', background: '#16161a', borderColor: '#2d2d38', color: '#f8fafc' }}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <Lock size={16} color="#71717a" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <button
                type="submit"
                className="btn"
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#16161a',
                  fontWeight: 700,
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
                disabled={submitting}
              >
                {submitting ? 'Authenticating...' : 'Sign In to Dashboard'}
                {!submitting && <ArrowRight size={16} color="#16161a" />}
              </button>
            </form>
          ) : (
            /* CREATE ACCOUNT / REGISTER FORM */
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#a1a1aa' }}>Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', background: '#16161a', borderColor: '#2d2d38', color: '#f8fafc' }}
                    placeholder="e.g. John Doe"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                  <User size={16} color="#71717a" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#a1a1aa' }}>Work Email *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', background: '#16161a', borderColor: '#2d2d38', color: '#f8fafc' }}
                    placeholder="name@company.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                  <Mail size={16} color="#71717a" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#a1a1aa' }}>Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', background: '#16161a', borderColor: '#2d2d38', color: '#f8fafc' }}
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                  <Lock size={16} color="#71717a" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ color: '#a1a1aa' }}>Assign User Role *</label>
                <select
                  className="form-select"
                  style={{ background: '#16161a', borderColor: '#2d2d38', color: '#f8fafc' }}
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                >
                  <option value="Admin">Admin (Full Access)</option>
                  <option value="Sales">Sales Manager (CRM & Orders)</option>
                  <option value="Warehouse">Warehouse Inspector (Inventory & Stock)</option>
                  <option value="Accounts">Accounts Specialist (Financial Verification)</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn"
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#16161a',
                  fontWeight: 700,
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
                disabled={submitting}
              >
                {submitting ? 'Registering Account...' : 'Register & Launch Portal'}
                {!submitting && <ArrowRight size={16} color="#16161a" />}
              </button>
            </form>
          )}

          {/* Quick Login Accounts */}
          {activeTab === 'login' && (
            <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #2d2d38' }}>
              <p style={{ fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Quick Demo Accounts (Password: Password123!)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => { setLoginEmail(acc.email); setLoginPassword('Password123!'); }}
                    style={{
                      padding: '0.5rem 0.625rem',
                      borderRadius: 'var(--radius-md)',
                      background: loginEmail === acc.email ? '#292934' : '#16161a',
                      border: '1px solid',
                      borderColor: loginEmail === acc.email ? '#f59e0b' : '#2d2d38',
                      color: '#f8fafc',
                      fontSize: '0.75rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '0.1rem' }}>{acc.role}</strong>
                    <span style={{ fontSize: '0.6875rem', color: '#a1a1aa' }}>{acc.email}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
