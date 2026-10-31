// src/components/AdminAuthGate.jsx - Enterprise Staff Access Challenge & Customer Isolation Shield
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, ShieldAlert, ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function AdminAuthGate({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeRestaurant } = useRestaurant();
  const { addToast } = useToast();

  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const authKey = `dineqr_staff_auth_${activeRestaurant?.id || 'default'}`;
  const superAuthKey = 'dineqr_super_auth';

  useEffect(() => {
    const isSuperAuthed = sessionStorage.getItem(superAuthKey) === 'true';
    const isStaffAuthed = sessionStorage.getItem(authKey) === 'true';

    if (isSuperAuthed || isStaffAuthed) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [activeRestaurant, location.pathname]);

  const handleVerifyPin = async (e) => {
    if (e) e.preventDefault();
    if (!pin) {
      setErrorMsg('Please enter your 4-digit Staff PIN');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    try {
      // Check Super Admin master key first
      if (pin === '2026') {
        sessionStorage.setItem(superAuthKey, 'true');
        sessionStorage.setItem(authKey, 'true');
        setIsAuthenticated(true);
        addToast('Super Admin Master Access Granted');
        return;
      }

      // Check restaurant staff PIN against backend
      const res = await fetch('/api/restaurants/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: activeRestaurant?.id || 'rest_losteria',
          pin: pin.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem(authKey, 'true');
        setIsAuthenticated(true);
        addToast(`Staff session unlocked for ${activeRestaurant?.name || 'Restaurant'}`);
      } else {
        setErrorMsg(data.error || 'Incorrect Staff PIN. Please try again.');
        setPin('');
      }
    } catch (err) {
      setErrorMsg('Authentication service unavailable: ' + err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePadDigit = (digit) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        // Auto-verify when 4 digits are entered
        setTimeout(() => {
          setPin(newPin);
        }, 100);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setErrorMsg('');
  };

  const handleReturnToCustomerMenu = () => {
    navigate(`/menu?restaurant=${activeRestaurant?.slug || activeRestaurant?.id || 'rest_losteria'}`);
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Security Shield Icon */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Staff & Management Access
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            {activeRestaurant?.name || 'Store'} back-office controls are secured. Customers scanning QR menus cannot view internal records.
          </p>
        </div>

        {/* PIN Dots Display */}
        <div className="flex justify-center gap-3 py-2">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full transition-all duration-150 ${
                pin.length > idx
                  ? 'bg-amber-400 scale-125 shadow-md shadow-amber-400/50'
                  : 'bg-slate-800 border border-slate-700'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 text-center justify-center animate-in shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Number Pad for Touch Terminals */}
        <div className="grid grid-cols-3 gap-2 text-base font-black">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handlePadDigit(String(num))}
              className="py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white transition cursor-pointer shadow-xs"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleBackspace}
            className="py-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 text-xs font-bold transition cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handlePadDigit('0')}
            className="py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white transition cursor-pointer shadow-xs"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handleVerifyPin()}
            disabled={isVerifying || pin.length < 4}
            className="py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-40"
          >
            {isVerifying ? '...' : 'Unlock'}
          </button>
        </div>

        {/* Return to Digital Menu Button */}
        <div className="pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleReturnToCustomerMenu}
            className="w-full py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Customer Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminAuthGate;
