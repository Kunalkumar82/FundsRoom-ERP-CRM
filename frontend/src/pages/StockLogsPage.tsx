import React, { useEffect, useState } from 'react';
import { productApi } from '../services/api';
import { StockLog } from '../types';
import { Badge } from '../components/Badge';
import { Pagination } from '../components/Pagination';
import { History, Calendar, User } from 'lucide-react';

export const StockLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await productApi.getStockLogs({
        movement_type: typeFilter,
        page,
        limit: 10
      });
      setLogs(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      console.error('Failed to fetch stock logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [typeFilter, page]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Filter Bar */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={20} color="var(--primary)" /> Inventory Audit History & Stock Logs
        </h3>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select className="form-select" style={{ width: '180px' }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Movement Types</option>
            <option value="IN">IN (+ Stock Entry)</option>
            <option value="OUT">OUT (- Stock Removal)</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Product & SKU</th>
                <th>Movement</th>
                <th>Quantity</th>
                <th>Reason / Trigger</th>
                <th>Logged By</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading inventory audit logs...</td></tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}>
                        <Calendar size={14} color="var(--text-dim)" />
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <strong>{log.product_name}</strong>
                      <br />
                      <code style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>{log.sku}</code>
                    </td>
                    <td><Badge status={log.movement_type} /></td>
                    <td>
                      <strong style={{ color: log.movement_type === 'IN' ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                        {log.movement_type === 'IN' ? '+' : '-'}{log.qty_changed} Units
                      </strong>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{log.reason}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        <User size={14} /> {log.created_by_name}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No stock movement logs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
      </div>
    </div>
  );
};
