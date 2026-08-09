import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../services/api';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import { 
  DollarSign, 
  Users, 
  Package, 
  AlertTriangle, 
  FileText, 
  ArrowUpRight, 
  Activity 
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getStats();
      setData(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading operations dashboard...</div>;
  }

  if (error) {
    return <div className="alert alert-danger" style={{ margin: '2rem' }}>{error}</div>;
  }

  const { customers, products, challans, lowStockProducts, recentChallans, recentStockLogs } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="TOTAL REVENUE (CONFIRMED)"
          value={`₹${Number(challans?.total_confirmed_revenue || 0).toLocaleString()}`}
          subtext={`${challans?.confirmed_challans || 0} Confirmed Challans`}
          icon={DollarSign}
          iconColor="var(--accent-emerald)"
          accentGradient="linear-gradient(90deg, #10b981, #059669)"
        />

        <StatCard
          title="CRM CUSTOMERS"
          value={customers?.total_customers || 0}
          subtext={`${customers?.active_customers || 0} Active • ${customers?.lead_customers || 0} Leads`}
          icon={Users}
          iconColor="var(--accent-cyan)"
          accentGradient="linear-gradient(90deg, #06b6d4, #0284c7)"
        />

        <StatCard
          title="LOW STOCK ALERTS"
          value={products?.low_stock_alerts || 0}
          subtext={`${products?.total_products || 0} Total Catalog Items`}
          icon={AlertTriangle}
          iconColor={products?.low_stock_alerts > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)'}
          accentGradient={products?.low_stock_alerts > 0 ? 'linear-gradient(90deg, #f43f5e, #e11d48)' : 'linear-gradient(90deg, #10b981, #059669)'}
        />

        <StatCard
          title="PENDING CHALLANS"
          value={challans?.draft_challans || 0}
          subtext={`${challans?.total_challans || 0} Total Created`}
          icon={FileText}
          iconColor="var(--accent-amber)"
          accentGradient="linear-gradient(90deg, #f59e0b, #d97706)"
        />
      </div>

      {/* Low Stock Warning Alert if any */}
      {lowStockProducts && lowStockProducts.length > 0 && (
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-rose)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <AlertTriangle size={20} color="var(--accent-rose)" />
              <h3 style={{ fontSize: '1.1rem' }}>Low Inventory Warning ({lowStockProducts.length} Items)</h3>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('products')}>
              Manage Inventory <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Min Alert Threshold</th>
                  <th>Warehouse Location</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((p: any) => (
                  <tr key={p.id}>
                    <td><code style={{ color: 'var(--accent-cyan)' }}>{p.sku}</code></td>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.category}</td>
                    <td>
                      <span className="badge badge-rose">
                        {p.current_stock} Units
                      </span>
                    </td>
                    <td>{p.min_stock_alert_qty} Units</td>
                    <td>{p.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid for Recent Activity: Challans vs Stock Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Challans */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="var(--primary)" /> Recent Sales Challans
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('challans')}>
              View All
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Challan #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentChallans && recentChallans.length > 0 ? (
                  recentChallans.map((c: any) => (
                    <tr key={c.id}>
                      <td><code style={{ color: 'var(--primary)' }}>{c.challan_number}</code></td>
                      <td>{c.customer_name}</td>
                      <td>₹{Number(c.total_amount).toLocaleString()}</td>
                      <td><Badge status={c.status} /></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No sales challans created yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Stock Logs */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="var(--accent-cyan)" /> Recent Stock Movements
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('stock-logs')}>
              View Logs
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {recentStockLogs && recentStockLogs.length > 0 ? (
                  recentStockLogs.map((log: any) => (
                    <tr key={log.id}>
                      <td>
                        <strong>{log.product_name}</strong>
                        <br />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{log.sku}</span>
                      </td>
                      <td><Badge status={log.movement_type} /></td>
                      <td>{log.qty_changed}</td>
                      <td style={{ fontSize: '0.8125rem' }}>{log.reason}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No stock movement logs recorded.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
