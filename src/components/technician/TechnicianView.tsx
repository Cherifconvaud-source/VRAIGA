import React, { useState, useEffect } from 'react';
import { 
  Power, 
  Wallet, 
  PlusCircle, 
  MapPin, 
  Navigation, 
  CheckCircle, 
  Play, 
  CheckCheck, 
  AlertCircle, 
  Clock, 
  Star, 
  ShieldCheck, 
  History, 
  Phone,
  Percent,
  Layers,
  ChevronRight,
  TrendingUp,
  UserCheck,
  HeartHandshake,
  User,
  Users,
  MessageSquareText,
  Compass,
  SlidersHorizontal,
  Crosshair,
  Check,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatFCFA, formatPercent, formatDateTime } from '../../utils/formatters';
import { TV_SIZE_TIERS, CLIENT_PAYMENT_METHODS, COMMUNES_ABIDJAN } from '../../data/initialData';
import { CommuneAbidjan } from '../../types';
import { IncomingMissionModal } from '../modals/IncomingMissionModal';
import { RechargeWalletModal } from '../modals/RechargeWalletModal';
import { OpenStreetMap } from '../common/OpenStreetMap';

export const TechnicianView: React.FC = () => {
  const { 
    technicians, 
    selectedTechId, 
    setSelectedTechId,
    activeMission, 
    transactions,
    toggleTechnicianStatus,
    updateTechnicianCommune,
    rechargeWallet,
    respondToMissionOffer,
    technicianMarkArrived,
    technicianStartJob,
    technicianCompleteJob 
  } = useApp();

  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState<boolean>(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState<boolean>(false);
  const [isZoneCardExpanded, setIsZoneCardExpanded] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Active Technician Object
  const tech = technicians.find(t => t.id === selectedTechId) || technicians[0];
  const isOnline = tech.status === 'ONLINE';
  const isLowBalance = tech.walletBalance < 2000;

  // Filter transactions for this tech
  const techTransactions = transactions.filter(tx => tx.technicianId === tech.id);

  // Available Abidjan Communes list
  const abidjanCommunes = Object.keys(COMMUNES_ABIDJAN) as CommuneAbidjan[];
  const currentCommuneData = COMMUNES_ABIDJAN[tech.commune] || COMMUNES_ABIDJAN['Cocody'];

  // Handle Primary Commune Change
  const handleSelectPrimaryCommune = (newCommune: CommuneAbidjan) => {
    const updatedSecondaries = (tech.secondaryCommunes || []).filter(c => c !== newCommune);
    updateTechnicianCommune(tech.id, newCommune, updatedSecondaries, tech.interventionRadiusKm || 10);
  };

  // Handle Toggle Secondary Commune
  const handleToggleSecondaryCommune = (commune: CommuneAbidjan) => {
    if (commune === tech.commune) return; // cannot be both primary & secondary
    const current = tech.secondaryCommunes || [];
    let next: CommuneAbidjan[];
    if (current.includes(commune)) {
      next = current.filter(c => c !== commune);
    } else {
      next = [...current, commune];
    }
    updateTechnicianCommune(tech.id, tech.commune, next, tech.interventionRadiusKm || 10);
  };

  // Handle Radius Change
  const handleChangeRadius = (radiusKm: number) => {
    updateTechnicianCommune(tech.id, tech.commune, tech.secondaryCommunes || [], radiusKm);
  };

  // Timer for IN_PROGRESS status
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeMission && activeMission.status === 'IN_PROGRESS') {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeMission?.status]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if there is an incoming mission waiting for this technician
  const isIncomingForMe = activeMission && 
    activeMission.status === 'OFFERED' && 
    (activeMission.technicianId === tech.id || !activeMission.technicianId);

  // Check if there is an active accepted job for this tech
  const hasActiveJob = activeMission && 
    ['ACCEPTED', 'ARRIVED', 'IN_PROGRESS'].includes(activeMission.status) &&
    (activeMission.technicianId === tech.id);

  const isCompletedJob = activeMission && 
    activeMission.status === 'COMPLETED' && 
    activeMission.technicianId === tech.id;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F0F4F8] flex flex-col pb-24 animate-in fade-in">
      {/* Top Technician Header */}
      <div className="bg-[#1B2A4A] text-white p-5 rounded-b-3xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={tech.photo}
                alt={tech.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-[#F59E0B] shadow-md"
              />
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1B2A4A] ${
                isOnline ? 'bg-emerald-500' : 'bg-slate-400'
              }`} />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-sm text-white">{tech.name}</h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                  {tech.kyc.status === 'VERIFIED' ? 'Vérifié KYC' : 'En attente'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <button
                  onClick={() => setIsZoneModalOpen(true)}
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-lg border border-white/20 transition-colors"
                  title="Changer votre commune d'intervention"
                >
                  <MapPin className="w-3 h-3 text-[#F59E0B]" />
                  Base : <strong className="text-[#F59E0B] underline decoration-dotted">{tech.commune}</strong>
                  <span className="text-[9px] text-amber-200">✎ Modifier</span>
                </button>
                <span className="text-xs text-slate-300">• ★ {tech.rating}</span>
              </div>
            </div>
          </div>

          {/* Quick tech profile switcher (Demo helper) */}
          <select
            value={selectedTechId}
            onChange={(e) => setSelectedTechId(e.target.value)}
            className="bg-white/10 text-white text-[11px] font-semibold py-1 px-2 rounded-lg border border-white/20 focus:outline-hidden"
          >
            {technicians.map(t => (
              <option key={t.id} value={t.id} className="text-[#1B2A4A]">
                {t.name.split(' ')[0]} ({t.commune})
              </option>
            ))}
          </select>
        </div>

        {/* Status Switcher (En ligne / Hors ligne) */}
        <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
            <div>
              <span className="text-xs font-extrabold text-white block">
                {isOnline ? 'VOUS ÊTES EN LIGNE' : 'VOUS ÊTES HORS LIGNE'}
              </span>
              <span className="text-[10px] text-slate-300">
                {isOnline ? 'Prêt à recevoir les missions Abidjan' : 'Aucune mission ne vous sera envoyée'}
              </span>
            </div>
          </div>

          <button
            onClick={() => toggleTechnicianStatus(tech.id)}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
              isOnline 
                ? 'bg-rose-500/90 hover:bg-rose-600 text-white' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white animate-pulse'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {isOnline ? 'Passer Hors Ligne' : 'Me Mettre En Ligne'}
          </button>
        </div>

        {/* VIRTUAL WALLET CARD & RECHARGE */}
        <div className="bg-gradient-to-br from-[#24375f] to-[#1B2A4A] p-4 rounded-2xl border border-white/15 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-[#F59E0B] flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider block">
                  Portefeuille Virtuel Vraiga
                </span>
                <span className="text-xl font-black text-white font-mono">
                  {formatFCFA(tech.walletBalance)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsRechargeModalOpen(true)}
              className="py-2 px-3 bg-[#F59E0B] hover:bg-[#e08e06] text-[#1B2A4A] font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#1B2A4A]" />
              Recharger MoMo
            </button>
          </div>

          {/* Commission explanation & Low Balance Warning */}
          {isLowBalance ? (
            <div className="p-2.5 bg-rose-500/20 border border-rose-400/30 rounded-xl flex items-center gap-2 text-rose-200 text-xs animate-pulse">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Solde inférieur à 2 000 FCFA. Rechargez via Wave ou Orange Money pour continuer à recevoir des missions.</span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-white/10">
              <span>Commission prélevée par mission : <strong className="text-amber-300">17.5%</strong></span>
              <span className="text-emerald-300 font-semibold">{tech.completedMissionsCount} missions faites</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-4 flex-1">
        {/* ACTIVE MISSION 3-STEP ACTION WORKFLOW */}
        {hasActiveJob ? (
          <div className="bg-white rounded-3xl p-5 shadow-xl border-2 border-[#1B2A4A] space-y-5">
            {/* Header with status */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#F59E0B] animate-ping" />
                <h3 className="font-extrabold text-sm text-[#1B2A4A]">Intervention en Cours</h3>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                Réf: {activeMission.reference}
              </span>
            </div>

            {/* Map Preview */}
            <OpenStreetMap
              mode="TRACKING"
              clientLocation={{
                lat: activeMission.coordinates.lat,
                lng: activeMission.coordinates.lng,
                address: activeMission.address,
                commune: activeMission.commune,
              }}
              technicianLocation={activeMission.technicianCoordinates ? {
                lat: activeMission.technicianCoordinates.lat,
                lng: activeMission.technicianCoordinates.lng,
                name: tech.name,
              } : undefined}
              height="180px"
              missionStatus={activeMission.status}
            />

            {/* Client and address details */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
              {activeMission.isForThirdParty ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <HeartHandshake className="w-3 h-3 text-rose-600" />
                      Commande passée pour un tiers
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {activeMission.recipientRelationship || 'Proche'}
                    </span>
                  </div>

                  {/* Beneficiary Card with Direct Phone Action */}
                  <div className="bg-white p-3 rounded-xl border border-rose-200/80 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-rose-700 block flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Bénéficiaire sur place
                      </span>
                      <span className="text-sm font-bold text-[#1B2A4A] block">
                        {activeMission.recipientName || activeMission.clientName}
                      </span>
                      <span className="text-xs font-mono text-slate-500 font-medium">
                        {activeMission.recipientPhone || activeMission.clientPhone}
                      </span>
                    </div>

                    <a
                      href={`tel:${activeMission.recipientPhone || activeMission.clientPhone}`}
                      className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Appeler sur place
                    </a>
                  </div>

                  {/* Orderer Info if available */}
                  <div className="flex items-center justify-between text-xs bg-slate-100/80 p-2.5 rounded-xl text-slate-600">
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Commandé par : <strong>{activeMission.ordererName || 'Client distant'}</strong>
                      </span>
                    </div>
                    {activeMission.ordererPhone && (
                      <a
                        href={`tel:${activeMission.ordererPhone}`}
                        className="text-xs font-bold text-blue-700 hover:underline shrink-0 ml-2"
                      >
                        Appeler
                      </a>
                    )}
                  </div>

                  {/* Special Notes */}
                  {activeMission.recipientNotes && (
                    <div className="text-xs bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl text-amber-900 flex items-start gap-2">
                      <MessageSquareText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-[11px]">Consignes d'accueil / Accès :</strong>
                        <span>{activeMission.recipientNotes}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Client</span>
                    <span className="text-sm font-bold text-[#1B2A4A]">{activeMission.clientName}</span>
                  </div>
                  <a
                    href={`tel:${activeMission.clientPhone}`}
                    className="py-1.5 px-3 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-emerald-200 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Appeler
                  </a>
                </div>
              )}

              <div className="text-xs text-slate-600 flex items-start gap-1.5 pt-1 border-t border-slate-200/60">
                <MapPin className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
                <div>
                  <strong>{activeMission.commune}</strong> – {activeMission.address}
                  {activeMission.landmark && <span className="block text-slate-500">Repère : {activeMission.landmark}</span>}
                </div>
              </div>

              {/* Service details */}
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                {activeMission.items.map((it, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>{it.quantity}x {it.name}</span>
                      <span className="font-bold text-[#1B2A4A] font-mono">{formatFCFA(it.totalPrice)}</span>
                    </div>

                    {it.tvList && it.tvList.length > 0 ? (
                      <div className="mt-1 pl-3 border-l-2 border-amber-400 space-y-0.5">
                        {it.tvList.map((tv, tvIdx) => {
                          const tier = TV_SIZE_TIERS.find(t => t.id === tv.tvSize);
                          return (
                            <div key={tv.id || tvIdx} className="text-[11px] text-slate-600 flex justify-between">
                              <span>📺 <strong>{tv.room}</strong> : {tier?.label} ({tier?.inches})</span>
                              <span className="font-mono">{formatFCFA(tier?.price || 0)}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : it.details ? (
                      <span className="text-[10px] text-slate-500 block">{it.details}</span>
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Finance & Payment Method breakdown */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-500">Total client : </span>
                    <span className="font-bold text-[#1B2A4A]">{formatFCFA(activeMission.grossAmount)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Gain net (-17.5%) :</span>
                    <span className="font-extrabold text-emerald-600">{formatFCFA(activeMission.technicianNetEarnings)}</span>
                  </div>
                </div>

                {/* Client payment method box */}
                <div className="p-2.5 bg-amber-50/90 border border-amber-200/80 rounded-xl text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">
                      {(CLIENT_PAYMENT_METHODS.find(m => m.id === activeMission.paymentMethod) || CLIENT_PAYMENT_METHODS[0]).iconSymbol}
                    </span>
                    <div>
                      <span className="font-bold text-[#1B2A4A] block">
                        Règlement client : {(CLIENT_PAYMENT_METHODS.find(m => m.id === activeMission.paymentMethod) || CLIENT_PAYMENT_METHODS[0]).label}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {activeMission.paymentMethod === 'CASH' 
                          ? 'Prévoir de la monnaie pour rendre l\'appoint'
                          : 'Faites scanner votre QR Code ou donnez votre numéro'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded-md shrink-0">
                    {(CLIENT_PAYMENT_METHODS.find(m => m.id === activeMission.paymentMethod) || CLIENT_PAYMENT_METHODS[0]).badge}
                  </span>
                </div>
              </div>
            </div>

            {/* Live in-progress timer */}
            {activeMission.status === 'IN_PROGRESS' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-amber-900">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#F59E0B] animate-spin" />
                  <span className="text-xs font-bold">Temps de travail écoulé :</span>
                </div>
                <span className="font-mono font-black text-lg text-[#1B2A4A]">
                  {formatTimer(elapsedSeconds)}
                </span>
              </div>
            )}

            {/* 3-STEP SEQUENTIAL ACTION BUTTONS (MANDATORY REQUIREMENT) */}
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-extrabold text-[#1B2A4A] uppercase tracking-wider block">
                Workflow d'Intervention :
              </span>

              {/* STEP 1 */}
              {activeMission.status === 'ACCEPTED' && (
                <button
                  onClick={() => technicianMarkArrived(activeMission.id)}
                  className="w-full py-4 px-4 bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 text-white font-extrabold text-xs tracking-wider uppercase rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <Navigation className="w-4 h-4 text-[#F59E0B]" />
                  <span>1. JE SUIS ARRIVÉ SUR PLACE</span>
                </button>
              )}

              {/* STEP 2 */}
              {activeMission.status === 'ARRIVED' && (
                <button
                  onClick={() => technicianStartJob(activeMission.id)}
                  className="w-full py-4 px-4 bg-[#F59E0B] hover:bg-[#e08e06] text-[#1B2A4A] font-extrabold text-xs tracking-wider uppercase rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 animate-pulse"
                >
                  <Play className="w-4 h-4 fill-[#1B2A4A]" />
                  <span>2. DÉMARRER LA PRESTATION</span>
                </button>
              )}

              {/* STEP 3 */}
              {activeMission.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => technicianCompleteJob(activeMission.id)}
                  className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <CheckCheck className="w-5 h-5 text-white" />
                  <span>3. TERMINER LA PRESTATION (-17.5% COMMISSION)</span>
                </button>
              )}
            </div>
          </div>
        ) : isCompletedJob ? (
          /* Receipt Card when finished */
          <div className="bg-white rounded-3xl p-5 shadow-lg border border-emerald-200 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1B2A4A]">Prestation Terminée avec Succès !</h3>
              <p className="text-xs text-slate-500 mt-0.5">Réf: {activeMission.reference}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl text-left text-xs space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-600">Montant brut perçu :</span>
                <span className="font-bold text-[#1B2A4A]">{formatFCFA(activeMission.grossAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Moyen de paiement client :</span>
                <span className="font-bold text-[#1B2A4A] flex items-center gap-1">
                  {(CLIENT_PAYMENT_METHODS.find(m => m.id === activeMission.paymentMethod) || CLIENT_PAYMENT_METHODS[0]).iconSymbol}
                  {(CLIENT_PAYMENT_METHODS.find(m => m.id === activeMission.paymentMethod) || CLIENT_PAYMENT_METHODS[0]).label}
                </span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Commission Vraiga déduite (17.5%) :</span>
                <span className="font-bold">- {formatFCFA(activeMission.commissionAmount)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm">
                <span className="font-bold text-slate-800">Gain net conservé :</span>
                <span className="font-extrabold text-emerald-600">{formatFCFA(activeMission.technicianNetEarnings)}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Idle / Ready State */
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Navigation className="w-8 h-8 text-[#1B2A4A]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1B2A4A]">
                {isOnline ? 'En attente de nouvelles demandes' : 'Vous êtes hors ligne'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {isOnline 
                  ? `Votre GPS est actif dans la zone de ${tech.commune}. Dès qu'un client passe commande, une alerte 30s apparaîtra.`
                  : 'Activez votre statut pour être éligible au dispatch intelligent.'}
              </p>
            </div>
          </div>
        )}

        {/* ZONE D'INTERVENTION & COMMUNE ACTIVE CARD */}
        <div className="bg-white rounded-3xl p-4 md:p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-[#F59E0B] flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#1B2A4A] uppercase tracking-wider">
                  Zone d'Intervention & Commune
                </h3>
                <p className="text-[10px] text-slate-500">
                  Définissez votre commune principale et zones secondaires
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsZoneModalOpen(true)}
              className="text-xs font-bold text-[#1B2A4A] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3 text-[#F59E0B]" />
              Configurer
            </button>
          </div>

          {/* Current Commune Badge & Neighborhoods */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Commune Principale :</span>
              <span className="text-xs font-extrabold text-[#1B2A4A] bg-amber-100/80 text-amber-950 px-2.5 py-1 rounded-xl flex items-center gap-1 border border-amber-200">
                <MapPin className="w-3 h-3 text-[#F59E0B]" />
                {tech.commune}
              </span>
            </div>

            {/* Quick 11 Communes Selector Grid */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Changer rapidement de commune principale :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {abidjanCommunes.map(c => {
                  const isSelected = tech.commune === c;
                  return (
                    <button
                      key={c}
                      onClick={() => handleSelectPrimaryCommune(c)}
                      className={`text-[11px] px-2.5 py-1 rounded-xl font-bold transition-all ${
                        isSelected 
                          ? 'bg-[#1B2A4A] text-white shadow-xs scale-102 ring-2 ring-[#F59E0B]' 
                          : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
                      }`}
                    >
                      {isSelected ? '✓ ' : ''}{c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secondary Communes */}
            <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-600">Communes secondaires couvertes :</span>
                <span className="text-[10px] font-bold text-slate-400">
                  {tech.secondaryCommunes && tech.secondaryCommunes.length > 0 
                    ? `${tech.secondaryCommunes.length} zone(s)` 
                    : 'Aucune'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {abidjanCommunes
                  .filter(c => c !== tech.commune)
                  .map(c => {
                    const isCovered = (tech.secondaryCommunes || []).includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => handleToggleSecondaryCommune(c)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg font-semibold transition-all ${
                          isCovered
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-slate-200/50 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {isCovered ? '✓ ' : '+ '}{c}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Radius & Neighborhoods info */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
              <span>Rayon : <strong className="text-[#1B2A4A]">{tech.interventionRadiusKm || 10} km</strong></span>
              <span className="truncate max-w-[200px]" title={currentCommuneData.neighborhoods.join(', ')}>
                Quartiers : {currentCommuneData.neighborhoods.slice(0, 3).join(', ')}...
              </span>
            </div>
          </div>
        </div>

        {/* Certifications & Skills (Illustrating Skill Pairing Rule) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#1B2A4A] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
              Vos Agréments Métiers
            </h3>
            <span className="text-[10px] text-slate-400">Certifié Vraiga</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              tech.certifications.paraboleTnt ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <span className="font-bold">📡 Parabole / TNT</span>
              {tech.certifications.paraboleTnt && <CheckCheck className="w-3.5 h-3.5 text-emerald-600 ml-auto" />}
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              tech.certifications.fixationTv ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div>
                <span className="font-bold block">📺 Fixation TV</span>
                <span className="text-[9px] text-slate-500">Lié à Parabole</span>
              </div>
              {tech.certifications.fixationTv && <CheckCheck className="w-3.5 h-3.5 text-emerald-600 ml-auto" />}
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              tech.certifications.climatisation ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <span className="font-bold">❄️ Climatisation</span>
              {tech.certifications.climatisation && <CheckCheck className="w-3.5 h-3.5 text-emerald-600 ml-auto" />}
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              tech.certifications.videosurveillance ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <span className="font-bold">📹 Vidéosurveillance</span>
              {tech.certifications.videosurveillance && <CheckCheck className="w-3.5 h-3.5 text-emerald-600 ml-auto" />}
            </div>
          </div>
        </div>

        {/* Recent Transactions / Commission Ledger */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#1B2A4A] uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#F59E0B]" />
              Historique du Portefeuille
            </h3>
            <span className="text-[10px] text-slate-500">{techTransactions.length} transactions</span>
          </div>

          <div className="space-y-2">
            {techTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-2">Aucune transaction pour le moment.</p>
            ) : (
              techTransactions.slice(0, 4).map((tx) => (
                <div key={tx.id} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#1B2A4A] block">{tx.description}</span>
                    <span className="text-[10px] text-slate-400">{formatDateTime(tx.createdAt)}</span>
                  </div>
                  <span className={`font-bold font-mono ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.amount > 0 ? `+${formatFCFA(tx.amount)}` : formatFCFA(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 30-Second Incoming Mission Popup */}
      {isIncomingForMe && activeMission && (
        <IncomingMissionModal
          mission={activeMission}
          isOpen={true}
          onAccept={() => respondToMissionOffer(activeMission.id, true)}
          onDecline={() => respondToMissionOffer(activeMission.id, false)}
        />
      )}

      {/* Recharge Wallet Modal */}
      <RechargeWalletModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
        onRecharge={(amount, method) => rechargeWallet(tech.id, amount, method)}
        currentBalance={tech.walletBalance}
      />

      {/* Zone & Commune d'Intervention Modal */}
      {isZoneModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#1B2A4A] text-[#F59E0B] flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#1B2A4A]">Zone d'Intervention Abidjan</h3>
                  <p className="text-[10px] text-slate-500">Configurez votre base et votre rayon d'action</p>
                </div>
              </div>
              <button
                onClick={() => setIsZoneModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Primary Commune Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1B2A4A] flex items-center justify-between">
                <span>1. Commune Principale (Base de départ) :</span>
                <span className="text-[11px] text-[#F59E0B] font-extrabold">{tech.commune}</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {abidjanCommunes.map(c => {
                  const isSelected = tech.commune === c;
                  return (
                    <button
                      key={c}
                      onClick={() => handleSelectPrimaryCommune(c)}
                      className={`p-2 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between border ${
                        isSelected 
                          ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-xs' 
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="truncate">{c}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Secondary Communes Multi-Select */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-[#1B2A4A] flex items-center justify-between">
                <span>2. Communes Secondaires Tolérées :</span>
                <span className="text-[10px] text-slate-400">
                  {tech.secondaryCommunes?.length || 0} sélectionnée(s)
                </span>
              </label>
              <p className="text-[10px] text-slate-500">
                Activez d'autres communes où vous acceptez de vous déplacer :
              </p>
              <div className="flex flex-wrap gap-1.5">
                {abidjanCommunes
                  .filter(c => c !== tech.commune)
                  .map(c => {
                    const isSelected = (tech.secondaryCommunes || []).includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => handleToggleSecondaryCommune(c)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓' : '+'} {c}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* 3. Intervention Radius */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold text-[#1B2A4A]">
                <span>3. Rayon Maximal d'Intervention :</span>
                <span className="font-mono text-emerald-600 font-extrabold">{tech.interventionRadiusKm || 10} km</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[5, 10, 15, 25].map(radius => (
                  <button
                    key={radius}
                    onClick={() => handleChangeRadius(radius)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      (tech.interventionRadiusKm || 10) === radius
                        ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {radius} km
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Active Commune Neighborhoods details */}
            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
                Quartiers couverts à {tech.commune} :
              </div>
              <p className="text-[11px] text-amber-800">
                {currentCommuneData.neighborhoods.join(' • ')}
              </p>
              <div className="text-[10px] text-amber-700 pt-1">
                Points de repère : {currentCommuneData.popularLandmarks.join(', ')}
              </div>
            </div>

            {/* Close / Confirm button */}
            <button
              onClick={() => setIsZoneModalOpen(false)}
              className="w-full py-3.5 bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 text-white font-extrabold text-xs rounded-2xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 text-[#F59E0B]" />
              Enregistrer ma Zone d'Intervention
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
