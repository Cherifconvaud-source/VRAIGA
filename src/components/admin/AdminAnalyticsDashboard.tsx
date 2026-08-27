import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Layers, 
  CheckCircle2, 
  PieChart as PieIcon, 
  Filter, 
  Download, 
  Sparkles,
  ArrowUpRight,
  Tv,
  SatelliteDish,
  Wind,
  ShieldCheck,
  CreditCard,
  Building
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Mission, CommuneAbidjan } from '../../types';
import { COMMUNES_ABIDJAN } from '../../data/initialData';
import { formatFCFA, formatPercent, formatDateTime } from '../../utils/formatters';

interface AdminAnalyticsDashboardProps {
  missions: Mission[];
  activeMission: Mission | null;
}

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

const SERVICE_COLORS: Record<string, string> = {
  'FIXATION_TV': '#3B82F6',
  'PARABOLE_TNT': '#F59E0B',
  'CLIMATISATION': '#06B6D4',
  'VIDEOSURVEILLANCE': '#8B5CF6',
};

const SERVICE_NAMES: Record<string, string> = {
  'FIXATION_TV': 'Fixation TV',
  'PARABOLE_TNT': 'Parabole / TNT',
  'CLIMATISATION': 'Climatisation',
  'VIDEOSURVEILLANCE': 'Vidéosurveillance',
};

export const AdminAnalyticsDashboard: React.FC<AdminAnalyticsDashboardProps> = ({ 
  missions, 
  activeMission 
}) => {
  const [timeRange, setTimeRange] = useState<'7D' | '14D' | '30D' | 'ALL'>('14D');
  const [selectedCommuneFilter, setSelectedCommuneFilter] = useState<string>('ALL');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('ALL');
  const [chartViewMode, setChartViewMode] = useState<'INTERVENTIONS' | 'REVENUE' | 'MIXED'>('MIXED');

  // Combine history + active mission if available
  const allMissions = useMemo(() => {
    const list = [...missions];
    if (activeMission && !list.some(m => m.id === activeMission.id)) {
      list.push(activeMission);
    }
    return list;
  }, [missions, activeMission]);

  // Filter missions by selected commune, service, and time range
  const filteredMissions = useMemo(() => {
    const now = new Date();
    let cutoffDate: Date | null = null;
    if (timeRange === '7D') {
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === '14D') {
      cutoffDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    } else if (timeRange === '30D') {
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return allMissions.filter(m => {
      // Date filter
      if (cutoffDate) {
        const missionDate = new Date(m.createdAt);
        if (missionDate < cutoffDate) return false;
      }
      // Commune filter
      if (selectedCommuneFilter !== 'ALL' && m.commune !== selectedCommuneFilter) {
        return false;
      }
      // Service filter
      if (selectedServiceFilter !== 'ALL') {
        const hasService = m.items.some(item => item.category === selectedServiceFilter);
        if (!hasService) return false;
      }
      return true;
    });
  }, [allMissions, timeRange, selectedCommuneFilter, selectedServiceFilter]);

  // Aggregate daily data for Recharts (Daily trend)
  const dailyData = useMemo(() => {
    const map = new Map<string, {
      date: string;
      rawDate: string;
      interventions: number;
      grossAmount: number;
      commissionAmount: number;
      netTechnician: number;
    }>();

    // Sort chronologically
    const sorted = [...filteredMissions].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sorted.forEach(m => {
      const d = new Date(m.createdAt);
      const dayKey = d.toISOString().split('T')[0];
      const formattedLabel = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

      if (!map.has(dayKey)) {
        map.set(dayKey, {
          date: formattedLabel,
          rawDate: dayKey,
          interventions: 0,
          grossAmount: 0,
          commissionAmount: 0,
          netTechnician: 0,
        });
      }

      const entry = map.get(dayKey)!;
      entry.interventions += 1;
      entry.grossAmount += m.grossAmount || 0;
      entry.commissionAmount += m.commissionAmount || 0;
      entry.netTechnician += m.technicianNetEarnings || 0;
    });

    return Array.from(map.values());
  }, [filteredMissions]);

  // Aggregate by Commune (All 11 Abidjan Communes)
  const communeData = useMemo(() => {
    const map = new Map<string, {
      commune: string;
      interventions: number;
      grossAmount: number;
      commissionAmount: number;
      fill: string;
    }>();

    // Initialize all Abidjan communes
    Object.keys(COMMUNES_ABIDJAN).forEach(c => {
      map.set(c, {
        commune: c,
        interventions: 0,
        grossAmount: 0,
        commissionAmount: 0,
        fill: COMMUNE_COLORS[c] || '#3B82F6',
      });
    });

    filteredMissions.forEach(m => {
      if (map.has(m.commune)) {
        const entry = map.get(m.commune)!;
        entry.interventions += 1;
        entry.grossAmount += m.grossAmount || 0;
        entry.commissionAmount += m.commissionAmount || 0;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.interventions - a.interventions);
  }, [filteredMissions]);

  // Commune Pie Data (Only communes with > 0 interventions for clean chart)
  const communePieData = useMemo(() => {
    return communeData.filter(c => c.interventions > 0);
  }, [communeData]);

  // Aggregate by Service Category
  const serviceData = useMemo(() => {
    const map = new Map<string, {
      category: string;
      name: string;
      count: number;
      grossRevenue: number;
      fill: string;
    }>();

    filteredMissions.forEach(m => {
      m.items.forEach(item => {
        const cat = item.category;
        if (!map.has(cat)) {
          map.set(cat, {
            category: cat,
            name: SERVICE_NAMES[cat] || cat,
            count: 0,
            grossRevenue: 0,
            fill: SERVICE_COLORS[cat] || '#3B82F6',
          });
        }
        const entry = map.get(cat)!;
        entry.count += item.quantity || 1;
        entry.grossRevenue += item.totalPrice || 0;
      });
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [filteredMissions]);

  // Payment Method breakdown
  const paymentMethodData = useMemo(() => {
    const map = new Map<string, { name: string; count: number; amount: number; color: string }>();
    const colors: Record<string, string> = {
      'WAVE': '#0EA5E9',
      'ORANGE_MONEY': '#F97316',
      'CASH': '#10B981',
      'MTN_MOMO': '#EAB308',
      'MOOV_MONEY': '#3B82F6',
    };
    const labels: Record<string, string> = {
      'WAVE': 'Wave CI',
      'ORANGE_MONEY': 'Orange Money',
      'CASH': 'Espèces (Cash)',
      'MTN_MOMO': 'MTN MoMo',
      'MOOV_MONEY': 'Moov Money',
    };

    filteredMissions.forEach(m => {
      const pm = m.paymentMethod || 'CASH';
      if (!map.has(pm)) {
        map.set(pm, {
          name: labels[pm] || pm,
          count: 0,
          amount: 0,
          color: colors[pm] || '#64748B',
        });
      }
      const entry = map.get(pm)!;
      entry.count += 1;
      entry.amount += m.grossAmount || 0;
    });

    return Array.from(map.values());
  }, [filteredMissions]);

  // Summary KPIs
  const totalInterventions = filteredMissions.length;
  const totalGrossAmount = filteredMissions.reduce((sum, m) => sum + (m.grossAmount || 0), 0);
  const totalCommissions = filteredMissions.reduce((sum, m) => sum + (m.commissionAmount || 0), 0);
  const averageTicket = totalInterventions > 0 ? Math.round(totalGrossAmount / totalInterventions) : 0;
  
  const topCommune = communeData.length > 0 && communeData[0].interventions > 0
    ? communeData[0]
    : null;

  const topService = serviceData.length > 0 && serviceData[0].count > 0
    ? serviceData[0]
    : null;

  // Custom Recharts Tooltips
  const CustomDailyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1B2A4A] text-white p-3 rounded-2xl shadow-xl border border-white/10 text-xs space-y-1.5 min-w-[200px]">
          <p className="font-bold text-amber-400 border-b border-white/10 pb-1 flex items-center justify-between">
            <span>📅 {label}</span>
            <span className="font-mono text-white text-[11px]">{data.rawDate}</span>
          </p>
          <div className="flex justify-between items-center text-slate-200">
            <span>Interventions :</span>
            <span className="font-bold text-emerald-400 font-mono text-sm">{data.interventions}</span>
          </div>
          <div className="flex justify-between items-center text-slate-200">
            <span>Volume Brut (CA) :</span>
            <span className="font-bold text-white font-mono">{formatFCFA(data.grossAmount)}</span>
          </div>
          <div className="flex justify-between items-center text-amber-300">
            <span>Commission Vraiga (17.5%) :</span>
            <span className="font-bold font-mono">{formatFCFA(data.commissionAmount)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-white/10 text-[10px]">
            <span>Net Techniciens :</span>
            <span className="font-mono">{formatFCFA(data.netTechnician)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomCommuneTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const totalAll = totalInterventions || 1;
      const pct = Math.round((data.interventions / totalAll) * 100);
      return (
        <div className="bg-[#1B2A4A] text-white p-3 rounded-2xl shadow-xl border border-white/10 text-xs space-y-1.5 min-w-[180px]">
          <p className="font-bold text-amber-400 border-b border-white/10 pb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Commune : {data.commune}</span>
          </p>
          <div className="flex justify-between items-center text-slate-200">
            <span>Interventions :</span>
            <span className="font-bold text-emerald-400 font-mono text-sm">{data.interventions} ({pct}%)</span>
          </div>
          <div className="flex justify-between items-center text-slate-200">
            <span>Chiffre d'Affaires :</span>
            <span className="font-bold text-white font-mono">{formatFCFA(data.grossAmount)}</span>
          </div>
          <div className="flex justify-between items-center text-amber-300">
            <span>Commissions :</span>
            <span className="font-bold font-mono">{formatFCFA(data.commissionAmount)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 md:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-[#F59E0B] flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-base text-[#1B2A4A]">Analytique des Interventions Abidjan</h2>
            <p className="text-xs text-slate-500">
              Graphiques dynamiques Recharts • Suivi journalier et ventilation par commune
            </p>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Pills */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200">
            {[
              { id: '7D', label: '7 jours' },
              { id: '14D', label: '14 jours' },
              { id: '30D', label: '30 jours' },
              { id: 'ALL', label: 'Tout' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeRange === tab.id 
                    ? 'bg-[#1B2A4A] text-white shadow-xs' 
                    : 'text-slate-600 hover:text-[#1B2A4A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Commune Filter Select */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-2xl border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedCommuneFilter}
              onChange={(e) => setSelectedCommuneFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#1B2A4A] focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">Toutes les communes ({Object.keys(COMMUNES_ABIDJAN).length})</option>
              {Object.keys(COMMUNES_ABIDJAN).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Service Filter Select */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-2xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedServiceFilter}
              onChange={(e) => setSelectedServiceFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#1B2A4A] focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">Tous les métiers</option>
              <option value="FIXATION_TV">Fixation TV</option>
              <option value="PARABOLE_TNT">Parabole / TNT</option>
              <option value="CLIMATISATION">Climatisation</option>
              <option value="VIDEOSURVEILLANCE">Vidéosurveillance</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Highlight Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Missions */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Interventions Réalisées</span>
            <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1B2A4A] font-mono">
            {totalInterventions}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            Sur la période sélectionnée ({timeRange})
          </p>
        </div>

        {/* Card 2: Chiffre d'Affaires Brut */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Volume Brut (CA Total)</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            {formatFCFA(totalGrossAmount)}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            Panier moyen : <strong className="text-[#1B2A4A]">{formatFCFA(averageTicket)}</strong>
          </p>
        </div>

        {/* Card 3: Commissions Vraiga 17.5% */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Commissions Vraiga (17.5%)</span>
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-[#F59E0B] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#F59E0B] font-mono">
            {formatFCFA(totalCommissions)}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            Revenu net plateforme
          </p>
        </div>

        {/* Card 4: Top Commune */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Commune N°1 (Volume)</span>
            <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1B2A4A] truncate">
            {topCommune ? topCommune.commune : 'Abidjan'}
          </div>
          <p className="text-[10px] text-purple-600 font-bold">
            {topCommune ? `${topCommune.interventions} missions (${formatFCFA(topCommune.grossAmount)})` : 'En attente'}
          </p>
        </div>
      </div>

      {/* MAIN CHART 1: ÉVOLUTION PAR JOUR (RECHARTS AREA/LINE/BAR) */}
      <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-sm md:text-base text-[#1B2A4A] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
              Évolution Quotidienne des Interventions & Revenus
            </h3>
            <p className="text-xs text-slate-500">
              Nombre de missions réalisées par jour et chiffre d'affaires généré à Abidjan
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setChartViewMode('MIXED')}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                chartViewMode === 'MIXED' ? 'bg-[#1B2A4A] text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Mixte (Volume + CA)
            </button>
            <button
              onClick={() => setChartViewMode('INTERVENTIONS')}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                chartViewMode === 'INTERVENTIONS' ? 'bg-[#1B2A4A] text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Volume Seul
            </button>
            <button
              onClick={() => setChartViewMode('REVENUE')}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                chartViewMode === 'REVENUE' ? 'bg-[#1B2A4A] text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              CA & Commissions
            </button>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-[320px] w-full pt-2">
          {dailyData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
              <Calendar className="w-8 h-8 text-slate-300" />
              <span>Aucune intervention enregistrée sur la plage temporelle sélectionnée.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartViewMode === 'MIXED' ? (
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInterventions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorCommissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: '#64748B' }} 
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: '#64748B' }} 
                    axisLine={{ stroke: '#CBD5E1' }}
                    allowDecimals={false}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10, fill: '#F59E0B' }} 
                    tickFormatter={(val) => `${Math.round(val / 1000)}k`}
                    axisLine={{ stroke: '#FDE68A' }}
                  />
                  <Tooltip content={<CustomDailyTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    formatter={(val) => <span className="text-xs font-bold text-slate-700">{val}</span>}
                  />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="interventions" 
                    name="Nombre d'Interventions" 
                    stroke="#3B82F6" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorInterventions)" 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="commissionAmount" 
                    name="Commissions Vraiga (FCFA)" 
                    stroke="#F59E0B" 
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#F59E0B', stroke: '#FFF', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              ) : chartViewMode === 'INTERVENTIONS' ? (
                <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: '#64748B' }} 
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748B' }} 
                    axisLine={{ stroke: '#CBD5E1' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomDailyTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    formatter={(val) => <span className="text-xs font-bold text-slate-700">{val}</span>}
                  />
                  <Bar 
                    dataKey="interventions" 
                    name="Nombre d'Interventions" 
                    fill="#3B82F6" 
                    radius={[8, 8, 0, 0]} 
                  />
                </BarChart>
              ) : (
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorCommissions2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: '#64748B' }} 
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#64748B' }} 
                    tickFormatter={(val) => `${Math.round(val / 1000)}k`}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <Tooltip content={<CustomDailyTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    formatter={(val) => <span className="text-xs font-bold text-slate-700">{val}</span>}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="grossAmount" 
                    name="Chiffre d'Affaires Brut (FCFA)" 
                    stroke="#10B981" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorGross)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="commissionAmount" 
                    name="Commissions 17.5% (FCFA)" 
                    stroke="#F59E0B" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorCommissions2)" 
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* GRID: CHARTS PAR COMMUNE D'ABIDJAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART 2: BAR CHART PAR COMMUNE (2 COLS) */}
        <div className="lg:col-span-2 bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm md:text-base text-[#1B2A4A] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F59E0B]" />
                Volume d'Interventions par Commune d'Abidjan
              </h3>
              <p className="text-xs text-slate-500">
                Classement des 11 communes selon l'activité et le chiffre d'affaires
              </p>
            </div>
            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-xl border border-blue-200">
              11 Communes Couvertes
            </span>
          </div>

          <div className="h-[320px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={communeData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 35, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 11, fill: '#64748B' }} 
                  allowDecimals={false}
                />
                <YAxis 
                  dataKey="commune" 
                  type="category" 
                  tick={{ fontSize: 11, fill: '#1B2A4A', fontWeight: 600 }}
                  width={80}
                />
                <Tooltip content={<CustomCommuneTooltip />} />
                <Bar 
                  dataKey="interventions" 
                  name="Nombre d'Interventions" 
                  radius={[0, 8, 8, 0]}
                >
                  {communeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COMMUNE_COLORS[entry.commune] || '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: DONUT REPARTITION PAR COMMUNE (1 COL) */}
        <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm md:text-base text-[#1B2A4A] flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#F59E0B]" />
              Parts de Marché par Commune
            </h3>
            <p className="text-xs text-slate-500">
              Répartition en pourcentage des demandes
            </p>
          </div>

          <div className="h-[220px] w-full relative">
            {communePieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Aucune intervention
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={communePieData}
                    dataKey="interventions"
                    nameKey="commune"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {communePieData.map((entry, index) => (
                      <Cell key={`pie-${index}`} fill={COMMUNE_COLORS[entry.commune] || '#3B82F6'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomCommuneTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {/* Center Label in Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-[#1B2A4A] font-mono">{totalInterventions}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Missions</span>
            </div>
          </div>

          {/* Mini Legend */}
          <div className="flex flex-wrap gap-1.5 justify-center max-h-24 overflow-y-auto pt-2 border-t border-slate-100">
            {communePieData.map(c => (
              <span
                key={c.commune}
                className="text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 bg-slate-100 text-slate-700"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: COMMUNE_COLORS[c.commune] || '#3B82F6' }}
                />
                {c.commune} ({c.interventions})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* SECONDARY ROW: METIERS & MOYENS DE PAIEMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Métiers / Categories Breakdown */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#1B2A4A] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#F59E0B]" />
              Répartition par Type de Prestation Métier
            </h3>
            <span className="text-xs text-slate-500 font-medium">Demandes clients</span>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#64748B' }} 
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748B' }} 
                  allowDecimals={false}
                />
                <Tooltip 
                  formatter={(value: any, name: any, item: any) => [
                    `${value} interventions (${formatFCFA(item.payload.grossRevenue)})`,
                    'Volume'
                  ]}
                />
                <Bar 
                  dataKey="count" 
                  name="Interventions" 
                  radius={[8, 8, 0, 0]}
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cat-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Moyens de Paiement Breakdown */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#1B2A4A] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#F59E0B]" />
              Moyens de Paiement Utilisés à Abidjan
            </h3>
            <span className="text-xs text-slate-500 font-medium">Wave, Orange Money, Cash</span>
          </div>

          <div className="space-y-3">
            {paymentMethodData.map(pm => {
              const pct = totalInterventions > 0 ? Math.round((pm.count / totalInterventions) * 100) : 0;
              return (
                <div key={pm.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pm.color }} />
                      {pm.name}
                    </span>
                    <span className="font-mono text-[#1B2A4A]">
                      {pm.count} missions ({pct}%) • {formatFCFA(pm.amount)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%`, backgroundColor: pm.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RECENT DETAILED INTERVENTIONS TABLE */}
      <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-sm md:text-base text-[#1B2A4A] flex items-center gap-2">
              <Building className="w-4 h-4 text-[#F59E0B]" />
              Journal Détaillé des Interventions Récentes
            </h3>
            <p className="text-xs text-slate-500">
              Historique complet synchronisé avec le tableau de bord
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
            {filteredMissions.length} missions affichées
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="p-3">Référence</th>
                <th className="p-3">Date</th>
                <th className="p-3">Commune & Adresse</th>
                <th className="p-3">Prestation</th>
                <th className="p-3">Technicien</th>
                <th className="p-3 text-right">Montant Brut</th>
                <th className="p-3 text-right">Commission (17.5%)</th>
                <th className="p-3 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    Aucune intervention trouvée pour ces critères de filtre.
                  </td>
                </tr>
              ) : (
                filteredMissions.slice(0, 15).map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#1B2A4A]">
                      {m.reference}
                    </td>
                    <td className="p-3 text-slate-500 whitespace-nowrap">
                      {formatDateTime(m.createdAt)}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-[#1B2A4A] flex items-center gap-1">
                        <span 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: COMMUNE_COLORS[m.commune] || '#3B82F6' }}
                        />
                        {m.commune}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[160px]">
                        {m.address}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="space-y-0.5">
                        {m.items.map((it, idx) => (
                          <span key={idx} className="block text-slate-700 font-medium truncate max-w-[180px]">
                            {it.name} {it.quantity > 1 ? `(x${it.quantity})` : ''}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 font-medium text-slate-700">
                      {m.technicianName || '—'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-[#1B2A4A] whitespace-nowrap">
                      {formatFCFA(m.grossAmount)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-[#F59E0B] whitespace-nowrap">
                      +{formatFCFA(m.commissionAmount)}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.status === 'COMPLETED' 
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.status === 'IN_PROGRESS' || m.status === 'ARRIVED' || m.status === 'ACCEPTED'
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : m.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {m.status === 'COMPLETED' ? 'Terminé' : m.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
