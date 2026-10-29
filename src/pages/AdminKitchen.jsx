// src/pages/AdminKitchen.jsx - Real-time Kitchen Display System (KDS) with audio alerts
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  BellRing,
  AlertCircle,
  Volume2,
  VolumeX,
  RefreshCw,
  UtensilsCrossed,
  Receipt,
  CheckCheck
} from 'lucide-react';
import { playOrderChime } from '../utils/audioAlert.js';
import { useToast } from '../context/ToastContext.jsx';
import { useRestaurant } from '../context/RestaurantContext.jsx';

export function AdminKitchen() {
  const { activeRestaurant } = useRestaurant();
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, RECEIVED, PREPARING, READY
  const [isUpdating, setIsUpdating] = useState(false);

  const prevOrderCountRef = useRef(0);

  // Fetch active orders for this restaurant
  const fetchOrders = () => {
    if (!activeRestaurant) return;
    fetch(`/api/orders?status=active&restaurant_id=${activeRestaurant.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.orders) {
          if (data.orders.length > prevOrderCountRef.current) {
            if (soundEnabled && prevOrderCountRef.current > 0) {
              playOrderChime();
              addToast('Ding! New order received from table!', 'info');
            }
          }
          prevOrderCountRef.current = data.orders.length;
          setOrders(data.orders);
        }
      })
      .catch((err) => console.error('Failed to load orders:', err));
  };

  useEffect(() => {
    fetchOrders();

    // 1. Setup Server-Sent Events for instant live notifications
    let eventSource = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.addEventListener('NEW_ORDER', (e) => {
        if (soundEnabled) {
          playOrderChime();
        }
        addToast('🔔 New table order placed!', 'info');
        fetchOrders();
      });

      eventSource.addEventListener('ORDER_PAID', (e) => {
        if (soundEnabled) {
          playOrderChime();
        }
        addToast('💳 Order payment verified online!', 'success');
        fetchOrders();
      });

      eventSource.addEventListener('ORDER_STATUS_CHANGED', () => {
        fetchOrders();
      });
    } catch (err) {
      console.warn('SSE fallback to polling:', err);
    }

    // 2. High-frequency polling fallback
    const interval = setInterval(fetchOrders, 4000);

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [soundEnabled, activeRestaurant]);

  // Status transitions
  const updateStatus = async (orderId, newStatus) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Order marked as ${newStatus}`);
        fetchOrders();
      }
    } catch (err) {
      addToast('Error updating status: ' + err.message, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const filtered = orders.filter((o) => {
    if (filterStatus === 'ALL') return true;
    return o.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Top KDS Control Bar */}
      <div className="bg-slate-950/80 border-b border-slate-800 px-4 sm:px-6 py-4 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white">Live Kitchen Display (KDS)</h1>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <p className="text-xs text-slate-400">
                {orders.length} active tickets queued · Real-time WebSocket/SSE connected
              </p>
            </div>
          </div>

          {/* Controls: Audio Toggle, Refresh, Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-800/80 rounded-xl p-1 text-xs font-bold border border-slate-700">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filterStatus === 'ALL' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({orders.length})
              </button>
              <button
                onClick={() => setFilterStatus('RECEIVED')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filterStatus === 'RECEIVED' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Queued
              </button>
              <button
                onClick={() => setFilterStatus('PREPARING')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filterStatus === 'PREPARING' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cooking
              </button>
              <button
                onClick={() => setFilterStatus('READY')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filterStatus === 'READY' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Ready
              </button>
            </div>

            {/* Sound chime test / toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playOrderChime();
              }}
              className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                soundEnabled
                  ? 'bg-slate-800 border-amber-500/40 text-amber-400 hover:bg-slate-700'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={soundEnabled ? 'Kitchen chime enabled' : 'Kitchen chime muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? 'Bell On' : 'Muted'}</span>
            </button>

            <button
              onClick={fetchOrders}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition cursor-pointer"
              title="Refresh tickets"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Ticket Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {filtered.length === 0 ? (
          <div className="py-24 text-center text-slate-500">
            <CheckCheck className="w-16 h-16 stroke-[1.5] text-slate-700 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-300">All Kitchen Orders Clear!</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No orders are currently waiting. When guests scan table QRs and submit their order, tickets appear here in real time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((order) => {
              const isUrgent = order.elapsed_minutes >= 15;
              const isReceived = order.status === 'RECEIVED';
              const isPreparing = order.status === 'PREPARING';
              const isReady = order.status === 'READY';
              const isServed = order.status === 'SERVED';

              return (
                <div
                  key={order.id}
                  className={`flex flex-col justify-between rounded-2xl border transition-all duration-200 overflow-hidden shadow-xl ${
                    isUrgent
                      ? 'border-rose-500/80 bg-slate-950 ring-2 ring-rose-500/30'
                      : isReceived
                      ? 'border-amber-500/50 bg-slate-950'
                      : isPreparing
                      ? 'border-sky-500/50 bg-slate-950'
                      : isReady
                      ? 'border-emerald-500/50 bg-slate-950'
                      : 'border-slate-800 bg-slate-950'
                  }`}
                >
                  {/* Ticket Header */}
                  <div
                    className={`p-4 flex items-center justify-between border-b ${
                      isReceived
                        ? 'bg-amber-500/15 border-amber-500/20'
                        : isPreparing
                        ? 'bg-sky-500/15 border-sky-500/20'
                        : isReady
                        ? 'bg-emerald-500/15 border-emerald-500/20'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white tracking-wide">
                          {order.table_number}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-400">
                          ({order.order_code})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {order.elapsed_minutes === 0 ? 'Just now' : `${order.elapsed_minutes}m ago`}
                        </span>
                        {isUrgent && (
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-rose-600 text-white animate-pulse">
                            Urgent
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        isReceived
                          ? 'bg-amber-400 text-slate-950'
                          : isPreparing
                          ? 'bg-sky-400 text-slate-950'
                          : isReady
                          ? 'bg-emerald-400 text-slate-950'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Customer / Table Note if any */}
                  {order.special_instructions && (
                    <div className="mx-4 mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Table Request: </span>
                        <span>{order.special_instructions}</span>
                      </div>
                    </div>
                  )}

                  {/* Items List */}
                  <div className="p-4 space-y-2.5 flex-1">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-xs font-black shrink-0">
                            {item.quantity}x
                          </span>
                          <div>
                            <div className="text-xs font-bold text-white leading-tight">
                              {item.name}
                            </div>
                            {item.notes && (
                              <div className="text-[11px] text-amber-300 font-medium italic mt-0.5">
                                Note: {item.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payment Pill & Order Value */}
                  <div className="px-4 py-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 bg-slate-900/40">
                    <div>
                      {order.payment_status === 'PAID' ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          PAID Online
                        </span>
                      ) : (
                        <span className="text-amber-400 font-bold">
                          Collect ₹{order.grand_total} at Counter
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/invoice/${order.id}`}
                      target="_blank"
                      className="text-slate-400 hover:text-white flex items-center gap-1 transition text-[11px]"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </Link>
                  </div>

                  {/* Action Pipeline Buttons */}
                  <div className="p-3 bg-slate-900/80 border-t border-slate-800 flex items-center gap-2">
                    {isReceived && (
                      <button
                        onClick={() => updateStatus(order.id, 'PREPARING')}
                        disabled={isUpdating}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <ChefHat className="w-4 h-4" />
                        <span>Start Cooking</span>
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => updateStatus(order.id, 'READY')}
                        disabled={isUpdating}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <BellRing className="w-4 h-4" />
                        <span>Food is Ready</span>
                      </button>
                    )}

                    {isReady && (
                      <button
                        onClick={() => updateStatus(order.id, 'SERVED')}
                        disabled={isUpdating}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <UtensilsCrossed className="w-4 h-4" />
                        <span>Mark Served to Table</span>
                      </button>
                    )}

                    {isServed && (
                      <button
                        onClick={() => updateStatus(order.id, 'COMPLETED')}
                        disabled={isUpdating}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
                      >
                        <span>Close Order (Completed)</span>
                      </button>
                    )}

                    {/* Quick Cancel option */}
                    {!isServed && (
                      <button
                        onClick={() => {
                          if (confirm(`Cancel ticket ${order.order_code}?`)) {
                            updateStatus(order.id, 'CANCELLED');
                          }
                        }}
                        className="px-2.5 py-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 text-xs transition cursor-pointer"
                        title="Cancel Order"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
