import React, { useState } from 'react';
import { 
  DollarSign, 
  Activity, 
  Users, 
  AlertTriangle, 
  ShieldCheck, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  PhoneCall, 
  FileText, 
  Search, 
  Filter, 
  TrendingUp, 
  RefreshCw, 
  Eye, 
  Check, 
  MessageSquare,
  HelpCircle,
  Clock,
  Layers,
  Sparkles,
  Package,
  BarChart3,
  Navigation
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Technician, DisputeTicket } from '../../types';
import { formatFCFA, formatDateTime, formatPercent } from '../../utils/formatters';
import { OpenStreetMap } from '../common/OpenStreetMap';
import { ServiceCatalogManager } from './ServiceCatalogManager';
import { AdminAnalyticsDashboard } from './AdminAnalyticsDashboard';
import { AdminQuartiersMap } from './AdminQuartiersMap';

export const AdminDashboard: React.FC = () => {
  const { 
    technicians, 
    activeMission, 
    missionHistory, 
    disputes, 
    transactions,
    services,
    tvSizeTiers,
    toggleTechnicianKyc,
    setTechnicianKycStatus,
    toggleCertification,
    resolveDispute,
    resetDemoData
  } = useApp();

  const [activeTab, setActiveTab] = useState<'QUARTIERS_MAP' | 'FLEET' | 'ANALYTICS' | 'SERVICES' | 'KYC' | 'DISPUTES' | 'COMMISSIONS'>('QUARTIERS_MAP');
  const [selectedTechForDetails, setSelectedTechForDetails] = useState<Technician | null>(null);
  
  // Dispute Resolution Modal State
  const [selectedDispute, setSelectedDispute] = useState<DisputeTicket | null>(null);
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [refundAmount, setRefundAmount] = useState<number>(0);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fleetFilter, setFleetFilter] = useState<'ALL' | 'ONLINE' | 'LOW_BALANCE'>('ALL');

  // KPI Calculations
  const totalCommissionRevenue = transactions
    .filter(t => t.type === 'COMMISSION_DEDUCTION')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalGrossVolume = missionHistory.reduce((sum, m) => sum + m.grossAmount, 0) + 
    (activeMission ? activeMission.grossAmount : 0);

  const onlineTechsCount = technicians.filter(t => t.status === 'ONLINE').length;
  const activeMissionsCount = activeMission && activeMission.status !== 'CANCELLED' && activeMission.status !== 'COMPLETED' ? 1 : 0;
  const openDisputesCount = disputes.filter(d => d.status === 'OPEN' || d.status === 'INVESTIGATING').length;

  const filteredTechs = technicians.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.commune.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (fleetFilter === 'ONLINE') return t.status === 'ONLINE';
    if (fleetFilter === 'LOW_BALANCE') return t.walletBalance < 2000;
    return true;
  });

  const handleOpenDisputeModal = (dispute: DisputeTicket) => {
    setSelectedDispute(dispute);
    setResolutionNote('Investigation menée. Contact téléphonique effectué avec le client et le technicien.');
    setRefundAmount(0);
  };

  const handleConfirmDisputeResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;
    resolveDispute(selectedDispute.id, resolutionNote, refundAmount);
    setSelectedDispute(null);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#1B2A4A] p-4 lg:p-8 space-y-6 animate-in fade-in">
      {/* Top Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#1B2A4A] flex items-center justify-center font-black text-[#F59E0B] text-2xl shadow-md">
            V
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#1B2A4A]">Back-Office Vraiga Côte d'Ivoire</h1>
              <span className="text-xs bg-[#1B2A4A] text-amber-300 font-bold px-2.5 py-0.5 rounded-full">
                Abidjan HQ
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Supervision de la flotte, régulation des commissions 17.5% et arbitrage des litiges
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetDemoData}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Réinitialiser Données Démo
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS (5 METRICS) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Commission Revenue 17.5% */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Commissions (17.5%)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#F59E0B] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#1B2A4A] font-mono">
            {formatFCFA(totalCommissionRevenue)}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block">
            Prélevé automatiquement
          </span>
        </div>

        {/* KPI 2: Active Missions */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Missions Actives
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#1B2A4A]">
            {activeMissionsCount} en cours
          </div>
          <span className="text-[10px] text-slate-500 block">
            {missionHistory.length} terminées au total
          </span>
        </div>

        {/* KPI 3: Online Technicians */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Flotte Disponible
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#1B2A4A]">
            {onlineTechsCount} / {technicians.length}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block">
            {Math.round((onlineTechsCount / technicians.length) * 100)}% en service
          </span>
        </div>

        {/* KPI 4: Open Disputes */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Litiges & Alertes
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              openDisputesCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl font-black ${openDisputesCount > 0 ? 'text-rose-600' : 'text-[#1B2A4A]'}`}>
            {openDisputesCount} en attente
          </div>
          <span className="text-[10px] text-slate-500 block">
            Notes 1-2 étoiles auto-signalées
          </span>
        </div>

        {/* KPI 5: Total GMV */}
        <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Volume Brut (GMV)
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#1B2A4A] font-mono">
            {formatFCFA(totalGrossVolume)}
          </div>
          <span className="text-[10px] text-slate-500 block">
            Paiements clients Abidjan
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'QUARTIERS_MAP', label: 'Carte Interventions par Quartier', icon: Navigation, badgeColor: 'bg-emerald-600 text-white' },
          { id: 'FLEET', label: 'Flotte Techniciens Abidjan', icon: MapPin },
          { id: 'ANALYTICS', label: 'Analyses & Graphiques Recharts', icon: BarChart3, badgeColor: 'bg-blue-600 text-white' },
          { id: 'SERVICES', label: `Prestations & Tarifs (${services.length})`, icon: Package, badgeColor: 'bg-amber-500 text-white' },
          { id: 'KYC', label: 'Gestion KYC & Agréments Métiers', icon: ShieldCheck },
          { id: 'DISPUTES', label: `Centre de Litiges (${openDisputesCount})`, icon: AlertTriangle, badgeColor: openDisputesCount > 0 ? 'bg-rose-500 text-white' : undefined },
          { id: 'COMMISSIONS', label: 'Livre des Commissions (17.5%)', icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2.5 px-4 rounded-2xl font-bold text-xs whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive 
                  ? 'bg-[#1B2A4A] text-white shadow-md' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#F59E0B]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.id === 'QUARTIERS_MAP' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
              {tab.id === 'DISPUTES' && openDisputesCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-rose-500 text-white">
                  {openDisputesCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB: INTERVENTIONS PAR QUARTIER (MAP INTERACTIVE) */}
      {activeTab === 'QUARTIERS_MAP' && (
        <AdminQuartiersMap
          activeMission={activeMission}
          technicians={technicians}
          onSelectTechnician={(tech) => setSelectedTechForDetails(tech)}
        />
      )}

      {/* TAB: ANALYTICS WITH RECHARTS (Interventions per day & per commune) */}
      {activeTab === 'ANALYTICS' && (
        <AdminAnalyticsDashboard 
          missions={missionHistory} 
          activeMission={activeMission} 
        />
      )}

      {/* TAB 1: FLEET MAP & REAL-TIME TRACKING */}
      {activeTab === 'FLEET' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-[#1B2A4A] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#F59E0B]" />
                  Carte Interactive des Techniciens en Direct
                </h3>
                <p className="text-xs text-slate-500">
                  Cliquez sur un marqueur pour inspecter l'état du technicien et de son portefeuille
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('QUARTIERS_MAP')}
                  className="text-xs px-3 py-1.5 rounded-xl font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 flex items-center gap-1 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  Vue Interventions / Quartier
                </button>
                <button
                  onClick={() => setFleetFilter('ALL')}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-colors ${
                    fleetFilter === 'ALL' ? 'bg-[#1B2A4A] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Tous ({technicians.length})
                </button>
                <button
                  onClick={() => setFleetFilter('ONLINE')}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-colors ${
                    fleetFilter === 'ONLINE' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  En Ligne ({onlineTechsCount})
                </button>
                <button
                  onClick={() => setFleetFilter('LOW_BALANCE')}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-colors ${
                    fleetFilter === 'LOW_BALANCE' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Solde Bas (&lt;2k)
                </button>
              </div>
            </div>

            {/* Abidjan Map */}
            <OpenStreetMap
              mode="FLEET"
              allTechnicians={filteredTechs}
              onSelectTechnician={(tech) => setSelectedTechForDetails(tech)}
              height="440px"
            />
          </div>

          {/* Technician Quick Inspector */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-[#1B2A4A] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#F59E0B]" />
              {selectedTechForDetails ? "Détails Technicien Sélectionné" : "Effectif Technicien Abidjan"}
            </h3>

            {selectedTechForDetails ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <img
                    src={selectedTechForDetails.photo}
                    alt={selectedTechForDetails.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#1B2A4A]"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-[#1B2A4A]">{selectedTechForDetails.name}</h4>
                    <span className="text-xs text-slate-500 block">{selectedTechForDetails.phone}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedTechForDetails.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {selectedTechForDetails.status === 'ONLINE' ? '● En ligne' : '○ Hors ligne'}
                      </span>
                      <span className="text-xs font-bold text-amber-600">★ {selectedTechForDetails.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-500">Commune de rattachement :</span>
                    <strong className="text-[#1B2A4A]">{selectedTechForDetails.commune}</strong>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-500">Solde Portefeuille Virtuel :</span>
                    <strong className={`font-mono ${selectedTechForDetails.walletBalance < 2000 ? 'text-rose-600' : 'text-[#1B2A4A]'}`}>
                      {formatFCFA(selectedTechForDetails.walletBalance)}
                    </strong>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-500">Interventions achevées :</span>
                    <strong className="text-[#1B2A4A]">{selectedTechForDetails.completedMissionsCount}</strong>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-500">Véhicule :</span>
                    <strong className="text-slate-700 truncate max-w-[150px]">{selectedTechForDetails.vehicle}</strong>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTechForDetails(null)}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 rounded-xl transition-colors"
                >
                  Fermer l'inspecteur
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  Sélectionnez un technicien dans la liste pour consulter ses certifications :
                </p>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {technicians.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTechForDetails(t)}
                      className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={t.photo} alt={t.name} className="w-9 h-9 rounded-xl object-cover" />
                        <div>
                          <h5 className="font-bold text-xs text-[#1B2A4A]">{t.name}</h5>
                          <span className="text-[10px] text-slate-500">{t.commune}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-bold block ${t.status === 'ONLINE' ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {t.status === 'ONLINE' ? 'En ligne' : 'Hors ligne'}
                        </span>
                        <span className="text-xs font-bold font-mono text-[#1B2A4A]">{formatFCFA(t.walletBalance)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: SERVICES & TARIFFS MANAGEMENT */}
      {activeTab === 'SERVICES' && (
        <ServiceCatalogManager />
      )}

      {/* TAB 2: KYC & CERTIFICATIONS MANAGEMENT TABLE (WITH SKILL PAIRING RULE) */}
      {activeTab === 'KYC' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-[#1B2A4A] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#F59E0B]" />
                Validation KYC & Agréments Métiers (Règle d'Appariement Parabole/TV)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                <strong>Règle Métier Imposée :</strong> Cocher "Parabole / TNT" débloque automatiquement l'éligibilité "Fixation TV". Seuls les techniciens agréés Parabole peuvent fixer des écrans TV.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom ou commune..."
                className="text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-64 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-[#1B2A4A] font-bold border-b border-slate-200">
                  <th className="p-3.5 rounded-l-xl">Technicien</th>
                  <th className="p-3.5">Zone</th>
                  <th className="p-3.5">Dossier KYC</th>
                  <th className="p-3.5">Statut KYC</th>
                  <th className="p-3.5">📡 Parabole/TNT</th>
                  <th className="p-3.5">📺 Fixation TV</th>
                  <th className="p-3.5">❄️ Climatisation</th>
                  <th className="p-3.5 rounded-r-xl">📹 Caméras</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTechs.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Technician Name & Avatar */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                        <div>
                          <span className="font-bold text-[#1B2A4A] block">{t.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{t.id} • {t.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Commune */}
                    <td className="p-3.5 font-semibold text-slate-700">
                      {t.commune}
                    </td>

                    {/* KYC Document Checklist */}
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => toggleTechnicianKyc(t.id, 'cniValidated')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            t.kyc.cniValidated ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}
                          title="Pièce d'identité CNI"
                        >
                          CNI {t.kyc.cniValidated ? '✓' : '✗'}
                        </button>
                        <button
                          onClick={() => toggleTechnicianKyc(t.id, 'residenceCertValidated')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            t.kyc.residenceCertValidated ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}
                          title="Certificat de résidence"
                        >
                          Résidence {t.kyc.residenceCertValidated ? '✓' : '✗'}
                        </button>
                        <button
                          onClick={() => toggleTechnicianKyc(t.id, 'criminalRecordClean')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            t.kyc.criminalRecordClean ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}
                          title="Casier judiciaire vierge"
                        >
                          Casier {t.kyc.criminalRecordClean ? '✓' : '✗'}
                        </button>
                      </div>
                    </td>

                    {/* KYC Status Toggle */}
                    <td className="p-3.5">
                      <select
                        value={t.kyc.status}
                        onChange={(e) => setTechnicianKycStatus(t.id, e.target.value as 'VERIFIED' | 'PENDING' | 'REJECTED')}
                        className={`text-[11px] font-bold p-1.5 rounded-lg border focus:outline-hidden ${
                          t.kyc.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          t.kyc.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        <option value="VERIFIED">Validé (Actif)</option>
                        <option value="PENDING">En attente</option>
                        <option value="REJECTED">Suspendu</option>
                      </select>
                    </td>

                    {/* Certification: Parabole / TNT (AUTO-PAIRS FIXATION TV) */}
                    <td className="p-3.5">
                      <button
                        onClick={() => toggleCertification(t.id, 'paraboleTnt')}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
                          t.certifications.paraboleTnt
                            ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-xs'
                            : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {t.certifications.paraboleTnt ? '✓ Agréé' : 'Non agréé'}
                      </button>
                    </td>

                    {/* Certification: Fixation TV (Linked to Parabole) */}
                    <td className="p-3.5">
                      <button
                        onClick={() => toggleCertification(t.id, 'fixationTv')}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
                          t.certifications.fixationTv
                            ? 'bg-[#F59E0B] text-[#1B2A4A] border-[#F59E0B] shadow-xs'
                            : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Conditionné à la certification Parabole"
                      >
                        {t.certifications.fixationTv ? '✓ TV Débloqué' : 'Verrouillé'}
                      </button>
                    </td>

                    {/* Certification: Climatisation */}
                    <td className="p-3.5">
                      <button
                        onClick={() => toggleCertification(t.id, 'climatisation')}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
                          t.certifications.climatisation
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        {t.certifications.climatisation ? '✓ Clim' : 'Non'}
                      </button>
                    </td>

                    {/* Certification: Vidéosurveillance */}
                    <td className="p-3.5">
                      <button
                        onClick={() => toggleCertification(t.id, 'videosurveillance')}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
                          t.certifications.videosurveillance
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        {t.certifications.videosurveillance ? '✓ CCTV' : 'Non'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DISPUTE ARBITRATION CENTER (AUTO-TRIGGERED ON LOW RATINGS 1-2 STARS) */}
      {activeTab === 'DISPUTES' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-[#1B2A4A] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                Centre de Gestion & Arbitrage des Litiges
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tickets générés automatiquement lorsqu'un client attribue 1 ou 2 étoiles après intervention.
              </p>
            </div>

            <span className="text-xs font-bold bg-rose-100 text-rose-800 px-3 py-1 rounded-full">
              {openDisputesCount} litige{openDisputesCount > 1 ? 's' : ''} à traiter
            </span>
          </div>

          <div className="space-y-3">
            {disputes.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-600">Aucun litige ouvert sur la plateforme</p>
                <p className="text-xs">Toutes les prestations se déroulent dans des conditions optimales.</p>
              </div>
            ) : (
              disputes.map((d) => (
                <div
                  key={d.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    d.status === 'OPEN' ? 'bg-rose-50/50 border-rose-200 shadow-xs' :
                    d.status === 'INVESTIGATING' ? 'bg-amber-50/50 border-amber-200' :
                    'bg-slate-50 border-slate-200 opacity-80'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#1B2A4A] bg-white px-2 py-0.5 rounded border border-slate-200">
                          {d.reference}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          d.status === 'OPEN' ? 'bg-rose-600 text-white' :
                          d.status === 'INVESTIGATING' ? 'bg-amber-500 text-white' :
                          'bg-emerald-600 text-white'
                        }`}>
                          {d.status === 'OPEN' ? 'NOUVEAU LITIGE' :
                           d.status === 'INVESTIGATING' ? 'EN ENQUÊTE' : 'RÉSOLU / CLÔTURÉ'}
                        </span>
                        <span className="text-xs font-bold text-rose-600 flex items-center gap-0.5">
                          ★ Note client : {d.stars}/5
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatDateTime(d.createdAt)}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-[#1B2A4A]">{d.reason}</h4>

                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                        <span className="font-bold text-slate-700 block">Témoignage du client :</span>
                        <p className="text-slate-600 italic">« {d.clientComment} »</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {d.tags.map((tg, i) => (
                            <span key={i} className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
                              {tg}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-xs text-slate-500">
                        <span>Client : <strong className="text-[#1B2A4A]">{d.clientName}</strong> ({d.clientPhone})</span>
                        <span>Technicien : <strong className="text-[#1B2A4A]">{d.technicianName}</strong></span>
                      </div>

                      {d.resolutionNote && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                          <strong>Décision d'arbitrage :</strong> {d.resolutionNote}
                          {d.refundAmount && d.refundAmount > 0 ? (
                            <span className="block font-bold mt-0.5 text-emerald-800">
                              Avoir / Remboursement accordé : {formatFCFA(d.refundAmount)}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                      <a
                        href={`tel:${d.clientPhone}`}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                        Appeler Client
                      </a>

                      {d.status !== 'RESOLVED' && d.status !== 'REFUNDED' && (
                        <button
                          onClick={() => handleOpenDisputeModal(d)}
                          className="py-2 px-3 bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 text-white font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
                          Arbitrer / Résoudre
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: COMMISSION LEDGER & PLATFORM REVENUE (17.5%) */}
      {activeTab === 'COMMISSIONS' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-[#1B2A4A] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#F59E0B]" />
                Livre Comptable des Prélèvements Commissions (17.5%)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Traçabilité en temps réel des déductions automatiques effectuées sur le portefeuille virtuel des techniciens à chaque clôture de prestation.
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Prélèvements</span>
              <span className="text-xl font-black text-emerald-600 font-mono">
                {formatFCFA(totalCommissionRevenue)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-[#1B2A4A] font-bold border-b border-slate-200">
                  <th className="p-3.5 rounded-l-xl">Réf Transaction</th>
                  <th className="p-3.5">Technicien</th>
                  <th className="p-3.5">Type & Description</th>
                  <th className="p-3.5">Date & Heure</th>
                  <th className="p-3.5">Taux</th>
                  <th className="p-3.5">Montant Prélèvement</th>
                  <th className="p-3.5 rounded-r-xl">Solde Restant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => {
                  const techObj = technicians.find(t => t.id === tx.technicianId);
                  const isCommission = tx.type === 'COMMISSION_DEDUCTION';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-600">
                        {tx.reference}
                      </td>
                      <td className="p-3.5 font-semibold text-[#1B2A4A]">
                        {techObj ? techObj.name : tx.technicianId}
                      </td>
                      <td className="p-3.5">
                        <span className="font-medium text-slate-700 block">{tx.description}</span>
                        {tx.paymentMethod && (
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">{tx.paymentMethod}</span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {formatDateTime(tx.createdAt)}
                      </td>
                      <td className="p-3.5">
                        {isCommission ? (
                          <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                            17.5%
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`font-mono font-bold ${isCommission ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {tx.amount > 0 ? `+${formatFCFA(tx.amount)}` : formatFCFA(tx.amount)}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-700">
                        {formatFCFA(tx.balanceAfter)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DISPUTE RESOLUTION MODAL */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="font-bold text-base text-[#1B2A4A]">Arbitrage Litige : {selectedDispute.reference}</h3>
              </div>
              <button
                onClick={() => setSelectedDispute(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl text-xs space-y-1.5 border border-slate-200">
              <div><strong>Client :</strong> {selectedDispute.clientName} ({selectedDispute.clientPhone})</div>
              <div><strong>Technicien mis en cause :</strong> {selectedDispute.technicianName}</div>
              <div><strong>Motif :</strong> {selectedDispute.reason}</div>
              <div className="italic text-slate-600">« {selectedDispute.clientComment} »</div>
            </div>

            <form onSubmit={handleConfirmDisputeResolution} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Rapport d'intervention et décision de clôture :
                </label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:border-[#1B2A4A] focus:outline-hidden"
                  placeholder="Décrivez les mesures prises (ex: envoi d'un technicien senior pour calage laser, geste commercial)..."
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Montant de dédommagement / Avoir client (FCFA) :
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="w-full text-xs font-bold p-3 rounded-xl border border-slate-300 focus:border-[#1B2A4A] focus:outline-hidden"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDispute(null)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Valider et Clôturer le Litige
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
