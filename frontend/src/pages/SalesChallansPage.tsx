import React, { useEffect, useState } from 'react';
import { challanApi } from '../services/api';
import { SalesChallan } from '../types';
import { Badge } from '../components/Badge';
import { Pagination } from '../components/Pagination';
import { Search, Plus, Eye, CheckCircle, X, FileText, Printer } from 'lucide-react';

interface SalesChallansPageProps {
  onNavigate: (tab: string) => void;
}

export const SalesChallansPage: React.FC<SalesChallansPageProps> = ({ onNavigate }) => {
  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Detail Modal
  const [selectedChallan, setSelectedChallan] = useState<SalesChallan | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Status Confirm Action
  const [confirmError, setConfirmError] = useState('');
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const fetchChallans = async () => {
    try {
      setLoading(true);
      const res = await challanApi.getChallans({
        search,
        status: statusFilter,
        page,
        limit: 8
      });
      setChallans(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      console.error('Failed to fetch challans', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [search, statusFilter, page]);

  const handleViewChallan = async (id: number) => {
    try {
      setDetailLoading(true);
      const res = await challanApi.getChallanById(id);
      setSelectedChallan(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleConfirmChallan = async (id: number) => {
    setConfirmError('');
    setConfirmingId(id);

    try {
      await challanApi.updateStatus(id, 'Confirmed');
      fetchChallans();
      if (selectedChallan && selectedChallan.id === id) {
        handleViewChallan(id);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to confirm challan.';
      setConfirmError(msg);
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search & Action Header */}
      <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by Challan #, customer or business..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <select className="form-select" style={{ width: '170px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={() => onNavigate('create-challan')}>
          <Plus size={18} />
          <span>New Sales Challan</span>
        </button>
      </div>

      {confirmError && <div className="alert alert-danger">{confirmError}</div>}

      {/* Sales Challans Table */}
      <div className="glass-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Challan Number</th>
                <th>Customer & Business</th>
                <th>Total Items Qty</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading sales challans...</td></tr>
              ) : challans.length > 0 ? (
                challans.map((c) => (
                  <tr key={c.id}>
                    <td><code style={{ color: 'var(--primary)', fontWeight: 600 }}>{c.challan_number}</code></td>
                    <td>
                      <strong>{c.customer_name}</strong>
                      <br />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{c.customer_business}</span>
                    </td>
                    <td>{c.total_quantity} Pcs</td>
                    <td>₹{Number(c.total_amount).toLocaleString()}</td>
                    <td><Badge status={c.status} /></td>
                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleViewChallan(c.id)}>
                          <Eye size={14} /> View
                        </button>
                        {c.status === 'Draft' && (
                          <button
                            className="btn btn-success btn-sm"
                            disabled={confirmingId === c.id}
                            onClick={() => handleConfirmChallan(c.id)}
                          >
                            <CheckCircle size={14} />
                            {confirmingId === c.id ? 'Checking Stock...' : 'Confirm'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No sales challans found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
      </div>

      {/* CHALLAN DETAIL / PRINTABLE MODAL */}
      {selectedChallan && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={22} color="var(--primary)" />
                <div>
                  <h3 style={{ margin: 0 }}>Sales Challan #{selectedChallan.challan_number}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Issued: {new Date(selectedChallan.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                  <Printer size={14} /> Print
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedChallan(null)}><X size={16} /></button>
              </div>
            </div>

            {/* Invoice Header Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>CUSTOMER DETAILS</p>
                <h4 style={{ fontSize: '1rem', marginTop: '0.25rem' }}>{selectedChallan.customer_name}</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{selectedChallan.customer_business}</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>📞 {selectedChallan.customer_mobile} | ✉️ {selectedChallan.customer_email}</p>
                {selectedChallan.customer_gst && <p style={{ fontSize: '0.8125rem', color: 'var(--accent-cyan)' }}>GST: {selectedChallan.customer_gst}</p>}
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>Address: {selectedChallan.customer_address}</p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>CHALLAN STATUS</p>
                <div style={{ margin: '0.5rem 0' }}><Badge status={selectedChallan.status} /></div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Prepared By: <strong>{selectedChallan.created_by_name}</strong></p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Total Items: <strong>{selectedChallan.total_quantity} Pcs</strong>
                </p>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
                  ₹{Number(selectedChallan.total_amount).toLocaleString()}
                </h3>
              </div>
            </div>

            {/* Product Snapshots Table */}
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              Items Summary (Static JSON Product Snapshots)
            </h4>

            <div className="table-container" style={{ marginBottom: '1.5rem' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product Snapshot Details</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedChallan.items && selectedChallan.items.map((item, idx) => {
                    const snap = item.product_snapshot;
                    return (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>
                          <strong>{snap.name}</strong>
                          <br />
                          <code style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>SKU: {snap.sku}</code>
                        </td>
                        <td>{snap.category}</td>
                        <td><strong>{item.quantity}</strong></td>
                        <td>₹{Number(item.unit_price).toLocaleString()}</td>
                        <td><strong>₹{Number(item.subtotal).toLocaleString()}</strong></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {selectedChallan.status === 'Draft' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--accent-amber)' }}>
                  ⚠️ This challan is currently in Draft status. Confirming will verify stock and update inventory.
                </span>
                <button
                  className="btn btn-success"
                  onClick={() => handleConfirmChallan(selectedChallan.id)}
                >
                  <CheckCircle size={16} /> Confirm Sales Challan
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
