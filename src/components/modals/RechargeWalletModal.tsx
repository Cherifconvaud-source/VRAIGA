import React, { useState } from 'react';
import { 
  Wallet, 
  X, 
  Smartphone, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { PaymentMethod } from '../../types';
import { formatFCFA } from '../../utils/formatters';

interface RechargeWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecharge: (amount: number, method: PaymentMethod) => Promise<boolean>;
  currentBalance: number;
}

const PRESET_AMOUNTS = [5000, 10000, 20000, 50000];

export const RechargeWalletModal: React.FC<RechargeWalletModalProps> = ({
  isOpen,
  onClose,
  onRecharge,
  currentBalance,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('WAVE');
  const [amount, setAmount] = useState<number>(10000);
  const [phone, setPhone] = useState<string>('07 08 45 12 89');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    setIsProcessing(true);
    try {
      await onRecharge(amount, selectedMethod);
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch {
      setIsProcessing(false);
    }
  };

  const paymentOptions: { id: PaymentMethod; name: string; color: string; bg: string; border: string; logo: string }[] = [
    {
      id: 'WAVE',
      name: 'Wave CI',
      color: '#1E90FF',
      bg: 'bg-sky-50',
      border: 'border-sky-300',
      logo: '🌊',
    },
    {
      id: 'ORANGE_MONEY',
      name: 'Orange Money',
      color: '#FF7900',
      bg: 'bg-orange-50',
      border: 'border-orange-300',
      logo: '🍊',
    },
    {
      id: 'MTN_MOMO',
      name: 'MTN MoMo',
      color: '#FFCC00',
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      logo: '🟡',
    },
    {
      id: 'MOOV_MONEY',
      name: 'Moov Money',
      color: '#006699',
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      logo: '📱',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-[#1B2A4A]">Recharge Réussie !</h3>
            <p className="text-sm text-slate-600">
              Votre solde a été crédité de <strong className="text-emerald-600 font-bold">{formatFCFA(amount)}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 text-[#F59E0B] rounded-2xl flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1B2A4A]">Recharger le Portefeuille</h3>
                <p className="text-xs text-slate-500">
                  Solde actuel : <strong className="text-[#1B2A4A]">{formatFCFA(currentBalance)}</strong>
                </p>
              </div>
            </div>

            {/* Select Gateway */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Sélectionnez votre moyen de paiement Mobile Money :
              </label>
              <div className="grid grid-cols-2 gap-2">
                {paymentOptions.map((opt) => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setSelectedMethod(opt.id)}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all ${
                      selectedMethod === opt.id
                        ? `${opt.bg} ${opt.border} ring-2 ring-[#1B2A4A] shadow-xs`
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl">{opt.logo}</span>
                    <div>
                      <div className="text-xs font-bold text-[#1B2A4A]">{opt.name}</div>
                      <div className="text-[10px] text-slate-500">Côte d'Ivoire</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Amounts */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Montant de la recharge (FCFA) :
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AMOUNTS.map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setAmount(val)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
                      amount === val
                        ? 'bg-[#1B2A4A] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {val >= 1000 ? `${val / 1000}k` : val}
                  </button>
                ))}
              </div>

              {/* Custom Amount Input */}
              <div className="relative mt-2">
                <input
                  type="number"
                  min="1000"
                  step="500"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full text-sm font-bold p-3 pr-16 rounded-xl border border-slate-300 focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A] focus:outline-hidden"
                  placeholder="Autre montant..."
                />
                <span className="absolute right-3.5 top-3.5 text-xs font-bold text-slate-400">
                  FCFA
                </span>
              </div>
            </div>

            {/* Phone input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Numéro de compte Mobile Money :
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3 text-xs font-bold text-slate-600 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  +225
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs font-medium pl-18 p-3 rounded-xl border border-slate-300 focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A] focus:outline-hidden"
                  placeholder="07 00 00 00 00"
                />
              </div>
            </div>

            {/* Commission Notice */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2 text-[11px] text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Recharge instantanée sans frais. Ce solde permet le prélèvement automatique de la commission Vraiga de <strong>17.5%</strong> sur vos interventions terminées.
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isProcessing || amount < 1000}
              className="w-full py-3.5 px-4 bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 text-white font-bold rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#F59E0B]" />
                  <span>Validation Mobile Money en cours...</span>
                </>
              ) : (
                <>
                  <span>Recharger {formatFCFA(amount)}</span>
                  <ArrowRight className="w-4 h-4 text-[#F59E0B]" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
