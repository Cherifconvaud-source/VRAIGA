import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert,
  Percent
} from 'lucide-react';
import { Mission } from '../../types';
import { TV_SIZE_TIERS, CLIENT_PAYMENT_METHODS } from '../../data/initialData';
import { formatFCFA, formatPercent } from '../../utils/formatters';

interface IncomingMissionModalProps {
  mission: Mission;
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingMissionModal: React.FC<IncomingMissionModalProps> = ({
  mission,
  isOpen,
  onAccept,
  onDecline,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const onDeclineRef = useRef(onDecline);

  useEffect(() => {
    onDeclineRef.current = onDecline;
  }, [onDecline]);

  // Reset timer on open or new mission
  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(30);
      return;
    }

    setTimeLeft(30);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, mission.id]);

  // Safely trigger onDecline in an effect phase when timer reaches 0
  useEffect(() => {
    if (isOpen && timeLeft === 0) {
      onDeclineRef.current();
    }
  }, [isOpen, timeLeft]);

  if (!isOpen) return null;

  const progressPercentage = (timeLeft / 30) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#F59E0B] overflow-hidden">
        {/* Urgent header with countdown bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-slate-100">
          <div
            className="h-full bg-[#F59E0B] transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="space-y-5 pt-2">
          {/* Top alert & timer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F59E0B]"></span>
              </span>
              <span className="text-xs font-bold text-[#1B2A4A] tracking-wider uppercase flex items-center gap-1">
                <Bell className="w-3.5 h-3.5 text-[#F59E0B]" />
                Nouvelle Mission Disponible
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-[#1B2A4A] font-mono font-bold text-sm">
              <Clock className="w-4 h-4 text-[#F59E0B] animate-spin" />
              <span>{timeLeft}s</span>
            </div>
          </div>

          {/* Client & Address Info */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    {mission.isForThirdParty ? 'Bénéficiaire sur place' : 'Client & Commune'}
                  </span>
                  {mission.isForThirdParty && (
                    <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded-full">
                      Commande pour un tiers
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-[#1B2A4A]">
                  {mission.isForThirdParty && mission.recipientName ? mission.recipientName : mission.clientName}
                </h4>
                {mission.isForThirdParty && mission.ordererName && (
                  <p className="text-[11px] text-slate-500">
                    Commandé par : <strong>{mission.ordererName}</strong>
                  </p>
                )}
              </div>
              <span className="bg-[#1B2A4A] text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                {mission.commune}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
              <MapPin className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <span className="truncate">{mission.address}</span>
            </div>

            {mission.isForThirdParty && mission.recipientNotes && (
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200/60 text-[11px] text-amber-900">
                <strong>Consignes d'accès :</strong> {mission.recipientNotes}
              </div>
            )}

            {/* Mode de règlement client */}
            <div className="flex items-center justify-between text-xs bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60">
              <div className="flex items-center gap-1.5 text-[#1B2A4A]">
                <span className="text-sm">
                  {(CLIENT_PAYMENT_METHODS.find(m => m.id === mission.paymentMethod) || CLIENT_PAYMENT_METHODS[0]).iconSymbol}
                </span>
                <span className="font-bold">
                  Règlement : {(CLIENT_PAYMENT_METHODS.find(m => m.id === mission.paymentMethod) || CLIENT_PAYMENT_METHODS[0]).label}
                </span>
              </div>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                {mission.isForThirdParty && mission.payerType === 'ORDERER_REMOTE' 
                  ? 'Payé à distance' 
                  : (mission.paymentMethod === 'CASH' ? 'Prévoir monnaie' : 'Mobile Money')}
              </span>
            </div>
          </div>

          {/* Services breakdown */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              Prestation{mission.items.length > 1 ? 's demandées' : ' demandée'} :
            </span>
            <div className="space-y-1.5">
              {mission.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 text-xs space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700 shrink-0 mt-0.5">
                        {item.quantity}x
                      </span>
                      <span className="font-semibold text-[#1B2A4A]">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-800 shrink-0">{formatFCFA(item.totalPrice)}</span>
                  </div>

                  {/* Multi-TV breakdown if available */}
                  {item.tvList && item.tvList.length > 0 ? (
                    <div className="pl-4 border-l-2 border-amber-400 space-y-1 pt-0.5">
                      {item.tvList.map((tv, tvIdx) => {
                        const tier = TV_SIZE_TIERS.find(t => t.id === tv.tvSize);
                        return (
                          <div key={tv.id || tvIdx} className="text-[11px] text-slate-600 flex justify-between">
                            <span>📺 <strong>{tv.room}</strong> : {tier?.label} ({tier?.inches})</span>
                            <span className="font-mono font-medium">{formatFCFA(tier?.price || 0)}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : item.details ? (
                    <span className="text-[10px] text-slate-500 block pl-7">
                      {item.details}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown (Gross, 17.5% Commission, Net) */}
          <div className="p-4 bg-gradient-to-br from-[#1B2A4A] to-[#253966] rounded-2xl text-white space-y-2.5 shadow-lg">
            <div className="flex justify-between items-center text-xs text-slate-300 pb-2 border-b border-white/10">
              <span>Prix brut payé par le client</span>
              <span className="font-bold text-white text-sm">{formatFCFA(mission.grossAmount)}</span>
            </div>

            <div className="flex justify-between items-center text-xs text-amber-300">
              <span className="flex items-center gap-1">
                <Percent className="w-3.5 h-3.5" />
                Commission Vraiga ({formatPercent(mission.commissionRate)})
              </span>
              <span className="font-semibold text-rose-300">
                - {formatFCFA(mission.commissionAmount)}
              </span>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between items-center">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-300 block">
                  Gain Net Technicien
                </span>
                <span className="text-[10px] text-emerald-300">Crédité ou perçu sur place</span>
              </div>
              <span className="text-xl font-extrabold text-[#F59E0B]">
                {formatFCFA(mission.technicianNetEarnings)}
              </span>
            </div>
          </div>

          {/* Bottom actions */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={onDecline}
              className="py-3 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4 text-slate-400" />
              Refuser
            </button>
            <button
              onClick={onAccept}
              className="py-3 px-4 rounded-xl text-xs font-bold text-[#1B2A4A] bg-[#F59E0B] hover:bg-[#e08e06] shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 animate-pulse"
            >
              <CheckCircle2 className="w-4 h-4 text-[#1B2A4A]" />
              ACCEPTER LA MISSION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
