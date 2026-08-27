import React from 'react';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  MapPin, 
  Wrench, 
  Sparkles, 
  Info, 
  CheckCheck, 
  Trash2, 
  PhoneCall,
  Clock,
  Ban
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppNotification } from '../../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { 
    notifications, 
    markAllNotificationsAsRead, 
    markNotificationAsRead, 
    clearNotifications 
  } = useApp();

  if (!isOpen) return null;

  const getIconByType = (type: AppNotification['type']) => {
    switch (type) {
      case 'MISSION_ACCEPTED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'TECHNICIAN_ARRIVED':
        return <MapPin className="w-4 h-4 text-[#F59E0B]" />;
      case 'MISSION_IN_PROGRESS':
        return <Wrench className="w-4 h-4 text-blue-600" />;
      case 'MISSION_COMPLETED':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'MISSION_CANCELLED':
        return <Ban className="w-4 h-4 text-rose-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-600" />;
    }
  };

  const getBadgeClass = (type: AppNotification['type']) => {
    switch (type) {
      case 'MISSION_ACCEPTED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'TECHNICIAN_ARRIVED':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      case 'MISSION_IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MISSION_COMPLETED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MISSION_CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="notification-center-modal"
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-[#1B2A4A] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#F59E0B] text-[#1B2A4A] flex items-center justify-center shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Centre de Notifications</h3>
              <p className="text-[11px] text-slate-300">Suivi des alertes en direct & techniciens</p>
            </div>
          </div>

          <button
            id="btn-close-notification-modal"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Toolbar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600">
            {notifications.length} notification{notifications.length > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.read) && (
              <button
                id="btn-mark-all-read"
                onClick={markAllNotificationsAsRead}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Tout lire</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                id="btn-clear-notifications"
                onClick={clearNotifications}
                className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 flex items-center gap-1 hover:underline ml-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Effacer</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-3 space-y-2.5 overflow-y-auto flex-1 divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-slate-400">
              <Bell className="w-10 h-10 mx-auto opacity-30 stroke-1" />
              <p className="text-xs font-semibold">Aucune notification pour le moment</p>
              <p className="text-[11px] text-slate-400">
                Vous recevrez une alerte dès qu'un technicien accepte votre commande ou arrive à votre adresse.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                id={`notif-item-${notif.id}`}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`pt-2.5 first:pt-0 pb-1 cursor-pointer transition-all rounded-xl p-2.5 ${
                  notif.read 
                    ? 'bg-white hover:bg-slate-50 opacity-80' 
                    : 'bg-amber-50/50 hover:bg-amber-50 border border-amber-200/60 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                    {getIconByType(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-black text-[#1B2A4A]">
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-[#F59E0B] inline-block animate-pulse" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5 shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(notif.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Meta bar */}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      {notif.badge ? (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getBadgeClass(notif.type)}`}>
                          {notif.badge}
                        </span>
                      ) : (
                        <span />
                      )}

                      {notif.technicianPhone && (
                        <a
                          href={`tel:${notif.technicianPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Appeler</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            id="btn-dismiss-modal-bottom"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-[#1B2A4A] hover:bg-[#253966] text-white font-bold text-xs rounded-xl transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
