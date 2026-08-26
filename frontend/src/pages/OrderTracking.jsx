import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Truck, ArrowLeft, Box, Loader2, AlertCircle } from 'lucide-react';
import { fetchOrderByNumber } from '../services/api';
import { formatINR } from '../utils/formatINR';
import Breadcrumbs from '../components/Breadcrumbs';

export default function OrderTracking() {
  const { orderId } = useParams();
  const currentOrderId = orderId || "MX10001";

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadOrderDetails() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchOrderByNumber(currentOrderId);
        if (isMounted) {
          if (data) {
            setOrder(data);
          } else {
            setError(`Order #${currentOrderId} could not be found.`);
          }
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to fetch order tracking details');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrderDetails();
    return () => { isMounted = false; };
  }, [currentOrderId]);

  const breadcrumbItems = [
    { label: 'Account', url: '/account' },
    { label: `Order #${currentOrderId}`, url: '' }
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
        <p className="text-xs font-semibold text-gray-500">Fetching order tracking information from PostgreSQL...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-navy">Order Not Found</h2>
        <p className="text-xs text-gray-500">{error || `Order #${currentOrderId} was not found in our records.`}</p>
        <Link to="/motors" className="inline-block px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl">
          RETURN TO MOTORS
        </Link>
      </div>
    );
  }

  const timeline = [
    {
      title: "Order Placed & Registered",
      date: new Date(order.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      completed: true,
      current: order.status === 'PROCESSING',
      desc: `Order received for customer ${order.customerName} (${order.customerPhone}).`
    },
    {
      title: "Payment Confirmed & Verified",
      date: "Instant via " + order.paymentMethod.toUpperCase(),
      completed: true,
      current: false,
      desc: "Order total verified against PostgreSQL database."
    },
    {
      title: "Processing & QC Testing",
      date: "Warehouse Hub",
      completed: order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED',
      current: order.status === 'PROCESSING',
      desc: "Motors undergoing motor bell balance and winding resistance testing."
    },
    {
      title: "Shipped via Express Courier",
      date: order.shippingMethod === 'express' ? 'Air Express 1-2 Days' : 'Standard 3-5 Days',
      completed: order.status === 'SHIPPED' || order.status === 'DELIVERED',
      current: order.status === 'SHIPPED',
      desc: `Destined for ${order.shippingAddress.city}, ${order.shippingAddress.state} (${order.shippingAddress.pincode}).`
    },
    {
      title: "Delivered",
      date: "Final Destination",
      completed: order.status === 'DELIVERED',
      current: order.status === 'DELIVERED',
      desc: "Package delivered to shipping address."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-gray-400 font-medium">Order Status & Live Tracking</div>
          <h1 className="text-2xl font-extrabold text-navy font-mono">#{order.orderNumber}</h1>
          <p className="text-xs text-gray-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} Items • Total: {formatINR(order.totalAmount)}
          </p>
        </div>

        <Link
          to="/account"
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-navy text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Account
        </Link>
      </div>

      {/* Order Timeline Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-card space-y-6">
        <h2 className="text-lg font-bold text-navy border-b border-gray-100 pb-3 flex items-center gap-2">
          <Truck className="w-5 h-5 text-primary" /> Delivery Progress Timeline
        </h2>

        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
          {timeline.map((step, idx) => {
            return (
              <div key={idx} className="relative flex items-start gap-4">
                {/* Status Dot / Icon */}
                <div
                  className={`absolute -left-6 sm:-left-8 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm transition-all ${
                    step.completed
                      ? step.current
                        ? 'bg-primary text-white ring-4 ring-blue-100'
                        : 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-400 border border-gray-300'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="text-[11px]">{idx + 1}</span>
                  )}
                </div>

                {/* Step Details */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`text-sm font-bold ${step.completed ? 'text-navy' : 'text-gray-400'}`}>
                      {step.title}
                    </h3>
                    {step.current && (
                      <span className="text-[10px] font-bold bg-blue-100 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {order.status}
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-mono text-gray-500">{step.date}</div>
                  <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Package Contents Summary */}
      <div className="bg-surface-hero rounded-2xl border border-blue-100 p-6 space-y-3">
        <h3 className="font-bold text-navy text-sm flex items-center gap-2">
          <Box className="w-4 h-4 text-primary" /> Items in Package ({order.items.length})
        </h3>
        <div className="space-y-2 text-xs">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center justify-between font-semibold text-gray-800 bg-white p-3 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                {item.image && <img src={item.image} alt={item.name} className="w-8 h-8 object-contain rounded border p-0.5" />}
                <div>
                  <div>{item.name}</div>
                  <div className="text-[11px] text-gray-400 font-mono">SKU: {item.sku}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-primary font-bold">{formatINR(item.subtotal)}</div>
                <div className="text-[10px] text-gray-400">Qty: {item.quantity} × {formatINR(item.unitPrice)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
