import React, { useState } from 'react';
import { Star, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Mission } from '../../types';

interface RatingModalProps {
  mission: Mission;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (stars: number, tags: string[], comment?: string) => void;
}

const ATTRIBUTE_TAGS = [
  'Ponctuel ⏱️',
  'Chantier propre 🧹',
  'Professionnel 🛠️',
  'Travail soigné ✨',
  'Explications claires 🗣️',
  'Poli & Respectueux 🤝',
  'Matériel conforme 🔩',
];

const LOW_RATING_TAGS = [
  'En retard ⏳',
  'Chantier non nettoyé 🗑️',
  'Installation imparfaite 📐',
  'Manque d\'outils 🧰',
  'Communication difficile 📵',
];

export const RatingModal: React.FC<RatingModalProps> = ({
  mission,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Professionnel 🛠️', 'Chantier propre 🧹']);
  const [comment, setComment] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const isLowRating = rating <= 2;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating >= 4) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // fallback
      }
    }
    onSubmit(rating, selectedTags, comment);
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  const currentTags = isLowRating ? LOW_RATING_TAGS : ATTRIBUTE_TAGS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-[#1B2A4A]">Merci pour votre évaluation !</h3>
            <p className="text-sm text-slate-600">
              {isLowRating 
                ? 'Votre signalement a été transmis immédiatement au Centre de Litiges Vraiga.'
                : 'Votre avis contribue à valoriser les meilleurs techniciens certifiés d\'Abidjan.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header with Tech avatar */}
            <div className="text-center space-y-2">
              <div className="relative inline-block">
                <img
                  src={mission.technicianPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                  alt={mission.technicianName}
                  className="w-16 h-16 rounded-full object-cover border-3 border-[#F59E0B] shadow-md mx-auto"
                />
                <span className="absolute bottom-0 right-0 bg-[#1B2A4A] text-white p-1 rounded-full text-[10px]">
                  ✓
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1B2A4A]">Évaluez la prestation</h3>
                <p className="text-xs text-slate-500">
                  Technicien : <span className="font-semibold text-[#1B2A4A]">{mission.technicianName || 'Expert Vraiga'}</span>
                </p>
                <p className="text-[11px] text-slate-400">Réf : {mission.reference}</p>
              </div>
            </div>

            {/* Star Rating selector */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-hidden"
                >
                  <Star
                    className={`w-9 h-9 ${
                      (hoverRating || rating) >= star
                        ? 'text-[#F59E0B] fill-[#F59E0B]'
                        : 'text-slate-200 fill-slate-100'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>

            <div className="text-center">
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                rating >= 4 ? 'bg-emerald-100 text-emerald-800' :
                rating === 3 ? 'bg-amber-100 text-amber-800' :
                'bg-rose-100 text-rose-800'
              }`}>
                {rating === 5 && '🌟 Prestation Exceptionnelle'}
                {rating === 4 && '👍 Très Bon Travail'}
                {rating === 3 && '😐 Correct / Acceptable'}
                {rating === 2 && '⚠️ Insatisfaisant'}
                {rating === 1 && '🚨 Très Décevant'}
              </span>
            </div>

            {/* Low-Rating Dispute Banner (CRITICAL REQUIREMENT) */}
            {isLowRating && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-900 animate-in fade-in">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-rose-800">
                    Déclenchement automatique du Centre de Litiges
                  </p>
                  <p className="text-rose-700 leading-relaxed">
                    Un ticket prioritaire sera ouvert instantanément. Un responsable qualité Vraiga Abidjan vous contactera sous <strong>15 minutes</strong> pour remédier à la situation ou ordonner une reprise gratuite.
                  </p>
                </div>
              </div>
            )}

            {/* Attribute Chips */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                {isLowRating ? 'Quels ont été les problèmes rencontrés ?' : 'Points forts de la prestation :'}
              </label>
              <div className="flex flex-wrap gap-2">
                {currentTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                        isSelected
                          ? isLowRating 
                            ? 'bg-rose-600 text-white border-rose-600 font-semibold shadow-xs'
                            : 'bg-[#1B2A4A] text-white border-[#1B2A4A] font-semibold shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Comment */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Commentaire ou remarques (facultatif) :
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isLowRating ? "Détaillez le problème rencontré (ex: support penché, clim mal nettoyée)..." : "Partagez votre expérience avec le technicien..."}
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A] focus:outline-hidden resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Passer
              </button>
              <button
                type="submit"
                className={`flex-1 py-2.5 px-4 text-xs font-bold text-white rounded-xl shadow-md transition-transform active:scale-95 ${
                  isLowRating 
                    ? 'bg-rose-600 hover:bg-rose-700' 
                    : 'bg-[#1B2A4A] hover:bg-[#1B2A4A]/90'
                }`}
              >
                {isLowRating ? 'Ouvrir le litige' : 'Envoyer l\'avis'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
