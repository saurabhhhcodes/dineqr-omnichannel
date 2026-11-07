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
  CheckCheck,
  Printer,
  Bike,
} from 'lucide-react';
import { playOrderChime } from '../utils/audioAlert.js';
import { useToast } from '../context/ToastContext.jsx';
import { useRestaurant } from '../context/RestaurantContext.jsx';

export function AdminKitchen() {
  const { activeRestaurant } = useRestaurant();
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoPrintEnabled, setAutoPrintEnabled] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, RECEIVED, PREPARING, READY
  const [isUpdating, setIsUpdating] = useState(false);
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());

  const prevOrderCountRef = useRef(0);
  const autoPrintRef = useRef(autoPrintEnabled);

  // Live timer interval to update "X minutes ago" tickers every 5 seconds accurately
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    autoPrintRef.current = autoPrintEnabled;
  }, [autoPrintEnabled]);

  // Robust live elapsed time calculation (handles SQLite UTC, local offsets & exact punch time)
  const calculateElapsed = (order) => {
    let createdDate = null;
    if (order.created_at_utc) {
      createdDate = new Date(order.created_at_utc);
    } else if (order.created_at) {
      let str = String(order.created_at).trim();
      if (!str.endsWith('Z') && !str.includes('+')) {
        str = str.replace(' ', 'T') + 'Z';
      }
      createdDate = new Date(str);
    }
    
    let mins = typeof order.elapsed_minutes === 'number' ? order.elapsed_minutes : 0;
    if (createdDate && !isNaN(createdDate.getTime())) {
      mins = Math.max(0, Math.floor((nowTimestamp - createdDate.getTime()) / 60000));
    }

    const timeString = createdDate && !isNaN(createdDate.getTime())
      ? createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    let label = 'Just now';
    if (mins === 0) {
      label = 'Just now (< 1m)';
    } else if (mins < 60) {
      label = `${mins}m ago`;
    } else {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      label = `${hrs}h ${remMins}m ago`;
    }

    return { label, timeString, mins };
  };

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

  const handlePrintTicket = async (orderId, orderCode) => {
    try {
      const res = await fetch(`/api/invoice/${orderId}/print`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        addToast(data.message || `Thermal KOT printed for ${orderCode}`);
      } else {
        addToast(data.error || 'Failed to print KOT', 'error');
      }
    } catch (err) {
      addToast('Print error: ' + err.message, 'error');
    }
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
        addToast('New table order placed!', 'info');

        try {
          const payload = JSON.parse(e.data);
          if (autoPrintRef.current && payload?.order?.id) {
            fetch(`/api/invoice/${payload.order.id}/print`, { method: 'POST' })
              .then((r) => r.json())
              .then((d) => {
                if (d.success) addToast(`Auto-printed ticket: ${payload.order.order_code}`);
              })
              .catch(() => {});
          }
        } catch {}

        fetchOrders();
      });

      eventSource.addEventListener('ORDER_PAID', (e) => {
        if (soundEnabled) {
          playOrderChime();
        }
        addToast('Order payment verified online!', 'success');
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
      <div className="bg-slate-950/95 border-b border-slate-800 px-3 sm:px-6 py-3.5 backdrop-blur-md w-full max-w-full">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
              <ChefHat className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white truncate">Live Kitchen Display (KDS)</h1>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                {orders.length} active tickets queued · Real-time WebSocket/SSE connected
              </p>
            </div>
          </div>

          {/* Controls: Audio Toggle, Refresh, Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start sm:justify-end">
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

            {/* Auto-print toggle */}
            <button
              onClick={() => {
                const next = !autoPrintEnabled;
                setAutoPrintEnabled(next);
                addToast(next ? 'Auto-print active on new orders' : 'Auto-print paused');
              }}
              className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 ${
                autoPrintEnabled
                  ? 'bg-slate-800 border-orange-500/40 text-orange-400 hover:bg-slate-700'
                  : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-white'
              }`}
              title={autoPrintEnabled ? 'Hardware thermal auto-print active' : 'Auto-print off'}
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">{autoPrintEnabled ? 'Auto-Print' : 'No Print'}</span>
            </button>

            {/* Sound chime test / toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playOrderChime();
              }}
              className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 ${
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
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition cursor-pointer shrink-0"
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
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 w-full min-w-0 max-w-full">
            {filtered.map((order) => {
              const elapsed = calculateElapsed(order);
              const isUrgent = elapsed.mins >= 15;
              const isReceived = order.status === 'RECEIVED';
              const isPreparing = order.status === 'PREPARING';
              const isReady = order.status === 'READY';
              const isServed = order.status === 'SERVED';
              const isZomato = order.order_source === 'ZOMATO';
              const isSwiggy = order.order_source === 'SWIGGY';
              const isOndc = order.order_source === 'ONDC';

              return (
                <div
                  key={order.id}
                  className={`flex flex-col justify-between rounded-2xl border transition-all duration-200 overflow-hidden shadow-xl min-w-0 max-w-full ${
                    isZomato
                      ? 'border-rose-500/80 bg-slate-950 ring-1 ring-rose-500/30'
                      : isSwiggy
                      ? 'border-orange-500/80 bg-slate-950 ring-1 ring-orange-500/30'
                      : isUrgent
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
                      isZomato
                        ? 'bg-rose-500/15 border-rose-500/30'
                        : isSwiggy
                        ? 'bg-orange-500/15 border-orange-500/30'
                        : isReceived
                        ? 'bg-amber-500/15 border-amber-500/20'
                        : isPreparing
                        ? 'bg-sky-500/15 border-sky-500/20'
                        : isReady
                        ? 'bg-emerald-500/15 border-emerald-500/20'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-black text-white tracking-wide">
                          {order.table_number}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-400">
                          ({order.order_code})
                        </span>
                        {isZomato && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[9px] uppercase tracking-wider">
                            Zomato
                          </span>
                        )}
                        {isSwiggy && (
                          <span className="px-2 py-0.5 rounded-md bg-orange-600 text-white font-black text-[9px] uppercase tracking-wider">
                            Swiggy
                          </span>
                        )}
                        {isOndc && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white font-black text-[9px] uppercase tracking-wider">
                            ONDC
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs mt-0.5 flex-wrap">
                        <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-400' : 'text-amber-400'}`} />
                        <span className={`font-bold ${isUrgent ? 'text-rose-300 font-extrabold' : 'text-slate-300'}`}>
                          {elapsed.label}
                        </span>
                        {elapsed.timeString && (
                          <span className="text-[11px] font-mono text-slate-400">
                            ({elapsed.timeString})
                          </span>
                        )}
                        {isUrgent && (
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-rose-600 text-white animate-pulse">
                            Delayed ({elapsed.mins}m)
                          </span>
                        )}
                      </div>
                      {order.aggregator_rider_name && (
                        <div className="text-[11px] text-amber-300 font-semibold mt-1 flex items-center gap-1">
                          <Bike className="w-3.5 h-3.5 text-amber-400" />
                          <span>Rider: {order.aggregator_rider_name}</span>
                        </div>
                      )}
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePrintTicket(order.id, order.order_code)}
                        className="text-slate-400 hover:text-orange-400 flex items-center gap-1 transition text-[11px] cursor-pointer"
                        title="Print 80mm ESC/POS KOT Slip"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print KOT</span>
                      </button>
                      <Link
                        to={`/invoice/${order.id}`}
                        target="_blank"
                        className="text-slate-400 hover:text-white flex items-center gap-1 transition text-[11px]"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </Link>
                    </div>
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
