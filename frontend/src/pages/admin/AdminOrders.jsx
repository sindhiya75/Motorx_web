import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, ArrowLeft, RefreshCw, Eye, CheckCircle2, Truck, XCircle, Clock, X } from 'lucide-react';
import { fetchAdminOrders, fetchAdminOrderDetails, updateAdminOrderStatus } from '../../services/adminApi';
import { formatINR } from '../../utils/formatINR';
import { useToast } from '../../context/ToastContext';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { addToast } = useToast();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminOrders({ page: pagination.page, limit: 12, status: statusFilter, search });
      setOrders(res.data || []);
      setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      addToast(err.message || 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [pagination.page, statusFilter, search]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateAdminOrderStatus(orderId, newStatus);
      addToast(`Updated order #${orderId} status to ${newStatus}`, 'success');
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      addToast(err.message || 'Failed to update order status', 'error');
    }
  };

  const openOrderDetails = async (orderId) => {
    try {
      const data = await fetchAdminOrderDetails(orderId);
      setSelectedOrder(data);
      setIsDetailsOpen(true);
    } catch (err) {
      addToast(err.message || 'Failed to fetch order details', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-navy">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-navy">Guest Orders & Fulfillment</h1>
            <p className="text-xs text-gray-500">View orders, check payment logs, and update delivery status</p>
          </div>
        </div>

        <button onClick={loadOrders} className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-navy text-xs font-bold rounded-xl flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> REFRESH ORDERS
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-card">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order #, email, or customer name..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-primary"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded-xl text-xs font-semibold bg-white"
          >
            <option value="">All Statuses</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Order #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">Loading guest orders from PostgreSQL...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">No orders found matching filter criteria.</td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 font-mono font-extrabold text-primary">#{o.orderNumber}</td>
                    <td className="p-4">
                      <div className="font-bold text-navy">{o.customerName}</div>
                      <div className="text-[11px] text-gray-400">{o.customerEmail} • {o.city}</div>
                    </td>
                    <td className="p-4 font-extrabold text-navy">{formatINR(o.totalAmount)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        o.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {o.paymentMethod.toUpperCase()} • {o.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="p-1.5 border rounded-lg text-xs font-bold bg-white focus:outline-none focus:border-primary"
                      >
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openOrderDetails(o.id)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-primary rounded-xl font-bold flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer */}
      {isDetailsOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-navy-deep/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                  <div className="text-xs text-gray-400 font-mono">Order Details</div>
                  <h3 className="font-extrabold text-navy text-xl font-mono">#{selectedOrder.orderNumber}</h3>
                </div>
                <button onClick={() => setIsDetailsOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Shipping Box */}
              <div className="p-4 bg-gray-50 rounded-2xl space-y-2 text-xs">
                <div className="font-bold text-navy text-sm">{selectedOrder.customerName}</div>
                <div className="text-gray-600">Email: {selectedOrder.customerEmail}</div>
                <div className="text-gray-600">Phone: {selectedOrder.customerPhone}</div>
                <div className="pt-2 border-t border-gray-200 font-medium text-gray-700">
                  {selectedOrder.shippingAddress.flat}, {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="font-bold text-navy text-xs uppercase tracking-wider">Ordered Products</div>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl text-xs">
                    {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 object-contain rounded border p-0.5" />}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 truncate">{item.name}</div>
                      <div className="text-gray-400 font-mono text-[10px]">SKU: {item.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-navy">{formatINR(item.subtotal)}</div>
                      <div className="text-[10px] text-gray-400">Qty: {item.quantity} × {formatINR(item.unitPrice)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Totals */}
              <div className="p-4 bg-surface-hero rounded-2xl border border-blue-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatINR(selectedOrder.subtotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>18% GST</span><span>{formatINR(selectedOrder.taxAmount)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{formatINR(selectedOrder.shippingFee)}</span></div>
                <div className="flex justify-between font-bold text-navy text-sm pt-2 border-t border-blue-200">
                  <span>Grand Total</span>
                  <span className="text-primary">{formatINR(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
