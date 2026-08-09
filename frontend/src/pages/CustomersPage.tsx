import React, { useEffect, useState } from 'react';
import { customerApi } from '../services/api';
import { Customer, CustomerType, CustomerStatus } from '../types';
import { Badge } from '../components/Badge';
import { Pagination } from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, UserPlus, Phone, Mail, FileText, Calendar, X, Send } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { hasRole } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newNote, setNewNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  // Form State for New Customer
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    business_name: '',
    gst_number: '',
    type: 'Retail' as CustomerType,
    address: '',
    status: 'Lead' as CustomerStatus,
    follow_up_date: '',
    notes: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await customerApi.getCustomers({
        search,
        type: typeFilter,
        status: statusFilter,
        page,
        limit: 8
      });
      setCustomers(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      console.error('Failed to fetch customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, typeFilter, statusFilter, page]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setFormSubmitting(true);

    try {
      await customerApi.createCustomer(formData);
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        mobile: '',
        email: '',
        business_name: '',
        gst_number: '',
        type: 'Retail',
        address: '',
        status: 'Lead',
        follow_up_date: '',
        notes: ''
      });
      fetchCustomers();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error creating customer.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newNote.trim()) return;

    setNoteSubmitting(true);
    try {
      const res = await customerApi.appendNote(selectedCustomer.id, newNote, followUpDate);
      setSelectedCustomer(res.data);
      setNewNote('');
      setFollowUpDate('');
      fetchCustomers();
    } catch (err: any) {
      console.error(err);
    } finally {
      setNoteSubmitting(false);
    }
  };

  const canEdit = hasRole(['Admin', 'Sales', 'Accounts']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search & Filter Bar */}
      <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by name, business, GST..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <select className="form-select" style={{ width: '160px' }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="Retail">Retail</option>
            <option value="Wholesale">Wholesale</option>
            <option value="Distributor">Distributor</option>
          </select>

          <select className="form-select" style={{ width: '160px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Lead">Lead</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {canEdit && (
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <UserPlus size={18} />
            <span>Add Customer</span>
          </button>
        )}
      </div>

      {/* Customer Directory Table */}
      <div className="glass-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer & Business</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Status</th>
                <th>GST Number</th>
                <th>Follow-up Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading customer directory...</td></tr>
              ) : customers.length > 0 ? (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.name}</strong>
                      <br />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{c.business_name}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', fontSize: '0.8125rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Phone size={12} /> {c.mobile}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-dim)' }}><Mail size={12} /> {c.email}</span>
                      </div>
                    </td>
                    <td><Badge status={c.type} /></td>
                    <td><Badge status={c.status} /></td>
                    <td>{c.gst_number || <span style={{ color: 'var(--text-dim)' }}>N/A</span>}</td>
                    <td>
                      {c.follow_up_date ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--accent-amber)' }}>
                          <Calendar size={14} /> {c.follow_up_date}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.8125rem' }}>None</span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedCustomer(c)}>
                        View CRM Notes
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No customers found matching search criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
      </div>

      {/* CREATE CUSTOMER MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Customer</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsAddModalOpen(false)}><X size={16} /></button>
            </div>

            {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

            <form onSubmit={handleCreateCustomer}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Contact Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Business Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Mobile *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Customer Type</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CustomerType })}
                  >
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Distributor">Distributor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">CRM Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
                  >
                    <option value="Lead">Lead</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">GST Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="27XXXXX0000X1Z0"
                    value={formData.gst_number}
                    onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Billing / Shipping Address *</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Follow-up Notes</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Record customer interest, requirements..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRM NOTES & DETAILS MODAL */}
      {selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div>
                <h3>{selectedCustomer.name}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{selectedCustomer.business_name}</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedCustomer(null)}><X size={16} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Contact Details</p>
                <p style={{ fontSize: '0.875rem' }}>📞 {selectedCustomer.mobile}</p>
                <p style={{ fontSize: '0.875rem' }}>✉️ {selectedCustomer.email}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>GST & Location</p>
                <p style={{ fontSize: '0.875rem' }}>GST: {selectedCustomer.gst_number || 'N/A'}</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{selectedCustomer.address}</p>
              </div>
            </div>

            {/* Notes Timeline */}
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={16} color="var(--primary)" /> CRM Follow-up Timeline & Notes
            </h4>

            <div style={{
              maxHeight: '200px',
              overflowY: 'auto',
              background: 'var(--bg-dark)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '1.5rem',
              whiteSpace: 'pre-line',
              fontSize: '0.8125rem',
              lineHeight: '1.6',
              color: 'var(--text-muted)'
            }}>
              {selectedCustomer.notes || 'No follow-up notes recorded yet.'}
            </div>

            {/* Append New Note Form */}
            {canEdit && (
              <form onSubmit={handleAddNote} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Append New Note</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Discussed pricing schedule, client agreed to PO..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Next Follow-up Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={noteSubmitting}>
                    <Send size={14} />
                    <span>{noteSubmitting ? 'Posting...' : 'Append Note'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
