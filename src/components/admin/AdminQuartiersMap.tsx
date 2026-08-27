import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Tv, 
  SatelliteDish, 
  Wind, 
  ShieldCheck, 
  Navigation, 
  Clock, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Search, 
  Filter, 
  Sparkles, 
  Maximize2, 
  Play, 
  ChevronRight,
  TrendingUp,
  Activity,
  Plus,
  RefreshCw,
  Eye,
  Sliders,
  DollarSign
} from 'lucide-react';
import { Mission, Technician, CommuneAbidjan, MissionStatus } from '../../types';
import { COMMUNES_ABIDJAN } from '../../data/initialData';
import { formatFCFA, formatDateTime } from '../../utils/formatters';

// Safely patch Leaflet's DomUtil.remove to prevent "NotFoundError: The object can not be found here"
if (typeof L !== 'undefined' && L.DomUtil) {
  const originalRemove = L.DomUtil.remove;
  L.DomUtil.remove = function (el: HTMLElement) {
    try {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    } catch {
      // Suppress NotFoundError on detached / unmounting nodes
    }
  };
}

export interface QuartierIntervention {
  id: string;
  reference: string;
  quartier: string;
  commune: CommuneAbidjan;
  clientName: string;
  clientPhone: string;
  address: string;
  landmark: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  category: 'FIXATION_TV' | 'PARABOLE_TNT' | 'CLIMATISATION' | 'VIDEOSURVEILLANCE';
  serviceName: string;
  itemsDescription: string;
  grossAmount: number;
  commissionAmount: number;
  technicianId?: string;
  technicianName?: string;
  technicianPhone?: string;
  technicianPhoto?: string;
  technicianCoordinates?: {
    lat: number;
    lng: number;
  };
  status: MissionStatus;
  startedAt: string; // ISO string
  estimatedDurationMin: number;
}

interface AdminQuartiersMapProps {
  activeMission: Mission | null;
  technicians: Technician[];
  onSelectTechnician?: (tech: Technician) => void;
}

// Pre-defined Abidjan neighborhoods with accurate geographical coordinates
export const ABIDJAN_QUARTIERS_GEO: Record<string, { lat: number; lng: number; commune: CommuneAbidjan; landmark: string }> = {
  'Angré 8e Tranche': { lat: 5.3795, lng: -3.9840, commune: 'Cocody', landmark: 'Station Shell 8ème Tranche' },
  'Riviera Palmeraie': { lat: 5.3620, lng: -3.9480, commune: 'Cocody', landmark: 'Rond-point Palmeraie' },
  'Deux Plateaux Vallons': { lat: 5.3610, lng: -4.0020, commune: 'Cocody', landmark: 'Rue des Jardins' },
  'Riviera Bonoumin': { lat: 5.3690, lng: -3.9630, commune: 'Cocody', landmark: 'Abidjan Mall' },
  'Riviera 2': { lat: 5.3520, lng: -3.9720, commune: 'Cocody', landmark: 'Clinique Ste Anne-Marie' },
  'Danga': { lat: 5.3430, lng: -4.0040, commune: 'Cocody', landmark: 'St Jean Cocody' },
  'Maroc': { lat: 5.3420, lng: -4.0890, commune: 'Yopougon', landmark: 'Carrefour Bel Air' },
  'Niangon Sud': { lat: 5.3340, lng: -4.0950, commune: 'Yopougon', landmark: 'Marché de Niangon' },
  'Siporex': { lat: 5.3480, lng: -4.0620, commune: 'Yopougon', landmark: 'Carrefour Siporex' },
  'Toit Rouge': { lat: 5.3390, lng: -4.0480, commune: 'Yopougon', landmark: 'Complexe Jesse Jackson' },
  'Selmer': { lat: 5.3520, lng: -4.0550, commune: 'Yopougon', landmark: 'Pharmacie Chigata' },
  'Zone 4C': { lat: 5.2920, lng: -3.9790, commune: 'Marcory', landmark: 'Rue du Canal / Prima' },
  'Biétry': { lat: 5.2850, lng: -3.9880, commune: 'Marcory', landmark: 'Boulevard de Marseille' },
  'Résidentiel Marcory': { lat: 5.3020, lng: -3.9840, commune: 'Marcory', landmark: 'Playce Marcory' },
  'Anoumambo': { lat: 5.3090, lng: -3.9730, commune: 'Marcory', landmark: 'Place FEMUA' },
  'Cité Administrative': { lat: 5.3280, lng: -4.0190, commune: 'Plateau', landmark: 'Tours Administratives' },
  'Commerce': { lat: 5.3210, lng: -4.0160, commune: 'Plateau', landmark: 'Immeuble CCIA' },
  'Remblais': { lat: 5.2930, lng: -3.9420, commune: 'Koumassi', landmark: 'Grand Carrefour Koumassi' },
  'Sopim': { lat: 5.2880, lng: -3.9510, commune: 'Koumassi', landmark: 'Pharmacie Kahira' },
  'Avenue 8': { lat: 5.3040, lng: -4.0110, commune: 'Treichville', landmark: 'Marché Belleville' },
  'Zone 3': { lat: 5.3080, lng: -4.0020, commune: 'Treichville', landmark: 'Solibra Treichville' },
  'Vridi': { lat: 5.2650, lng: -3.9890, commune: 'Port-Bouët', landmark: 'Canal de Vridi' },
  'Aéroport FHB': { lat: 5.2570, lng: -3.9310, commune: 'Port-Bouët', landmark: 'Rond-Point Akwaba' },
  'Gonzagueville': { lat: 5.2480, lng: -3.9050, commune: 'Port-Bouët', landmark: 'Carrefour Terre Rouge' },
  '220 Logements': { lat: 5.3580, lng: -4.0210, commune: 'Adjamé', landmark: 'Gare Nord SOTRA' },
  'Williamsville': { lat: 5.3690, lng: -4.0190, commune: 'Adjamé', landmark: 'Macaci Adjamé' },
  'Locodjro': { lat: 5.3320, lng: -4.0430, commune: 'Attécoubé', landmark: 'Pont de Locodjro' },
  'Féh Kessé': { lat: 5.3590, lng: -3.8860, commune: 'Bingerville', landmark: 'Carrefour Féh Kessé' },
  'Samaké': { lat: 5.4190, lng: -4.0160, commune: 'Abobo', landmark: 'Mairie d\'Abobo' },
  'Dokui': { lat: 5.3850, lng: -4.0150, commune: 'Abobo', landmark: 'Sogephia Dokui' },
};

// Initial ongoing sample interventions across Abidjan
const INITIAL_IN_PROGRESS_INTERVENTIONS: QuartierIntervention[] = [
  {
    id: 'LIVE-001',
    reference: 'VRG-LIVE-101',
    quartier: 'Angré 8e Tranche',
    commune: 'Cocody',
    clientName: 'M. Touré Mamadou',
    clientPhone: '+225 07 88 12 34 56',
    address: 'Angré 8ème Tranche, Cité Caféiers Villa 42',
    landmark: 'Station Shell 8ème Tranche',
    coordinates: { lat: 5.3795, lng: -3.9840 },
    category: 'FIXATION_TV',
    serviceName: 'Fixation TV Murale 65"',
    itemsDescription: 'Support orientable double bras sur mur en brique',
    grossAmount: 15000,
    commissionAmount: 2625,
    technicianId: 'TECH-001',
    technicianName: 'Kouamé Jean-Yves',
    technicianPhone: '+225 07 08 45 12 89',
    technicianPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    technicianCoordinates: { lat: 5.3790, lng: -3.9835 },
    status: 'IN_PROGRESS',
    startedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    estimatedDurationMin: 45,
  },
  {
    id: 'LIVE-002',
    reference: 'VRG-LIVE-102',
    quartier: 'Angré 8e Tranche',
    commune: 'Cocody',
    clientName: 'Mme Bamba Aïcha',
    clientPhone: '+225 05 44 22 11 99',
    address: 'Angré 8ème Tranche, Résidence Les Perles',
    landmark: 'Pharmacie 8ème Tranche',
    coordinates: { lat: 5.3810, lng: -3.9825 },
    category: 'PARABOLE_TNT',
    serviceName: 'Pointage Parabole HD Canal+',
    itemsDescription: 'Réglage signal LNB et raccordement décodeur',
    grossAmount: 5000,
    commissionAmount: 875,
    technicianId: 'TECH-002',
    technicianName: 'Konan Brice',
    technicianPhone: '+225 05 44 89 23 10',
    technicianPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    technicianCoordinates: { lat: 5.3805, lng: -3.9820 },
    status: 'ARRIVED',
    startedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    estimatedDurationMin: 30,
  },
  {
    id: 'LIVE-003',
    reference: 'VRG-LIVE-103',
    quartier: 'Zone 4C',
    commune: 'Marcory',
    clientName: 'M. Philippe Delorme',
    clientPhone: '+225 07 00 11 22 33',
    address: 'Zone 4C, Rue Pierre et Marie Curie',
    landmark: 'Prima Center / Rue du Canal',
    coordinates: { lat: 5.2920, lng: -3.9790 },
    category: 'CLIMATISATION',
    serviceName: 'Nettoyage & Désinfection 3 Splits',
    itemsDescription: 'Lavage turbine haute pression + traitement antibactérien',
    grossAmount: 30000,
    commissionAmount: 5250,
    technicianId: 'TECH-003',
    technicianName: 'Bakayoko Moussa',
    technicianPhone: '+225 01 02 78 90 44',
    technicianPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    technicianCoordinates: { lat: 5.2918, lng: -3.9785 },
    status: 'IN_PROGRESS',
    startedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    estimatedDurationMin: 60,
  },
  {
    id: 'LIVE-004',
    reference: 'VRG-LIVE-104',
    quartier: 'Maroc',
    commune: 'Yopougon',
    clientName: 'Mme Koffi Mireille',
    clientPhone: '+225 01 44 55 66 77',
    address: 'Maroc, Carrefour Complexe Jesse Jackson',
    landmark: 'Carrefour Bel Air',
    coordinates: { lat: 5.3420, lng: -4.0890 },
    category: 'FIXATION_TV',
    serviceName: 'Fixation TV 55" Salon + Chambre',
    itemsDescription: 'Pose 2 supports muraux avec passage de câbles goulotte',
    grossAmount: 20000,
    commissionAmount: 3500,
    technicianId: 'TECH-005',
    technicianName: 'Touré Ibrahim',
    technicianPhone: '+225 05 98 76 54 32',
    technicianPhoto: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    technicianCoordinates: { lat: 5.3460, lng: -4.0810 },
    status: 'ACCEPTED',
    startedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    estimatedDurationMin: 50,
  },
  {
    id: 'LIVE-005',
    reference: 'VRG-LIVE-105',
    quartier: 'Deux Plateaux Vallons',
    commune: 'Cocody',
    clientName: 'M. Sery Patrick',
    clientPhone: '+225 07 22 33 44 55',
    address: 'Vallons, Rue des Jardins Immeuble Palm',
    landmark: 'Pâtisserie Abidjanaise',
    coordinates: { lat: 5.3610, lng: -4.0020 },
    category: 'VIDEOSURVEILLANCE',
    serviceName: 'Installation 4 Caméras IP Wifi',
    itemsDescription: 'Configuration NVR et application mobile de vision nocturne',
    grossAmount: 40000,
    commissionAmount: 7000,
    technicianId: 'TECH-004',
    technicianName: 'Diallo Sékou',
    technicianPhone: '+225 07 77 12 34 56',
    technicianPhoto: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
    technicianCoordinates: { lat: 5.3608, lng: -4.0015 },
    status: 'IN_PROGRESS',
    startedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    estimatedDurationMin: 90,
  },
  {
    id: 'LIVE-006',
    reference: 'VRG-LIVE-106',
    quartier: 'Cité Administrative',
    commune: 'Plateau',
    clientName: 'M. N\'Guessan Jean-Luc',
    clientPhone: '+225 05 99 88 77 11',
    address: 'Plateau, Tour C 14ème étage Bureau 1402',
    landmark: 'Tours Administratives',
    coordinates: { lat: 5.3280, lng: -4.0190 },
    category: 'FIXATION_TV',
    serviceName: 'Fixation Écran Salle de Conférence 75"',
    itemsDescription: 'Support ultra-robuste avec fixation sur mur béton armé',
    grossAmount: 15000,
    commissionAmount: 2625,
    technicianId: 'TECH-001',
    technicianName: 'Kouamé Jean-Yves',
    technicianPhone: '+225 07 08 45 12 89',
    technicianPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    technicianCoordinates: { lat: 5.3275, lng: -4.0185 },
    status: 'ARRIVED',
    startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    estimatedDurationMin: 40,
  },
  {
    id: 'LIVE-007',
    reference: 'VRG-LIVE-107',
    quartier: 'Remblais',
    commune: 'Koumassi',
    clientName: 'Mme Diabaté Fatim',
    clientPhone: '+225 01 22 33 66 88',
    address: 'Remblais, Cité Houphouët-Boigny Bat B',
    landmark: 'Grand Carrefour Koumassi',
    coordinates: { lat: 5.2930, lng: -3.9420 },
    category: 'CLIMATISATION',
    serviceName: 'Entretien Split 1.5 CV',
    itemsDescription: 'Nettoyage filtre et contrôle pression gaz R410A',
    grossAmount: 10000,
    commissionAmount: 1750,
    status: 'OFFERED',
    startedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    estimatedDurationMin: 35,
  },
  {
    id: 'LIVE-008',
    reference: 'VRG-LIVE-108',
    quartier: '220 Logements',
    commune: 'Adjamé',
    clientName: 'M. Ouattara Moussa',
    clientPhone: '+225 07 11 44 77 88',
    address: '220 Logements, Immeuble Flamboyant',
    landmark: 'Gare Nord SOTRA',
    coordinates: { lat: 5.3580, lng: -4.0210 },
    category: 'PARABOLE_TNT',
    serviceName: 'Installation Parabole + Câblage 15m',
    itemsDescription: 'Fixation bras coudé et orientation satellite Eutelsat',
    grossAmount: 5000,
    commissionAmount: 875,
    technicianId: 'TECH-002',
    technicianName: 'Konan Brice',
    technicianPhone: '+225 05 44 89 23 10',
    technicianPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    technicianCoordinates: { lat: 5.3560, lng: -4.0240 },
    status: 'ACCEPTED',
    startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    estimatedDurationMin: 45,
  },
];

const COMMUNE_COLORS: Record<string, string> = {
  'Cocody': '#3B82F6',
  'Yopougon': '#10B981',
  'Marcory': '#F59E0B',
  'Plateau': '#8B5CF6',
  'Koumassi': '#EC4899',
  'Treichville': '#06B6D4',
  'Port-Bouët': '#14B8A6',
  'Adjamé': '#F97316',
  'Attécoubé': '#6366F1',
  'Bingerville': '#84CC16',
  'Abobo': '#E11D48',
};

const CATEGORY_ICONS: Record<string, any> = {
  'FIXATION_TV': Tv,
  'PARABOLE_TNT': SatelliteDish,
  'CLIMATISATION': Wind,
  'VIDEOSURVEILLANCE': ShieldCheck,
};

const STATUS_LABELS: Record<string, { label: string; color: string; badge: string; dot: string }> = {
  'IN_PROGRESS': { label: 'Prestation en cours', color: 'text-emerald-700 bg-emerald-100 border-emerald-300', badge: 'bg-emerald-500', dot: '#10B981' },
  'ARRIVED': { label: 'Technicien sur place', color: 'text-amber-800 bg-amber-100 border-amber-300', badge: 'bg-amber-500', dot: '#F59E0B' },
  'ACCEPTED': { label: 'Technicien en route', color: 'text-blue-800 bg-blue-100 border-blue-300', badge: 'bg-blue-500', dot: '#3B82F6' },
  'OFFERED': { label: 'Proposition envoyée', color: 'text-purple-800 bg-purple-100 border-purple-300', badge: 'bg-purple-500', dot: '#8B5CF6' },
  'SEARCHING': { label: 'Recherche radar en cours', color: 'text-orange-800 bg-orange-100 border-orange-300', badge: 'bg-orange-500', dot: '#F97316' },
  'COMPLETED': { label: 'Terminé avec succès', color: 'text-slate-800 bg-slate-100 border-slate-300', badge: 'bg-slate-500', dot: '#64748B' },
  'CANCELLED': { label: 'Annulé', color: 'text-rose-800 bg-rose-100 border-rose-300', badge: 'bg-rose-500', dot: '#EF4444' },
};

export const AdminQuartiersMap: React.FC<AdminQuartiersMapProps> = ({
  activeMission,
  technicians,
  onSelectTechnician,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);

  // In-progress missions state
  const [liveInterventions, setLiveInterventions] = useState<QuartierIntervention[]>(INITIAL_IN_PROGRESS_INTERVENTIONS);
  const [selectedIntervention, setSelectedIntervention] = useState<QuartierIntervention | null>(null);
  const [selectedQuartierFilter, setSelectedQuartierFilter] = useState<string>('ALL');
  const [selectedCommuneFilter, setSelectedCommuneFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Map display settings
  const [showQuartierDensityCircles, setShowQuartierDensityCircles] = useState<boolean>(true);
  const [showTechnicianRoutes, setShowTechnicianRoutes] = useState<boolean>(true);
  const [showTechniciansLayer, setShowTechniciansLayer] = useState<boolean>(true);

  // Sync activeMission from AppContext into liveInterventions if currently active
  useEffect(() => {
    if (!activeMission || activeMission.status === 'COMPLETED' || activeMission.status === 'CANCELLED') return;

    // Detect quartier from address or landmark
    let matchedQuartier = 'Angré 8e Tranche';
    const addrLower = (activeMission.address + ' ' + (activeMission.landmark || '')).toLowerCase();
    for (const [qName] of Object.entries(ABIDJAN_QUARTIERS_GEO)) {
      if (addrLower.includes(qName.toLowerCase()) || qName.toLowerCase().includes(activeMission.commune.toLowerCase())) {
        matchedQuartier = qName;
        break;
      }
    }

    const firstItem = activeMission.items[0];
    const cat = (firstItem ? firstItem.category : 'FIXATION_TV') as any;

    const dynamicIntervention: QuartierIntervention = {
      id: `CLIENT-APP-${activeMission.id}`,
      reference: activeMission.reference,
      quartier: matchedQuartier,
      commune: activeMission.commune,
      clientName: activeMission.clientName,
      clientPhone: activeMission.clientPhone,
      address: activeMission.address,
      landmark: activeMission.landmark || `${activeMission.commune} Abidjan`,
      coordinates: activeMission.coordinates,
      category: cat,
      serviceName: firstItem ? firstItem.name : 'Intervention Domicile',
      itemsDescription: activeMission.items.map(i => `${i.name} (x${i.quantity})`).join(', '),
      grossAmount: activeMission.grossAmount,
      commissionAmount: activeMission.commissionAmount,
      technicianId: activeMission.technicianId,
      technicianName: activeMission.technicianName,
      technicianPhone: activeMission.technicianPhone,
      technicianPhoto: activeMission.technicianPhoto,
      technicianCoordinates: activeMission.technicianCoordinates,
      status: activeMission.status,
      startedAt: activeMission.createdAt,
      estimatedDurationMin: 45,
    };

    setLiveInterventions(prev => {
      const exists = prev.some(i => i.id === dynamicIntervention.id);
      if (exists) {
        return prev.map(i => i.id === dynamicIntervention.id ? dynamicIntervention : i);
      }
      return [dynamicIntervention, ...prev];
    });
  }, [activeMission]);

  // Aggregate interventions by Quartier
  const quartierDensity = useMemo(() => {
    const map = new Map<string, {
      quartier: string;
      commune: CommuneAbidjan;
      lat: number;
      lng: number;
      interventionsCount: number;
      interventions: QuartierIntervention[];
      totalGrossAmount: number;
      totalCommissions: number;
      statusCounts: Record<string, number>;
    }>();

    // Initialize with all known quartiers
    Object.entries(ABIDJAN_QUARTIERS_GEO).forEach(([qName, qGeo]) => {
      map.set(qName, {
        quartier: qName,
        commune: qGeo.commune,
        lat: qGeo.lat,
        lng: qGeo.lng,
        interventionsCount: 0,
        interventions: [],
        totalGrossAmount: 0,
        totalCommissions: 0,
        statusCounts: {},
      });
    });

    // Populate with active interventions
    liveInterventions.forEach(item => {
      if (item.status === 'COMPLETED' || item.status === 'CANCELLED') return;

      const qName = item.quartier;
      if (map.has(qName)) {
        const entry = map.get(qName)!;
        entry.interventionsCount += 1;
        entry.interventions.push(item);
        entry.totalGrossAmount += item.grossAmount;
        entry.totalCommissions += item.commissionAmount;
        entry.statusCounts[item.status] = (entry.statusCounts[item.status] || 0) + 1;
      } else {
        // Fallback for custom quartier
        map.set(qName, {
          quartier: qName,
          commune: item.commune,
          lat: item.coordinates.lat,
          lng: item.coordinates.lng,
          interventionsCount: 1,
          interventions: [item],
          totalGrossAmount: item.grossAmount,
          totalCommissions: item.commissionAmount,
          statusCounts: { [item.status]: 1 },
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.interventionsCount - a.interventionsCount);
  }, [liveInterventions]);

  // Filtered interventions
  const filteredInterventions = useMemo(() => {
    return liveInterventions.filter(item => {
      if (selectedCommuneFilter !== 'ALL' && item.commune !== selectedCommuneFilter) return false;
      if (selectedQuartierFilter !== 'ALL' && item.quartier !== selectedQuartierFilter) return false;
      if (selectedStatusFilter !== 'ALL' && item.status !== selectedStatusFilter) return false;
      if (selectedCategoryFilter !== 'ALL' && item.category !== selectedCategoryFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matches = 
          item.clientName.toLowerCase().includes(q) ||
          item.reference.toLowerCase().includes(q) ||
          item.address.toLowerCase().includes(q) ||
          item.quartier.toLowerCase().includes(q) ||
          (item.technicianName && item.technicianName.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [liveInterventions, selectedCommuneFilter, selectedQuartierFilter, selectedStatusFilter, selectedCategoryFilter, searchQuery]);

  // Summary Metrics
  const activeCount = liveInterventions.filter(i => i.status !== 'COMPLETED' && i.status !== 'CANCELLED').length;
  const inProgressNowCount = liveInterventions.filter(i => i.status === 'IN_PROGRESS').length;
  const arrivedCount = liveInterventions.filter(i => i.status === 'ARRIVED').length;
  const enRouteCount = liveInterventions.filter(i => i.status === 'ACCEPTED').length;
  const activeQuartiersCount = quartierDensity.filter(q => q.interventionsCount > 0).length;
  const totalVolumeInProgress = liveInterventions
    .filter(i => i.status !== 'COMPLETED' && i.status !== 'CANCELLED')
    .reduce((sum, i) => sum + i.grossAmount, 0);

  // Initialize Leaflet Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    let map: L.Map | null = null;
    try {
      map = L.map(container, {
        center: [5.3450, -4.0050],
        zoom: 12.5,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      const markersGroup = L.featureGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    } catch (e) {
      console.warn('Admin map init warning:', e);
    }

    return () => {
      try {
        if (markersGroupRef.current) {
          try {
            markersGroupRef.current.clearLayers();
          } catch {}
          markersGroupRef.current = null;
        }
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.stop();
            mapInstanceRef.current.off();
            mapInstanceRef.current.remove();
          } catch {}
          mapInstanceRef.current = null;
        }
      } catch (err) {
        console.warn('Admin map cleanup error suppressed:', err);
      } finally {
        if (container && (container as any)._leaflet_id) {
          delete (container as any)._leaflet_id;
        }
      }
    };
  }, []);

  // Update map layers and markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    try {
      try {
        markersGroup.clearLayers();
      } catch {}
      const bounds = L.latLngBounds([]);

      // 1. QUARTIER DENSITY CIRCLES & BADGES
      if (showQuartierDensityCircles) {
        quartierDensity.forEach(qd => {
          if (qd.interventionsCount === 0) return;

          const communeColor = COMMUNE_COLORS[qd.commune] || '#3B82F6';
          const radius = Math.min(300 + qd.interventionsCount * 180, 850);

          // Density circle
          const circle = L.circle([qd.lat, qd.lng], {
            radius,
            color: communeColor,
            fillColor: communeColor,
            fillOpacity: 0.16,
            weight: 2,
            dashArray: '4, 4',
          });

          // Quartier Label Badge
          const badgeIcon = L.divIcon({
            className: 'custom-quartier-cluster-badge',
            html: `
              <div class="cursor-pointer group flex items-center gap-1.5 bg-[#1B2A4A] text-white px-2.5 py-1 rounded-full shadow-lg border-2 border-white transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform">
                <span class="w-2 h-2 rounded-full" style="background-color: ${communeColor};"></span>
                <span class="font-black text-[11px]">${qd.quartier}</span>
                <span class="bg-[#F59E0B] text-[#1B2A4A] font-black text-[10px] px-1.5 py-0.2 rounded-full">
                  ${qd.interventionsCount}
                </span>
              </div>
            `,
            iconSize: [120, 30],
            iconAnchor: [60, 15],
          });

          const badgeMarker = L.marker([qd.lat + 0.0035, qd.lng], { icon: badgeIcon });

          badgeMarker.on('click', () => {
            setSelectedQuartierFilter(qd.quartier);
            map.flyTo([qd.lat, qd.lng], 14, { duration: 0.8 });
          });

          markersGroup.addLayer(circle);
          markersGroup.addLayer(badgeMarker);
          bounds.extend([qd.lat, qd.lng]);
        });
      }

      // 2. INDIVIDUAL INTERVENTION PINS
      filteredInterventions.forEach(item => {
        const isCurrentActive = item.status === 'IN_PROGRESS' || item.status === 'ARRIVED' || item.status === 'ACCEPTED';
        const st = STATUS_LABELS[item.status] || STATUS_LABELS['IN_PROGRESS'];
        const communeColor = COMMUNE_COLORS[item.commune] || '#3B82F6';

        // Custom Pin for Intervention
        const pinIcon = L.divIcon({
          className: 'custom-intervention-pin',
          html: `
            <div class="relative flex flex-col items-center cursor-pointer group">
              ${isCurrentActive ? `
                <div class="absolute -inset-2 rounded-full opacity-40 animate-ping" style="background-color: ${st.dot};"></div>
              ` : ''}
              <div class="w-10 h-10 rounded-2xl bg-[#1B2A4A] border-2 border-white shadow-xl flex items-center justify-center text-white transition-transform group-hover:scale-115">
                <span class="font-bold text-xs" style="color: ${st.dot};">
                  ${item.category === 'FIXATION_TV' ? '📺' : item.category === 'PARABOLE_TNT' ? '📡' : item.category === 'CLIMATISATION' ? '❄️' : '📹'}
                </span>
              </div>
              <div class="mt-1 bg-white text-[#1B2A4A] px-2 py-0.5 rounded-lg border border-slate-200 shadow-md text-[10px] font-black whitespace-nowrap flex items-center gap-1">
                <span class="w-2 h-2 rounded-full" style="background-color: ${st.dot};"></span>
                <span>${item.reference}</span>
              </div>
            </div>
          `,
          iconSize: [40, 52],
          iconAnchor: [20, 26],
        });

        const marker = L.marker([item.coordinates.lat, item.coordinates.lng], { icon: pinIcon });

        // Popup Content
        marker.bindPopup(`
          <div class="p-3 text-xs font-sans min-w-[240px] space-y-2">
            <div class="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span class="font-mono font-bold text-[#1B2A4A] text-sm">${item.reference}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${st.color}">
                ${st.label}
              </span>
            </div>

            <div class="space-y-1">
              <div class="font-black text-[#1B2A4A] text-xs flex items-center gap-1">
                <span class="w-2 h-2 rounded-full" style="background-color: ${communeColor};"></span>
                ${item.quartier} (${item.commune})
              </div>
              <p class="text-slate-600 text-[11px]">${item.address}</p>
              <p class="text-slate-400 text-[10px]">📍 Repère : ${item.landmark}</p>
            </div>

            <div class="p-2 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
              <div class="font-bold text-[#1B2A4A] text-xs">${item.serviceName}</div>
              <div class="text-[10px] text-slate-500">${item.itemsDescription}</div>
              <div class="flex justify-between items-center pt-1 font-mono font-bold">
                <span class="text-slate-500">Montant :</span>
                <span class="text-[#1B2A4A]">${formatFCFA(item.grossAmount)}</span>
              </div>
            </div>

            ${item.technicianName ? `
              <div class="flex items-center gap-2 pt-1 border-t border-slate-100">
                <img src="${item.technicianPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}" class="w-7 h-7 rounded-full object-cover border border-slate-300" />
                <div class="text-[11px]">
                  <strong class="text-[#1B2A4A] block">${item.technicianName}</strong>
                  <span class="text-slate-500 text-[10px]">Technicien Vraiga</span>
                </div>
              </div>
            ` : `
              <div class="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded-lg">
                Technicien en cours d'attribution...
              </div>
            `}
          </div>
        `);

        marker.on('click', () => {
          setSelectedIntervention(item);
        });

        markersGroup.addLayer(marker);
        bounds.extend([item.coordinates.lat, item.coordinates.lng]);

        // 3. TECHNICIAN POSITION & ROUTE LINE
        if (showTechnicianRoutes && item.technicianCoordinates && (item.status === 'ACCEPTED' || item.status === 'ARRIVED')) {
          const techLatLng = L.latLng(item.technicianCoordinates.lat, item.technicianCoordinates.lng);
          
          // Route polyline
          const pathCoords: [number, number][] = [
            [item.technicianCoordinates.lat, item.technicianCoordinates.lng],
            [
              (item.technicianCoordinates.lat + item.coordinates.lat) / 2 + 0.001,
              (item.technicianCoordinates.lng + item.coordinates.lng) / 2 - 0.0015
            ],
            [item.coordinates.lat, item.coordinates.lng]
          ];

          const route = L.polyline(pathCoords, {
            color: '#1B2A4A',
            weight: 3.5,
            dashArray: '6, 6',
            opacity: 0.8,
          });

          markersGroup.addLayer(route);
          bounds.extend(techLatLng);
        }
      });

      // Fit bounds if valid
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 14.5,
          animate: true,
        });
      }
    } catch (err) {
      console.warn('Map render warning:', err);
    }
  }, [
    filteredInterventions, 
    quartierDensity, 
    showQuartierDensityCircles, 
    showTechnicianRoutes, 
    showTechniciansLayer
  ]);

  // Handler: Advance Intervention Status (Simulation for live admin management)
  const handleAdvanceStatus = (interventionId: string) => {
    const order: MissionStatus[] = ['OFFERED', 'ACCEPTED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'];
    setLiveInterventions(prev => prev.map(item => {
      if (item.id === interventionId) {
        const currentIndex = order.indexOf(item.status);
        const nextStatus = currentIndex >= 0 && currentIndex < order.length - 1 
          ? order[currentIndex + 1] 
          : 'COMPLETED';
        return {
          ...item,
          status: nextStatus,
        };
      }
      return item;
    }));
  };

  // Handler: Focus Map on specific Quartier or Intervention
  const handleFocusIntervention = (item: QuartierIntervention) => {
    setSelectedIntervention(item);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([item.coordinates.lat, item.coordinates.lng], 15, {
        duration: 1,
      });
    }
  };

  // Handler: Quick Test Mission Creator in selected neighborhood
  const handleSpawnTestMission = (quartierName: string) => {
    const geo = ABIDJAN_QUARTIERS_GEO[quartierName] || ABIDJAN_QUARTIERS_GEO['Angré 8e Tranche'];
    const newRef = `VRG-LIVE-${Math.floor(100 + Math.random() * 900)}`;
    const randomNames = ['M. Bitty Kouamé', 'Mme Ouattara Sara', 'M. Koffi Sylvain', 'Mme N\'Dri Estelle', 'M. Coulibaly Daouda'];
    const randomTech = technicians[Math.floor(Math.random() * technicians.length)];
    
    const newMission: QuartierIntervention = {
      id: `SPAWN-${Date.now()}`,
      reference: newRef,
      quartier: quartierName,
      commune: geo.commune,
      clientName: randomNames[Math.floor(Math.random() * randomNames.length)],
      clientPhone: '+225 07 ' + Math.floor(10000000 + Math.random() * 90000000),
      address: `${quartierName}, Rue Principale`,
      landmark: geo.landmark,
      coordinates: {
        lat: geo.lat + (Math.random() - 0.5) * 0.004,
        lng: geo.lng + (Math.random() - 0.5) * 0.004,
      },
      category: 'FIXATION_TV',
      serviceName: 'Fixation TV Murale 55"',
      itemsDescription: 'Support mural universel niveau laser',
      grossAmount: 10000,
      commissionAmount: 1750,
      technicianId: randomTech?.id,
      technicianName: randomTech?.name,
      technicianPhone: randomTech?.phone,
      technicianPhoto: randomTech?.photo,
      technicianCoordinates: {
        lat: geo.lat + 0.003,
        lng: geo.lng - 0.002,
      },
      status: 'IN_PROGRESS',
      startedAt: new Date().toISOString(),
      estimatedDurationMin: 45,
    };

    setLiveInterventions(prev => [newMission, ...prev]);
    setSelectedIntervention(newMission);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([newMission.coordinates.lat, newMission.coordinates.lng], 15);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner & Live Control Bar */}
      <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#1B2A4A] text-[#F59E0B] flex items-center justify-center shadow-md">
            <Navigation className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-[#1B2A4A]">
                Carte des Interventions en Cours par Quartier
              </h2>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Abidjan Live GPS
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervision géographique des techniciens mobilisés et densité des demandes par quartier
            </p>
          </div>
        </div>

        {/* Quick KPI Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200 flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">En cours :</span>
            <span className="font-mono font-black text-sm text-emerald-600">{activeCount}</span>
          </div>

          <div className="bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200 flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Quartiers actifs :</span>
            <span className="font-mono font-black text-sm text-[#1B2A4A]">{activeQuartiersCount}</span>
          </div>

          <div className="bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200 flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Volume en cours :</span>
            <span className="font-mono font-black text-sm text-[#F59E0B]">{formatFCFA(totalVolumeInProgress)}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Map (Left 2 cols) & Quartiers List / Controls (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAP CONTAINER (2 COLS) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3 relative">
            {/* Map Top Filters & Layer Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              {/* Commune Filter */}
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={selectedCommuneFilter}
                  onChange={(e) => {
                    setSelectedCommuneFilter(e.target.value);
                    setSelectedQuartierFilter('ALL');
                  }}
                  className="bg-transparent font-bold text-[#1B2A4A] focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">Toutes les communes</option>
                  {Object.keys(COMMUNES_ABIDJAN).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Quartier Filter */}
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={selectedQuartierFilter}
                  onChange={(e) => setSelectedQuartierFilter(e.target.value)}
                  className="bg-transparent font-bold text-[#1B2A4A] focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">Tous les quartiers ({Object.keys(ABIDJAN_QUARTIERS_GEO).length})</option>
                  {Object.entries(ABIDJAN_QUARTIERS_GEO)
                    .filter(([_, g]) => selectedCommuneFilter === 'ALL' || g.commune === selectedCommuneFilter)
                    .map(([qName]) => (
                      <option key={qName} value={qName}>{qName}</option>
                    ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-transparent font-bold text-[#1B2A4A] focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="IN_PROGRESS">En cours (Montage)</option>
                  <option value="ARRIVED">Sur place</option>
                  <option value="ACCEPTED">En route</option>
                  <option value="OFFERED">Proposition</option>
                </select>
              </div>

              {/* Layer Toggles */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowQuartierDensityCircles(!showQuartierDensityCircles)}
                  className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition-colors border ${
                    showQuartierDensityCircles 
                      ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]' 
                      : 'bg-white text-slate-500 border-slate-200'
                  }`}
                  title="Afficher/Masquer les cercles de densité par quartier"
                >
                  Cercles Quartiers
                </button>
                <button
                  onClick={() => setShowTechnicianRoutes(!showTechnicianRoutes)}
                  className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition-colors border ${
                    showTechnicianRoutes 
                      ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]' 
                      : 'bg-white text-slate-500 border-slate-200'
                  }`}
                  title="Afficher/Masquer les tracés GPS vers les clients"
                >
                  Tracés GPS
                </button>
              </div>
            </div>

            {/* LEAFLET MAP ELEMENT */}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 h-[500px]">
              <div ref={mapContainerRef} className="w-full h-full z-0" />
              
              {/* Map Floating Legend */}
              <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-xs p-3 rounded-2xl border border-slate-200 shadow-md text-[10px] space-y-1.5 max-w-[260px]">
                <div className="font-extrabold text-[#1B2A4A] flex items-center justify-between">
                  <span>Légende des Interventions :</span>
                  <span className="font-mono text-emerald-600 font-bold">{filteredInterventions.length} visibles</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <div className="flex items-center gap-1 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>En cours</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>Sur place</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span>En route</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    <span>En attente</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DENSITY SUMMARY STRIP BY QUARTIER */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs text-[#1B2A4A] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
                Densité des Interventions par Quartier à Abidjan
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                Cliquez pour centrer sur la zone
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {quartierDensity
                .filter(q => q.interventionsCount > 0)
                .map(q => {
                  const communeColor = COMMUNE_COLORS[q.commune] || '#3B82F6';
                  const isSelected = selectedQuartierFilter === q.quartier;
                  return (
                    <button
                      key={q.quartier}
                      onClick={() => {
                        setSelectedQuartierFilter(q.quartier);
                        if (mapInstanceRef.current) {
                          mapInstanceRef.current.flyTo([q.lat, q.lng], 14.5);
                        }
                      }}
                      className={`p-3 rounded-2xl border text-left shrink-0 min-w-[170px] transition-all ${
                        isSelected 
                          ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-md scale-102 ring-2 ring-[#F59E0B]' 
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: communeColor }}
                        />
                        <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-amber-400 text-slate-950' : 'bg-[#1B2A4A] text-white'
                        }`}>
                          {q.interventionsCount} active(s)
                        </span>
                      </div>
                      <div className="font-black text-xs mt-1.5 truncate">{q.quartier}</div>
                      <div className="text-[10px] opacity-75">{q.commune}</div>
                      <div className="text-[10px] font-mono font-bold text-amber-500 mt-1">
                        {formatFCFA(q.totalGrossAmount)}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: INTERVENTIONS LIST & INSPECTOR (1 COL) */}
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher client, réf, technicien..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-hidden focus:border-[#1B2A4A]"
              />
            </div>

            {/* Quick Test Creator Button */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Tester une commande :</span>
              <button
                onClick={() => handleSpawnTestMission(selectedQuartierFilter !== 'ALL' ? selectedQuartierFilter : 'Angré 8e Tranche')}
                className="text-[11px] font-bold text-[#1B2A4A] bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl border border-amber-300 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#F59E0B]" />
                + Simuler Intervention
              </button>
            </div>
          </div>

          {/* ACTIVE INTERVENTIONS LIST */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3 max-h-[580px] overflow-y-auto">
            <div className="flex items-center justify-between sticky top-0 bg-white pb-2 border-b border-slate-100 z-10">
              <h3 className="font-extrabold text-xs text-[#1B2A4A] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#F59E0B]" />
                Interventions en Temps Réel ({filteredInterventions.length})
              </h3>
              {selectedQuartierFilter !== 'ALL' && (
                <button
                  onClick={() => setSelectedQuartierFilter('ALL')}
                  className="text-[10px] text-blue-600 font-bold hover:underline"
                >
                  Effacer filtre ({selectedQuartierFilter})
                </button>
              )}
            </div>

            <div className="space-y-3">
              {filteredInterventions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                  <Navigation className="w-8 h-8 mx-auto text-slate-300" />
                  <p>Aucune intervention ne correspond aux filtres sélectionnés.</p>
                </div>
              ) : (
                filteredInterventions.map(item => {
                  const st = STATUS_LABELS[item.status] || STATUS_LABELS['IN_PROGRESS'];
                  const communeColor = COMMUNE_COLORS[item.commune] || '#3B82F6';
                  const isSelected = selectedIntervention?.id === item.id;
                  const Icon = CATEGORY_ICONS[item.category] || Tv;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleFocusIntervention(item)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'bg-amber-50/70 border-[#F59E0B] shadow-md ring-2 ring-[#F59E0B]/50'
                          : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200/80'
                      }`}
                    >
                      {/* Card Top: Reference + Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-xl bg-[#1B2A4A] text-white flex items-center justify-center shadow-xs">
                            <Icon className="w-3.5 h-3.5 text-[#F59E0B]" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-xs text-[#1B2A4A] block">
                              {item.reference}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {item.serviceName}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${st.color}`}>
                          {st.label}
                        </span>
                      </div>

                      {/* Quartier & Address */}
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black text-[#1B2A4A] flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: communeColor }} />
                            {item.quartier}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {item.commune}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate">
                          {item.address}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          📍 {item.landmark}
                        </p>
                      </div>

                      {/* Client & Technician Info */}
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="font-bold truncate max-w-[110px]">{item.clientName}</span>
                        </div>

                        <div className="flex items-center gap-1.5 font-mono font-bold text-[#1B2A4A]">
                          <DollarSign className="w-3 h-3 text-emerald-600" />
                          <span>{formatFCFA(item.grossAmount)}</span>
                        </div>
                      </div>

                      {/* Assigned Tech badge if any */}
                      {item.technicianName && (
                        <div className="flex items-center justify-between bg-slate-100/80 px-2.5 py-1 rounded-xl text-[10px] text-slate-600">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Tech : <strong>{item.technicianName}</strong>
                          </span>
                          <span className="font-mono text-slate-400">{item.technicianPhone}</span>
                        </div>
                      )}

                      {/* Live Action Controls on Selected Item */}
                      {isSelected && (
                        <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdvanceStatus(item.id);
                            }}
                            className="flex-1 py-1.5 bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition-colors"
                          >
                            <Play className="w-3 h-3 text-[#F59E0B]" />
                            Avancer Statut
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFocusIntervention(item);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#1B2A4A] font-bold text-[11px] rounded-xl flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            Zoom
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
