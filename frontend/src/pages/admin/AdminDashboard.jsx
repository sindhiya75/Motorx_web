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
  Minus,
  Edit2,
  Trash2,
  ArrowRight,
  ShieldCheck,
  X
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
import { normalizeProductImageUrl, handleImageError } from '../../utils/imageHelper';

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
    <div className="h-screen max-h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      
      {/* Top Admin Navigation Header */}
      <header className="bg-navy text-white border-b border-navy-light shrink-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">
              SD
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-wider text-white">SEVAL DRONES</span>
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
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 flex-1 min-h-0 flex flex-col md:flex-row gap-6 overflow-hidden">
        
        {/* Tab Content Display Area (Left Content Pane) */}
        <main className="flex-1 w-full min-w-0 h-full overflow-y-auto pr-1 md:pr-3 pb-6">
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

        {/* Admin Navigation Sidebar (Right Navigation Pane) */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col justify-between gap-3 h-full overflow-y-auto pb-6">
          <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-card space-y-1">
            <div className="px-3 py-1.5 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
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
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                    item.danger
                      ? 'text-rose-600 hover:bg-rose-50'
                      : active
                      ? 'bg-primary text-white shadow-md'
                      : 'text-slate-800 hover:bg-gray-100 hover:text-navy font-bold'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${active ? 'text-white' : item.danger ? 'text-rose-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

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
          <p className="text-xs text-slate-600 font-medium">Live PostgreSQL metric summary and quick store actions</p>
        </div>
      </div>

      {/* Analytics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-card flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Revenue</div>
            <div className="text-2xl font-extrabold text-navy mt-1">{formatINR(metrics.totalRevenue)}</div>
            <div className="text-xs text-emerald-700 font-bold mt-1">✓ Express DB Calculated</div>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-card flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Orders</div>
            <div className="text-2xl font-extrabold text-navy mt-1">{metrics.totalOrders}</div>
            <div className="text-xs text-primary font-bold mt-1">{metrics.pendingOrders} Pending Processing</div>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center font-bold">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-card flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Catalog Products</div>
            <div className="text-2xl font-extrabold text-navy mt-1">{metrics.totalProducts}</div>
            <div className="text-xs text-slate-600 font-bold mt-1">Active SKUs</div>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-card flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Stock Alerts</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{metrics.lowStockCount}</div>
            <div className="text-xs text-slate-600 font-bold mt-1">Low / Out-of-Stock</div>
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
  const [categoriesList, setCategoriesList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    isManualCategory: false,
    newCategoryName: '',
    brandId: '',
    isManualBrand: false,
    newBrandName: '',
    price: '',
    salePrice: '',
    status: 'IN_STOCK',
    stock: 10,
    image: '/products/cured_products/Carbon_Fiber_Sheet.jpeg',
    featured: false
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

  const refreshMetadata = async () => {
    try {
      const [cats, brs] = await Promise.all([fetchCategories(), fetchBrands()]);
      setCategoriesList(cats || []);
      setBrandsList(brs || []);
    } catch (err) {
      console.warn('Failed to load categories/brands:', err.message);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadMeta() {
      try {
        const [cats, brs] = await Promise.all([fetchCategories(), fetchBrands()]);
        if (isMounted) {
          setCategoriesList(cats || []);
          setBrandsList(brs || []);
        }
      } catch (err) {
        console.warn('Failed to load categories/brands:', err.message);
      }
    }
    loadMeta();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => { loadProducts(); }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        price: formData.price,
        salePrice: formData.salePrice,
        status: formData.status,
        stock: formData.stock,
        image: formData.image,
        featured: formData.featured,
        categoryId: formData.isManualCategory ? null : formData.categoryId,
        newCategoryName: formData.isManualCategory ? formData.newCategoryName.trim() : undefined,
        brandId: formData.isManualBrand ? null : formData.brandId,
        newBrandName: formData.isManualBrand ? formData.newBrandName.trim() : undefined
      };

      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, payload);
        addToast(`Updated product "${formData.name}"`, 'success');
      } else {
        await createAdminProduct(payload);
        addToast(`Created product "${formData.name}"`, 'success');
      }
      setIsAddModalOpen(false);
      setEditingProduct(null);
      await refreshMetadata();
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
              name: '',
              categoryId: categoriesList[0]?.id || '',
              isManualCategory: false,
              newCategoryName: '',
              brandId: brandsList[0]?.id || '',
              isManualBrand: false,
              newBrandName: '',
              price: '',
              salePrice: '',
              status: 'IN_STOCK',
              stock: 10,
              image: '/products/cured_products/Carbon_Fiber_Sheet.jpeg',
              featured: false
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
            <thead className="bg-gray-50 border-b border-gray-200 text-slate-700 font-extrabold uppercase">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category & Brand</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr><td colSpan="7" className="p-6 text-center text-gray-400">Loading catalog...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="7" className="p-6 text-center text-gray-400">No products found.</td></tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="hover:bg-blue-50/20">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={normalizeProductImageUrl(p.image)}
                        onError={handleImageError}
                        alt={p.name}
                        className="w-9 h-9 object-contain bg-gray-50 rounded border p-0.5 shrink-0"
                      />
                      <div className="font-bold text-navy max-w-xs">{p.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800 text-xs">{p.category || 'General Composites'}</div>
                      <div className="text-[11px] text-gray-400">{p.brand || 'Seval Drones Composites'}</div>
                    </td>
                    <td className="p-4 font-mono font-bold text-primary">{p.sku}</td>
                    <td className="p-4 font-bold text-navy">
                      <div>{formatINR(p.salePrice || p.price)}</div>
                      {p.salePrice && <div className="text-[10px] text-gray-400 line-through">{formatINR(p.price)}</div>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        p.status === 'IN_STOCK' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>{p.status}</span>
                    </td>
                    <td className="p-4 font-bold">{p.stock} units</td>
                    <td className="p-4 text-right space-x-1">
                      <button onClick={() => {
                        setEditingProduct(p);
                        setFormData({
                          name: p.name,
                          categoryId: p.categoryId || '',
                          isManualCategory: false,
                          newCategoryName: '',
                          brandId: p.brandId || '',
                          isManualBrand: false,
                          newBrandName: '',
                          price: p.price,
                          salePrice: p.salePrice || '',
                          status: p.status,
                          stock: p.stock,
                          image: p.image || '',
                          featured: p.featured || false
                        });
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-deep/60 backdrop-blur-sm overflow-hidden">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-gray-100 bg-white shrink-0">
              <div>
                <h3 className="font-bold text-navy text-base">
                  {editingProduct ? `Edit Product #${editingProduct.id}` : 'Create New Product'}
                </h3>
                <p className="text-[11px] text-gray-500">Configure product specifications, pricing and inventory</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden text-xs">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. AeroCore Structural PVC Foam Core"
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Category & Brand Side-by-Side in 2-column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Category */}
                  <div className="p-2.5 bg-gray-50/90 rounded-xl border border-gray-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-navy text-[11px]">Category *</label>
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          isManualCategory: !formData.isManualCategory,
                          newCategoryName: ''
                        })}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        {formData.isManualCategory ? '← Select Existing' : '+ New Category'}
                      </button>
                    </div>
                    {formData.isManualCategory ? (
                      <input
                        type="text"
                        required
                        value={formData.newCategoryName}
                        onChange={e => setFormData({ ...formData, newCategoryName: e.target.value })}
                        placeholder="New category name"
                        className="w-full p-2 border border-primary/50 bg-white rounded-lg text-navy font-bold text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    ) : (
                      <select
                        required
                        value={formData.categoryId}
                        onChange={e => {
                          if (e.target.value === '__NEW__') {
                            setFormData({ ...formData, isManualCategory: true, newCategoryName: '' });
                          } else {
                            setFormData({ ...formData, categoryId: e.target.value });
                          }
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white font-medium text-gray-800 text-xs"
                      >
                        <option value="">Select Category</option>
                        {categoriesList.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                        <option value="__NEW__">+ Enter New Category...</option>
                      </select>
                    )}
                  </div>

                  {/* Brand */}
                  <div className="p-2.5 bg-gray-50/90 rounded-xl border border-gray-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-navy text-[11px]">Brand / Manufacturer</label>
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          isManualBrand: !formData.isManualBrand,
                          newBrandName: ''
                        })}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        {formData.isManualBrand ? '← Select Existing' : '+ New Brand'}
                      </button>
                    </div>
                    {formData.isManualBrand ? (
                      <input
                        type="text"
                        required
                        value={formData.newBrandName}
                        onChange={e => setFormData({ ...formData, newBrandName: e.target.value })}
                        placeholder="New brand name"
                        className="w-full p-2 border border-primary/50 bg-white rounded-lg text-navy font-bold text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    ) : (
                      <select
                        value={formData.brandId}
                        onChange={e => {
                          if (e.target.value === '__NEW__') {
                            setFormData({ ...formData, isManualBrand: true, newBrandName: '' });
                          } else {
                            setFormData({ ...formData, brandId: e.target.value });
                          }
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white font-medium text-gray-800 text-xs"
                      >
                        <option value="">Select Brand</option>
                        {brandsList.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                        <option value="__NEW__">+ Enter New Brand...</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Price & Sale Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Sale Price (₹)</label>
                    <input
                      type="number"
                      value={formData.salePrice}
                      onChange={e => setFormData({ ...formData, salePrice: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Stock & Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-xl bg-white text-xs focus:outline-none focus:border-primary"
                    >
                      <option value="IN_STOCK">IN_STOCK</option>
                      <option value="LOW_STOCK">LOW_STOCK</option>
                      <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                    </select>
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Image URL / Path</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                    placeholder="/products/cured_products/Carbon_Fiber_Sheet.jpeg"
                    className="w-full p-2.5 border border-gray-300 rounded-xl font-mono text-[11px] focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Modal Sticky Footer */}
              <div className="flex items-center justify-end gap-2.5 px-5 sm:px-6 py-3 border-t border-gray-100 bg-gray-50/70 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-white transition-colors text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md transition-colors text-xs"
                >
                  {editingProduct ? 'Save Changes' : 'Create & Save Product'}
                </button>
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
            <thead className="bg-gray-50 border-b border-gray-200 text-slate-700 font-extrabold uppercase">
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
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [adjustModalItem, setAdjustModalItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminInventory(lowStockOnly);
      setInventory(data || []);
    } catch (err) {
      addToast(err.message || 'Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInventory(); }, [lowStockOnly]);

  const handleSaveAdjustStock = async (e) => {
    e.preventDefault();
    if (!adjustModalItem) return;
    const qty = parseInt(adjustModalItem.newStock, 10);
    const threshold = parseInt(adjustModalItem.newThreshold, 10);

    if (isNaN(qty) || qty < 0) {
      addToast('Please enter a valid stock quantity (0 or higher)', 'error');
      return;
    }

    setSaving(true);
    try {
      await updateAdminStock(adjustModalItem.productId, qty, isNaN(threshold) ? 5 : threshold);
      addToast(`Updated stock for "${adjustModalItem.productName || adjustModalItem.name}" to ${qty} units`, 'success');
      setAdjustModalItem(null);
      loadInventory();
    } catch (err) {
      addToast(err.message || 'Stock update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-3">
        <div>
          <h2 className="text-2xl font-extrabold text-navy">Warehouse Inventory Control</h2>
          <p className="text-xs text-gray-500">Monitor warehouse stock quantities, SKU levels, and adjust inventory</p>
        </div>
        <button onClick={loadInventory} className="p-2 text-gray-500 hover:text-primary rounded-xl border border-gray-200 bg-white">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and stats bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
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
          Total Tracked Products: <strong className="text-navy font-bold">{inventory.length}</strong>
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-slate-700 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="p-4">SKU</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Stock Status</th>
                <th className="p-4">Stock Quantity</th>
                <th className="p-4">Threshold</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-400">Loading stock levels from PostgreSQL...</td></tr>
              ) : inventory.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-400">No inventory records matching criteria.</td></tr>
              ) : (
                inventory.map(inv => {
                  const isOut = inv.stockQuantity === 0;
                  const isLow = inv.stockQuantity <= (inv.lowStockThreshold || 5);
                  const productName = inv.productName || inv.name || 'Product';
                  const sku = inv.productSku || inv.sku || 'N/A';

                  return (
                    <tr key={inv.productId || inv.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="p-4 font-mono font-bold text-primary">{sku}</td>
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={normalizeProductImageUrl(inv.image)}
                          onError={handleImageError}
                          alt={productName}
                          className="w-9 h-9 object-contain bg-gray-50 rounded border p-0.5 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-navy text-xs">{productName}</div>
                          <div className="text-[11px] text-gray-400">{inv.brand || 'Seval Drones Composites'}</div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 font-medium">{inv.category || 'General Composites'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          isOut ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          isLow ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'HEALTHY'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-navy text-xs">
                        {inv.stockQuantity} units
                      </td>
                      <td className="p-4 font-mono text-gray-500">
                        {inv.lowStockThreshold || 5} units
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setAdjustModalItem({
                            productId: inv.productId,
                            productName,
                            productSku: sku,
                            image: inv.image,
                            newStock: inv.stockQuantity,
                            newThreshold: inv.lowStockThreshold || 5,
                            category: inv.category
                          })}
                          className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs shadow-sm transition-colors"
                        >
                          Adjust Stock
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

      {/* Professional Adjust Stock Modal */}
      {adjustModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-navy text-base">Adjust Inventory Stock</h3>
                <span className="font-mono text-xs font-bold text-primary">SKU: {adjustModalItem.productSku}</span>
              </div>
              <button
                onClick={() => setAdjustModalItem(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
              <img
                src={normalizeProductImageUrl(adjustModalItem.image)}
                onError={handleImageError}
                alt={adjustModalItem.productName}
                className="w-12 h-12 object-contain bg-white rounded-xl border p-1 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-navy text-xs truncate">{adjustModalItem.productName}</div>
                <div className="text-[11px] text-gray-500">{adjustModalItem.category || 'Composite Materials'}</div>
              </div>
            </div>

            <form onSubmit={handleSaveAdjustStock} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Current Stock Quantity (Units) *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustModalItem(prev => ({
                      ...prev,
                      newStock: Math.max(0, parseInt(prev.newStock || 0) - 1)
                    }))}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-navy font-bold rounded-xl flex items-center justify-center text-base"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    required
                    value={adjustModalItem.newStock}
                    onChange={(e) => setAdjustModalItem({ ...adjustModalItem, newStock: e.target.value })}
                    className="flex-1 p-2.5 text-center text-base font-extrabold border rounded-xl bg-gray-50 focus:bg-white text-navy focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustModalItem(prev => ({
                      ...prev,
                      newStock: parseInt(prev.newStock || 0) + 1
                    }))}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-navy font-bold rounded-xl flex items-center justify-center text-base"
                  >
                    +
                  </button>
                </div>

                {/* Quick adjustments */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] text-gray-400 font-bold uppercase mr-1">Quick Add:</span>
                  {[5, 10, 25, 50].map(add => (
                    <button
                      key={add}
                      type="button"
                      onClick={() => setAdjustModalItem(prev => ({
                        ...prev,
                        newStock: parseInt(prev.newStock || 0) + add
                      }))}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-primary font-bold text-[11px] rounded-lg transition-colors"
                    >
                      +{add}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAdjustModalItem(prev => ({ ...prev, newStock: 0 }))}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[11px] rounded-lg transition-colors ml-auto"
                  >
                    Set 0
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Low Stock Alert Threshold (Units)
                </label>
                <input
                  type="number"
                  min="1"
                  value={adjustModalItem.newThreshold}
                  onChange={(e) => setAdjustModalItem({ ...adjustModalItem, newThreshold: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white text-xs font-semibold"
                />
                <p className="text-[10px] text-gray-400 mt-1">Triggers low stock warnings when quantity drops at or below this value.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAdjustModalItem(null)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Stock Quantity</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
            <thead className="bg-gray-50 border-b border-gray-200 text-slate-700 font-extrabold uppercase">
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
    storeName: 'Seval Drones E-Commerce',
    gstRate: '18',
    currency: 'INR (₹)',
    shippingFee: '150',
    freeShippingMin: '5000',
    supportEmail: 'mjayakumaraero@gmail.com'
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
