// src/pages/InvoiceView.jsx - Printable GST Tax Invoice & POS Thermal Receipt
import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Printer, ArrowLeft, Download, ShieldCheck, Utensils, Receipt, CheckCircle2, Cpu } from 'lucide-react';

export function InvoiceView() {
  const { orderId } = useParams();
  const location = useLocation();
  const [invoiceData, setInvoiceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [receiptMode, setReceiptMode] = useState(
    location.search.includes('mode=thermal') ? 'thermal' : 'a4'
  );
  const [isHardwarePrinting, setIsHardwarePrinting] = useState(false);
  const [hardwareMsg, setHardwareMsg] = useState(null);

  useEffect(() => {
    fetch(`/api/invoice/${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.invoice) {
          setInvoiceData(data.invoice);

          if (location.search.includes('autoprint=true')) {
            setTimeout(() => {
              window.print();
            }, 600);
          }
        }
      })
      .catch((err) => console.error('Error loading invoice:', err))
      .finally(() => setIsLoading(false));
  }, [orderId, location.search]);

  const handlePrint = () => {
    window.print();
  };

  const handleHardwarePrint = async () => {
    setIsHardwarePrinting(true);
    setHardwareMsg(null);
    try {
      const res = await fetch(`/api/invoice/${orderId}/print`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setHardwareMsg(data.message || 'Dispatched to ESC/POS billing printer');
      } else {
        setHardwareMsg('Print error: ' + (data.error || 'Check printer connection'));
      }
    } catch (err) {
      setHardwareMsg('Hardware printer unreachable: ' + err.message);
    } finally {
      setIsHardwarePrinting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <span className="w-8 h-8 border-3 border-amber-500/20 border-t-amber-600 rounded-full animate-spin mb-3"></span>
        <p className="text-xs font-bold text-slate-600">Generating GST Tax Invoice...</p>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <p className="text-sm font-bold text-rose-600 mb-2">Invoice not found</p>
        <Link to="/admin/orders" className="text-xs font-semibold text-slate-700 underline">
          Return to orders
        </Link>
      </div>
    );
  }

  const { invoice_number, invoice_date, restaurant, order, items, breakdown } = invoiceData;

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 sm:px-6 print:p-0 print:bg-white">
      {/* Control Action Bar (hidden when printing) */}
      <div className="max-w-3xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
        <Link
          to={`/order/${order.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order Tracker</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Format Toggle */}
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex text-xs font-bold">
            <button
              onClick={() => setReceiptMode('a4')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                receiptMode === 'a4' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Standard A4
            </button>
            <button
              onClick={() => setReceiptMode('thermal')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                receiptMode === 'thermal' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              80mm Thermal Slip
            </button>
          </div>

          <button
            onClick={handleHardwarePrint}
            disabled={isHardwarePrinting}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            title="Dispatch ESC/POS raw bytes to physical thermal billing machine (Port 9100)"
          >
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>{isHardwarePrinting ? 'Dispatching...' : 'Hardware Thermal POS'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice / PDF</span>
          </button>
        </div>
      </div>

      {hardwareMsg && (
        <div className="max-w-3xl mx-auto mb-4 text-center text-xs font-bold text-slate-800 bg-amber-50 border border-amber-300 py-2 px-4 rounded-xl shadow-xs no-print animate-in fade-in">
          {hardwareMsg}
        </div>
      )}

      {/* INVOICE CARD */}
      <div
        className={`mx-auto bg-white border border-slate-200 shadow-xl rounded-2xl print:shadow-none print:border-none print:rounded-none overflow-hidden ${
          receiptMode === 'thermal' ? 'max-w-sm p-6 font-mono text-xs' : 'max-w-3xl p-8 sm:p-12 text-sm'
        }`}
      >
        {/* Thermal Slip Mode */}
        {receiptMode === 'thermal' ? (
          <div className="space-y-4 text-center">
            <div className="border-b-2 border-dashed border-slate-300 pb-3">
              <h2 className="text-base font-black uppercase tracking-wider">{restaurant.name}</h2>
              <p className="text-[11px] text-slate-500">{restaurant.tagline}</p>
              <p className="text-[10px] text-slate-500 mt-1">{restaurant.address}</p>
              <p className="text-[10px] text-slate-500">Ph: {restaurant.phone}</p>
              <div className="text-[10px] text-slate-600 mt-1">
                GSTIN: {restaurant.gstin} | FSSAI: {restaurant.fssai}
              </div>
            </div>

            {(order.token_number || order.is_counter_order) && (
              <div className="py-2.5 my-1 border-y-2 border-dashed border-slate-900 text-center font-black bg-slate-50">
                <div className="text-[10px] uppercase tracking-widest text-slate-500">Customer Pickup Token</div>
                <div className="text-2xl font-black mt-0.5 text-slate-950">TOKEN #{order.token_number || '1'}</div>
              </div>
            )}

            <div className="border-b border-dashed border-slate-300 pb-2 text-left text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span>Inv: {invoice_number}</span>
                <span>{new Date(invoice_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>{order.table_number}</span>
                <span>{order.order_code}</span>
              </div>
              {order.customer_name && (
                <div className="text-slate-500">Guest: {order.customer_name}</div>
              )}
            </div>

            {/* Items Table */}
            <div className="border-b border-dashed border-slate-300 pb-3 text-left">
              <div className="flex justify-between font-bold text-[11px] border-b border-slate-200 pb-1 mb-1">
                <span>Item</span>
                <span>Qty x Rate = Amt</span>
              </div>
              {items.map((it) => (
                <div key={it.sr_no} className="flex justify-between py-0.5 text-[11px]">
                  <span className="truncate pr-2">{it.name}</span>
                  <span className="shrink-0">
                    {it.quantity} x {it.unit_price} = ₹{it.amount}
                  </span>
                </div>
              ))}
            </div>

            {/* Breakdown */}
            <div className="border-b-2 border-dashed border-slate-300 pb-3 text-left text-[11px] space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{breakdown.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>CGST ({breakdown.cgst_rate}%):</span>
                <span>₹{breakdown.cgst_amount}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST ({breakdown.sgst_rate}%):</span>
                <span>₹{breakdown.sgst_amount}</span>
              </div>
              <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-200">
                <span>TOTAL:</span>
                <span>₹{breakdown.grand_total}</span>
              </div>
            </div>

            {/* Payment stamp */}
            <div className="text-center text-[10px] text-slate-500 space-y-1">
              <div className="font-bold text-slate-800">
                Payment: {order.payment_method} ({order.payment_status})
              </div>
              {order.razorpay_payment_id && (
                <div>Rzp Ref: {order.razorpay_payment_id}</div>
              )}
              <div className="pt-2">*** Thank You! Visit Again ***</div>
            </div>
          </div>
        ) : (
          /* Standard A4 Tax Invoice Mode */
          <div className="space-y-8">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {restaurant.name}
                  </h1>
                </div>
                <p className="text-xs font-semibold text-amber-700">{restaurant.tagline}</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">{restaurant.address}</p>
                <p className="text-xs text-slate-500">Ph: {restaurant.phone} · Email: {restaurant.email}</p>
              </div>

              <div className="sm:text-right">
                <span className="inline-block px-3 py-1 rounded-md bg-slate-900 text-white text-xs font-extrabold uppercase tracking-wider">
                  TAX INVOICE
                </span>
                <div className="text-base font-black text-slate-900 mt-2">{invoice_number}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Date: {new Date(invoice_date).toLocaleDateString()} {new Date(invoice_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-xs text-slate-600 mt-1 font-mono">
                  GSTIN: <span className="font-bold">{restaurant.gstin}</span>
                </div>
                <div className="text-xs text-slate-600 font-mono">
                  FSSAI Lic: <span className="font-bold">{restaurant.fssai}</span>
                </div>
              </div>
            </div>

            {/* Billed To / Dining Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Table No</span>
                <div className="font-black text-slate-900 text-sm mt-0.5">{order.table_number}</div>
                <div className="text-slate-500 text-[11px]">{order.section}</div>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Order Ref</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{order.order_code}</div>
                <div className="text-slate-500 text-[11px]">Dine-In Order</div>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Customer</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{order.customer_name || 'Walk-in Guest'}</div>
                <div className="text-slate-500 text-[11px]">{order.customer_phone || '—'}</div>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Payment Mode</span>
                <div className="font-bold text-emerald-700 text-sm mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{order.payment_status === 'PAID' ? 'PAID ONLINE' : 'CASH AT COUNTER'}</span>
                </div>
                <div className="text-slate-500 text-[10px] font-mono truncate">
                  {order.razorpay_payment_id ? `ID: ${order.razorpay_payment_id}` : 'Settled at POS'}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-slate-900 font-black uppercase text-[11px]">
                    <th className="py-2.5 px-2 w-10">#</th>
                    <th className="py-2.5 px-2">Item Description</th>
                    <th className="py-2.5 px-2 text-center w-20">Qty</th>
                    <th className="py-2.5 px-2 text-right w-24">Rate</th>
                    <th className="py-2.5 px-2 text-right w-28">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it) => (
                    <tr key={it.sr_no} className="hover:bg-slate-50/50">
                      <td className="py-3 px-2 text-slate-400 font-mono">{it.sr_no}</td>
                      <td className="py-3 px-2">
                        <div className="font-bold text-slate-900">{it.name}</div>
                        {it.notes && (
                          <div className="text-[11px] text-amber-700 italic">Chef note: {it.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-slate-800">{it.quantity}</td>
                      <td className="py-3 px-2 text-right text-slate-600">₹{it.unit_price.toFixed(2)}</td>
                      <td className="py-3 px-2 text-right font-bold text-slate-900">₹{it.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations & Taxes */}
            <div className="flex flex-col sm:flex-row justify-between gap-6 pt-4 border-t border-slate-200">
              <div className="space-y-1 text-xs text-slate-500 max-w-sm">
                <div className="font-bold text-slate-800">Terms & Conditions:</div>
                <p className="text-[11px]">
                  1. Goods once sold will not be taken back or exchanged.
                  <br />
                  2. All disputes are subject to local jurisdiction.
                  <br />
                  3. This is a computer-generated tax invoice and requires no physical signature.
                </p>
              </div>

              <div className="w-full sm:w-72 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-800">₹{breakdown.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>CGST ({breakdown.cgst_rate}%):</span>
                  <span className="font-semibold text-slate-800">₹{breakdown.cgst_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>SGST ({breakdown.sgst_rate}%):</span>
                  <span className="font-semibold text-slate-800">₹{breakdown.sgst_amount.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t-2 border-slate-900 flex justify-between font-black text-slate-950 text-base">
                  <span>Invoice Total:</span>
                  <span className="text-amber-600">₹{breakdown.grand_total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-8 border-t border-slate-200 text-center text-xs text-slate-500">
              <p className="font-bold text-slate-800">Thank you for dining at L'Osteria Bistro!</p>
              <p className="text-[11px] mt-0.5">For reservations & feedback, please call {restaurant.phone}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
