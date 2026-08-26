import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowLeft, RefreshCw, AlertTriangle, Check, Save } from 'lucide-react';
import { fetchAdminInventory, updateAdminStock } from '../../services/adminApi';
import { useToast } from '../../context/ToastContext';

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stockInputs, setStockInputs] = useState({});

  const { addToast } = useToast();

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminInventory(lowStockOnly);
      setInventory(data || []);
      const initialMap = {};
      (data || []).forEach(item => {
        initialMap[item.productId] = item.stockQuantity;
      });
      setStockInputs(initialMap);
    } catch (err) {
      addToast(err.message || 'Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [lowStockOnly]);

  const handleStockUpdate = async (productId, productName) => {
    const qty = stockInputs[productId];
    if (qty === undefined || qty < 0) return;
    try {
      await updateAdminStock(productId, qty);
      addToast(`Updated stock for "${productName}" to ${qty} units`, 'success');
      loadInventory();
    } catch (err) {
      addToast(err.message || 'Stock update failed', 'error');
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
            <h1 className="text-2xl font-extrabold text-navy">Inventory & Stock Control</h1>
            <p className="text-xs text-gray-500">Monitor warehouse stock quantities, low-stock warnings, and restock items</p>
          </div>
        </div>

        <button onClick={loadInventory} className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-navy text-xs font-bold rounded-xl flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> REFRESH INVENTORY
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-card">
        <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="w-4 h-4 text-primary focus:ring-primary rounded border-gray-300"
          />
          <span>Show Low Stock & Out-of-Stock Items Only</span>
        </label>

        <span className="text-xs text-gray-500 font-semibold">
          Total Tracked Items: <strong className="text-navy font-bold">{inventory.length}</strong>
        </span>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Product Name</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Current Stock Quantity</th>
                <th className="p-4 text-right">Quick Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">Loading stock inventory from PostgreSQL...</td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">No inventory items match filter.</td>
                </tr>
              ) : (
                inventory.map((inv) => {
                  const isLow = inv.stockQuantity <= inv.lowStockThreshold;
                  const isOut = inv.stockQuantity === 0;

                  return (
                    <tr key={inv.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        {inv.image && <img src={inv.image} alt={inv.productName} className="w-10 h-10 object-contain rounded border p-0.5 bg-gray-50 shrink-0" />}
                        <div>
                          <div className="font-bold text-navy text-xs">{inv.productName}</div>
                          <div className="text-[11px] text-gray-400">{inv.brand}</div>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-primary">{inv.productSku}</td>
                      <td className="p-4 text-gray-600">{inv.category}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isOut ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          isLow ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'HEALTHY'}
                        </span>
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          min="0"
                          value={stockInputs[inv.productId] !== undefined ? stockInputs[inv.productId] : inv.stockQuantity}
                          onChange={(e) => setStockInputs({ ...stockInputs, [inv.productId]: Number(e.target.value) })}
                          className="w-24 p-2 text-xs font-bold border rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-primary"
                        />
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleStockUpdate(inv.productId, inv.productName)}
                          className="px-3 py-1.5 bg-navy hover:bg-navy-light text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Save className="w-3.5 h-3.5" /> Save
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
