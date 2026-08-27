import React, { useState } from 'react';
import { 
  AlertTriangle, 
  X, 
  Clock, 
  ShieldCheck, 
  Ban, 
  CheckCircle2, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { Mission } from '../../types';
import { formatFCFA } from '../../utils/formatters';

interface CancelMissionModalProps {
  mission: Mission | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: (reason: string) => void;
}

const CANCELLATION_REASONS = [
  {
    id: 'DELAY',
    icon: '⏱️',
    label: "Délai d'attente trop long",
    description: "Le temps d'arrivée estimé ne me convient pas."
  },
  {
    id: 'MISTAKE',
    icon: '🔄',
    label: "Erreur de commande ou changement d'avis",
    description: "Je souhaite modifier les services ou je n'en ai plus besoin."
  },
  {
    id: 'UNAVAILABLE',
    icon: '📅',
    label: "Imprévu / Indisponibilité personnelle",
    description: "Je dois m'absenter ou reporter à un autre jour."
  },
  {
    id: 'UNREACHABLE',
    icon: '📵',
    label: "Technicien injoignable",
    description: "Impossible d'établir le contact avec le technicien."
  },
  {
    id: 'OTHER',
    icon: '📝',
    label: "Autre motif spécifique",
    description: "Préciser une raison particulière."
  },
];

export const CancelMissionModal: React.FC<CancelMissionModalProps> = ({
  mission,
  isOpen,
  onClose,
  onConfirmCancel,
}) => {
  const [selectedReasonId, setSelectedReasonId] = useState<string>('DELAY');
  const [customComment, setCustomComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !mission) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedReasonObj = CANCELLATION_REASONS.find(r => r.id === selectedReasonId);
    let finalReasonText = selectedReasonObj ? selectedReasonObj.label : "Annulation à la demande du client";

    if (customComment.trim()) {
      finalReasonText = `${finalReasonText} - ${customComment.trim()}`;
    }

    setTimeout(() => {
      onConfirmCancel(finalReasonText);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const getStatusLabel = () => {
    switch (mission.status) {
      case 'SEARCHING':
        return 'Recherche de technicien en cours';
      case 'OFFERED':
        return 'En attente de confirmation du technicien';
      case 'ACCEPTED':
        return 'Technicien en route';
      case 'ARRIVED':
        return 'Technicien sur place';
      case 'IN_PROGRESS':
        return 'Travaux en cours';
      default:
        return 'Commande active';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-rose-50 border-b border-rose-100 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1B2A4A] flex items-center gap-2">
                Annuler l'intervention
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Réf : <strong className="text-rose-700">{mission.reference}</strong> ({mission.commune})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleConfirm} className="p-5 space-y-4 overflow-y-auto flex-1 text-slate-700">
          {/* Status & Free Cancellation Guarantee Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Statut actuel :</span>
              <span className="font-bold text-[#1B2A4A] bg-amber-100/80 text-amber-900 px-2 py-0.5 rounded-full text-[11px]">
                {getStatusLabel()}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-start gap-2 text-xs text-emerald-800 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-emerald-900">Annulation 100% Sans Frais</strong>
                <span className="text-[11px] text-emerald-700 leading-tight">
                  Aucun montant n'est débité. Le technicien sera automatiquement libéré pour d'autres clients.
                </span>
              </div>
            </div>
          </div>

          {/* Reason Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
              Pour quelle raison souhaitez-vous annuler ?
            </label>

            <div className="space-y-2">
              {CANCELLATION_REASONS.map((reason) => {
                const isSelected = selectedReasonId === reason.id;
                return (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() => setSelectedReasonId(reason.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-200 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg shrink-0 mt-0.5">{reason.icon}</span>
                    <div className="flex-1">
                      <h4 className={`text-xs font-bold ${isSelected ? 'text-rose-900' : 'text-slate-800'}`}>
                        {reason.label}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {reason.description}
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-1 shrink-0 ${
                      isSelected ? 'border-rose-600 bg-rose-600' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional detail comment */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 flex items-center justify-between">
              <span>Précisions complémentaires (facultatif) :</span>
              <span className="text-[10px] text-slate-400 font-normal">Max 250 caractères</span>
            </label>
            <textarea
              rows={2}
              value={customComment}
              onChange={(e) => setCustomComment(e.target.value)}
              placeholder="Ex : J'ai trouvé une solution alternative, je commanderai plus tard..."
              maxLength={250}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-rose-400 resize-none bg-slate-50 focus:bg-white transition-all"
            />
          </div>

          {/* Order Summary Recap Box */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span>Prestations ({mission.items.length}) :</span>
              <span className="font-bold text-[#1B2A4A]">{formatFCFA(mission.grossAmount)}</span>
            </div>
            {mission.technicianName && (
              <div className="flex justify-between items-center text-slate-500 text-[11px]">
                <span>Technicien assigné :</span>
                <span className="font-semibold text-slate-700">{mission.technicianName}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-slate-500 text-[11px]">
              <span>Lieu :</span>
              <span className="font-semibold text-slate-700">{mission.commune}</span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors text-center"
            >
              Non, maintenir la commande
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Annulation...</span>
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  <span>Confirmer l'annulation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
