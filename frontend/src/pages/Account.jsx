import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, Heart, MapPin, Bell, LogOut, ChevronRight, Truck, ShieldCheck, Clock } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

export default function Account() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { wishlistItems } = useWishlist();
  const { addToast } = useToast();

  const userProfile = {
    name: "Ananya Sharma",
    email: "ananya.sharma@example.com",
    phone: "+91 98765 43210",
    memberSince: "January 2026",
    gstin: "29AAAAA0000A1Z5"
  };

  const sampleOrders = [
    {
      id: "MX10001",
      date: "11 Aug 2026",
      total: 2624,
      status: "PROCESSING",
      items: "2x AeroDrive C145 1404 4500KV"
    },
    {
      id: "MX09842",
      date: "24 Jul 2026",
      total: 18300,
      status: "DELIVERED",
      items: "1x TitanLift 4006 380KV UAV Motor (2PCS)"
    }
  ];

  const breadcrumbItems = [
    { label: 'Account', url: '/account' }
  ];

  const handleLogout = () => {
    addToast("Logged out of demo session.", "info");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Account Overview Top Card */}
      <div className="bg-navy text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-500 text-white rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-inner">
            AS
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold">{userProfile.name}</h1>
            <p className="text-xs text-blue-200">{userProfile.email} • {userProfile.phone}</p>
            <span className="inline-block text-[10px] bg-blue-900/80 text-blue-300 px-2 py-0.5 rounded-md font-mono mt-1">
              GSTIN: {userProfile.gstin}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-navy-deep hover:bg-navy-light text-gray-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 border border-navy-light/40"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* Account Navigation & Content Grid (3 cols left, 9 cols right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar Menu */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-2 shadow-card space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: User },
            { id: 'orders', label: 'My Orders', icon: Package },
            { id: 'wishlist', label: `Wishlist (${wishlistItems.length})`, icon: Heart },
            { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
            { id: 'profile', label: 'Profile Settings', icon: User },
            { id: 'notifications', label: 'Notifications', icon: Bell }
          ].map((item) => {
            const IconComp = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-between transition-colors ${
                  active
                    ? 'bg-blue-50 text-primary font-extrabold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-navy'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <IconComp className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </button>
            );
          })}
        </div>

        {/* Right Tab Content */}
        <div className="lg:col-span-9 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-card">
          
          {/* Tab 1: Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-navy border-b border-gray-100 pb-3">
                Account Overview
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-surface-hero rounded-2xl border border-blue-100 space-y-1">
                  <div className="text-xs text-gray-500">Total Orders</div>
                  <div className="text-2xl font-bold text-navy">2</div>
                </div>

                <div className="p-4 bg-surface-hero rounded-2xl border border-blue-100 space-y-1">
                  <div className="text-xs text-gray-500">Saved Wishlist</div>
                  <div className="text-2xl font-bold text-navy">{wishlistItems.length}</div>
                </div>

                <div className="p-4 bg-surface-hero rounded-2xl border border-blue-100 space-y-1">
                  <div className="text-xs text-gray-500">Member Status</div>
                  <div className="text-base font-bold text-emerald-600">Verified Pilot</div>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="space-y-3 pt-4">
                <h3 className="font-bold text-navy text-sm">Recent Orders</h3>
                <div className="space-y-3">
                  {sampleOrders.map(ord => (
                    <div key={ord.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-mono font-bold text-navy">#{ord.id}</div>
                        <div className="text-gray-600 font-medium">{ord.items}</div>
                        <div className="text-gray-400 font-mono mt-0.5">{ord.date} • ₹{ord.total.toLocaleString('en-IN')}</div>
                      </div>

                      <Link
                        to={`/orders/${ord.id}`}
                        className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary-hover transition-colors text-center shrink-0"
                      >
                        TRACK ORDER
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: My Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-navy border-b border-gray-100 pb-3">
                My Order History
              </h2>

              <div className="space-y-4">
                {sampleOrders.map(ord => (
                  <div key={ord.id} className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-center text-xs font-mono border-b border-gray-100 pb-2">
                      <span className="font-bold text-navy">Order #{ord.id}</span>
                      <span className="bg-blue-50 text-primary font-bold px-2 py-0.5 rounded">
                        {ord.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-gray-900">{ord.items}</div>
                        <div className="text-gray-400">Placed on {ord.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">Total</div>
                        <div className="font-bold text-navy text-sm">₹{ord.total.toLocaleString('en-IN')}</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex justify-end">
                      <Link
                        to={`/orders/${ord.id}`}
                        className="px-4 py-1.5 bg-navy text-white font-bold text-xs rounded-lg hover:bg-navy-light transition-colors"
                      >
                        View Timeline Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Wishlist Redirect */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4 text-center py-8">
              <Heart className="w-12 h-12 text-rose-500 mx-auto" />
              <h3 className="font-bold text-navy text-lg">Your Wishlist ({wishlistItems.length} Items)</h3>
              <p className="text-xs text-gray-500">Manage all your saved motors and quadcopter components.</p>
              <Link to="/wishlist" className="inline-block px-6 py-2.5 bg-primary text-white font-bold text-xs rounded-xl">
                GO TO WISHLIST PAGE
              </Link>
            </div>
          )}

          {/* Tab 4: Saved Addresses */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-navy border-b border-gray-100 pb-3">
                Saved Shipping Addresses
              </h2>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-navy">
                  <span>Home / Office Address</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Default</span>
                </div>
                <div className="text-gray-700">
                  Flat 402, Aero Heights, Koramangala 8th Block, Near Sony World Signal
                </div>
                <div className="text-gray-600">Bengaluru, Karnataka — 560095, India</div>
              </div>
            </div>
          )}

          {/* Tab 5: Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-navy border-b border-gray-100 pb-3">
                Profile Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1">Full Name</label>
                  <input type="text" readOnly value={userProfile.name} className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-navy" />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Email</label>
                  <input type="text" readOnly value={userProfile.email} className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-navy" />
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-navy border-b border-gray-100 pb-3">
                Order Notifications
              </h2>
              <p className="text-xs text-gray-500">You have no unread notifications.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
