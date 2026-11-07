// src/components/ItemCard.jsx - Dual-media catalog card with video loop, photo switcher & carousel
import React, { useRef, useState } from 'react';
import { Plus, Minus, Flame, Clock, Sparkles, Video, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function getContextualFallbackImage(item = {}) {
  const text = `${item.name || ''} ${item.description || ''} ${item.category_id || ''} ${item.restaurant_id || ''}`.toLowerCase();
  if (text.includes('clinic') || text.includes('doctor') || text.includes('consult') || text.includes('cbc') || text.includes('ecg') || text.includes('opd') || text.includes('health') || text.includes('physio') || text.includes('blood')) {
    return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80&auto=format&fit=crop';
  }
  if (text.includes('gym') || text.includes('fitness') || text.includes('protein') || text.includes('whey') || text.includes('creatine') || text.includes('pre-workout') || text.includes('pump') || text.includes('ironpulse')) {
    return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80&auto=format&fit=crop';
  }
  if (text.includes('salon') || text.includes('hair') || text.includes('facial') || text.includes('beard') || text.includes('spa') || text.includes('massage') || text.includes('glamour') || text.includes('reflexology')) {
    return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80&auto=format&fit=crop';
  }
  if (text.includes('coffee') || text.includes('roastery') || text.includes('latte') || text.includes('croissant') || text.includes('matcha') || text.includes('affogato') || text.includes('bakery')) {
    return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80&auto=format&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&auto=format&fit=crop';
}

export function ItemCard({ item, onSelect }) {
  const { items, addToCart, updateQuantity } = useCart();
  const { addToast } = useToast();
  const videoRef = useRef(null);

  const cartItem = items.find((i) => i.id === item.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const fallbackImage = getContextualFallbackImage(item);

  // Split multiple images if provided as comma-separated
  const imageList = item.image_url
    ? item.image_url.split(',').map((u) => u.trim()).filter(Boolean)
    : [fallbackImage];

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [videoError, setVideoError] = useState(false);

  const videoSource = item.video_url || (item.image_url?.endsWith('.mp4') ? item.image_url : null);
  const hasVideo = !!videoSource && !videoError;

  // Active view mode: 'video' or 'photo'
  const [mediaMode, setMediaMode] = useState(hasVideo ? 'video' : 'photo');

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

  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev + 1) % imageList.length);
    setMediaMode('photo');
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev - 1 + imageList.length) % imageList.length);
    setMediaMode('photo');
  };

  const currentImageUrl = imageList[activeImageIdx] || imageList[0];

  return (
    <div
      onClick={() => onSelect(item)}
      className="group relative flex flex-col bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left h-full"
    >
      {/* Media Box: Video / Photo / Scrollable Carousel */}
      <div className="relative w-full h-52 sm:h-56 bg-slate-950 overflow-hidden shrink-0 select-none">
        {mediaMode === 'video' && hasVideo ? (
          <video
            ref={videoRef}
            src={videoSource}
            poster={currentImageUrl}
            autoPlay
            loop
            muted
            playsInline
            onError={() => {
              setVideoError(true);
              setMediaMode('photo');
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <img
            src={currentImageUrl}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={(e) => {
              e.target.src = fallbackImage;
            }}
          />
        )}

        {/* Ambient Dark Gradient at Bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent pointer-events-none" />

        {/* Veg / Non-Veg Indicator Badge */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-md flex items-center justify-center z-10">
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

        {/* Media Switcher: Video / Photo Pill */}
        {hasVideo && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3 right-3 flex items-center bg-black/60 backdrop-blur-md border border-white/20 rounded-full p-0.5 z-10 shadow-md"
          >
            <button
              type="button"
              onClick={() => setMediaMode('video')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition ${
                mediaMode === 'video'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Watch video loop"
            >
              <Video className="w-3 h-3" />
              <span>Video</span>
            </button>

            <button
              type="button"
              onClick={() => setMediaMode('photo')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition ${
                mediaMode === 'photo'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="View high-res photo"
            >
              <ImageIcon className="w-3 h-3" />
              <span>Photo</span>
            </button>
          </div>
        )}

        {/* Multi-image carousel navigation arrows inside the small box */}
        {mediaMode === 'photo' && imageList.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition z-10 shadow"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition z-10 shadow"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
              {imageList.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === activeImageIdx ? 'bg-white w-3' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Live Video Indicator Badge */}
        {mediaMode === 'video' && hasVideo && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white tracking-wider uppercase z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Live Loop</span>
          </div>
        )}

        {/* Special tag (Bestseller, Chef's Special) */}
        {!hasVideo && item.tags && (
          <div className="absolute top-3 right-3 flex flex-col gap-1 items-end z-10">
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

        {/* Price Tag Overlay on bottom right of media box */}
        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/10 text-white font-black text-sm shadow-md z-10">
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
              <span className="hidden sm:inline text-slate-400">
                {item.calories} kcal
              </span>
            )}
          </div>

          {/* Stepper / Add button */}
          <div className="shrink-0">
            {quantity === 0 ? (
              <button
                onClick={handleAdd}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white font-black text-xs shadow-md shadow-orange-500/20 transition cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            ) : (
              <div
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 bg-slate-900 text-white rounded-xl px-2 py-1 shadow-md"
              >
                <button
                  onClick={handleDecrement}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-black min-w-4 text-center">{quantity}</span>
                <button
                  onClick={handleIncrement}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
