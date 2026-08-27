import React, { useState } from 'react';
import { 
  MapPin, 
  DollarSign, 
  Percent, 
  TrendingUp, 
  RotateCcw, 
  Edit3, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  Calculator, 
  Info, 
  CheckCircle2, 
  Save, 
  X,
  Plus,
  Tv,
  Satellite,
  Wind,
  ShieldCheck,
  Sliders,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CommuneAbidjan, CommunePricingPolicy, ServiceItem } from '../../types';
import { COMMUNES_ABIDJAN, DEFAULT_COMMUNE_PRICING } from '../../data/initialData';
import { formatFCFA } from '../../utils/formatters';

export const CommunePricingManager: React.FC = () => {
  const { 
    services, 
    tvSizeTiers, 
    communePricing, 
    getServicePriceForCommune, 
    getTvTierPriceForCommune,
    updateCommunePricing, 
    setCommuneServicePriceOverride, 
    setCommuneTvTierPriceOverride,
    resetCommunePricing, 
    batchApplyCommunePricing 
  } = useApp();

  // Active view: TABLE (Matrix) vs CARDS vs SIMULATOR
  const [viewMode, setViewMode] = useState<'MATRIX' | 'CARDS' | 'SIMULATOR'>('MATRIX');
  
  // Selected Commune for modal editing
  const [selectedCommuneToEdit, setSelectedCommuneToEdit] = useState<CommuneAbidjan | null>(null);
  const [editFormData, setEditFormData] = useState<{
    surchargeFCFA: number;
    percentageMultiplier: number;
    note: string;
    customServicePrices: Partial<Record<string, number>>;
    customTvTierPrices: Partial<Record<string, number>>;
  }>({
    surchargeFCFA: 0,
    percentageMultiplier: 1.0,
    note: '',
    customServicePrices: {},
    customTvTierPrices: {},
  });

  // Batch adjustment modal state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchSelectedCommunes, setBatchSelectedCommunes] = useState<CommuneAbidjan[]>([
    'Bingerville', 
    'Port-Bouët', 
    'Abobo'
  ]);
  const [batchSurcharge, setBatchSurcharge] = useState<number>(1000);
  const [batchMultiplier, setBatchMultiplier] = useState<number>(1.0);
  const [batchNote, setBatchNote] = useState<string>('Zone périphérique / déplacement étendu');

  // Simulator State
  const [simCommune, setSimCommune] = useState<CommuneAbidjan>('Bingerville');
  const [simParaboleCount, setSimParaboleCount] = useState<number>(1);
  const [simTvSize, setSimTvSize] = useState<string>('44-55');
  const [simTvCount, setSimTvCount] = useState<number>(1);
  const [simClimCount, setSimClimCount] = useState<number>(1);
  const [simCctvCount, setSimCctvCount] = useState<number>(0);

  const communesList = Object.keys(COMMUNES_ABIDJAN) as CommuneAbidjan[];

  // Quick statistics
  const customizedCommunesCount = communesList.filter(
    c => (communePricing[c]?.surchargeFCFA || 0) > 0 || 
         (communePricing[c]?.percentageMultiplier || 1) !== 1.0 || 
         (communePricing[c]?.customServicePrices && Object.keys(communePricing[c]?.customServicePrices || {}).length > 0)
  ).length;

  const standardCommunesCount = communesList.length - customizedCommunesCount;

  // Open Edit Modal for a commune
  const handleOpenEdit = (commune: CommuneAbidjan) => {
    const policy = communePricing[commune] || DEFAULT_COMMUNE_PRICING[commune];
    setSelectedCommuneToEdit(commune);
    setEditFormData({
      surchargeFCFA: policy.surchargeFCFA || 0,
      percentageMultiplier: policy.percentageMultiplier || 1.0,
      note: policy.note || '',
      customServicePrices: { ...(policy.customServicePrices || {}) },
      customTvTierPrices: { ...(policy.customTvTierPrices || {}) },
    });
  };

  // Save Edit Form
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommuneToEdit) return;

    updateCommunePricing(selectedCommuneToEdit, {
      commune: selectedCommuneToEdit,
      surchargeFCFA: Number(editFormData.surchargeFCFA) || 0,
      percentageMultiplier: Number(editFormData.percentageMultiplier) || 1.0,
      note: editFormData.note,
      customServicePrices: editFormData.customServicePrices,
      customTvTierPrices: editFormData.customTvTierPrices,
      isCustomized: Number(editFormData.surchargeFCFA) > 0 || Number(editFormData.percentageMultiplier) !== 1.0 || Object.keys(editFormData.customServicePrices).length > 0,
    });

    setSelectedCommuneToEdit(null);
  };

  // Quick preset actions
  const handleApplyPreset = (preset: 'STANDARD_ALL' | 'PERIPHERAL_MAJORATION' | 'CLIM_SUMMER') => {
    if (preset === 'STANDARD_ALL') {
      resetCommunePricing();
    } else if (preset === 'PERIPHERAL_MAJORATION') {
      batchApplyCommunePricing(
        ['Bingerville', 'Port-Bouët', 'Abobo'],
        1500,
        1.0,
        'Zone périphérique / péage et grand déplacement'
      );
    } else if (preset === 'CLIM_SUMMER') {
      batchApplyCommunePricing(
        communesList,
        0,
        1.10,
        'Ajustement saisonnier haute demande (+10%)'
      );
    }
  };

  // Helper icon renderer
  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'PARABOLE_TNT': return <Satellite className="w-4 h-4 text-amber-500" />;
      case 'FIXATION_TV': return <Tv className="w-4 h-4 text-sky-500" />;
      case 'CLIMATISATION': return <Wind className="w-4 h-4 text-emerald-500" />;
      case 'VIDEOSURVEILLANCE': return <ShieldCheck className="w-4 h-4 text-indigo-500" />;
      default: return <Layers className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Overview */}
      <div className="bg-gradient-to-br from-[#1B2A4A] via-[#24375e] to-[#1B2A4A] text-white p-6 rounded-3xl shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-400/20 text-[#F59E0B] font-black text-sm">
                📍 TARIFICATION DYNAMIQUE PAR COMMUNE
              </span>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                11 Communes d'Abidjan
              </span>
            </div>
            <h3 className="text-xl font-black mt-2 text-white">
              Grille Tarifaire Adaptée aux Zones & Frais de Déplacement
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Définissez des frais de déplacement ou des tarifs spécifiques par commune à Abidjan (ex: +1 500 FCFA pour Bingerville / Port-Bouët / Abobo, ou prix sur-mesure par type de prestation). Les prix s'appliquent automatiquement au client en temps réel dès la sélection de sa commune.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-[#F59E0B] hover:bg-[#e08e06] text-[#1B2A4A] text-xs font-black shadow-sm flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Ajustement Groupé</span>
            </button>

            <button
              onClick={() => handleApplyPreset('PERIPHERAL_MAJORATION')}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-colors flex items-center gap-1.5"
              title="Majorer automatiquement Bingerville, Port-Bouët et Abobo (+1 500 FCFA)"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
              <span>Preset Périphérique (+1.5k)</span>
            </button>

            <button
              onClick={() => handleApplyPreset('STANDARD_ALL')}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold border border-white/15 transition-colors flex items-center gap-1.5"
              title="Réinitialiser toutes les communes aux tarifs de base standard"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
              <span>Standard Tout</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Communes couvertes</span>
            <span className="text-lg font-black text-white font-mono">{communesList.length}</span>
            <span className="text-[10px] text-slate-400 block">100% Grand Abidjan</span>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Tarif Standard Central</span>
            <span className="text-lg font-black text-emerald-400 font-mono">{standardCommunesCount}</span>
            <span className="text-[10px] text-slate-400 block">Cocody, Plateau, Marcory...</span>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Zones Personnalisées / Majoration</span>
            <span className="text-lg font-black text-amber-400 font-mono">{customizedCommunesCount}</span>
            <span className="text-[10px] text-slate-400 block">Bingerville, Port-Bouët, Abobo</span>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Commission Vraiga</span>
            <span className="text-lg font-black text-sky-400 font-mono">17.5 %</span>
            <span className="text-[10px] text-slate-400 block">Fixe sur montant total</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs: MATRIX vs CARDS vs SIMULATOR */}
      <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('MATRIX')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'MATRIX'
                ? 'bg-[#1B2A4A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Tableau Croisé (Matrice 11 Communes)</span>
          </button>

          <button
            onClick={() => setViewMode('CARDS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'CARDS'
                ? 'bg-[#1B2A4A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Vue Cartes Détail par Commune</span>
          </button>

          <button
            onClick={() => setViewMode('SIMULATOR')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'SIMULATOR'
                ? 'bg-[#1B2A4A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Simulateur Devis Client en Direct</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-block">
          Modifications synchronisées instantanément avec l'application client
        </span>
      </div>

      {/* VIEW 1: MATRIX TABLE (Tableau Croisé) */}
      {viewMode === 'MATRIX' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-[#1B2A4A]">
                Matrice des Prix par Prestation & par Commune (FCFA)
              </h4>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                Cliquez sur « Modifier » pour ajuster une commune
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Commune</th>
                  <th className="py-3 px-3">Frais Déplacement</th>
                  <th className="py-3 px-3">Coefficient</th>
                  {services.map(s => (
                    <th key={s.id} className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        {getServiceIcon(s.id)}
                        <span>{s.shortTitle || s.name}</span>
                      </div>
                      <span className="text-[10px] font-normal text-slate-400 block font-mono">
                        Base: {formatFCFA(s.basePrice)}
                      </span>
                    </th>
                  ))}
                  <th className="py-3 px-3">Support TV (44-55")</th>
                  <th className="py-3 px-3">Statut & Note</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {communesList.map((commune) => {
                  const policy = communePricing[commune] || DEFAULT_COMMUNE_PRICING[commune];
                  const isCustom = policy.surchargeFCFA > 0 || policy.percentageMultiplier !== 1.0 || (policy.customServicePrices && Object.keys(policy.customServicePrices).length > 0);
                  const tv55Price = getTvTierPriceForCommune('44-55', commune);

                  return (
                    <tr 
                      key={commune}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCustom ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Commune Name */}
                      <td className="py-3 px-4 font-extrabold text-[#1B2A4A]">
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-3.5 h-3.5 ${isCustom ? 'text-amber-500' : 'text-slate-400'}`} />
                          <span>{commune}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal block pl-5">
                          {COMMUNES_ABIDJAN[commune].neighborhoods.slice(0, 2).join(', ')}...
                        </span>
                      </td>

                      {/* Surcharge FCFA */}
                      <td className="py-3 px-3 font-mono font-bold">
                        {policy.surchargeFCFA > 0 ? (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 text-xs">
                            +{formatFCFA(policy.surchargeFCFA)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">0 FCFA</span>
                        )}
                      </td>

                      {/* Multiplier */}
                      <td className="py-3 px-3 font-mono">
                        {policy.percentageMultiplier !== 1.0 ? (
                          <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg">
                            {(policy.percentageMultiplier * 100).toFixed(0)}%
                          </span>
                        ) : (
                          <span className="text-slate-400">100%</span>
                        )}
                      </td>

                      {/* Dynamic Price for Each Service */}
                      {services.map(s => {
                        const price = getServicePriceForCommune(s.id, commune);
                        const hasOverride = policy.customServicePrices && typeof policy.customServicePrices[s.id] === 'number';
                        const isDiffFromBase = price !== s.basePrice;

                        return (
                          <td key={s.id} className="py-3 px-3 font-mono font-extrabold">
                            <div className="flex items-center gap-1">
                              <span className={isDiffFromBase ? 'text-amber-700' : 'text-[#1B2A4A]'}>
                                {formatFCFA(price)}
                              </span>
                              {hasOverride && (
                                <span className="text-[9px] bg-purple-100 text-purple-700 font-bold px-1 rounded-sm" title="Prix spécifique forcé">
                                  fixe
                                </span>
                              )}
                            </div>
                            {isDiffFromBase && (
                              <span className="text-[9px] text-emerald-600 font-bold block">
                                {price > s.basePrice ? `+${price - s.basePrice} F` : `${price - s.basePrice} F`}
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* TV 44-55" Price */}
                      <td className="py-3 px-3 font-mono font-extrabold text-slate-800">
                        <span>{formatFCFA(tv55Price)}</span>
                        {tv55Price !== 10000 && (
                          <span className="text-[9px] text-amber-600 font-bold block">
                            +{tv55Price - 10000} F
                          </span>
                        )}
                      </td>

                      {/* Status & Note */}
                      <td className="py-3 px-3 max-w-[200px]">
                        {isCustom ? (
                          <div className="space-y-0.5">
                            <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-full">
                              Majoration active
                            </span>
                            {policy.note && (
                              <p className="text-[10px] text-slate-500 truncate" title={policy.note}>
                                {policy.note}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full">
                            Tarif Standard
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(commune)}
                            className="p-1.5 rounded-xl bg-[#1B2A4A] text-white hover:bg-[#273c68] transition-colors text-xs font-bold flex items-center gap-1"
                            title={`Modifier les tarifs de ${commune}`}
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#F59E0B]" />
                            <span className="hidden sm:inline">Modifier</span>
                          </button>

                          {isCustom && (
                            <button
                              onClick={() => resetCommunePricing(commune)}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors text-xs font-bold"
                              title={`Rétablir ${commune} au tarif standard`}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: CARDS DETAILED VIEW */}
      {viewMode === 'CARDS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {communesList.map((commune) => {
            const policy = communePricing[commune] || DEFAULT_COMMUNE_PRICING[commune];
            const isCustom = policy.surchargeFCFA > 0 || policy.percentageMultiplier !== 1.0 || (policy.customServicePrices && Object.keys(policy.customServicePrices).length > 0);
            const communeInfo = COMMUNES_ABIDJAN[commune];

            return (
              <div
                key={commune}
                className={`bg-white rounded-3xl p-5 border shadow-xs transition-all space-y-4 flex flex-col justify-between ${
                  isCustom ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-4 h-4 ${isCustom ? 'text-amber-500' : 'text-[#1B2A4A]'}`} />
                        <h4 className="font-extrabold text-base text-[#1B2A4A]">{commune}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Quartiers: {communeInfo.neighborhoods.slice(0, 3).join(', ')}...
                      </p>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      isCustom ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {isCustom ? 'Majoration' : 'Standard'}
                    </span>
                  </div>

                  {/* Surcharge summary box */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Frais Déplacement</span>
                      <span className="text-sm font-black font-mono text-[#1B2A4A]">
                        {policy.surchargeFCFA > 0 ? `+${formatFCFA(policy.surchargeFCFA)}` : '0 FCFA (Inclus)'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Coefficient</span>
                      <span className="text-sm font-black font-mono text-[#1B2A4A]">
                        {(policy.percentageMultiplier * 100).toFixed(0)} %
                      </span>
                    </div>
                  </div>

                  {/* Service price breakdown list */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Prix appliqués à {commune} :
                    </span>
                    {services.map((s) => {
                      const price = getServicePriceForCommune(s.id, commune);
                      const isOverridden = policy.customServicePrices && typeof policy.customServicePrices[s.id] === 'number';
                      
                      return (
                        <div key={s.id} className="flex items-center justify-between text-xs py-1 px-2.5 bg-slate-50/70 rounded-xl">
                          <div className="flex items-center gap-1.5">
                            {getServiceIcon(s.id)}
                            <span className="font-semibold text-slate-700">{s.shortTitle || s.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-[#1B2A4A]">{formatFCFA(price)}</span>
                            {isOverridden && (
                              <span className="text-[9px] bg-purple-100 text-purple-700 font-bold px-1 rounded-sm">fixe</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {policy.note && (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 text-[11px] text-amber-900 flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{policy.note}</span>
                    </div>
                  )}
                </div>

                {/* Card footer buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEdit(commune)}
                    className="flex-1 py-2 px-3 bg-[#1B2A4A] hover:bg-[#283f6d] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Ajuster tarifs</span>
                  </button>

                  {isCustom && (
                    <button
                      onClick={() => resetCommunePricing(commune)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                      title="Réinitialiser au standard"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: INTERACTIVE CLIENT LIVE QUOTE SIMULATOR */}
      {viewMode === 'SIMULATOR' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h4 className="font-extrabold text-base text-[#1B2A4A] flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#F59E0B]" />
                Simulateur de Devis & Calculateur en Temps Réel
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Sélectionnez une commune et composez un panier pour vérifier exactement ce que le client verra et paiera, ainsi que la répartition Vraiga (17.5%) / Technicien (82.5%).
              </p>
            </div>

            <div className="w-48">
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Commune testée :</label>
              <select
                value={simCommune}
                onChange={(e) => setSimCommune(e.target.value as CommuneAbidjan)}
                className="w-full bg-slate-100 border border-slate-300 text-xs font-bold p-2 rounded-xl text-[#1B2A4A] focus:outline-hidden"
              >
                {communesList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Simulator Config & Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Compose Order */}
            <div className="space-y-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
              <h5 className="font-bold text-xs text-[#1B2A4A] uppercase tracking-wider">
                1. Composition de la Prestation
              </h5>

              {/* Parabole */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Satellite className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="font-bold text-xs text-[#1B2A4A] block">Canal+ / TNT</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatFCFA(getServicePriceForCommune('PARABOLE_TNT', simCommune))} / unité
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSimParaboleCount(Math.max(0, simParaboleCount - 1))}
                    className="w-6 h-6 rounded-lg bg-slate-100 font-bold text-xs text-slate-700"
                  >-</button>
                  <span className="w-6 text-center font-bold text-xs">{simParaboleCount}</span>
                  <button
                    onClick={() => setSimParaboleCount(simParaboleCount + 1)}
                    className="w-6 h-6 rounded-lg bg-[#1B2A4A] font-bold text-xs text-white"
                  >+</button>
                </div>
              </div>

              {/* Fixation TV */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4 text-sky-500" />
                    <div>
                      <span className="font-bold text-xs text-[#1B2A4A] block">Fixation TV Murale</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatFCFA(getTvTierPriceForCommune(simTvSize, simCommune))} ({simTvSize}")
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSimTvCount(Math.max(0, simTvCount - 1))}
                      className="w-6 h-6 rounded-lg bg-slate-100 font-bold text-xs text-slate-700"
                    >-</button>
                    <span className="w-6 text-center font-bold text-xs">{simTvCount}</span>
                    <button
                      onClick={() => setSimTvCount(simTvCount + 1)}
                      className="w-6 h-6 rounded-lg bg-[#1B2A4A] font-bold text-xs text-white"
                    >+</button>
                  </div>
                </div>

                {simTvCount > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                    {tvSizeTiers.map(tier => (
                      <button
                        key={tier.id}
                        onClick={() => setSimTvSize(tier.id)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                          simTvSize === tier.id ? 'bg-[#1B2A4A] text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {tier.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Climatisation */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="font-bold text-xs text-[#1B2A4A] block">Climatiseur Split</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatFCFA(getServicePriceForCommune('CLIMATISATION', simCommune))} / unité
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSimClimCount(Math.max(0, simClimCount - 1))}
                    className="w-6 h-6 rounded-lg bg-slate-100 font-bold text-xs text-slate-700"
                  >-</button>
                  <span className="w-6 text-center font-bold text-xs">{simClimCount}</span>
                  <button
                    onClick={() => setSimClimCount(simClimCount + 1)}
                    className="w-6 h-6 rounded-lg bg-[#1B2A4A] font-bold text-xs text-white"
                  >+</button>
                </div>
              </div>

              {/* Vidéosurveillance */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <div>
                    <span className="font-bold text-xs text-[#1B2A4A] block">Vidéosurveillance (CCTV)</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatFCFA(getServicePriceForCommune('VIDEOSURVEILLANCE', simCommune))} / caméra
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSimCctvCount(Math.max(0, simCctvCount - 1))}
                    className="w-6 h-6 rounded-lg bg-slate-100 font-bold text-xs text-slate-700"
                  >-</button>
                  <span className="w-6 text-center font-bold text-xs">{simCctvCount}</span>
                  <button
                    onClick={() => setSimCctvCount(simCctvCount + 1)}
                    className="w-6 h-6 rounded-lg bg-[#1B2A4A] font-bold text-xs text-white"
                  >+</button>
                </div>
              </div>
            </div>

            {/* Right: Breakdown & Final Calculations */}
            {(() => {
              const paraboleUnitP = getServicePriceForCommune('PARABOLE_TNT', simCommune);
              const tvUnitP = getTvTierPriceForCommune(simTvSize, simCommune);
              const climUnitP = getServicePriceForCommune('CLIMATISATION', simCommune);
              const cctvUnitP = getServicePriceForCommune('VIDEOSURVEILLANCE', simCommune);

              const paraboleTotal = simParaboleCount * paraboleUnitP;
              const tvTotal = simTvCount * tvUnitP;
              const climTotal = simClimCount * climUnitP;
              const cctvTotal = simCctvCount * cctvUnitP;

              const grandTotal = paraboleTotal + tvTotal + climTotal + cctvTotal;
              const commissionAmount = Math.round(grandTotal * 0.175);
              const techEarnings = grandTotal - commissionAmount;

              // Baseline comparison
              const baseGrandTotal = (simParaboleCount * 5000) + 
                                     (simTvCount * (tvSizeTiers.find(t => t.id === simTvSize)?.price || 10000)) + 
                                     (simClimCount * 10000) + 
                                     (simCctvCount * 10000);
              
              const diffFromBase = grandTotal - baseGrandTotal;

              return (
                <div className="bg-[#1B2A4A] text-white p-5 rounded-2xl shadow-md space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#F59E0B]" />
                        <span className="font-extrabold text-sm">Devis Client • {simCommune}</span>
                      </div>
                      <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30">
                        Temps Réel
                      </span>
                    </div>

                    {/* Breakdown rows */}
                    <div className="space-y-2 text-xs">
                      {simParaboleCount > 0 && (
                        <div className="flex justify-between text-slate-300">
                          <span>{simParaboleCount}x Parabole / TNT :</span>
                          <span className="font-mono font-bold text-white">{formatFCFA(paraboleTotal)}</span>
                        </div>
                      )}

                      {simTvCount > 0 && (
                        <div className="flex justify-between text-slate-300">
                          <span>{simTvCount}x Fixation TV ({simTvSize}") :</span>
                          <span className="font-mono font-bold text-white">{formatFCFA(tvTotal)}</span>
                        </div>
                      )}

                      {simClimCount > 0 && (
                        <div className="flex justify-between text-slate-300">
                          <span>{simClimCount}x Climatiseur Split :</span>
                          <span className="font-mono font-bold text-white">{formatFCFA(climTotal)}</span>
                        </div>
                      )}

                      {simCctvCount > 0 && (
                        <div className="flex justify-between text-slate-300">
                          <span>{simCctvCount}x Caméra Vidéosurveillance :</span>
                          <span className="font-mono font-bold text-white">{formatFCFA(cctvTotal)}</span>
                        </div>
                      )}

                      {grandTotal === 0 && (
                        <p className="text-slate-400 italic text-center py-4">
                          Sélectionnez au moins un service pour afficher le devis.
                        </p>
                      )}
                    </div>

                    {/* Zone Surcharge notification */}
                    {diffFromBase !== 0 && (
                      <div className="p-2.5 bg-amber-500/20 border border-amber-400/30 rounded-xl text-[11px] text-amber-200">
                        📍 Ajustement de zone {simCommune} : <strong>{diffFromBase > 0 ? `+${formatFCFA(diffFromBase)}` : formatFCFA(diffFromBase)}</strong> par rapport au tarif central standard.
                      </div>
                    )}
                  </div>

                  {/* Totals & Commission Split */}
                  <div className="pt-3 border-t border-white/10 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-bold text-amber-300 uppercase">Total Facturé Client :</span>
                      <span className="text-2xl font-black font-mono text-white">
                        {formatFCFA(grandTotal)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                      <div className="bg-white/10 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-300 block">Gain Net Technicien (82.5%)</span>
                        <span className="font-black font-mono text-emerald-400 text-sm">
                          {formatFCFA(techEarnings)}
                        </span>
                      </div>
                      <div className="bg-white/10 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-300 block">Commission Vraiga (17.5%)</span>
                        <span className="font-black font-mono text-amber-300 text-sm">
                          {formatFCFA(commissionAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT COMMUNE SPECIFIC PRICING */}
      {selectedCommuneToEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-[#1B2A4A] text-white flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#1B2A4A]">
                    Paramétrage Tarifaire : Commune de {selectedCommuneToEdit}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ajustez les frais de déplacement, coefficients ou forcez des prix spécifiques.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCommuneToEdit(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-6 flex-1">
              {/* 1. Surcharge & Multiplier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                    Frais de Déplacement / Surcharge (FCFA) :
                  </label>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    max="50000"
                    value={editFormData.surchargeFCFA}
                    onChange={(e) => setEditFormData({ ...editFormData, surchargeFCFA: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm font-mono font-bold text-[#1B2A4A] focus:outline-hidden focus:ring-1 focus:ring-[#1B2A4A]"
                    placeholder="0"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Ex: 0 (standard), 1 000 ou 1 500 FCFA (zone périphérique / péage)
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-sky-500" />
                    Coefficient Multiplicateur :
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.5"
                    max="3.0"
                    value={editFormData.percentageMultiplier}
                    onChange={(e) => setEditFormData({ ...editFormData, percentageMultiplier: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm font-mono font-bold text-[#1B2A4A] focus:outline-hidden focus:ring-1 focus:ring-[#1B2A4A]"
                    placeholder="1.0"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    1.0 = standard, 1.15 = +15%, 0.90 = -10%
                  </span>
                </div>
              </div>

              {/* 2. Public Note / Reason */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  Motif d'ajustement (affiché au client en toute transparence) :
                </label>
                <input
                  type="text"
                  value={editFormData.note}
                  onChange={(e) => setEditFormData({ ...editFormData, note: e.target.value })}
                  placeholder="Ex: Frais de déplacement zone périphérique / péage"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-[#1B2A4A] focus:outline-hidden"
                />
              </div>

              {/* 3. Specific Custom Service Price Overrides */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-[#1B2A4A] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#F59E0B]" />
                    Prix Spécifiques Forcés par Prestation (Optionnel)
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Laissez vide pour utiliser le calcul automatique (Base + Déplacement)
                  </span>
                </div>

                <div className="space-y-2">
                  {services.map((service) => {
                    const currentOverride = editFormData.customServicePrices[service.id];
                    const isOverridden = typeof currentOverride === 'number' && currentOverride > 0;

                    return (
                      <div
                        key={service.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isOverridden ? 'bg-purple-50/50 border-purple-200' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {getServiceIcon(service.id)}
                          <div>
                            <span className="font-bold text-xs text-[#1B2A4A] block">
                              {service.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Base: {formatFCFA(service.basePrice)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="500"
                            min="0"
                            value={currentOverride !== undefined ? currentOverride : ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? undefined : Number(e.target.value);
                              const updated = { ...editFormData.customServicePrices };
                              if (val === undefined || val <= 0) {
                                delete updated[service.id];
                              } else {
                                updated[service.id] = val;
                              }
                              setEditFormData({ ...editFormData, customServicePrices: updated });
                            }}
                            placeholder={`Auto: ${formatFCFA(Math.round((service.basePrice * (editFormData.percentageMultiplier || 1) + (editFormData.surchargeFCFA || 0)) / 100) * 100)}`}
                            className="w-36 bg-white border border-slate-300 text-xs font-mono font-bold p-2 rounded-xl text-[#1B2A4A] focus:outline-hidden"
                          />
                          <span className="text-xs font-mono text-slate-500">FCFA</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setEditFormData({
                      surchargeFCFA: 0,
                      percentageMultiplier: 1.0,
                      note: 'Tarif standard réinitialisé',
                      customServicePrices: {},
                      customTvTierPrices: {},
                    });
                  }}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rétablir standard</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCommuneToEdit(null)}
                    className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-[#1B2A4A] hover:bg-[#283e6b] text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                  >
                    <Save className="w-4 h-4 text-[#F59E0B]" />
                    <span>Enregistrer la grille</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BATCH ZONE ADJUSTMENT */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#F59E0B] flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#1B2A4A]">
                    Ajustement Tarifaire Groupé
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Appliquez une majoration identique à plusieurs communes sélectionnées en 1 clic.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Communes Checkbox Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Communes à ajuster ({batchSelectedCommunes.length}) :
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBatchSelectedCommunes(communesList)}
                    className="text-[10px] font-bold text-[#1B2A4A] hover:underline"
                  >
                    Tout cocher
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchSelectedCommunes([])}
                    className="text-[10px] font-bold text-slate-400 hover:underline"
                  >
                    Tout décocher
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                {communesList.map((commune) => {
                  const isChecked = batchSelectedCommunes.includes(commune);
                  return (
                    <button
                      type="button"
                      key={commune}
                      onClick={() => {
                        if (isChecked) {
                          setBatchSelectedCommunes(batchSelectedCommunes.filter(c => c !== commune));
                        } else {
                          setBatchSelectedCommunes([...batchSelectedCommunes, commune]);
                        }
                      }}
                      className={`text-left text-xs p-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                        isChecked ? 'bg-[#1B2A4A] text-white font-bold' : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                        isChecked ? 'bg-amber-400 border-amber-400 text-[#1B2A4A]' : 'border-slate-300'
                      }`}>
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className="truncate">{commune}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inputs: Surcharge & Multiplier */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Frais Déplacement :</label>
                <input
                  type="number"
                  step="500"
                  min="0"
                  value={batchSurcharge}
                  onChange={(e) => setBatchSurcharge(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-[#1B2A4A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Coefficient :</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="3.0"
                  value={batchMultiplier}
                  onChange={(e) => setBatchMultiplier(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-[#1B2A4A]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Motif de l'ajustement :</label>
              <input
                type="text"
                value={batchNote}
                onChange={(e) => setBatchNote(e.target.value)}
                placeholder="Ex: Frais de déplacement zone périphérique / péage"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-[#1B2A4A]"
              />
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                className="py-2 px-3 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Annuler
              </button>

              <button
                type="button"
                disabled={batchSelectedCommunes.length === 0}
                onClick={() => {
                  batchApplyCommunePricing(
                    batchSelectedCommunes,
                    batchSurcharge,
                    batchMultiplier,
                    batchNote
                  );
                  setIsBatchModalOpen(false);
                }}
                className="py-2 px-4 text-xs font-black text-white bg-[#1B2A4A] hover:bg-[#253963] rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Appliquer à {batchSelectedCommunes.length} communes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
