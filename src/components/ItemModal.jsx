// src/components/ItemModal.jsx - Food item detail view with video playback & cooking instructions
import React, { useState } from 'react';
import { X, Plus, Minus, Clock, Flame, ShieldAlert, Sparkles, Video } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getContextualFallbackImage } from './ItemCard.jsx';

export function ItemModal({ item, onClose }) {
  const { addToCart, items } = useCart();
  const { addToast } = useToast();
  const [videoError, setVideoError] = useState(false);

  const cartItem = items.find((i) => i.id === item.id);
  const [quantity, setQuantity] = useState(cartItem ? cartItem.quantity : 1);
  const [notes, setNotes] = useState(cartItem?.notes || '');

  if (!item) return null;

  const handleConfirm = () => {
    addToCart(item, quantity, notes);
    addToast(`Added ${quantity}x ${item.name} to order`);
    onClose();
  };

  const videoSource = item.video_url || (item.image_url?.endsWith('.mp4') ? item.image_url : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 transform animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Video / Media Showcase */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-950 shrink-0 overflow-hidden">
          {videoSource && !videoError ? (
            <video
              src={videoSource}
              poster={item.image_url}
              autoPlay
              loop
              muted
              playsInline
              onError={() => setVideoError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={item.image_url || getContextualFallbackImage(item)}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = getContextualFallbackImage(item);
              }}
            />
          )}

          {/* Dark gradient for controls contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/40 pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md transition cursor-pointer shadow-lg z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Veg / Non-Veg badge */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 text-xs font-bold text-slate-800 z-10">
            {item.is_veg ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-emerald-600 rounded-xs flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                </span>
                <span>Pure Vegetarian</span>
              </>
            ) : (
              <>
                <span className="w-3.5 h-3.5 border-2 border-rose-700 rounded-xs flex items-center justify-center">
                  <span className="w-2 h-2 rounded-xs bg-rose-700"></span>
                </span>
                <span>Non-Vegetarian</span>
              </>
            )}
          </div>

          {/* Bottom Video Badge & Dish Title Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div className="space-y-1">
              {videoSource && !videoError && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>Live Video Preview</span>
                </span>
              )}
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                {item.name}
              </h2>
            </div>
            <div className="text-2xl font-black text-amber-300 drop-shadow-md shrink-0">
              ₹{item.price}
            </div>
          </div>
        </div>

        {/* Scrollable details */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {item.tags && (
            <div className="flex items-center gap-2">
              {item.tags.split(',').map((t, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  {t.trim()}
                </span>
              ))}
            </div>
          )}

          <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prep Time</div>
              <div className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {item.prep_time_mins || 15} mins
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Spice Level</div>
              <div className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                {item.spice_level || 'Mild'}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Calories</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">
                {item.calories || 450} kcal
              </div>
            </div>
          </div>

          {/* Cooking instruction note input */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Chef's Special Request & Cooking Notes</span>
              <span className="text-[10px] font-normal text-slate-400">Optional</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Less spicy, dressing on the side, extra crispy..."
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-950 font-bold text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition shadow-xs"
              maxLength={120}
            />
          </div>
        </div>

        {/* Footer with quantity & add button */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
          {/* Stepper */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 active:scale-95 transition cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-black text-sm text-slate-900">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 active:scale-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to order CTA */}
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-98 text-white font-bold text-sm shadow-md shadow-orange-500/25 transition flex items-center justify-between cursor-pointer"
          >
            <span>Add to Order</span>
            <span>₹{item.price * quantity}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
