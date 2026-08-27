import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Tag, 
  Tv, 
  Satellite, 
  Wind, 
  ShieldCheck, 
  Zap, 
  Wrench, 
  Sparkles, 
  Camera, 
  Home, 
  Settings, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Package,
  Layers,
  MapPin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ServiceItem, TVSizeOption } from '../../types';
import { formatFCFA } from '../../utils/formatters';
import { CommunePricingManager } from './CommunePricingManager';

const AVAILABLE_ICONS = [
  { name: 'SatelliteDish', label: 'Antenne / Parabole', Icon: Satellite },
  { name: 'Tv', label: 'Téléviseur', Icon: Tv },
  { name: 'Wind', label: 'Climatisation', Icon: Wind },
  { name: 'ShieldCheck', label: 'Sécurité / CCTV', Icon: ShieldCheck },
  { name: 'Zap', label: 'Électricité / Énergie', Icon: Zap },
  { name: 'Wrench', label: 'Dépannage / Outillage', Icon: Wrench },
  { name: 'Sparkles', label: 'Nettoyage / Entretien', Icon: Sparkles },
  { name: 'Camera', label: 'Caméra / Vidéo', Icon: Camera },
  { name: 'Home', label: 'Domotique / Habitat', Icon: Home },
  { name: 'Settings', label: 'Installation / Système', Icon: Settings },
];

export const ServiceCatalogManager: React.FC = () => {
  const { 
    services, 
    tvSizeTiers, 
    addService, 
    updateService, 
    toggleServiceActive, 
    deleteService, 
    updateTvSizeTierPrice,
    addTvSizeTier,
    deleteTvSizeTier
  } = useApp();

  // Tab: SERVICES vs TV_TIERS vs COMMUNE_PRICING
  const [subTab, setSubTab] = useState<'SERVICES' | 'TV_PRICING' | 'COMMUNE_PRICING'>('SERVICES');

  // Modal / Form state for Adding or Editing a Service
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const [serviceFormData, setServiceFormData] = useState<{
    id: string;
    name: string;
    shortTitle: string;
    iconName: string;
    badge: string;
    basePrice: number;
    unitLabel: string;
    priceDescription: string;
    description: string;
    isUnitBased: boolean;
    minUnits: number;
    maxUnits: number;
    requiresParaboleCert: boolean;
    requiredCertKey: string;
    isActive: boolean;
  }>({
    id: '',
    name: '',
    shortTitle: '',
    iconName: 'Wrench',
    badge: '',
    basePrice: 5000,
    unitLabel: 'intervention',
    priceDescription: '',
    description: '',
    isUnitBased: false,
    minUnits: 1,
    maxUnits: 10,
    requiresParaboleCert: false,
    requiredCertKey: 'none',
    isActive: true,
  });

  // Modal / Form state for TV Tier editing/adding
  const [isTvTierModalOpen, setIsTvTierModalOpen] = useState(false);
  const [tvTierFormData, setTvTierFormData] = useState<TVSizeOption>({
    id: '',
    label: '',
    inches: '',
    price: 10000,
    description: '',
  });

  // Open modal to create a new service
  const handleOpenNewService = () => {
    setEditingServiceId(null);
    setServiceFormData({
      id: `SERV_${Date.now()}`,
      name: '',
      shortTitle: '',
      iconName: 'Wrench',
      badge: '',
      basePrice: 5000,
      unitLabel: 'intervention',
      priceDescription: '',
      description: '',
      isUnitBased: false,
      minUnits: 1,
      maxUnits: 10,
      requiresParaboleCert: false,
      requiredCertKey: 'none',
      isActive: true,
    });
    setIsServiceModalOpen(true);
  };

  // Open modal to edit existing service
  const handleOpenEditService = (service: ServiceItem) => {
    setEditingServiceId(service.id);
    setServiceFormData({
      id: service.id,
      name: service.name,
      shortTitle: service.shortTitle || service.name,
      iconName: service.iconName || 'Wrench',
      badge: service.badge || `${service.basePrice.toLocaleString()} FCFA`,
      basePrice: service.basePrice,
      unitLabel: service.unitLabel || 'unité',
      priceDescription: service.priceDescription || '',
      description: service.description || '',
      isUnitBased: !!service.isUnitBased,
      minUnits: service.minUnits || 1,
      maxUnits: service.maxUnits || 10,
      requiresParaboleCert: !!service.requiresParaboleCert,
      requiredCertKey: service.requiredCertKey || (service.requiresParaboleCert ? 'paraboleTnt' : 'none'),
      isActive: service.isActive !== false,
    });
    setIsServiceModalOpen(true);
  };

  // Submit Service Form
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormData.name.trim()) return;

    const baseBadge = serviceFormData.badge.trim() || 
      (serviceFormData.isUnitBased 
        ? `${serviceFormData.basePrice.toLocaleString()} FCFA / ${serviceFormData.unitLabel || 'unité'}`
        : `${serviceFormData.basePrice.toLocaleString()} FCFA`);

    const basePriceDesc = serviceFormData.priceDescription.trim() || 
      (serviceFormData.isUnitBased 
        ? `${serviceFormData.basePrice.toLocaleString()} FCFA par ${serviceFormData.unitLabel || 'appareil'}`
        : `${serviceFormData.basePrice.toLocaleString()} FCFA / intervention`);

    if (editingServiceId) {
      updateService(editingServiceId, {
        name: serviceFormData.name,
        shortTitle: serviceFormData.shortTitle || serviceFormData.name,
        iconName: serviceFormData.iconName,
        badge: baseBadge,
        basePrice: Number(serviceFormData.basePrice),
        unitLabel: serviceFormData.unitLabel,
        priceDescription: basePriceDesc,
        description: serviceFormData.description,
        isUnitBased: serviceFormData.isUnitBased,
        minUnits: Number(serviceFormData.minUnits) || 1,
        maxUnits: Number(serviceFormData.maxUnits) || 10,
        requiresParaboleCert: serviceFormData.requiresParaboleCert || serviceFormData.requiredCertKey === 'paraboleTnt',
        requiredCertKey: serviceFormData.requiredCertKey,
        isActive: serviceFormData.isActive,
      });
    } else {
      addService({
        name: serviceFormData.name,
        shortTitle: serviceFormData.shortTitle || serviceFormData.name,
        iconName: serviceFormData.iconName,
        badge: baseBadge,
        basePrice: Number(serviceFormData.basePrice),
        unitLabel: serviceFormData.unitLabel,
        priceDescription: basePriceDesc,
        description: serviceFormData.description,
        isUnitBased: serviceFormData.isUnitBased,
        minUnits: Number(serviceFormData.minUnits) || 1,
        maxUnits: Number(serviceFormData.maxUnits) || 10,
        requiresParaboleCert: serviceFormData.requiresParaboleCert || serviceFormData.requiredCertKey === 'paraboleTnt',
        requiredCertKey: serviceFormData.requiredCertKey,
        isActive: serviceFormData.isActive,
      });
    }

    setIsServiceModalOpen(false);
  };

  // Helper to render icon component
  const renderIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'SatelliteDish':
      case 'Satellite':
        return <Satellite className={className} />;
      case 'Tv':
        return <Tv className={className} />;
      case 'Wind':
        return <Wind className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Wrench':
        return <Wrench className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Camera':
        return <Camera className={className} />;
      case 'Home':
        return <Home className={className} />;
      default:
        return <Settings className={className} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-tabs */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#F59E0B] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <h3 className="font-black text-base text-[#1B2A4A]">
              Gestion du Catalogue des Prestations & Grille Tarifaire
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ajoutez de nouveaux services à la demande, modifiez les prix de base en FCFA, paramétrez les unités et mettez à jour la grille de fixation TV.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-2xl flex-wrap gap-1">
            <button
              onClick={() => setSubTab('SERVICES')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                subTab === 'SERVICES'
                  ? 'bg-white text-[#1B2A4A] shadow-xs'
                  : 'text-slate-600 hover:text-[#1B2A4A]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Prestations ({services.length})</span>
            </button>
            <button
              onClick={() => setSubTab('TV_PRICING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                subTab === 'TV_PRICING'
                  ? 'bg-white text-[#1B2A4A] shadow-xs'
                  : 'text-slate-600 hover:text-[#1B2A4A]'
              }`}
            >
              <Tv className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Tarifs Fixation TV ({tvSizeTiers.length})</span>
            </button>
            <button
              onClick={() => setSubTab('COMMUNE_PRICING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                subTab === 'COMMUNE_PRICING'
                  ? 'bg-[#1B2A4A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#1B2A4A]'
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 ${subTab === 'COMMUNE_PRICING' ? 'text-[#F59E0B]' : 'text-amber-500'}`} />
              <span>Tarifs par Commune (11)</span>
              <span className="text-[9px] bg-amber-400 text-[#1B2A4A] px-1.5 py-0.2 rounded-full font-black">
                Nouveau
              </span>
            </button>
          </div>

          {subTab === 'SERVICES' && (
            <button
              onClick={handleOpenNewService}
              className="py-2 px-4 bg-[#1B2A4A] hover:bg-[#253966] text-white text-xs font-bold rounded-2xl shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 text-[#F59E0B]" />
              <span>Ajouter une prestation</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: PRESTATIONS / SERVICES CATALOG */}
      {subTab === 'SERVICES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {services.map((service) => {
            const isActive = service.isActive !== false;
            return (
              <div
                key={service.id}
                className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between shadow-xs ${
                  isActive ? 'border-slate-200' : 'border-slate-200 bg-slate-50/60 opacity-70'
                }`}
              >
                <div>
                  {/* Top Bar with Icon, Category badge and Active switch */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#1B2A4A] text-white flex items-center justify-center shadow-xs">
                        {renderIcon(service.iconName, 'w-5 h-5 text-[#F59E0B]')}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-[#1B2A4A] leading-tight">
                          {service.name}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400 font-semibold block mt-0.5">
                          ID: {service.id}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleServiceActive(service.id)}
                        className={`p-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                          isActive
                            ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                            : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
                        }`}
                        title={isActive ? 'Désactiver le service' : 'Activer le service'}
                      >
                        {isActive ? (
                          <ToggleRight className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Price & Specs */}
                  <div className="py-3.5 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500 font-medium">Tarif de base :</span>
                      <span className="text-base font-black text-[#1B2A4A] font-mono">
                        {formatFCFA(service.basePrice)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Facturation :</span>
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg text-[11px]">
                        {service.isUnitBased 
                          ? `Par unité (${service.unitLabel || 'unité'})` 
                          : 'Forfait intervention'}
                      </span>
                    </div>

                    {service.isUnitBased && (
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Limites d'unités :</span>
                        <span className="font-mono text-slate-700 font-semibold">
                          {service.minUnits || 1} à {service.maxUnits || 10} {service.unitLabel || 'unités'}
                        </span>
                      </div>
                    )}

                    <div className="p-2.5 bg-slate-50 rounded-2xl text-[11px] text-slate-600 border border-slate-100">
                      <span className="font-bold text-slate-700 block mb-0.5">Libellé affiché client :</span>
                      <p className="text-slate-600">{service.priceDescription || service.badge}</p>
                    </div>

                    {/* Certifications requirement */}
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        Certification requise :{' '}
                        <strong className="text-slate-700">
                          {service.requiresParaboleCert || service.requiredCertKey === 'paraboleTnt'
                            ? 'Parabole / TNT'
                            : service.requiredCertKey === 'climatisation'
                            ? 'Climatisation'
                            : service.requiredCertKey === 'videosurveillance'
                            ? 'Vidéosurveillance'
                            : 'Standard Vraiga'}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isActive ? '● En ligne' : '○ Masqué'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditService(service)}
                      className="py-1.5 px-3 bg-slate-100 hover:bg-[#1B2A4A] hover:text-white text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>Modifier Tarif & Infos</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Confirmez-vous la suppression de la prestation "${service.name}" ?`)) {
                          deleteService(service.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Supprimer la prestation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: TV PRICING MATRIX */}
      {subTab === 'TV_PRICING' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-[#1B2A4A] flex items-center gap-2">
                  <Tv className="w-4 h-4 text-[#F59E0B]" />
                  Barème Progressif de Fixation TV Murale selon la Diagonale
                </h4>
                <p className="text-xs text-slate-500">
                  Modifiez directement les prix facturés aux clients pour chaque tranche de taille d'écran.
                </p>
              </div>
              <button
                onClick={() => {
                  setTvTierFormData({
                    id: '',
                    label: '',
                    inches: '',
                    price: 10000,
                    description: '',
                  });
                  setIsTvTierModalOpen(true);
                }}
                className="py-1.5 px-3 bg-[#1B2A4A] hover:bg-[#253966] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Ajouter un palier TV</span>
              </button>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 uppercase font-black tracking-wider text-[10px]">
                    <th className="p-3 rounded-l-xl">Palier ID</th>
                    <th className="p-3">Diagonale (Pouces)</th>
                    <th className="p-3">Équivalence (cm)</th>
                    <th className="p-3">Description technique</th>
                    <th className="p-3">Prix Client (FCFA)</th>
                    <th className="p-3">Commission 17.5%</th>
                    <th className="p-3">Gain Net Tech</th>
                    <th className="p-3 rounded-r-xl text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tvSizeTiers.map((tier) => {
                    const commission = Math.round(tier.price * 0.175);
                    const netTech = tier.price - commission;

                    return (
                      <tr key={tier.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-[#1B2A4A]">
                          {tier.id}
                        </td>
                        <td className="p-3 font-extrabold text-[#1B2A4A]">
                          {tier.label}
                        </td>
                        <td className="p-3 text-slate-500 font-mono">
                          {tier.inches}
                        </td>
                        <td className="p-3 text-slate-600 max-w-xs">
                          {tier.description}
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            step="500"
                            min="1000"
                            defaultValue={tier.price}
                            onBlur={(e) => {
                              const newP = Number(e.target.value);
                              if (newP !== tier.price && newP > 0) {
                                updateTvSizeTierPrice(tier.id, newP);
                              }
                            }}
                            className="w-24 text-xs font-mono font-black p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[#1B2A4A] focus:border-[#1B2A4A] focus:bg-white outline-none"
                          />
                        </td>
                        <td className="p-3 font-mono text-amber-700 font-bold">
                          {formatFCFA(commission)}
                        </td>
                        <td className="p-3 font-mono text-emerald-600 font-black">
                          {formatFCFA(netTech)}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              const newPriceStr = prompt(`Entrez le nouveau prix en FCFA pour ${tier.label} :`, String(tier.price));
                              if (newPriceStr) {
                                const newP = Number(newPriceStr);
                                if (!isNaN(newP) && newP > 0) {
                                  updateTvSizeTierPrice(tier.id, newP);
                                }
                              }
                            }}
                            className="py-1 px-2.5 bg-slate-100 hover:bg-[#1B2A4A] hover:text-white rounded-lg text-[11px] font-bold text-slate-700 transition-colors"
                          >
                            Modifier
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: COMMUNE PRICING POLICY MANAGER */}
      {subTab === 'COMMUNE_PRICING' && (
        <CommunePricingManager />
      )}

      {/* MODAL: ADD / EDIT SERVICE */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="font-bold text-base text-[#1B2A4A]">
                  {editingServiceId ? 'Modifier la prestation de service' : 'Ajouter une nouvelle prestation'}
                </h3>
              </div>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Nom complet du service * :</label>
                  <input
                    type="text"
                    required
                    value={serviceFormData.name}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                    placeholder="Ex: Pose Éclairage LED / Luminaire"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#1B2A4A] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Titre court / Carte :</label>
                  <input
                    type="text"
                    value={serviceFormData.shortTitle}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, shortTitle: e.target.value })}
                    placeholder="Ex: Éclairage & Spots"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#1B2A4A] outline-none"
                  />
                </div>
              </div>

              {/* Icon Selector */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Icône représentative :</label>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_ICONS.map((ic) => {
                    const isSelected = serviceFormData.iconName === ic.name;
                    const IconComp = ic.Icon;
                    return (
                      <button
                        type="button"
                        key={ic.name}
                        onClick={() => setServiceFormData({ ...serviceFormData, iconName: ic.name })}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <IconComp className={`w-4 h-4 ${isSelected ? 'text-[#F59E0B]' : 'text-slate-500'}`} />
                        <span className="text-[9px] font-semibold truncate w-full text-center">{ic.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pricing & Billing Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Tarif de base (FCFA) * :</label>
                  <input
                    type="number"
                    step="500"
                    min="500"
                    required
                    value={serviceFormData.basePrice}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, basePrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:border-[#1B2A4A] outline-none bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Mode de facturation :</label>
                  <select
                    value={serviceFormData.isUnitBased ? 'UNIT' : 'FLAT'}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, isUnitBased: e.target.value === 'UNIT' })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:border-[#1B2A4A] outline-none bg-white"
                  >
                    <option value="FLAT">Forfait fixe par intervention</option>
                    <option value="UNIT">Multiplicateur par unité / quantité</option>
                  </select>
                </div>

                {serviceFormData.isUnitBased && (
                  <>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Nom de l'unité (ex: spot, caméra) :</label>
                      <input
                        type="text"
                        value={serviceFormData.unitLabel}
                        onChange={(e) => setServiceFormData({ ...serviceFormData, unitLabel: e.target.value })}
                        placeholder="Ex: luminaire(s)"
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block text-[10px]">Min unités :</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={serviceFormData.minUnits}
                          onChange={(e) => setServiceFormData({ ...serviceFormData, minUnits: Number(e.target.value) })}
                          className="w-full p-2 rounded-xl border border-slate-300 bg-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block text-[10px]">Max unités :</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={serviceFormData.maxUnits}
                          onChange={(e) => setServiceFormData({ ...serviceFormData, maxUnits: Number(e.target.value) })}
                          className="w-full p-2 rounded-xl border border-slate-300 bg-white font-mono"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Descriptions & Badges */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Texte de description du service :</label>
                  <textarea
                    rows={2}
                    value={serviceFormData.description}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                    placeholder="Description détaillée des travaux inclus dans la prestation..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#1B2A4A] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Badge tarifaire affiché :</label>
                    <input
                      type="text"
                      value={serviceFormData.badge}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, badge: e.target.value })}
                      placeholder="Ex: 5 000 FCFA / poste"
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#1B2A4A] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Certification requise pour le technicien :</label>
                    <select
                      value={serviceFormData.requiredCertKey}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, requiredCertKey: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#1B2A4A] outline-none bg-white"
                    >
                      <option value="none">Aucune certification spéciale requise</option>
                      <option value="paraboleTnt">Certification Parabole / Canal+ & TNT</option>
                      <option value="climatisation">Certification Climatisation & Frigorifique</option>
                      <option value="videosurveillance">Certification Vidéosurveillance / Réseaux</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-[#1B2A4A] hover:bg-[#253966] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#F59E0B]" />
                  <span>{editingServiceId ? 'Enregistrer les modifications' : 'Créer et Publier la Prestation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD TV TIER */}
      {isTvTierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="font-bold text-base text-[#1B2A4A]">Ajouter un palier de diagonale TV</h3>
              </div>
              <button
                onClick={() => setIsTvTierModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!tvTierFormData.label || !tvTierFormData.price) return;
                addTvSizeTier({
                  ...tvTierFormData,
                  id: tvTierFormData.id || `TV_${Date.now()}`,
                });
                setIsTvTierModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Identifiant / Clé (ex: 100+) :</label>
                <input
                  type="text"
                  required
                  value={tvTierFormData.id}
                  onChange={(e) => setTvTierFormData({ ...tvTierFormData, id: e.target.value })}
                  placeholder="Ex: 100+"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Libellé (ex: 100"+ Écrans Géants) :</label>
                <input
                  type="text"
                  required
                  value={tvTierFormData.label}
                  onChange={(e) => setTvTierFormData({ ...tvTierFormData, label: e.target.value })}
                  placeholder='Ex: 100"+ et Écrans Géants'
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Équivalence en cm :</label>
                <input
                  type="text"
                  value={tvTierFormData.inches}
                  onChange={(e) => setTvTierFormData({ ...tvTierFormData, inches: e.target.value })}
                  placeholder="Ex: 254+ cm"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Tarif de pose (FCFA) :</label>
                <input
                  type="number"
                  required
                  step="500"
                  min="1000"
                  value={tvTierFormData.price}
                  onChange={(e) => setTvTierFormData({ ...tvTierFormData, price: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Description technique :</label>
                <input
                  type="text"
                  value={tvTierFormData.description}
                  onChange={(e) => setTvTierFormData({ ...tvTierFormData, description: e.target.value })}
                  placeholder="Ex: Pose lourde structurelle par 2 techniciens"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTvTierModalOpen(false)}
                  className="flex-1 py-2 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-[#1B2A4A] text-white font-bold rounded-xl shadow-md"
                >
                  Ajouter le palier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
