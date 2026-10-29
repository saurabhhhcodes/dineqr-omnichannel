// src/components/ItemCard.jsx - Food catalog item card with video autoplay & culinary styling
import React, { useRef, useState } from 'react';
import { Plus, Minus, Flame, Clock, Sparkles, Video, Play } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function ItemCard({ item, onSelect }) {
  const { items, addToCart, updateQuantity } = useCart();
  const { addToast } = useToast();
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);

  const cartItem = items.find((i) => i.id === item.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(item, 1);
    addToast(`Added 1x ${item.name} to order`);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    updateQuantity(item.id, quantity + 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    updateQuantity(item.id, quantity - 1);
  };

  const videoSource = item.video_url || (item.image_url?.endsWith('.mp4') ? item.image_url : null);

  return (
    <div
      onClick={() => onSelect(item)}
      className="group relative flex flex-col bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left h-full"
    >
      {/* Media Container: Full-width looping video with image poster fallback */}
      <div className="relative w-full h-52 sm:h-56 bg-slate-950 overflow-hidden shrink-0">
        {videoSource && !videoError ? (
          <video
            ref={videoRef}
            src={videoSource}
            poster={item.image_url}
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&auto=format&fit=crop';
            }}
          />
        )}

        {/* Ambient Dark Gradient at Bottom of Video */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent pointer-events-none" />

        {/* Veg / Non-Veg Indicator Badge */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-md flex items-center justify-center">
          {item.is_veg ? (
            <span className="w-4 h-4 border-2 border-emerald-600 rounded-sm flex items-center justify-center" title="Pure Vegetarian">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            </span>
          ) : (
            <span className="w-4 h-4 border-2 border-rose-700 rounded-sm flex items-center justify-center" title="Non-Vegetarian">
              <span className="w-2 h-2 rounded-xs bg-rose-700"></span>
            </span>
          )}
        </div>

        {/* Special tag (Bestseller, Chef's Special) */}
        {item.tags && (
          <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
            {item.tags.split(',').slice(0, 1).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-amber-300 border border-amber-400/30 shadow-md flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Live Video Indicator Badge */}
        {videoSource && !videoError && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Video</span>
          </div>
        )}

        {/* Price Tag Overlay on bottom right of video */}
        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/10 text-white font-black text-sm shadow-md">
          ₹{item.price}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-3">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg group-hover:text-amber-600 transition line-clamp-1">
            {item.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Metadata + Action Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Tags: prep time, spice level, calories */}
          <div className="flex items-center gap-2.5 text-slate-500 text-[11px] font-medium">
            {item.prep_time_mins > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {item.prep_time_mins}m
              </span>
            )}

            {item.spice_level && item.spice_level !== 'None' && (
              <span className="flex items-center gap-0.5 text-amber-700 font-bold">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                {item.spice_level}
              </span>
            )}

            {item.calories > 0 && (
              <span className="text-slate-400 hidden sm:inline">
                {item.calories} kcal
              </span>
            )}
          </div>

          {/* Cart Stepper or Add Button */}
          <div onClick={(e) => e.stopPropagation()}>
            {quantity === 0 ? (
              <button
                onClick={handleAdd}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white font-bold text-xs shadow-md shadow-orange-500/20 hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add</span>
              </button>
            ) : (
              <div className="flex items-center bg-slate-900 text-white rounded-xl shadow-md overflow-hidden">
                <button
                  onClick={handleDecrement}
                  className="px-2.5 py-1.5 hover:bg-slate-800 transition active:scale-90 text-amber-400 cursor-pointer"
                  title="Remove one"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 py-1 text-xs font-black min-w-6 text-center text-white">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="px-2.5 py-1.5 hover:bg-slate-800 transition active:scale-90 text-amber-400 cursor-pointer"
                  title="Add one more"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
