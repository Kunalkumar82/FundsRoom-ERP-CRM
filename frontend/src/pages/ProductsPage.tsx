import React, { useEffect, useState } from 'react';
import { productApi } from '../services/api';
import { Product } from '../types';
import { Pagination } from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, PackagePlus, AlertTriangle, ArrowUpDown, X, MapPin } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [page, setPage] = useState(1);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAdjustProduct, setSelectedAdjustProduct] = useState<Product | null>(null);

  // Form State: Add Product
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    unit_price: 0,
    current_stock: 0,
    min_stock_alert_qty: 10,
    location: 'Main Warehouse'
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Stock Adjust Form State
  const [adjustData, setAdjustData] = useState({
    qty_changed: 1,
    movement_type: 'IN' as 'IN' | 'OUT',
    reason: ''
  });
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);
  const [adjustError, setAdjustError] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productApi.getProducts({
        search,
        category: categoryFilter,
        low_stock: lowStockFilter,
        page,
        limit: 8
      });
      setProducts(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, lowStockFilter, page]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setFormSubmitting(true);

    try {
      await productApi.createProduct(formData);
      setIsAddModalOpen(false);
      setFormData({
        sku: '',
        name: '',
        category: '',
        unit_price: 0,
        current_stock: 0,
        min_stock_alert_qty: 10,
        location: 'Main Warehouse'
      });
      fetchProducts();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error creating product.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdjustProduct) return;
    setAdjustError('');
    setAdjustSubmitting(true);

    try {
      await productApi.adjustStock(
        selectedAdjustProduct.id,
        adjustData.qty_changed,
        adjustData.movement_type,
        adjustData.reason
      );
      setSelectedAdjustProduct(null);
      setAdjustData({ qty_changed: 1, movement_type: 'IN', reason: '' });
      fetchProducts();
    } catch (err: any) {
      setAdjustError(err.response?.data?.message || 'Error adjusting inventory stock.');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const canManage = hasRole(['Admin', 'Warehouse']);
  const canAdjust = hasRole(['Admin', 'Warehouse', 'Sales']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search & Filter Header */}
      <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by SKU, product name, category, warehouse..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <input
            type="text"
            className="form-input"
            style={{ width: '160px' }}
            placeholder="Filter Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />

          <button
            type="button"
            className={`btn ${lowStockFilter ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => setLowStockFilter(!lowStockFilter)}
          >
            <AlertTriangle size={16} />
            <span>{lowStockFilter ? 'Showing Low Stock Only' : 'Filter Low Stock'}</span>
          </button>
        </div>

        {canManage && (
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <PackagePlus size={18} />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* Product Catalog & Stock Table */}
      <div className="glass-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name & Category</th>
                <th>Unit Price</th>
                <th>Current Stock</th>
                <th>Alert Threshold</th>
                <th>Warehouse Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading inventory catalog...</td></tr>
              ) : products.length > 0 ? (
                products.map((p) => {
                  const isLow = p.current_stock <= p.min_stock_alert_qty;
                  return (
                    <tr key={p.id}>
                      <td><code style={{ color: 'var(--accent-cyan)' }}>{p.sku}</code></td>
                      <td>
                        <strong>{p.name}</strong>
                        <br />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{p.category}</span>
                      </td>
                      <td>₹{Number(p.unit_price).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${isLow ? 'badge-rose' : 'badge-emerald'}`}>
                          {p.current_stock} Units {isLow ? '⚠️ LOW' : ''}
                        </span>
                      </td>
                      <td>{p.min_stock_alert_qty} Units</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}>
                          <MapPin size={14} color="var(--text-dim)" /> {p.location}
                        </span>
                      </td>
                      <td>
                        {canAdjust && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => { setSelectedAdjustProduct(p); setAdjustError(''); }}
                          >
                            <ArrowUpDown size={14} />
                            <span>Adjust Stock</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
      </div>

      {/* CREATE PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Catalog Product</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsAddModalOpen(false)}><X size={16} /></button>
            </div>

            {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

            <form onSubmit={handleCreateProduct}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">SKU (Stock Keeping Unit) *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="PRD-CAT-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Electronics, Power, Cabling..."
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Initial Stock Qty</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.current_stock}
                    onChange={(e) => setFormData({ ...formData, current_stock: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Min Alert Limit</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.min_stock_alert_qty}
                    onChange={(e) => setFormData({ ...formData, min_stock_alert_qty: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Warehouse Bay</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST STOCK MODAL */}
      {selectedAdjustProduct && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div>
                <h3>Adjust Inventory Stock</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {selectedAdjustProduct.name} (SKU: {selectedAdjustProduct.sku})
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedAdjustProduct(null)}><X size={16} /></button>
            </div>

            {adjustError && <div className="alert alert-danger">{adjustError}</div>}

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.875rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>Current In-Stock Quantity:</span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--accent-cyan)', display: 'block' }}>
                {selectedAdjustProduct.current_stock} Units
              </strong>
            </div>

            <form onSubmit={handleAdjustStock}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Movement Type</label>
                  <select
                    className="form-select"
                    value={adjustData.movement_type}
                    onChange={(e) => setAdjustData({ ...adjustData, movement_type: e.target.value as 'IN' | 'OUT' })}
                  >
                    <option value="IN">IN (+ Stock Addition)</option>
                    <option value="OUT">OUT (- Stock Reduction)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={adjustData.qty_changed}
                    onChange={(e) => setAdjustData({ ...adjustData, qty_changed: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Audit Reason *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Stock shipment received, Damaged goods removal..."
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedAdjustProduct(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={adjustSubmitting}>
                  {adjustSubmitting ? 'Processing...' : 'Apply Stock Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
