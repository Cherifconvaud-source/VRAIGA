import React, { useState } from 'react';
import { 
  Smartphone, 
  Wrench, 
  LayoutDashboard, 
  SplitSquareVertical, 
  RotateCcw,
  Sparkles,
  MapPin,
  Shield,
  Bell,
  User
} from 'lucide-react';
import { useApp, AppView } from '../../context/AppContext';
import { NotificationCenterModal } from '../modals/NotificationCenterModal';
import { ProfileModal } from '../client/ProfileModal';
import { DEFAULT_USER_PROFILE } from '../../data/initialData';

export const Navbar: React.FC = () => {
  const { currentView, setCurrentView, resetDemoData, activeMission, unreadNotificationsCount, userProfile } = useApp();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navItems: { id: AppView; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'CLIENT', label: '1. Vue Client (Mobile)', icon: Smartphone },
    { 
      id: 'TECHNICIAN', 
      label: '2. Vue Technicien (Mobile)', 
      icon: Wrench,
      badge: activeMission && activeMission.status === 'OFFERED' ? 'Alerte 30s' : undefined
    },
    { id: 'ADMIN', label: '3. Admin Back-Office', icon: LayoutDashboard },
    { id: 'DUAL', label: '⚡ Mode Synchronisé', icon: SplitSquareVertical },
  ];

  return (
    <>
      <header className="bg-[#1B2A4A] text-white border-b border-white/10 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Brand Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F59E0B] flex items-center justify-center font-black text-[#1B2A4A] text-base shadow-xs">
              V
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">VRAIGA</span>
                <span className="text-[10px] font-bold bg-[#F59E0B] text-[#1B2A4A] px-1.5 py-0.2 rounded">
                  Abidjan
                </span>
              </div>
              <span className="text-[10px] text-slate-300 font-medium block">
                Plateforme Services Techniques à la Demande
              </span>
            </div>
          </div>

          {/* View Switcher Tabs */}
          <nav className="flex items-center gap-1.5 bg-white/10 p-1 rounded-2xl border border-white/10 overflow-x-auto max-w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#F59E0B] text-[#1B2A4A] shadow-md scale-102'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-rose-600 text-white rounded-full animate-bounce">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Actions: Profile Avatar + Notification Bell + Reset Quick Demo Button */}
          <div className="flex items-center gap-2">
            {/* User Profile Quick Button */}
            <button
              id="navbar-btn-profile"
              onClick={() => setIsProfileOpen(true)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10 flex items-center gap-1.5 active:scale-95"
              title="Mon Profil (Coordonnées & Avatar)"
              aria-label="Mon Profil"
            >
              <img
                src={userProfile?.avatar || DEFAULT_USER_PROFILE.avatar}
                alt="Avatar"
                className="w-6 h-6 rounded-full object-cover border border-amber-300 bg-slate-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_USER_PROFILE.avatar;
                }}
              />
              <span className="text-xs font-bold text-white hidden md:inline max-w-[80px] truncate">
                {userProfile?.name?.split(' ')[0] || 'Profil'}
              </span>
            </button>

            <button
              id="navbar-btn-notifications"
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 flex items-center gap-1"
              title="Centre de notifications"
              aria-label="Centre de notifications"
            >
              <Bell className="w-4 h-4 text-amber-300" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            <button
              onClick={resetDemoData}
              title="Réinitialiser l'état de simulation"
              className="text-[11px] font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </header>

      <NotificationCenterModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
};
