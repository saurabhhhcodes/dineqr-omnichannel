// src/pages/AdminOrders.jsx - Full order log, historical archives & Excel spreadsheet export
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  CreditCard,
  Banknote,
  Utensils,
  Download,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function AdminOrders() {
  const { activeRestaurant } = useRestaurant();
  const { addToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [timeRange, setTimeRange] = useState('all'); // all, today, yesterday, week, month

  const fetchOrders = () => {
    if (!activeRestaurant) return;
    setIsLoading(true);

    const params = new URLSearchParams();
    params.append('restaurant_id', activeRestaurant.id);
    if (statusFilter !== 'ALL') params.append('status', statusFilter);
    if (timeRange !== 'all') params.append('timeRange', timeRange);

    fetch(`/api/orders?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      })
      .catch((err) => addToast('Failed to load orders: ' + err.message, 'error'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [activeRestaurant, statusFilter, timeRange]);

  // Export to Excel / CSV
  const handleExportSpreadsheet = () => {
    if (!activeRestaurant) return;
    const params = new URLSearchParams();
    params.append('restaurant_id', activeRestaurant.id);
    if (statusFilter !== 'ALL') params.append('status', statusFilter);
    if (timeRange !== 'all') params.append('timeRange', timeRange);

    const exportUrl = `/api/orders/export?${params.toString()}`;
    window.location.href = exportUrl;
    addToast('Generating Excel/CSV spreadsheet report...');
  };

  const filtered = orders.filter((o) => {
    if (search.trim()) {
      const term = search.toLowerCase();
      const codeMatch = o.order_code?.toLowerCase().includes(term);
      const tableMatch = o.table_number?.toLowerCase().includes(term);
      const custMatch = o.customer_name?.toLowerCase().includes(term);
      const phoneMatch = o.customer_phone?.toLowerCase().includes(term);
      return codeMatch || tableMatch || custMatch || phoneMatch;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                Sales Ledger
              </span>
              <span className="text-xs text-slate-500">
                · {activeRestaurant?.name} ({orders.length} total orders recorded)
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Order Log & Tax Invoices
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Complete historical order records, customer contact details, Razorpay transaction references, and 1-click accounting spreadsheet exports.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportSpreadsheet}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer"
              title="Download Microsoft Excel / CSV spreadsheet"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export to Spreadsheet (Excel/CSV)</span>
            </button>

            <button
              onClick={fetchOrders}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="Refresh order list"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter & Date Range Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Order #, Table, Guest..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              />
            </div>

            {/* Time Range Selector for Historical Orders */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">All Historical Orders</option>
                <option value="today">Today's Orders</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* Status buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto text-xs font-bold pb-1 no-scrollbar">
            {['ALL', 'RECEIVED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center text-slate-400">
              <span className="w-8 h-8 border-3 border-amber-500/20 border-t-amber-600 rounded-full animate-spin inline-block mb-3"></span>
              <p className="text-xs font-bold text-slate-600">Loading order records...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Receipt className="w-12 h-12 stroke-[1.5] text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">No matching orders found</p>
              <p className="text-xs text-slate-500 mt-1">Try switching date range or clearing search filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3.5 px-4">Order Code</th>
                    <th className="py-3.5 px-4">Table</th>
                    <th className="py-3.5 px-4">Guest</th>
                    <th className="py-3.5 px-4">Dishes Ordered</th>
                    <th className="py-3.5 px-4">Total Amount</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {order.order_code}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {order.table_number}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-semibold text-slate-900">{order.customer_name || 'Guest'}</div>
                        {order.customer_phone && (
                          <div className="text-[10px] text-slate-400">{order.customer_phone}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 max-w-xs">
                        <div className="truncate">
                          {order.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-black text-slate-900">
                        ₹{order.grand_total}
                      </td>

                      <td className="py-3.5 px-4">
                        {order.payment_status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            PAID (Razorpay)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                            <Banknote className="w-3 h-3" />
                            CASH Pending
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            order.status === 'RECEIVED'
                              ? 'bg-amber-100 text-amber-900'
                              : order.status === 'PREPARING'
                              ? 'bg-sky-100 text-sky-900'
                              : order.status === 'READY'
                              ? 'bg-emerald-100 text-emerald-900'
                              : order.status === 'COMPLETED'
                              ? 'bg-slate-200 text-slate-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        <div>{new Date(order.created_at).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/invoice/${order.id}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="View GST Tax Invoice"
                          >
                            <Receipt className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/order/${order.id}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="Live Tracker"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
