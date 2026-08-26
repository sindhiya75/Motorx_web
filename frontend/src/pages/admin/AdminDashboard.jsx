import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Award,
  ShoppingCart,
  Boxes,
  Users,
  Settings,
  Key,
  LogOut,
  IndianRupee,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Lock,
  Loader2,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  fetchAdminAnalyticsSummary,
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  fetchAdminOrders,
  fetchAdminOrderDetails,
  updateAdminOrderStatus,
  fetchAdminInventory,
  updateAdminStock,
  fetchAdminCustomers,
  changeAdminPassword
} from '../../services/adminApi';
import { fetchCategories, fetchBrands } from '../../services/api';
import { formatINR } from '../../utils/formatINR';
import { useToast } from '../../context/ToastContext';

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'dashboard';

  const [activeTab, setActiveTab] = useState(initialTab);
  const { adminUser, logoutAdmin } = useAdminAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Sync tab with search params
  const handleTabChange = (tabId) => {
    if (tabId === 'logout') {
      handleLogout();
      return;
    }
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const handleLogout = () => {
    logoutAdmin();
    addToast('Admin logged out successfully', 'info');
    navigate('/admin/login');
  };

  // State definitions for tabs
  const [metrics, setMetrics] = useState({ totalRevenue: 0, totalOrders: 0, pendingOrders: 0, totalProducts: 25, lowStockCount: 0 });
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Load analytics for dashboard
  useEffect(() => {
    let isMounted = true;
    async function loadMetrics() {
      try {
        const data = await fetchAdminAnalyticsSummary();
        if (isMounted && data) setMetrics(data);
      } catch (err) {
        console.warn('Analytics fetch notice:', err.message);
      } finally {
        if (isMounted) setMetricsLoading(false);
      }
    }
    loadMetrics();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Top Admin Navigation Header */}
      <header className="bg-navy text-white border-b border-navy-light sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">
              MX
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-wider text-white">MOTORX</span>
              <span className="ml-2 text-[10px] bg-primary/30 text-blue-300 px-2 py-0.5 rounded border border-primary/40 font-mono">
                ADMIN PORTAL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:block text-right">
              <div className="font-bold text-white">{adminUser?.name || 'Administrator'}</div>
              <div className="text-[11px] text-gray-300">{adminUser?.email}</div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col md:flex-row gap-8">
        
        {/* Admin Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-2">
          <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-card space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Control Modules
            </div>

            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'categories', label: 'Categories', icon: Layers },
              { id: 'brands', label: 'Brands', icon: Award },
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
              { id: 'inventory', label: 'Inventory', icon: Boxes },
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'change-password', label: 'Change Password', icon: Key },
              { id: 'logout', label: 'Logout', icon: LogOut, danger: true }
            ].map(item => {
              const IconComp = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    item.danger
                      ? 'text-rose-600 hover:bg-rose-50'
                      : active
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-navy'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${active ? 'text-white' : item.danger ? 'text-rose-600' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl text-[11px] text-gray-600 space-y-1">
            <div className="font-bold text-navy flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Active PostgreSQL Connection
            </div>
            <p className="text-gray-500 text-[10px]">
              Admin auth & live store data backed by Node.js/Express API.
            </p>
          </div>
        </aside>

        {/* Tab Content Display Area */}
        <main className="flex-1 w-full min-w-0">
          {activeTab === 'dashboard' && <DashboardTab metrics={metrics} loading={metricsLoading} onSelectTab={handleTabChange} />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'categories' && <CategoriesTab />}
          {activeTab === 'brands' && <BrandsTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'inventory' && <InventoryTab />}
          {activeTab === 'customers' && <CustomersTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'change-password' && <ChangePasswordTab />}
        </main>
      </div>

    </div>
  );
}

/* ========================================================================== */
/* TAB 1: DASHBOARD OVERVIEW */
/* ========================================================================== */
function DashboardTab({ metrics, loading, onSelectTab }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div>
          <h2 className="text-2xl font-extrabold text-navy">Store Analytics & Control Panel</h2>
          <p className="text-xs text-gray-500">Live PostgreSQL metric summary and quick store actions</p>
        </div>
      </div>

      {/* Analytics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-card flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</div>
            <div className="text-2xl font-extrabold text-navy mt-1">{formatINR(metrics.totalRevenue)}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">✓ Express DB Calculated</div>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-card flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</div>
            <div className="text-2xl font-extrabold text-navy mt-1">{metrics.totalOrders}</div>
            <div className="text-[11px] text-primary font-semibold mt-1">{metrics.pendingOrders} Pending Processing</div>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center font-bold">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-card flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Catalog Products</div>
            <div className="text-2xl font-extrabold text-navy mt-1">{metrics.totalProducts}</div>
            <div className="text-[11px] text-gray-500 font-semibold mt-1">Active SKUs</div>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-card flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stock Alerts</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{metrics.lowStockCount}</div>
            <div className="text-[11px] text-gray-500 font-semibold mt-1">Low / Out-of-Stock</div>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Access Modules Grid */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-card space-y-4">
        <h3 className="text-base font-bold text-navy border-b border-gray-100 pb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Store Management Shortcuts
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {[
            { tab: 'products', title: 'Products Catalog', desc: 'Add new motors, adjust prices & specs', icon: Package },
            { tab: 'orders', title: 'Customer Orders', desc: 'View guest orders & update fulfillment status', icon: ShoppingCart },
            { tab: 'inventory', title: 'Warehouse Inventory', desc: 'Monitor stock levels & restock SKUs', icon: Boxes },
            { tab: 'categories', title: 'Product Categories', desc: 'View composite & motor categories', icon: Layers },
            { tab: 'customers', title: 'Customer Database', desc: 'View customer purchase history & contact info', icon: Users },
            { tab: 'settings', title: 'Store Settings', desc: 'Configure GST rates, shipping & support details', icon: Settings },
          ].map(mod => {
            const IconComp = mod.icon;
            return (
              <button
                key={mod.tab}
                onClick={() => onSelectTab(mod.tab)}
                className="p-5 bg-surface-hero hover:bg-blue-50/80 rounded-2xl border border-blue-100 transition-all text-left space-y-2 group shadow-sm hover:shadow-md"
              >
                <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="font-bold text-navy text-sm group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>{mod.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">{mod.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* TAB 2: PRODUCTS MANAGEMENT */
/* ========================================================================== */
function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '', price: '', salePrice: '', status: 'IN_STOCK', stock: 10,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', featured: false
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminProducts({ limit: 50, search });
      setProducts(res.data || []);
    } catch (err) {
      addToast(err.message || 'Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, formData);
        addToast(`Updated product "${formData.name}"`, 'success');
      } else {
        await createAdminProduct(formData);
        addToast(`Created product "${formData.name}"`, 'success');
      }
      setIsAddModalOpen(false);
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      addToast(err.message || 'Action failed', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete "${name}" from PostgreSQL database?`)) {
      try {
        await deleteAdminProduct(id);
        addToast(`Deleted product #${id}`, 'info');
        loadProducts();
      } catch (err) {
        addToast(err.message || 'Delete failed', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-3">
        <div>
          <h2 className="text-2xl font-extrabold text-navy">Products Management</h2>
          <p className="text-xs text-gray-500">Add, update, or remove composite & motor products</p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({
              name: '', price: '', salePrice: '', status: 'IN_STOCK', stock: 10,
              image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', featured: false
            });
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> ADD NEW PRODUCT
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product name or SKU..."
          className="w-full max-w-md px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-primary"
        />
        <button onClick={loadProducts} className="p-2 text-gray-500 hover:text-primary rounded-lg border border-gray-200">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr><td colSpan="6" className="p-6 text-center text-gray-400">Loading catalog...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-gray-400">No products found.</td></tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="hover:bg-blue-50/20">
                    <td className="p-4 flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-9 h-9 object-contain bg-gray-50 rounded border p-0.5" />
                      <div>
                        <div className="font-bold text-navy">{p.name}</div>
                        <div className="text-[10px] text-gray-400">{p.category}</div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-primary">{p.sku}</td>
                    <td className="p-4 font-bold text-navy">{formatINR(p.salePrice || p.price)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        p.status === 'IN_STOCK' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>{p.status}</span>
                    </td>
                    <td className="p-4 font-bold">{p.stock} units</td>
                    <td className="p-4 text-right space-x-1">
                      <button onClick={() => {
                        setEditingProduct(p);
                        setFormData({ name: p.name, price: p.price, salePrice: p.salePrice || '', status: p.status, stock: p.stock, image: p.image || '', featured: p.featured || false });
                        setIsAddModalOpen(true);
                      }} className="p-1.5 bg-blue-50 text-primary rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-navy text-base border-b pb-2">
              {editingProduct ? `Edit Product #${editingProduct.id}` : 'Create New Motor Product'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Product Name *</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Price (₹) *</label>
                  <input type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full p-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sale Price (₹)</label>
                  <input type="number" value={formData.salePrice} onChange={e => setFormData({ ...formData, salePrice: e.target.value })} className="w-full p-2 border rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Stock Quantity *</label>
                  <input type="number" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="w-full p-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full p-2 border rounded-xl bg-white">
                    <option value="IN_STOCK">IN_STOCK</option>
                    <option value="LOW_STOCK">LOW_STOCK</option>
                    <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Image URL</label>
                <input type="url" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="w-full p-2 border rounded-xl font-mono text-[11px]" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white font-bold rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================================================== */
/* TAB 3: CATEGORIES MANAGEMENT */
/* ========================================================================== */
function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const data = await fetchCategories();
      if (isMounted) { setCategories(data || []); setLoading(false); }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-3">
        <h2 className="text-2xl font-extrabold text-navy">Categories Directory</h2>
        <p className="text-xs text-gray-500">Active motor and composite product categories from PostgreSQL</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-6 text-center text-gray-400">Loading categories...</div>
        ) : (
          categories.map(c => (
            <div key={c.id || c.slug} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-primary font-bold">/{c.slug}</span>
                <span className="px-2 py-0.5 bg-blue-50 text-primary text-[10px] font-bold rounded-full">{c.count || 0} Models</span>
              </div>
              <h3 className="font-bold text-navy text-base">{c.name}</h3>
              <p className="text-xs text-gray-500">{c.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* TAB 4: BRANDS MANAGEMENT */
/* ========================================================================== */
function BrandsTab() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const data = await fetchBrands();
      if (isMounted) { setBrands(data || []); setLoading(false); }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-3">
        <h2 className="text-2xl font-extrabold text-navy">Manufacturer Brands</h2>
        <p className="text-xs text-gray-500">Certified component brands listed in store</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-6 text-center text-gray-400">Loading brands...</div>
        ) : (
          brands.map(b => (
            <div key={b.id || b.slug} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-card space-y-2">
              <div className="w-10 h-10 bg-navy text-white rounded-xl flex items-center justify-center font-bold text-xs">
                {b.name.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="font-bold text-navy text-base">{b.name}</h3>
              <span className="text-xs font-mono text-gray-400">Slug: {b.slug}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* TAB 5: ORDERS MANAGEMENT */
/* ========================================================================== */
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminOrders();
      setOrders(res.data || []);
    } catch (err) {
      addToast(err.message || 'Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateAdminOrderStatus(orderId, status);
      addToast(`Updated order status to ${status}`, 'success');
      loadOrders();
    } catch (err) {
      addToast(err.message || 'Status update failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div>
          <h2 className="text-2xl font-extrabold text-navy">Guest Customer Orders</h2>
          <p className="text-xs text-gray-500">Manage order fulfillment & payment verification</p>
        </div>
        <button onClick={loadOrders} className="p-2 text-gray-500 hover:text-primary border rounded-lg">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
              <tr>
                <th className="p-4">Order #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr><td colSpan="5" className="p-6 text-center text-gray-400">Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-gray-400">No orders recorded in database yet.</td></tr>
              ) : (
                orders.map(o => (
                  <tr key={o.id} className="hover:bg-blue-50/20">
                    <td className="p-4 font-mono font-bold text-primary">#{o.orderNumber}</td>
                    <td className="p-4">
                      <div className="font-bold text-navy">{o.customerName}</div>
                      <div className="text-[10px] text-gray-400">{o.customerEmail} • {o.customerPhone}</div>
                    </td>
                    <td className="p-4 font-bold text-navy">{formatINR(o.totalAmount)}</td>
                    <td className="p-4 uppercase text-[10px] font-bold text-gray-600">{o.paymentMethod} ({o.paymentStatus})</td>
                    <td className="p-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="p-1.5 border rounded-lg bg-white text-xs font-bold"
                      >
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* TAB 6: INVENTORY CONTROL */
/* ========================================================================== */
function InventoryTab() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminInventory();
      setInventory(data || []);
    } catch (err) {
      addToast(err.message || 'Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInventory(); }, []);

  const handleUpdateStock = async (productId, currentStock) => {
    const newStockStr = window.prompt("Enter new stock quantity for product:", currentStock);
    if (newStockStr !== null) {
      const newStock = parseInt(newStockStr, 10);
      if (!isNaN(newStock) && newStock >= 0) {
        try {
          await updateAdminStock(productId, newStock);
          addToast(`Updated stock quantity to ${newStock}`, 'success');
          loadInventory();
        } catch (err) {
          addToast(err.message || 'Stock update failed', 'error');
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-3">
        <h2 className="text-2xl font-extrabold text-navy">Warehouse Inventory Control</h2>
        <p className="text-xs text-gray-500">Monitor stock levels & trigger restock alerts</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
              <tr>
                <th className="p-4">SKU</th>
                <th className="p-4">Motor Model</th>
                <th className="p-4">Stock Quantity</th>
                <th className="p-4">Threshold</th>
                <th className="p-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr><td colSpan="5" className="p-6 text-center text-gray-400">Loading stock levels...</td></tr>
              ) : inventory.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-gray-400">No inventory records.</td></tr>
              ) : (
                inventory.map(inv => (
                  <tr key={inv.productId} className="hover:bg-blue-50/20">
                    <td className="p-4 font-mono font-bold text-primary">{inv.sku}</td>
                    <td className="p-4 font-bold text-navy">{inv.name}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                        inv.stockQuantity <= inv.lowStockThreshold ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {inv.stockQuantity} units
                      </span>
                    </td>
                    <td className="p-4 font-mono text-gray-500">{inv.lowStockThreshold} units</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleUpdateStock(inv.productId, inv.stockQuantity)}
                        className="px-3 py-1 bg-primary text-white font-bold rounded-lg text-xs hover:bg-primary-hover"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* TAB 7: CUSTOMERS LIST */
/* ========================================================================== */
function CustomersTab() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await fetchAdminCustomers();
        if (isMounted) setCustomers(data || []);
      } catch (err) {
        console.warn('Customer fetch notice:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-3">
        <h2 className="text-2xl font-extrabold text-navy">Customer Database</h2>
        <p className="text-xs text-gray-500">Customers who placed orders in store (PostgreSQL Orders)</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Location</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr><td colSpan="6" className="p-6 text-center text-gray-400">Loading customers...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-gray-400">No customer checkout records found yet.</td></tr>
              ) : (
                customers.map((c, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/20">
                    <td className="p-4 font-bold text-navy">{c.name}</td>
                    <td className="p-4 font-mono text-primary">{c.email}</td>
                    <td className="p-4">{c.phone}</td>
                    <td className="p-4">{c.city}, {c.state}</td>
                    <td className="p-4 font-bold">{c.totalOrders} order(s)</td>
                    <td className="p-4 font-bold text-emerald-600">{formatINR(c.totalSpent)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* TAB 8: STORE SETTINGS */
/* ========================================================================== */
function SettingsTab() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState({
    storeName: 'MOTORX E-Commerce',
    gstRate: '18',
    currency: 'INR (₹)',
    shippingFee: '150',
    freeShippingMin: '5000',
    supportEmail: 'support@motorx.com'
  });

  const handleSave = (e) => {
    e.preventDefault();
    addToast('Store settings saved successfully', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-3">
        <h2 className="text-2xl font-extrabold text-navy">Store Settings & Configuration</h2>
        <p className="text-xs text-gray-500">Manage store tax rates, shipping parameters, and contact info</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-card max-w-2xl">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-navy mb-1 uppercase">Store Name</label>
            <input type="text" value={settings.storeName} onChange={e => setSettings({ ...settings, storeName: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-navy mb-1 uppercase">GST Tax Rate (%)</label>
              <input type="text" value={settings.gstRate} onChange={e => setSettings({ ...settings, gstRate: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
            </div>
            <div>
              <label className="block font-bold text-navy mb-1 uppercase">Base Currency</label>
              <input type="text" value={settings.currency} readOnly className="w-full p-3 border rounded-xl bg-gray-100 font-bold" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-navy mb-1 uppercase">Flat Shipping Fee (₹)</label>
              <input type="text" value={settings.shippingFee} onChange={e => setSettings({ ...settings, shippingFee: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
            </div>
            <div>
              <label className="block font-bold text-navy mb-1 uppercase">Free Shipping Min (₹)</label>
              <input type="text" value={settings.freeShippingMin} onChange={e => setSettings({ ...settings, freeShippingMin: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-navy mb-1 uppercase">Support Email</label>
            <input type="email" value={settings.supportEmail} onChange={e => setSettings({ ...settings, supportEmail: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
          </div>

          <button type="submit" className="px-6 py-3 bg-navy hover:bg-navy-light text-white font-bold rounded-xl shadow-md transition-colors uppercase tracking-wider">
            SAVE CONFIGURATION
          </button>
        </form>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* TAB 9: CHANGE ADMIN PASSWORD */
/* ========================================================================== */
function ChangePasswordTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      await changeAdminPassword(currentPassword, newPassword);
      addToast('Admin password changed successfully in PostgreSQL', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      addToast(err.message || 'Password update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-3">
        <h2 className="text-2xl font-extrabold text-navy">Security & Password</h2>
        <p className="text-xs text-gray-500">Update administrative password in Node.js / PostgreSQL database</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-card max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-navy mb-1 uppercase">Current Admin Password *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-navy mb-1 uppercase">New Password *</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-navy mb-1 uppercase">Confirm New Password *</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-navy hover:bg-navy-light text-white font-extrabold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>UPDATE ADMIN PASSWORD</span>}
          </button>
        </form>
      </div>
    </div>
  );
}
