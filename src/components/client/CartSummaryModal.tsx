import React from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  MapPin, 
  Phone, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  Satellite, 
  Tv, 
  Wind, 
  Sparkles,
  Info,
  CheckCircle2,
  Banknote,
  Smartphone,
  Check,
  HeartHandshake,
  Users,
  CreditCard,
  MessageSquareText,
  AlertCircle
} from 'lucide-react';
import { MissionCartItem, CommuneAbidjan, ServiceCategory, PaymentMethod, RecipientRelationship, PayerType } from '../../types';
import { TV_SIZE_TIERS, CLIENT_PAYMENT_METHODS } from '../../data/initialData';
import { formatFCFA } from '../../utils/formatters';

interface CartSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmOrder: () => void;
  items: MissionCartItem[];
  totalAmount: number;
  commune: CommuneAbidjan;
  address: string;
  landmark?: string;
  clientName: string;
  clientPhone: string;
  paymentMethod: PaymentMethod;
  onSelectPaymentMethod: (method: PaymentMethod) => void;
  onUpdateQuantity: (category: ServiceCategory, delta: number) => void;
  onRemoveItem: (category: ServiceCategory) => void;
  // Third party ordering props
  isForThirdParty?: boolean;
  ordererName?: string;
  ordererPhone?: string;
  recipientName?: string;
  recipientPhone?: string;
  recipientRelationship?: RecipientRelationship;
  recipientNotes?: string;
  payerType?: PayerType;
}

export const CartSummaryModal: React.FC<CartSummaryModalProps> = ({
  isOpen,
  onClose,
  onConfirmOrder,
  items,
  totalAmount,
  commune,
  address,
  landmark,
  clientName,
  clientPhone,
  paymentMethod,
  onSelectPaymentMethod,
  onUpdateQuantity,
  onRemoveItem,
  isForThirdParty = false,
  ordererName,
  ordererPhone,
  recipientName,
  recipientPhone,
  recipientRelationship = 'PARENT',
  recipientNotes,
  payerType = 'RECIPIENT_ON_SITE',
}) => {
  if (!isOpen) return null;

  const relationshipLabels: Record<RecipientRelationship, string> = {
    PARENT: 'Parent (Père / Mère)',
    CHILD: 'Enfant / Famille',
    SPOUSE: 'Conjoint(e)',
    FRIEND: 'Ami(e) / Connaissance',
    TENANT: 'Locataire',
    COLLEAGUE: 'Collègue / Partenaire',
    OTHER: 'Autre proche',
  };

  const getServiceIcon = (category: ServiceCategory) => {
    switch (category) {
      case 'PARABOLE_TNT':
        return <Satellite className="w-4 h-4 text-[#F59E0B]" />;
      case 'FIXATION_TV':
        return <Tv className="w-4 h-4 text-[#F59E0B]" />;
      case 'CLIMATISATION':
        return <Wind className="w-4 h-4 text-[#F59E0B]" />;
      case 'VIDEOSURVEILLANCE':
        return <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />;
    }
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300"
      >
        {/* Modal Header */}
        <div className="bg-[#1B2A4A] text-white p-5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F59E0B] flex items-center justify-center font-black text-[#1B2A4A] shadow-md">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">Récapitulatif du Panier</h3>
                <span className="text-[10px] bg-amber-400 text-[#1B2A4A] font-bold px-2 py-0.5 rounded-full">
                  {items.length} service{items.length > 1 ? 's' : ''} ({totalQuantity} prestation{totalQuantity > 1 ? 's' : ''})
                </span>
              </div>
              <p className="text-xs text-slate-300">Vérifiez vos choix avant l'envoi au technicien</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 divide-y divide-slate-100">
          
          {/* Section 1: Intervention Location & Contact */}
          <div className="space-y-2 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Lieu d'intervention & Contact
              </span>
              {isForThirdParty && (
                <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <HeartHandshake className="w-3 h-3 text-rose-600" />
                  Commande pour un proche
                </span>
              )}
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2.5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#1B2A4A]">
                    {commune} <span className="text-slate-500 font-normal">({address})</span>
                  </div>
                  {landmark && (
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Repère : <span className="font-medium text-slate-700">{landmark}</span>
                    </div>
                  )}
                </div>
              </div>

              {isForThirdParty ? (
                <div className="pt-2 border-t border-slate-200/80 space-y-2">
                  {/* Beneficiary on site */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wide flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Bénéficiaire sur place ({relationshipLabels[recipientRelationship] || 'Proche'})
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.2 rounded">
                        Contact direct
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#1B2A4A]">
                      <span className="font-bold">{recipientName || 'Bénéficiaire sur place'}</span>
                      <span className="font-mono font-bold flex items-center gap-1 text-emerald-700">
                        <Phone className="w-3 h-3" />
                        {recipientPhone || '+225 ...'}
                      </span>
                    </div>
                    {recipientNotes && (
                      <div className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded-lg flex items-start gap-1">
                        <MessageSquareText className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <span>Consignes : {recipientNotes}</span>
                      </div>
                    )}
                  </div>

                  {/* Orderer details */}
                  <div className="flex items-center justify-between text-[11px] text-slate-600 px-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      Commandé par : <strong>{ordererName || clientName}</strong>
                    </span>
                    <span className="font-mono text-slate-500">
                      {ordererPhone || clientPhone}
                    </span>
                  </div>

                  {/* Who pays */}
                  <div className="p-2 bg-amber-50 rounded-xl border border-amber-200/60 text-[11px] flex items-center justify-between text-amber-900">
                    <span className="flex items-center gap-1 font-semibold">
                      <CreditCard className="w-3 h-3 text-[#F59E0B]" />
                      Prise en charge du règlement :
                    </span>
                    <strong className="text-xs">
                      {payerType === 'ORDERER_REMOTE' ? 'À distance par le commanditaire' : 'Sur place par le bénéficiaire'}
                    </strong>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {clientName}
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-[#1B2A4A]">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {clientPhone}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Selected Services List with Quantity Controls */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Détail des prestations sélectionnées
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Modifiable en direct
              </span>
            </div>

            {items.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-500">Votre panier est vide</p>
                <p className="text-[11px] text-slate-400 mt-1">Sélectionnez au moins un service dans le catalogue.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {items.map((item) => (
                  <div
                    key={item.category}
                    className="p-3.5 bg-slate-50/90 hover:bg-slate-50 rounded-2xl border border-slate-200/90 flex flex-col gap-2.5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                          {getServiceIcon(item.category)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#1B2A4A] leading-tight">
                            {item.name}
                          </h4>
                          
                          {/* If TV List is provided with multiple rooms & inches */}
                          {item.tvList && item.tvList.length > 0 ? (
                            <div className="mt-2 space-y-1.5 pl-2.5 border-l-2 border-amber-400">
                              {item.tvList.map((tv, idx) => {
                                const tier = TV_SIZE_TIERS.find(t => t.id === tv.tvSize);
                                return (
                                  <div key={tv.id || idx} className="text-[11px] flex items-center justify-between text-slate-700 gap-2">
                                    <span>
                                      📺 <strong>{tv.room}</strong> : <span className="text-slate-600">{tier?.label} ({tier?.inches})</span>
                                    </span>
                                    <span className="font-mono font-bold text-[#1B2A4A]">
                                      {formatFCFA(tier?.price || 0)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <>
                              {item.details && (
                                <span className="text-[10px] text-slate-500 block mt-0.5">
                                  {item.details}
                                </span>
                              )}
                              <span className="text-[11px] font-mono text-slate-500 mt-0.5 block">
                                {formatFCFA(item.unitPrice)} / unité
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveItem(item.category)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Supprimer du panier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quantity & Line Total Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-slate-500">Quantité :</span>
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-0.5 rounded-xl shadow-2xs">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.category, -1)}
                            className="w-6 h-6 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold"
                            title="Diminuer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-bold text-xs text-[#1B2A4A]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.category, 1)}
                            className="w-6 h-6 rounded-lg bg-[#1B2A4A] text-white hover:bg-[#1B2A4A]/90 flex items-center justify-center font-bold"
                            title="Augmenter"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total ligne</span>
                        <span className="text-xs font-black text-[#1B2A4A] font-mono">
                          {formatFCFA(item.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Payment Method Selection */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Mode de règlement souhaité
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Sur place après travaux
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CLIENT_PAYMENT_METHODS.map((method) => {
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => onSelectPaymentMethod(method.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-[#F59E0B] shadow-md'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl shrink-0">{method.iconSymbol}</span>
                        <div>
                          <span className="text-xs font-bold block">{method.label}</span>
                          <span className={`text-[10px] line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            {method.description}
                          </span>
                        </div>
                      </div>

                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-[#F59E0B] border-[#F59E0B] text-[#1B2A4A]' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="mt-2.5 pt-1.5 border-t border-slate-200/30 flex items-center justify-between w-full">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        isSelected ? 'bg-white/20 text-[#F59E0B]' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {method.badge}
                      </span>
                      <span className={`text-[9px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {method.id === 'CASH' ? 'Main propre' : 'Transfert direct'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Payment Method Instruction Note */}
            {(() => {
              const selectedOption = CLIENT_PAYMENT_METHODS.find(m => m.id === paymentMethod) || CLIENT_PAYMENT_METHODS[0];

              return (
                <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-950">
                  <span className="text-base shrink-0 mt-0.5">{selectedOption.iconSymbol}</span>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-[#1B2A4A]">
                      Règlement sélectionné : <span className="text-amber-800">{selectedOption.label}</span>
                    </p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {selectedOption.instruction}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Section 4: Cost Breakdown & Vraiga Commitments */}
          <div className="space-y-3 pt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Détail financier & Tarifs
            </span>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total prestations ({totalQuantity} unités) :</span>
                <span className="font-bold text-[#1B2A4A]">{formatFCFA(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Déplacement technicien :</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.2 rounded">
                  Gratuit (Inclus)
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Assurance & Garantie intervention :</span>
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.2 rounded">
                  Couvert par Vraiga
                </span>
              </div>

              <div className="pt-2.5 border-t border-slate-200 flex justify-between items-center text-sm">
                <div>
                  <span className="font-extrabold text-[#1B2A4A] block">Total net à régler</span>
                  <span className="text-[10px] text-slate-500 font-medium">Sur place après contrôle des travaux</span>
                </div>
                <span className="text-lg font-black text-[#1B2A4A] font-mono">
                  {formatFCFA(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-2 sticky bottom-0">
          <button
            onClick={onConfirmOrder}
            disabled={items.length === 0}
            className="w-full py-4 px-4 bg-[#F59E0B] hover:bg-[#e08e06] disabled:bg-slate-300 disabled:cursor-not-allowed text-[#1B2A4A] font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98 text-xs tracking-wider uppercase"
          >
            <span>CONFIRMER ET TROUVER UN TECHNICIEN ({formatFCFA(totalAmount)})</span>
            <ArrowRight className="w-4 h-4 text-[#1B2A4A]" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Modifier la sélection / Ajouter d'autres services
          </button>
        </div>
      </div>
    </div>
  );
};
