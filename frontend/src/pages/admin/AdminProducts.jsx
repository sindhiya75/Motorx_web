import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Search, Edit2, Trash2, CheckCircle2, AlertTriangle, ArrowLeft, RefreshCw, X } from 'lucide-react';
import { fetchAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct } from '../../services/adminApi';
import { formatINR } from '../../utils/formatINR';
import { useToast } from '../../context/ToastContext';
import { normalizeProductImageUrl, handleImageError } from '../../utils/imageHelper';

import { fetchCategories, fetchBrands } from '../../services/api';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
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
      const res = await fetchAdminProducts({ page: pagination.page, limit: 12, search });
      setProducts(res.data || []);
      setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      addToast(err.message || 'Failed to load products', 'error');
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

  useEffect(() => {
    loadProducts();
  }, [pagination.page, search]);

  const handleCreateOrUpdate = async (e) => {
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
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteAdminProduct(id);
        addToast(`Deleted product #${id}`, 'info');
        loadProducts();
      } catch (err) {
        addToast(err.message || 'Delete failed', 'error');
      }
    }
  };

  const openEditModal = (p) => {
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
      image: p.image || '/products/cured_products/Carbon_Fiber_Sheet.jpeg',
      featured: p.featured || false
    });
    setIsAddModalOpen(true);
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
            <h1 className="text-2xl font-extrabold text-navy">Products Catalogue Management</h1>
            <p className="text-xs text-gray-500">Add, edit, or delete drone motors and DIY components</p>
          </div>
        </div>

        <button
          type="button"
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
          className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> ADD NEW MOTOR
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-card">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-primary"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
        </div>

        <button onClick={loadProducts} className="p-2 text-gray-500 hover:text-primary rounded-lg border border-gray-200">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Motor</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">Loading catalog from PostgreSQL...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">No products found matching query.</td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={normalizeProductImageUrl(p.image)}
                        onError={handleImageError}
                        alt={p.name}
                        className="w-10 h-10 object-contain rounded border p-0.5 bg-gray-50 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-navy text-xs">{p.name}</div>
                        <div className="text-[11px] text-gray-400">{p.category} • {p.brand}</div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-primary">{p.sku}</td>
                    <td className="p-4">
                      <span className="font-bold text-navy">{formatINR(p.salePrice || p.price)}</span>
                      {p.salePrice && <span className="block text-[10px] text-gray-400 line-through">{formatINR(p.price)}</span>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'IN_STOCK' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        p.status === 'LOW_STOCK' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-navy">{p.stock} units</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-primary rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-deep/60 backdrop-blur-sm overflow-hidden">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-gray-100 bg-white shrink-0">
              <div>
                <h3 className="font-bold text-navy text-base">
                  {editingProduct ? `Edit Motor #${editingProduct.id}` : 'Add New Motor Model'}
                </h3>
                <p className="text-[11px] text-gray-500">Configure motor specifications, pricing and inventory</p>
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
            <form onSubmit={handleCreateOrUpdate} className="flex flex-col flex-1 overflow-hidden text-xs">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="e.g. AeroCore Structural PVC Foam Core"
                  />
                </div>

                {/* Category & Brand Side-by-Side in 2-column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Category Selection / Manual Entry */}
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

                  {/* Brand Selection / Manual Entry */}
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

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Regular Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Sale Price (₹)</label>
                    <input
                      type="number"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-xl bg-white text-xs focus:outline-none focus:border-primary"
                    >
                      <option value="IN_STOCK">IN_STOCK</option>
                      <option value="LOW_STOCK">LOW_STOCK</option>
                      <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                      <option value="PRICE_ON_REQUEST">PRICE_ON_REQUEST</option>
                    </select>
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Image URL / Path</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
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
                  {editingProduct ? 'Save Changes' : 'Create Motor Model'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
