import React, { useEffect, useState, useRef } from 'react';
import { 
  CheckCircle2, 
  MapPin, 
  Wrench, 
  Sparkles, 
  Info, 
  X, 
  PhoneCall, 
  Bell,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppNotification } from '../../types';

export const NotificationToast: React.FC = () => {
  const { currentToast, dismissToast, setCurrentView, currentView } = useApp();
  const [progress, setProgress] = useState(100);
  const dismissToastRef = useRef(dismissToast);

  useEffect(() => {
    dismissToastRef.current = dismissToast;
  }, [dismissToast]);

  useEffect(() => {
    if (!currentToast) return;

    setProgress(100);
    const duration = 7500; // 7.5 seconds
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (pct <= 0) {
        clearInterval(progressInterval);
      }
    }, 50);

    const autoDismissTimeout = setTimeout(() => {
      dismissToastRef.current();
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(autoDismissTimeout);
    };
  }, [currentToast]);

  if (!currentToast) return null;

  const getStyleByType = (type: AppNotification['type']) => {
    switch (type) {
      case 'MISSION_ACCEPTED':
        return {
          border: 'border-emerald-500',
          bg: 'bg-white',
          headerBg: 'bg-emerald-500 text-white',
          icon: CheckCircle2,
          iconColor: 'text-emerald-500',
          badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        };
      case 'TECHNICIAN_ARRIVED':
        return {
          border: 'border-[#F59E0B]',
          bg: 'bg-white',
          headerBg: 'bg-[#F59E0B] text-[#1B2A4A]',
          icon: MapPin,
          iconColor: 'text-[#F59E0B]',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
        };
      case 'MISSION_IN_PROGRESS':
        return {
          border: 'border-blue-500',
          bg: 'bg-white',
          headerBg: 'bg-blue-600 text-white',
          icon: Wrench,
          iconColor: 'text-blue-600',
          badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
        };
      case 'MISSION_COMPLETED':
        return {
          border: 'border-purple-500',
          bg: 'bg-white',
          headerBg: 'bg-purple-600 text-white',
          icon: Sparkles,
          iconColor: 'text-purple-600',
          badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
        };
      default:
        return {
          border: 'border-[#1B2A4A]',
          bg: 'bg-white',
          headerBg: 'bg-[#1B2A4A] text-white',
          icon: Info,
          iconColor: 'text-[#1B2A4A]',
          badgeBg: 'bg-slate-100 text-slate-900 border-slate-300',
        };
    }
  };

  const config = getStyleByType(currentToast.type);
  const IconComponent = config.icon;

  return (
    <aside 
      aria-label="Notification en direct"
      className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto shadow-2xl"
    >
      <div 
        id={`toast-${currentToast.id}`}
        className={`bg-white rounded-2xl overflow-hidden border-2 ${config.border} shadow-2xl transition-all`}
      >
        {/* Top Header bar with Badge and Close */}
        <div className={`px-3.5 py-1.5 flex items-center justify-between ${config.headerBg}`}>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <Bell className="w-3.5 h-3.5 animate-bounce" />
            <span>Notification Vraiga Direct</span>
          </div>
          <div className="flex items-center gap-2">
            {currentToast.badge && (
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-white/20 text-current backdrop-blur-xs">
                {currentToast.badge}
              </span>
            )}
            <button
              id="btn-dismiss-toast"
              onClick={dismissToast}
              className="p-1 rounded-full hover:bg-black/10 transition-colors"
              aria-label="Fermer la notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-3.5 space-y-2.5">
          <div className="flex items-start gap-3">
            {currentToast.technicianPhoto ? (
              <div className="relative shrink-0">
                <img
                  src={currentToast.technicianPhoto}
                  alt={currentToast.technicianName || 'Technicien'}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-slate-200 shadow-xs"
                />
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full ring-1 ring-white">
                  <ShieldCheck className="w-3 h-3" />
                </span>
              </div>
            ) : (
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 ${config.iconColor}`}>
                <IconComponent className="w-5 h-5" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-xs font-black text-[#1B2A4A] truncate">
                  {currentToast.title}
                </h4>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  À l'instant
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                {currentToast.message}
              </p>
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            {currentToast.technicianPhone ? (
              <a
                id="btn-call-tech-toast"
                href={`tel:${currentToast.technicianPhone}`}
                className="py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-emerald-200"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Appeler {currentToast.technicianName?.split(' ')[0] || 'le technicien'}</span>
              </a>
            ) : (
              <span className="text-[10px] font-medium text-slate-400">
                {currentToast.commune ? `Zone : ${currentToast.commune}` : 'Service certifié Vraiga'}
              </span>
            )}

            {currentView !== 'CLIENT' && (
              <button
                id="btn-view-client-toast"
                onClick={() => {
                  setCurrentView('CLIENT');
                  dismissToast();
                }}
                className="py-1.5 px-3 rounded-xl bg-[#1B2A4A] hover:bg-[#253966] text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
              >
                <span>Voir le suivi</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Linear Progress bar timer */}
        <div className="h-1 bg-slate-100 w-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-75 ${
              currentToast.type === 'MISSION_ACCEPTED' ? 'bg-emerald-500' :
              currentToast.type === 'TECHNICIAN_ARRIVED' ? 'bg-[#F59E0B]' :
              currentToast.type === 'MISSION_IN_PROGRESS' ? 'bg-blue-600' :
              currentToast.type === 'MISSION_COMPLETED' ? 'bg-purple-600' :
              'bg-[#1B2A4A]'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </aside>
  );
};
