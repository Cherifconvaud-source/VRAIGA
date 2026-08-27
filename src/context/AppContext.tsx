import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Mission, 
  MissionStatus, 
  Technician, 
  DisputeTicket, 
  WalletTransaction, 
  UserWalletTransaction,
  CommuneAbidjan,
  CommunePricingPolicy,
  PaymentMethod,
  MissionCartItem,
  AppNotification,
  ServiceItem,
  TVSizeOption,
  UserProfile
} from '../types';
import { 
  INITIAL_TECHNICIANS, 
  INITIAL_DISPUTES, 
  INITIAL_TRANSACTIONS, 
  INITIAL_MISSIONS_HISTORY,
  COMMUNES_ABIDJAN,
  SERVICES_CATALOG,
  TV_SIZE_TIERS,
  DEFAULT_COMMUNE_PRICING,
  DEFAULT_USER_PROFILE,
  DEFAULT_USER_WALLET_TRANSACTIONS
} from '../data/initialData';
import { formatFCFA } from '../utils/formatters';

export type AppView = 'CLIENT' | 'TECHNICIAN' | 'ADMIN' | 'DUAL';

interface AppContextType {
  // Navigation & Simulation
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedTechId: string;
  setSelectedTechId: (id: string) => void;
  
  // User Profile & Virtual Wallet
  userProfile: UserProfile;
  updateUserProfile: (profileUpdate: Partial<UserProfile>) => void;
  rechargeUserWallet: (amount: number, method: PaymentMethod, phoneNumber?: string, operatorRef?: string) => Promise<{ success: boolean; transaction: UserWalletTransaction }>;
  debitUserWallet: (amount: number, description: string, missionRef?: string) => boolean;

  // Data State
  technicians: Technician[];
  activeMission: Mission | null;
  missionHistory: Mission[];
  disputes: DisputeTicket[];
  transactions: WalletTransaction[];
  services: ServiceItem[];
  tvSizeTiers: TVSizeOption[];
  communePricing: Record<CommuneAbidjan, CommunePricingPolicy>;

  // Price Calculation Helpers by Commune
  getServicePriceForCommune: (serviceId: string, commune: CommuneAbidjan) => number;
  getTvTierPriceForCommune: (tierId: string, commune: CommuneAbidjan) => number;

  // Visual Notifications & Toasts
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  currentToast: AppNotification | null;
  dismissToast: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  showCustomNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  
  // Services & Pricing Management (Admin)
  addService: (newService: Omit<ServiceItem, 'id'> & { id?: string }) => void;
  updateService: (serviceId: string, updatedFields: Partial<ServiceItem>) => void;
  toggleServiceActive: (serviceId: string) => void;
  deleteService: (serviceId: string) => void;
  updateTvSizeTierPrice: (tierId: string, newPrice: number) => void;
  addTvSizeTier: (tier: TVSizeOption) => void;
  deleteTvSizeTier: (tierId: string) => void;

  // Commune Pricing Management (Admin)
  updateCommunePricing: (commune: CommuneAbidjan, policyUpdate: Partial<CommunePricingPolicy>) => void;
  setCommuneServicePriceOverride: (commune: CommuneAbidjan, serviceId: string, price: number | null) => void;
  setCommuneTvTierPriceOverride: (commune: CommuneAbidjan, tierId: string, price: number | null) => void;
  resetCommunePricing: (commune?: CommuneAbidjan) => void;
  batchApplyCommunePricing: (communes: CommuneAbidjan[], surchargeFCFA: number, percentageMultiplier: number, note?: string) => void;

  // Client Actions
  createAndDispatchMission: (
    items: MissionCartItem[], 
    commune: CommuneAbidjan, 
    address: string, 
    landmark?: string, 
    clientName?: string, 
    clientPhone?: string,
    paymentMethod?: PaymentMethod,
    thirdPartyInfo?: {
      isForThirdParty: boolean;
      ordererName?: string;
      ordererPhone?: string;
      recipientName?: string;
      recipientPhone?: string;
      recipientRelationship?: import('../types').RecipientRelationship;
      recipientNotes?: string;
      payerType?: import('../types').PayerType;
    }
  ) => Promise<Mission | null>;
  cancelMission: (missionId: string, reason?: string, cancelledBy?: 'CLIENT' | 'TECHNICIAN' | 'ADMIN') => void;
  submitRating: (stars: number, tags: string[], comment?: string) => void;
  
  // Technician Actions
  toggleTechnicianStatus: (techId: string) => void;
  updateTechnicianCommune: (
    techId: string, 
    commune: CommuneAbidjan, 
    secondaryCommunes?: CommuneAbidjan[],
    radiusKm?: number
  ) => void;
  rechargeWallet: (techId: string, amount: number, method: PaymentMethod) => Promise<boolean>;
  respondToMissionOffer: (missionId: string, accept: boolean) => void;
  technicianMarkArrived: (missionId: string) => void;
  technicianStartJob: (missionId: string) => void;
  technicianCompleteJob: (missionId: string) => void;
  
  // Admin Actions
  toggleTechnicianKyc: (techId: string, field: 'cniValidated' | 'residenceCertValidated' | 'criminalRecordClean' | 'photoValidated') => void;
  setTechnicianKycStatus: (techId: string, status: 'VERIFIED' | 'PENDING' | 'REJECTED') => void;
  toggleCertification: (techId: string, certKey: 'paraboleTnt' | 'fixationTv' | 'climatisation' | 'videosurveillance') => void;
  resolveDispute: (disputeId: string, resolutionNote: string, refundAmount?: number) => void;
  resetDemoData: () => void;
  
  // Audio / Feedback
  playNotificationSound: (type: 'dispatch' | 'arrival' | 'complete' | 'alert') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('CLIENT');
  const [selectedTechId, setSelectedTechId] = useState<string>('TECH-001');
  
  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    const saved = localStorage.getItem('vraiga_techs');
    return saved ? JSON.parse(saved) : INITIAL_TECHNICIANS;
  });

  const [activeMission, setActiveMission] = useState<Mission | null>(() => {
    const saved = localStorage.getItem('vraiga_active_mission');
    return saved ? JSON.parse(saved) : null;
  });

  const [missionHistory, setMissionHistory] = useState<Mission[]>(() => {
    const saved = localStorage.getItem('vraiga_mission_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_MISSIONS_HISTORY;
  });

  const [disputes, setDisputes] = useState<DisputeTicket[]>(() => {
    const saved = localStorage.getItem('vraiga_disputes');
    return saved ? JSON.parse(saved) : INITIAL_DISPUTES;
  });

  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    const saved = localStorage.getItem('vraiga_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('vraiga_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      {
        id: 'NOTIF-INIT-1',
        type: 'INFO',
        title: 'Bienvenue sur Vraiga Abidjan',
        message: 'Commandez vos techniciens certifiés en direct avec suivi temps réel et notifications instantanées.',
        timestamp: new Date().toISOString(),
        read: false,
        badge: 'Info Vraiga'
      }
    ];
  });

  const [services, setServices] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem('vraiga_services');
    return saved ? JSON.parse(saved) : SERVICES_CATALOG;
  });

  const [tvSizeTiers, setTvSizeTiers] = useState<TVSizeOption[]>(() => {
    const saved = localStorage.getItem('vraiga_tv_tiers');
    return saved ? JSON.parse(saved) : TV_SIZE_TIERS;
  });

  const [communePricing, setCommunePricing] = useState<Record<CommuneAbidjan, CommunePricingPolicy>>(() => {
    const saved = localStorage.getItem('vraiga_commune_pricing');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.Cocody) {
          return { ...DEFAULT_COMMUNE_PRICING, ...parsed };
        }
      } catch {
        // fallback
      }
    }
    return DEFAULT_COMMUNE_PRICING;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('vraiga_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_USER_PROFILE,
            ...parsed,
            walletBalance: typeof parsed.walletBalance === 'number' ? parsed.walletBalance : DEFAULT_USER_PROFILE.walletBalance,
            walletTransactions: Array.isArray(parsed.walletTransactions) ? parsed.walletTransactions : (DEFAULT_USER_PROFILE.walletTransactions || DEFAULT_USER_WALLET_TRANSACTIONS),
          };
        }
      } catch {
        // fallback
      }
    }
    return DEFAULT_USER_PROFILE;
  });

  const [currentToast, setCurrentToast] = useState<AppNotification | null>(null);

  // Sync userProfile to localStorage
  useEffect(() => {
    localStorage.setItem('vraiga_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const updateUserProfile = useCallback((profileUpdate: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...profileUpdate };
      localStorage.setItem('vraiga_user_profile', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Audio tone generator
  const playNotificationSound = useCallback((type: 'dispatch' | 'arrival' | 'complete' | 'alert') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'dispatch') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'arrival') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'complete') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.12);
        osc.frequency.setValueAtTime(1046.5, now + 0.24); // C6
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(350, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {
      // Ignore audio block on strict browser policies
    }
  }, []);

  // Recharge User Virtual Wallet via Mobile Money
  const rechargeUserWallet = useCallback(async (
    amount: number, 
    method: PaymentMethod, 
    phoneNumber?: string,
    operatorRef?: string
  ): Promise<{ success: boolean; transaction: UserWalletTransaction }> => {
    // Simulate real Mobile Money API network latency
    await new Promise(r => setTimeout(r, 650));

    const methodLabels: Record<PaymentMethod, string> = {
      CASH: 'Espèces',
      WAVE: 'Wave CI',
      ORANGE_MONEY: 'Orange Money CI',
      MTN_MOMO: 'MTN Mobile Money',
      MOOV_MONEY: 'Moov Money (Flooz)',
      WALLET: 'Portefeuille Virtuel'
    };

    const newTxnRef = `REC-${method.slice(0, 3)}-${Math.floor(100000 + Math.random() * 900000)}`;
    const opRef = operatorRef || `${method.slice(0, 3)}-CI-${Date.now().toString().slice(-7)}`;

    let createdTxn: UserWalletTransaction | null = null;

    setUserProfile(prev => {
      const currentBal = typeof prev.walletBalance === 'number' ? prev.walletBalance : 0;
      const nextBal = currentBal + amount;
      const newTxn: UserWalletTransaction = {
        id: `UTXN-${Date.now()}`,
        userId: prev.id,
        type: 'RECHARGE',
        amount: amount,
        balanceAfter: nextBal,
        reference: newTxnRef,
        paymentMethod: method,
        phoneNumber: phoneNumber || prev.phone,
        description: `Rechargement portefeuille via ${methodLabels[method] || method}`,
        createdAt: new Date().toISOString(),
        status: 'SUCCESS',
        operatorRef: opRef,
      };
      createdTxn = newTxn;
      const currentTxns = prev.walletTransactions || [];
      const updated = {
        ...prev,
        walletBalance: nextBal,
        walletTransactions: [newTxn, ...currentTxns],
      };
      localStorage.setItem('vraiga_user_profile', JSON.stringify(updated));
      return updated;
    });

    const notif: AppNotification = {
      id: `NOTIF-REC-${Date.now()}`,
      type: 'INFO',
      title: '💳 Solde rechargé avec succès',
      message: `Votre portefeuille Vraiga Pro a été crédité de ${formatFCFA(amount)} via ${methodLabels[method]}.`,
      timestamp: new Date().toISOString(),
      read: false,
      badge: 'Solde +',
    };
    setNotifications(prev => [notif, ...prev]);
    setCurrentToast(notif);
    playNotificationSound('complete');

    return { success: true, transaction: createdTxn! };
  }, [playNotificationSound]);

  // Debit User Virtual Wallet for Service / Mission
  const debitUserWallet = useCallback((amount: number, description: string, missionRef?: string): boolean => {
    let success = false;
    setUserProfile(prev => {
      const currentBal = typeof prev.walletBalance === 'number' ? prev.walletBalance : 0;
      if (currentBal < amount) {
        return prev;
      }
      success = true;
      const nextBal = currentBal - amount;
      const newTxn: UserWalletTransaction = {
        id: `UTXN-${Date.now()}`,
        userId: prev.id,
        type: 'PAYMENT',
        amount: -amount,
        balanceAfter: nextBal,
        reference: missionRef ? `PAY-${missionRef}` : `PAY-VRG-${Math.floor(100000 + Math.random() * 900000)}`,
        paymentMethod: 'WALLET',
        phoneNumber: prev.phone,
        description: description || `Paiement prestation Vraiga Pro`,
        missionRef: missionRef,
        createdAt: new Date().toISOString(),
        status: 'SUCCESS',
        operatorRef: `SYS-DEBIT-${Date.now().toString().slice(-6)}`,
      };
      const currentTxns = prev.walletTransactions || [];
      const updated = {
        ...prev,
        walletBalance: nextBal,
        walletTransactions: [newTxn, ...currentTxns],
      };
      localStorage.setItem('vraiga_user_profile', JSON.stringify(updated));
      return updated;
    });
    return success;
  }, []);

  // Sync services, tv sizes & commune pricing to localStorage
  useEffect(() => {
    localStorage.setItem('vraiga_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('vraiga_tv_tiers', JSON.stringify(tvSizeTiers));
  }, [tvSizeTiers]);

  useEffect(() => {
    localStorage.setItem('vraiga_commune_pricing', JSON.stringify(communePricing));
  }, [communePricing]);

  // Helper to compute dynamic service price for a specific commune
  const getServicePriceForCommune = useCallback((serviceId: string, commune: CommuneAbidjan): number => {
    const policy = communePricing[commune] || DEFAULT_COMMUNE_PRICING[commune];
    const service = services.find(s => s.id === serviceId);
    const basePrice = service ? service.basePrice : 5000;

    // Check specific custom price override for this service in this commune
    if (policy?.customServicePrices && typeof policy.customServicePrices[serviceId] === 'number' && policy.customServicePrices[serviceId]! > 0) {
      return policy.customServicePrices[serviceId]!;
    }

    if (!policy) return basePrice;

    const multiplier = policy.percentageMultiplier || 1.0;
    const surcharge = policy.surchargeFCFA || 0;
    const computed = Math.round((basePrice * multiplier + surcharge) / 100) * 100;
    return computed;
  }, [communePricing, services]);

  // Helper to compute dynamic TV tier price for a specific commune
  const getTvTierPriceForCommune = useCallback((tierId: string, commune: CommuneAbidjan): number => {
    const policy = communePricing[commune] || DEFAULT_COMMUNE_PRICING[commune];
    const tier = tvSizeTiers.find(t => t.id === tierId) || TV_SIZE_TIERS.find(t => t.id === tierId);
    const basePrice = tier ? tier.price : 10000;

    // Check specific custom price override for this TV tier in this commune
    if (policy?.customTvTierPrices && typeof policy.customTvTierPrices[tierId] === 'number' && policy.customTvTierPrices[tierId]! > 0) {
      return policy.customTvTierPrices[tierId]!;
    }

    if (!policy) return basePrice;

    const multiplier = policy.percentageMultiplier || 1.0;
    const surcharge = policy.surchargeFCFA || 0;
    const computed = Math.round((basePrice * multiplier + surcharge) / 100) * 100;
    return computed;
  }, [communePricing, tvSizeTiers]);

  // Sync notifications to localStorage
  useEffect(() => {
    localStorage.setItem('vraiga_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Unread count
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Toast handlers
  const dismissToast = useCallback(() => {
    setCurrentToast(null);
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showCustomNotification = useCallback((notifData: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notifData,
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
    setCurrentToast(newNotif);
  }, []);

  // Local storage sync
  useEffect(() => {
    localStorage.setItem('vraiga_techs', JSON.stringify(technicians));
  }, [technicians]);

  useEffect(() => {
    localStorage.setItem('vraiga_active_mission', JSON.stringify(activeMission));
  }, [activeMission]);

  useEffect(() => {
    localStorage.setItem('vraiga_mission_history', JSON.stringify(missionHistory));
  }, [missionHistory]);

  useEffect(() => {
    localStorage.setItem('vraiga_disputes', JSON.stringify(disputes));
  }, [disputes]);

  useEffect(() => {
    localStorage.setItem('vraiga_transactions', JSON.stringify(transactions));
  }, [transactions]);



  // Technician status toggle
  const toggleTechnicianStatus = useCallback((techId: string) => {
    setTechnicians(prev => prev.map(t => {
      if (t.id === techId) {
        const nextStatus = t.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  }, []);

  // Update technician's chosen intervention commune & secondary zones
  const updateTechnicianCommune = useCallback((
    techId: string, 
    commune: CommuneAbidjan, 
    secondaryCommunes: CommuneAbidjan[] = [],
    radiusKm: number = 10
  ) => {
    const communeData = COMMUNES_ABIDJAN[commune];
    setTechnicians(prev => prev.map(t => {
      if (t.id === techId) {
        return {
          ...t,
          commune,
          secondaryCommunes,
          interventionRadiusKm: radiusKm,
          coordinates: {
            lat: communeData ? communeData.lat + (Math.random() - 0.5) * 0.006 : t.coordinates.lat,
            lng: communeData ? communeData.lng + (Math.random() - 0.5) * 0.006 : t.coordinates.lng,
          }
        };
      }
      return t;
    }));

    showCustomNotification({
      type: 'SUCCESS',
      title: 'Zone d\'intervention mise à jour',
      message: `Votre commune principale est maintenant ${commune}${secondaryCommunes.length > 0 ? ` (+${secondaryCommunes.length} zones secondaires)` : ''}.`,
      badge: 'Zone GPS'
    });
  }, [showCustomNotification]);

  // Skill Pairing rule: ticking Parabole/TNT automatically enables Fixation TV
  const toggleCertification = useCallback((techId: string, certKey: 'paraboleTnt' | 'fixationTv' | 'climatisation' | 'videosurveillance') => {
    setTechnicians(prev => prev.map(t => {
      if (t.id !== techId) return t;

      const updatedCerts = { ...t.certifications };
      
      if (certKey === 'paraboleTnt') {
        const nextParabole = !updatedCerts.paraboleTnt;
        updatedCerts.paraboleTnt = nextParabole;
        // SKILL PAIRING RULE ENFORCEMENT:
        if (nextParabole) {
          // If Parabole is granted, Fixation TV is automatically unlocked/enabled
          updatedCerts.fixationTv = true;
        } else {
          // If Parabole is revoked, Fixation TV is disabled too by rule
          updatedCerts.fixationTv = false;
        }
      } else if (certKey === 'fixationTv') {
        // Can only manually toggle if Parabole is already true
        if (updatedCerts.paraboleTnt) {
          updatedCerts.fixationTv = !updatedCerts.fixationTv;
        } else {
          // If trying to activate Fixation TV while Parabole is false,
          // automatically activate Parabole as well per business rule!
          updatedCerts.paraboleTnt = true;
          updatedCerts.fixationTv = true;
        }
      } else {
        updatedCerts[certKey] = !updatedCerts[certKey];
      }

      return {
        ...t,
        certifications: updatedCerts,
      };
    }));
  }, []);

  // KYC validation
  const toggleTechnicianKyc = useCallback((techId: string, field: 'cniValidated' | 'residenceCertValidated' | 'criminalRecordClean' | 'photoValidated') => {
    setTechnicians(prev => prev.map(t => {
      if (t.id !== techId) return t;
      const updatedKyc = {
        ...t.kyc,
        [field]: !t.kyc[field],
      };
      
      // Auto-evaluate KYC status
      const allDone = updatedKyc.cniValidated && updatedKyc.residenceCertValidated && updatedKyc.criminalRecordClean && updatedKyc.photoValidated;
      updatedKyc.status = allDone ? 'VERIFIED' : 'PENDING';

      return {
        ...t,
        kyc: updatedKyc,
      };
    }));
  }, []);

  const setTechnicianKycStatus = useCallback((techId: string, status: 'VERIFIED' | 'PENDING' | 'REJECTED') => {
    setTechnicians(prev => prev.map(t => {
      if (t.id === techId) {
        return {
          ...t,
          kyc: { ...t.kyc, status }
        };
      }
      return t;
    }));
  }, []);

  // Wallet recharge
  const rechargeWallet = useCallback(async (techId: string, amount: number, method: PaymentMethod): Promise<boolean> => {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 600));

    let updatedBalance = 0;
    let techName = '';

    setTechnicians(prev => prev.map(t => {
      if (t.id === techId) {
        updatedBalance = t.walletBalance + amount;
        techName = t.name;
        return {
          ...t,
          walletBalance: updatedBalance,
        };
      }
      return t;
    }));

    const methodLabels: Record<PaymentMethod, string> = {
      CASH: 'Espèces (Cash)',
      WAVE: 'Wave CI',
      ORANGE_MONEY: 'Orange Money CI',
      MTN_MOMO: 'MTN Mobile Money',
      MOOV_MONEY: 'Moov Money',
      WALLET: 'Portefeuille Virtuel',
    };

    const newTxn: WalletTransaction = {
      id: `TXN-${Date.now().toString().slice(-6)}`,
      technicianId: techId,
      type: 'RECHARGE',
      amount: amount,
      balanceAfter: updatedBalance,
      reference: `REC-${method.slice(0, 3)}-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentMethod: method,
      description: `Recharge portefeuille via ${methodLabels[method]} (+${amount} FCFA)`,
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [newTxn, ...prev]);
    playNotificationSound('complete');
    return true;
  }, [playNotificationSound]);

  // Client creates & dispatches mission
  const createAndDispatchMission = useCallback(async (
    items: MissionCartItem[], 
    commune: CommuneAbidjan, 
    address: string, 
    landmark: string = '',
    clientName: string = 'Client Abidjan',
    clientPhone: string = '+225 07 88 99 00 11',
    paymentMethod: PaymentMethod = 'CASH',
    thirdPartyInfo?: {
      isForThirdParty: boolean;
      ordererName?: string;
      ordererPhone?: string;
      recipientName?: string;
      recipientPhone?: string;
      recipientRelationship?: import('../types').RecipientRelationship;
      recipientNotes?: string;
      payerType?: import('../types').PayerType;
    }
  ): Promise<Mission | null> => {
    const gross = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const commissionRate = 0.175; // 17.5%
    const commissionAmount = Math.round(gross * commissionRate);
    const netEarnings = gross - commissionAmount;

    const communeData = COMMUNES_ABIDJAN[commune];
    // Slightly jitter coordinates for realism around the commune center
    const clientLat = communeData.lat + (Math.random() - 0.5) * 0.01;
    const clientLng = communeData.lng + (Math.random() - 0.5) * 0.01;

    // Check required certifications based on cart
    const requiresParabole = items.some(i => i.category === 'PARABOLE_TNT' || i.category === 'FIXATION_TV');
    const requiresClim = items.some(i => i.category === 'CLIMATISATION');
    const requiresCctv = items.some(i => i.category === 'VIDEOSURVEILLANCE');

    // Find eligible technician
    // Preference: ONLINE, KYC VERIFIED, adequate wallet balance for commission, certified for requested services
    const eligibleTechs = technicians.filter(t => {
      if (t.status !== 'ONLINE') return false;
      if (requiresParabole && !t.certifications.paraboleTnt) return false;
      if (requiresClim && !t.certifications.climatisation) return false;
      if (requiresCctv && !t.certifications.videosurveillance) return false;
      return true;
    });

    // Pick technician who matches chosen commune (primary or secondary)
    const matchingTech = eligibleTechs.find(t => 
      t.commune === commune || (t.secondaryCommunes && t.secondaryCommunes.includes(commune))
    );
    const assignedTech = matchingTech || (eligibleTechs.length > 0 ? eligibleTechs[0] : technicians[0]);

    const missionRef = `VRG-${Math.floor(1000 + Math.random() * 9000)}`;

    const isThirdParty = !!thirdPartyInfo?.isForThirdParty;
    const finalClientName = isThirdParty && thirdPartyInfo?.recipientName 
      ? `${thirdPartyInfo.recipientName} (Pour un proche)` 
      : clientName;
    const finalClientPhone = isThirdParty && thirdPartyInfo?.recipientPhone 
      ? thirdPartyInfo.recipientPhone 
      : clientPhone;

    const newMission: Mission = {
      id: `MIS-${Date.now()}`,
      reference: missionRef,
      clientName: finalClientName,
      clientPhone: finalClientPhone,
      isForThirdParty: isThirdParty,
      ordererName: thirdPartyInfo?.ordererName || clientName,
      ordererPhone: thirdPartyInfo?.ordererPhone || clientPhone,
      recipientName: thirdPartyInfo?.recipientName,
      recipientPhone: thirdPartyInfo?.recipientPhone,
      recipientRelationship: thirdPartyInfo?.recipientRelationship,
      recipientNotes: thirdPartyInfo?.recipientNotes,
      payerType: thirdPartyInfo?.payerType || 'RECIPIENT_ON_SITE',
      commune,
      address: address || `${communeData.neighborhoods[0]}, ${commune}`,
      landmark: landmark || communeData.popularLandmarks[0],
      coordinates: {
        lat: clientLat,
        lng: clientLng,
      },
      items,
      grossAmount: gross,
      commissionRate,
      commissionAmount,
      technicianNetEarnings: netEarnings,
      status: 'SEARCHING',
      technicianId: assignedTech.id,
      technicianName: assignedTech.name,
      technicianPhone: assignedTech.phone,
      technicianPhoto: assignedTech.photo,
      technicianRating: assignedTech.rating,
      technicianVehicle: assignedTech.vehicle,
      technicianCoordinates: {
        lat: assignedTech.coordinates.lat,
        lng: assignedTech.coordinates.lng,
      },
      paymentMethod: paymentMethod || 'CASH',
      createdAt: new Date().toISOString(),
    };

    // If client pays using their virtual wallet solde, debit wallet immediately
    if (paymentMethod === 'WALLET') {
      debitUserWallet(
        gross,
        `Paiement commande ${missionRef} (${items.map(i => i.name).join(', ')})`,
        missionRef
      );
    }

    setActiveMission(newMission);
    playNotificationSound('dispatch');

    // Radar simulation: 4 seconds search phase, then transition to OFFERED / ACCEPTED
    await new Promise(r => setTimeout(r, 4000));

    setActiveMission(prev => {
      if (!prev || prev.id !== newMission.id) return prev;
      return {
        ...prev,
        status: 'OFFERED',
      };
    });

    return newMission;
  }, [technicians, playNotificationSound]);

  // Technician responds to incoming mission
  const respondToMissionOffer = useCallback((missionId: string, accept: boolean) => {
    if (accept) {
      let acceptedMission: Mission | null = null;
      setActiveMission(prev => {
        if (!prev || prev.id !== missionId) return prev;
        const updated: Mission = {
          ...prev,
          status: 'ACCEPTED',
          acceptedAt: new Date().toISOString(),
        };
        acceptedMission = updated;
        return updated;
      });

      if (acceptedMission) {
        const m = acceptedMission as Mission;
        const recipientText = m.isForThirdParty && m.recipientName ? ` pour ${m.recipientName}` : '';
        const newNotif: AppNotification = {
          id: `NOTIF-ACC-${Date.now()}`,
          type: 'MISSION_ACCEPTED',
          title: m.isForThirdParty ? '🎉 Demande Acceptée (Pour votre proche) !' : '🎉 Demande Acceptée !',
          message: `${m.technicianName || 'Votre technicien'} a accepté la demande${recipientText} et fait route vers l'adresse à ${m.commune}.`,
          timestamp: new Date().toISOString(),
          read: false,
          missionId: m.id,
          missionRef: m.reference,
          technicianName: m.technicianName,
          technicianPhoto: m.technicianPhoto,
          technicianPhone: m.technicianPhone,
          commune: m.commune,
          badge: 'En route 🛵',
        };
        setNotifications(prev => [newNotif, ...prev]);
        setCurrentToast(newNotif);
      }

      playNotificationSound('dispatch');
    } else {
      setActiveMission(prev => {
        if (!prev || prev.id !== missionId) return prev;
        return {
          ...prev,
          status: 'CANCELLED',
        };
      });
    }
  }, [playNotificationSound]);

  // Step 1: Technician Arrived
  const technicianMarkArrived = useCallback((missionId: string) => {
    let arrivedMission: Mission | null = null;
    setActiveMission(prev => {
      if (!prev || prev.id !== missionId) return prev;
      // Also snap technician coordinates to client coordinates
      const updated: Mission = {
        ...prev,
        status: 'ARRIVED',
        arrivedAt: new Date().toISOString(),
        technicianCoordinates: {
          lat: prev.coordinates.lat + 0.0002,
          lng: prev.coordinates.lng + 0.0002,
        }
      };
      arrivedMission = updated;
      return updated;
    });

    if (arrivedMission) {
      const m = arrivedMission as Mission;
      const arrivalMsg = m.isForThirdParty && m.recipientName
        ? `${m.technicianName || 'Le technicien'} est arrivé à l'adresse de ${m.recipientName} (${m.address || m.commune}). Contact sur place : ${m.recipientPhone || m.clientPhone}.`
        : `${m.technicianName || 'Le technicien'} est arrivé devant votre domicile (${m.address || m.commune}).`;
      const newNotif: AppNotification = {
        id: `NOTIF-ARR-${Date.now()}`,
        type: 'TECHNICIAN_ARRIVED',
        title: m.isForThirdParty ? '📍 Technicien sur place chez votre proche !' : '📍 Arrivée Imminente / Technicien sur place !',
        message: arrivalMsg,
        timestamp: new Date().toISOString(),
        read: false,
        missionId: m.id,
        missionRef: m.reference,
        technicianName: m.technicianName,
        technicianPhoto: m.technicianPhoto,
        technicianPhone: m.technicianPhone,
        commune: m.commune,
        badge: 'Sur place 📍',
      };
      setNotifications(prev => [newNotif, ...prev]);
      setCurrentToast(newNotif);
    }

    playNotificationSound('arrival');
  }, [playNotificationSound]);

  // Step 2: Start job
  const technicianStartJob = useCallback((missionId: string) => {
    let startedMission: Mission | null = null;
    setActiveMission(prev => {
      if (!prev || prev.id !== missionId) return prev;
      const updated: Mission = {
        ...prev,
        status: 'IN_PROGRESS',
        startedAt: new Date().toISOString(),
      };
      startedMission = updated;
      return updated;
    });

    if (startedMission) {
      const m = startedMission as Mission;
      const newNotif: AppNotification = {
        id: `NOTIF-PROG-${Date.now()}`,
        type: 'MISSION_IN_PROGRESS',
        title: '🛠️ Prestation en cours',
        message: `${m.technicianName || 'Le technicien'} a commencé l\'installation sur vos équipements.`,
        timestamp: new Date().toISOString(),
        read: false,
        missionId: m.id,
        missionRef: m.reference,
        badge: 'En cours 🛠️',
      };
      setNotifications(prev => [newNotif, ...prev]);
      setCurrentToast(newNotif);
    }
  }, []);

  // Step 3: Complete job & Auto-deduct 17.5% from wallet
  const technicianCompleteJob = useCallback((missionId: string) => {
    let completedMission: Mission | null = null;

    setActiveMission(prev => {
      if (!prev || prev.id !== missionId) return prev;
      const updated: Mission = {
        ...prev,
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
      };
      completedMission = updated;
      return updated;
    });

    if (completedMission) {
      const mission = completedMission as Mission;
      const techId = mission.technicianId || 'TECH-001';
      const commissionToDeduct = mission.commissionAmount;

      // Deduct from technician's wallet
      let finalBalance = 0;
      setTechnicians(prev => prev.map(t => {
        if (t.id === techId) {
          finalBalance = t.walletBalance - commissionToDeduct;
          return {
            ...t,
            walletBalance: finalBalance,
            completedMissionsCount: t.completedMissionsCount + 1,
          };
        }
        return t;
      }));

      // Log wallet transaction
      const newTxn: WalletTransaction = {
        id: `TXN-${Date.now().toString().slice(-6)}`,
        technicianId: techId,
        type: 'COMMISSION_DEDUCTION',
        amount: -commissionToDeduct,
        balanceAfter: finalBalance,
        reference: `COM-VRG-${mission.reference}`,
        missionId: mission.id,
        description: `Prélèvement commission Vraiga 17.5% (${mission.reference})`,
        createdAt: new Date().toISOString(),
      };

      setTransactions(prev => [newTxn, ...prev]);
      setMissionHistory(prev => [mission, ...prev]);

      // Client Notification on completion
      const newNotif: AppNotification = {
        id: `NOTIF-COMP-${Date.now()}`,
        type: 'MISSION_COMPLETED',
        title: '✨ Intervention Finalisée !',
        message: `Votre intervention ${mission.reference} est terminée. N'hésitez pas à laisser votre avis.`,
        timestamp: new Date().toISOString(),
        read: false,
        missionId: mission.id,
        missionRef: mission.reference,
        badge: 'Terminé ✨',
      };
      setNotifications(prev => [newNotif, ...prev]);
      setCurrentToast(newNotif);

      playNotificationSound('complete');
    }
  }, [playNotificationSound]);

  // Cancel mission
  const cancelMission = useCallback((missionId: string, reason?: string, cancelledBy: 'CLIENT' | 'TECHNICIAN' | 'ADMIN' = 'CLIENT') => {
    let cancelledMission: Mission | null = null;

    setActiveMission(prev => {
      if (prev?.id === missionId) {
        cancelledMission = {
          ...prev,
          status: 'CANCELLED',
          cancelledAt: new Date().toISOString(),
          cancelReason: reason || (cancelledBy === 'CLIENT' ? 'Annulé à la demande du client' : 'Annulé par le technicien'),
          cancelledBy,
        };
        return null;
      }
      return prev;
    });

    if (cancelledMission) {
      const m = cancelledMission as Mission;
      // Archive into mission history
      setMissionHistory(prev => [m, ...prev.filter(item => item.id !== m.id)]);

      // If cancelled mission was paid with virtual wallet, automatically refund the user balance
      if (m.paymentMethod === 'WALLET') {
        setUserProfile(prev => {
          const nextBal = (prev.walletBalance || 0) + m.grossAmount;
          const refundTxn: UserWalletTransaction = {
            id: `UTXN-${Date.now()}`,
            userId: prev.id,
            type: 'REFUND',
            amount: m.grossAmount,
            balanceAfter: nextBal,
            reference: `REF-${m.reference}`,
            paymentMethod: 'WALLET',
            phoneNumber: prev.phone,
            description: `Remboursement suite à annulation (${m.reference})`,
            missionRef: m.reference,
            createdAt: new Date().toISOString(),
            status: 'SUCCESS',
            operatorRef: `SYS-REFUND-${Date.now().toString().slice(-6)}`,
          };
          const updated = {
            ...prev,
            walletBalance: nextBal,
            walletTransactions: [refundTxn, ...(prev.walletTransactions || [])]
          };
          localStorage.setItem('vraiga_user_profile', JSON.stringify(updated));
          return updated;
        });
      }

      // Create notification
      const actorLabel = cancelledBy === 'CLIENT' ? 'par le client' : cancelledBy === 'TECHNICIAN' ? 'par le technicien' : 'par le support';
      const newNotif: AppNotification = {
        id: `NOTIF-CAN-${Date.now()}`,
        type: 'MISSION_CANCELLED',
        title: '🚫 Prestation Annulée',
        message: `La commande ${m.reference} (${m.commune}) a été annulée ${actorLabel}.${m.paymentMethod === 'WALLET' ? ` Remboursement automatique de ${formatFCFA(m.grossAmount)} sur votre portefeuille.` : ''}${reason ? ` Motif : ${reason}` : ''}`,
        timestamp: new Date().toISOString(),
        read: false,
        missionId: m.id,
        missionRef: m.reference,
        commune: m.commune,
        badge: 'Annulée 🚫',
      };
      setNotifications(prev => [newNotif, ...prev]);
      setCurrentToast(newNotif);

      playNotificationSound('alert');
    }
  }, [playNotificationSound]);

  // Rating and Auto-Dispute Trigger
  const submitRating = useCallback((stars: number, tags: string[], comment?: string) => {
    if (!activeMission) return;

    const ratingData = {
      stars,
      tags,
      comment,
      createdAt: new Date().toISOString(),
    };

    const isLowRating = stars <= 2;

    const ratedMission: Mission = {
      ...activeMission,
      rating: ratingData,
      hasDispute: isLowRating,
    };

    setActiveMission(ratedMission);
    setMissionHistory(prev => [ratedMission, ...prev.filter(m => m.id !== ratedMission.id)]);

    // Update technician rating average
    if (activeMission.technicianId) {
      setTechnicians(prev => prev.map(t => {
        if (t.id === activeMission.technicianId) {
          const newCount = t.reviewCount + 1;
          const newAvg = Number(((t.rating * t.reviewCount + stars) / newCount).toFixed(2));
          return {
            ...t,
            rating: newAvg,
            reviewCount: newCount,
          };
        }
        return t;
      }));
    }

    // AUTOMATIC DISPUTE TRIGGER IF RATING IS 1 OR 2 STARS
    if (isLowRating) {
      const newDispute: DisputeTicket = {
        id: `DISP-${Date.now().toString().slice(-5)}`,
        reference: `LIT-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
        missionId: activeMission.id,
        clientName: activeMission.clientName,
        clientPhone: activeMission.clientPhone,
        technicianId: activeMission.technicianId || 'TECH-001',
        technicianName: activeMission.technicianName || 'Technicien Vraiga',
        stars,
        tags,
        clientComment: comment || 'Note insatisfaisante attribuée par le client',
        reason: `Alerte automatique : Note de ${stars}/5 reçue sur l'intervention ${activeMission.reference}`,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      };

      setDisputes(prev => [newDispute, ...prev]);
      playNotificationSound('alert');
    }
  }, [activeMission, playNotificationSound]);

  // Admin resolves dispute
  const resolveDispute = useCallback((disputeId: string, resolutionNote: string, refundAmount?: number) => {
    setDisputes(prev => prev.map(d => {
      if (d.id === disputeId) {
        return {
          ...d,
          status: refundAmount && refundAmount > 0 ? 'REFUNDED' : 'RESOLVED',
          resolutionNote,
          refundAmount,
          resolvedAt: new Date().toISOString(),
        };
      }
      return d;
    }));
  }, []);

  // Services & Pricing Management Handlers
  const addService = useCallback((newServiceData: Omit<ServiceItem, 'id'> & { id?: string }) => {
    const serviceId = newServiceData.id || `SERV_${Date.now()}`;
    const service: ServiceItem = {
      ...newServiceData,
      id: serviceId,
      badge: newServiceData.badge || `${newServiceData.basePrice.toLocaleString()} FCFA`,
      priceDescription: newServiceData.priceDescription || `${newServiceData.basePrice.toLocaleString()} FCFA / intervention`,
      isActive: newServiceData.isActive !== false,
    };

    setServices(prev => [...prev, service]);

    showCustomNotification({
      type: 'INFO',
      title: '✨ Nouveau service ajouté',
      message: `La prestation "${service.name}" a été intégrée au catalogue Vraiga (${service.basePrice.toLocaleString()} FCFA).`,
      badge: 'Admin Catalogue',
    });
  }, [showCustomNotification]);

  const updateService = useCallback((serviceId: string, updatedFields: Partial<ServiceItem>) => {
    setServices(prev => prev.map(s => {
      if (s.id === serviceId) {
        const updated = { ...s, ...updatedFields };
        if (updatedFields.basePrice !== undefined && !updatedFields.badge) {
          updated.badge = updated.isUnitBased 
            ? `${updatedFields.basePrice.toLocaleString()} FCFA / ${updated.unitLabel || 'unité'}`
            : `${updatedFields.basePrice.toLocaleString()} FCFA`;
        }
        if (updatedFields.basePrice !== undefined && !updatedFields.priceDescription) {
          updated.priceDescription = updated.isUnitBased
            ? `${updatedFields.basePrice.toLocaleString()} FCFA par ${updated.unitLabel || 'appareil'}`
            : `${updatedFields.basePrice.toLocaleString()} FCFA / intervention`;
        }
        return updated;
      }
      return s;
    }));

    showCustomNotification({
      type: 'INFO',
      title: ' Tarif / Prestation mis à jour',
      message: `Les modifications de la prestation ${serviceId} ont été appliquées avec succès.`,
      badge: 'Admin Tarif',
    });
  }, [showCustomNotification]);

  const toggleServiceActive = useCallback((serviceId: string) => {
    setServices(prev => prev.map(s => {
      if (s.id === serviceId) {
        const newActive = s.isActive === false ? true : false;
        return { ...s, isActive: newActive };
      }
      return s;
    }));
  }, []);

  const deleteService = useCallback((serviceId: string) => {
    setServices(prev => prev.filter(s => s.id !== serviceId));
    showCustomNotification({
      type: 'ALERT',
      title: '🗑️ Prestation retirée',
      message: `Le service ${serviceId} a été retiré du catalogue actif.`,
      badge: 'Admin Catalogue',
    });
  }, [showCustomNotification]);

  const updateTvSizeTierPrice = useCallback((tierId: string, newPrice: number) => {
    setTvSizeTiers(prev => prev.map(t => {
      if (t.id === tierId) {
        return { ...t, price: newPrice };
      }
      return t;
    }));

    showCustomNotification({
      type: 'INFO',
      title: ' Grille TV actualisée',
      message: `Le tarif pour la diagonale "${tierId}" est désormais de ${newPrice.toLocaleString()} FCFA.`,
      badge: 'Admin Tarif TV',
    });
  }, [showCustomNotification]);

  const addTvSizeTier = useCallback((tier: TVSizeOption) => {
    setTvSizeTiers(prev => [...prev, tier]);
  }, []);

  const deleteTvSizeTier = useCallback((tierId: string) => {
    setTvSizeTiers(prev => prev.filter(t => t.id !== tierId));
  }, []);

  // Commune Pricing Management (Admin)
  const updateCommunePricing = useCallback((commune: CommuneAbidjan, policyUpdate: Partial<CommunePricingPolicy>) => {
    setCommunePricing(prev => {
      const current = prev[commune] || DEFAULT_COMMUNE_PRICING[commune];
      const updated: CommunePricingPolicy = {
        ...current,
        ...policyUpdate,
        isCustomized: true,
      };
      return {
        ...prev,
        [commune]: updated,
      };
    });

    showCustomNotification({
      type: 'INFO',
      title: `📍 Grille ${commune} mise à jour`,
      message: `La politique tarifaire pour la commune de ${commune} a été enregistrée.`,
      badge: 'Admin Tarifs Commune',
    });
  }, [showCustomNotification]);

  const setCommuneServicePriceOverride = useCallback((commune: CommuneAbidjan, serviceId: string, price: number | null) => {
    setCommunePricing(prev => {
      const current = prev[commune] || DEFAULT_COMMUNE_PRICING[commune];
      const customServicePrices = { ...(current.customServicePrices || {}) };
      if (price === null || price <= 0) {
        delete customServicePrices[serviceId];
      } else {
        customServicePrices[serviceId] = price;
      }
      return {
        ...prev,
        [commune]: {
          ...current,
          customServicePrices,
          isCustomized: true,
        }
      };
    });
  }, []);

  const setCommuneTvTierPriceOverride = useCallback((commune: CommuneAbidjan, tierId: string, price: number | null) => {
    setCommunePricing(prev => {
      const current = prev[commune] || DEFAULT_COMMUNE_PRICING[commune];
      const customTvTierPrices = { ...(current.customTvTierPrices || {}) };
      if (price === null || price <= 0) {
        delete customTvTierPrices[tierId];
      } else {
        customTvTierPrices[tierId] = price;
      }
      return {
        ...prev,
        [commune]: {
          ...current,
          customTvTierPrices,
          isCustomized: true,
        }
      };
    });
  }, []);

  const resetCommunePricing = useCallback((commune?: CommuneAbidjan) => {
    if (commune) {
      setCommunePricing(prev => ({
        ...prev,
        [commune]: DEFAULT_COMMUNE_PRICING[commune],
      }));
      showCustomNotification({
        type: 'INFO',
        title: `Tarifs réinitialisés : ${commune}`,
        message: `Les tarifs pour ${commune} ont été réinitialisés aux valeurs standards.`,
        badge: 'Admin Tarifs',
      });
    } else {
      setCommunePricing(DEFAULT_COMMUNE_PRICING);
      localStorage.removeItem('vraiga_commune_pricing');
      showCustomNotification({
        type: 'INFO',
        title: 'Grille tarifaire réinitialisée',
        message: 'Toutes les communes ont été réinitialisées aux tarifs standards par défaut.',
        badge: 'Admin Tarifs',
      });
    }
  }, [showCustomNotification]);

  const batchApplyCommunePricing = useCallback((communes: CommuneAbidjan[], surchargeFCFA: number, percentageMultiplier: number, note?: string) => {
    setCommunePricing(prev => {
      const next = { ...prev };
      communes.forEach(c => {
        const current = next[c] || DEFAULT_COMMUNE_PRICING[c];
        next[c] = {
          ...current,
          surchargeFCFA,
          percentageMultiplier,
          note: note !== undefined ? note : current.note,
          isCustomized: surchargeFCFA > 0 || percentageMultiplier !== 1.0,
        };
      });
      return next;
    });

    showCustomNotification({
      type: 'SUCCESS',
      title: '⚡ Ajustement groupé appliqué',
      message: `La règle tarifaire (+${surchargeFCFA.toLocaleString()} FCFA / ${(percentageMultiplier * 100).toFixed(0)}%) a été appliquée à ${communes.length} communes.`,
      badge: 'Admin Tarifs',
    });
  }, [showCustomNotification]);

  // Reset to initial demo data
  const resetDemoData = useCallback(() => {
    localStorage.removeItem('vraiga_techs');
    localStorage.removeItem('vraiga_active_mission');
    localStorage.removeItem('vraiga_mission_history');
    localStorage.removeItem('vraiga_disputes');
    localStorage.removeItem('vraiga_transactions');
    localStorage.removeItem('vraiga_notifications');
    localStorage.removeItem('vraiga_services');
    localStorage.removeItem('vraiga_tv_tiers');
    localStorage.removeItem('vraiga_commune_pricing');
    localStorage.removeItem('vraiga_user_profile');
    setUserProfile(DEFAULT_USER_PROFILE);
    setTechnicians(INITIAL_TECHNICIANS);
    setServices(SERVICES_CATALOG);
    setTvSizeTiers(TV_SIZE_TIERS);
    setCommunePricing(DEFAULT_COMMUNE_PRICING);
    setActiveMission(null);
    setMissionHistory(INITIAL_MISSIONS_HISTORY);
    setDisputes(INITIAL_DISPUTES);
    setTransactions(INITIAL_TRANSACTIONS);
    setNotifications([
      {
        id: 'NOTIF-INIT-1',
        type: 'INFO',
        title: 'Bienvenue sur Vraiga Abidjan',
        message: 'Commandez vos techniciens certifiés en direct avec suivi temps réel et notifications instantanées.',
        timestamp: new Date().toISOString(),
        read: false,
        badge: 'Info Vraiga'
      }
    ]);
    setCurrentToast(null);
  }, []);

  const value = useMemo(() => ({
    currentView,
    setCurrentView,
    selectedTechId,
    setSelectedTechId,
    userProfile,
    updateUserProfile,
    rechargeUserWallet,
    debitUserWallet,
    technicians,
    activeMission,
    missionHistory,
    disputes,
    transactions,
    services,
    tvSizeTiers,
    communePricing,
    getServicePriceForCommune,
    getTvTierPriceForCommune,
    notifications,
    unreadNotificationsCount,
    currentToast,
    dismissToast,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    showCustomNotification,
    addService,
    updateService,
    toggleServiceActive,
    deleteService,
    updateTvSizeTierPrice,
    addTvSizeTier,
    deleteTvSizeTier,
    updateCommunePricing,
    setCommuneServicePriceOverride,
    setCommuneTvTierPriceOverride,
    resetCommunePricing,
    batchApplyCommunePricing,
    createAndDispatchMission,
    cancelMission,
    submitRating,
    toggleTechnicianStatus,
    updateTechnicianCommune,
    rechargeWallet,
    respondToMissionOffer,
    technicianMarkArrived,
    technicianStartJob,
    technicianCompleteJob,
    toggleTechnicianKyc,
    setTechnicianKycStatus,
    toggleCertification,
    resolveDispute,
    resetDemoData,
    playNotificationSound,
  }), [
    currentView,
    setCurrentView,
    selectedTechId,
    setSelectedTechId,
    userProfile,
    updateUserProfile,
    rechargeUserWallet,
    debitUserWallet,
    technicians,
    activeMission,
    missionHistory,
    disputes,
    transactions,
    services,
    tvSizeTiers,
    communePricing,
    getServicePriceForCommune,
    getTvTierPriceForCommune,
    notifications,
    unreadNotificationsCount,
    currentToast,
    dismissToast,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    showCustomNotification,
    addService,
    updateService,
    toggleServiceActive,
    deleteService,
    updateTvSizeTierPrice,
    addTvSizeTier,
    deleteTvSizeTier,
    updateCommunePricing,
    setCommuneServicePriceOverride,
    setCommuneTvTierPriceOverride,
    resetCommunePricing,
    batchApplyCommunePricing,
    createAndDispatchMission,
    cancelMission,
    submitRating,
    toggleTechnicianStatus,
    updateTechnicianCommune,
    rechargeWallet,
    respondToMissionOffer,
    technicianMarkArrived,
    technicianStartJob,
    technicianCompleteJob,
    toggleTechnicianKyc,
    setTechnicianKycStatus,
    toggleCertification,
    resolveDispute,
    resetDemoData,
    playNotificationSound,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
