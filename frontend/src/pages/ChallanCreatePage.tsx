import React, { useEffect, useState } from 'react';
import { customerApi, productApi, challanApi } from '../services/api';
import { Customer, Product } from '../types';
import { Plus, Trash2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

interface ChallanCreatePageProps {
  onNavigate: (tab: string) => void;
}

interface ChallanRow {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export const ChallanCreatePage: React.FC<ChallanCreatePageProps> = ({ onNavigate }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [items, setItems] = useState<ChallanRow[]>([
    { product_id: 0, quantity: 1, unit_price: 0 }
  ]);
  const [status, setStatus] = useState<'Draft' | 'Confirmed'>('Draft');

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        setLoadingData(true);
        const [custRes, prodRes] = await Promise.all([
          customerApi.getCustomers({ limit: 100 }),
          productApi.getProducts({ limit: 100 })
        ]);
        setCustomers(custRes.data);
        setProducts(prodRes.data);
        if (custRes.data.length > 0) setSelectedCustomerId(custRes.data[0].id);
        if (prodRes.data.length > 0) {
          setItems([{ product_id: prodRes.data[0].id, quantity: 1, unit_price: prodRes.data[0].unit_price }]);
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };

    loadDropdowns();
  }, []);

  const handleProductSelect = (index: number, productId: number) => {
    const foundProduct = products.find((p) => p.id === productId);
    const updated = [...items];
    updated[index] = {
      product_id: productId,
      quantity: updated[index]?.quantity || 1,
      unit_price: foundProduct ? Number(foundProduct.unit_price) : 0
    };
    setItems(updated);
  };

  const handleQtyChange = (index: number, qty: number) => {
    const updated = [...items];
    updated[index].quantity = qty;
    setItems(updated);
  };

  const handlePriceChange = (index: number, price: number) => {
    const updated = [...items];
    updated[index].unit_price = price;
    setItems(updated);
  };

  const addRow = () => {
    const defaultProduct = products[0];
    setItems([
      ...items,
      {
        product_id: defaultProduct ? defaultProduct.id : 0,
        quantity: 1,
        unit_price: defaultProduct ? Number(defaultProduct.unit_price) : 0
      }
    ]);
  };

  const removeRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    let totalQty = 0;
    let totalAmt = 0;
    items.forEach((item) => {
      totalQty += Number(item.quantity || 0);
      totalAmt += Number(item.quantity || 0) * Number(item.unit_price || 0);
    });
    return { totalQty, totalAmt };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedCustomerId) {
      setErrorMsg('Please select a customer.');
      return;
    }

    if (items.some((i) => !i.product_id || i.quantity <= 0)) {
      setErrorMsg('Please ensure all items have a valid product and quantity (>0).');
      return;
    }

    setSubmitting(true);

    try {
      const res = await challanApi.createChallan({
        customer_id: Number(selectedCustomerId),
        items: items.map((i) => ({
          product_id: Number(i.product_id),
          quantity: Number(i.quantity),
          unit_price: Number(i.unit_price)
        })),
        status
      });

      setSuccessMsg(res.message || 'Sales Challan created successfully!');
      setTimeout(() => {
        onNavigate('challans');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create Sales Challan.');
    } finally {
      setSubmitting(false);
    }
  };

  const { totalQty, totalAmt } = calculateTotals();

  if (loadingData) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading inventory & customer directory...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Page Navigation Top */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('challans')}>
          <ArrowLeft size={16} /> Back to Sales Challans
        </button>
        <h2 style={{ fontSize: '1.4rem' }}>Create Sales Delivery Challan</h2>
      </div>

      {errorMsg && <div className="alert alert-danger"><AlertCircle size={18} /> {errorMsg}</div>}
      {successMsg && <div className="alert alert-success"><CheckCircle2 size={18} /> {successMsg}</div>}

      <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header Configuration: Customer & Status Choice */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Select CRM Customer *</label>
            <select
              className="form-select"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
              required
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.business_name}) - {c.type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Initial Challan Status *</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Draft' | 'Confirmed')}
            >
              <option value="Draft">Draft (Save Without Stock Lock)</option>
              <option value="Confirmed">Confirmed (Execute Stock Deduction)</option>
            </select>
          </div>
        </div>

        {/* Dynamic Product Rows Table */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Order Line Items</h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addRow}>
              <Plus size={16} /> Add Product Line
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Product Selection & In-Stock Availability</th>
                  <th style={{ width: '15%' }}>Quantity</th>
                  <th style={{ width: '20%' }}>Unit Price (₹)</th>
                  <th style={{ width: '15%' }}>Subtotal (₹)</th>
                  <th style={{ width: '10%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, index) => {
                  const currentProduct = products.find((p) => p.id === row.product_id);
                  const stockAvailable = currentProduct ? currentProduct.current_stock : 0;
                  const isInsufficient = status === 'Confirmed' && row.quantity > stockAvailable;

                  return (
                    <tr key={index}>
                      <td>
                        <select
                          className="form-select"
                          value={row.product_id}
                          onChange={(e) => handleProductSelect(index, Number(e.target.value))}
                          required
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (SKU: {p.sku}) — Available: {p.current_stock}
                            </option>
                          ))}
                        </select>

                        {currentProduct && (
                          <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: isInsufficient ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                            Available Stock: <strong>{stockAvailable} Units</strong> {isInsufficient ? '⚠️ Exceeds Available Stock!' : ''}
                          </div>
                        )}
                      </td>

                      <td>
                        <input
                          type="number"
                          min="1"
                          className="form-input"
                          value={row.quantity}
                          onChange={(e) => handleQtyChange(index, Number(e.target.value))}
                          required
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          step="0.01"
                          className="form-input"
                          value={row.unit_price}
                          onChange={(e) => handlePriceChange(index, Number(e.target.value))}
                          required
                        />
                      </td>

                      <td>
                        <strong style={{ color: 'var(--accent-cyan)' }}>
                          ₹{(Number(row.quantity || 0) * Number(row.unit_price || 0)).toLocaleString()}
                        </strong>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          disabled={items.length <= 1}
                          onClick={() => removeRow(index)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary & Submit Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem',
          background: 'rgba(99, 102, 241, 0.08)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(99, 102, 241, 0.2)'
        }}>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Order Summary:</span>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
              <span>Total Quantity: <strong>{totalQty} Items</strong></span>
              <span>Total Amount: <strong style={{ color: 'var(--accent-emerald)', fontSize: '1.1rem' }}>₹{totalAmt.toLocaleString()}</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => onNavigate('challans')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <CheckCircle2 size={18} />
              <span>{submitting ? 'Processing Transaction...' : `Save Sales Challan (${status})`}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
