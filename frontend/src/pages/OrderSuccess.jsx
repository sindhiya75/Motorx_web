import React from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Truck } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { formatINR } from '../utils/formatINR';

export default function OrderSuccess() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const orderData = location.state?.order;
  const orderId = orderData?.orderNumber || searchParams.get('orderNumber') || "MX10001";

  const breadcrumbItems = [
    { label: 'Checkout', url: '/checkout' },
    { label: 'Order Success', url: '' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Main Success Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-xl text-center space-y-6">
        
        {/* Animated Check Icon */}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Order Confirmed & Saved
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
            ORDER PLACED SUCCESSFULLY
          </h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Thank you for your purchase{orderData?.customerName ? `, ${orderData.customerName}` : ''}! Your order has been registered in the database.
          </p>
        </div>

        {/* Order Details Banner */}
        <div className="bg-surface-hero p-4 sm:p-6 rounded-2xl border border-blue-100 max-w-md mx-auto space-y-2">
          <div className="text-xs text-gray-500 font-medium">Order Reference Number</div>
          <div className="text-2xl font-mono font-extrabold text-primary">#{orderId}</div>
          {orderData?.totalAmount && (
            <div className="text-xs font-bold text-navy pt-1">
              Total Payable: {formatINR(orderData.totalAmount)}
            </div>
          )}
          <div className="text-xs text-gray-600 pt-1">
            Estimated Delivery: <strong>3–5 Business Days (Standard Pan-India)</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to={`/orders/${orderId}`}
            className="px-8 py-3.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>TRACK ORDER</span>
          </Link>

          <Link
            to="/motors"
            className="px-8 py-3.5 bg-white border border-gray-300 hover:bg-gray-50 text-navy text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <span>CONTINUE SHOPPING</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Notice */}
        <div className="text-[11px] text-gray-400 pt-6 border-t border-gray-100">
          Your order has been recorded in PostgreSQL. You can view real-time tracking details anytime using your Order Reference Number.
        </div>

      </div>
    </div>
  );
}
