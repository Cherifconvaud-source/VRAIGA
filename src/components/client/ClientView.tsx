import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Satellite, 
  Wind, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  User, 
  Plus, 
  Minus, 
  Check, 
  Clock, 
  PhoneCall, 
  MessageCircle, 
  Star, 
  ChevronRight, 
  Info, 
  Layers, 
  ArrowRight, 
  Sparkles, 
  Shield, 
  RotateCcw, 
  ShoppingCart, 
  Trash2, 
  CheckCircle2, 
  Bell, 
  Navigation, 
  AlertCircle, 
  HeartHandshake, 
  Users, 
  Share2, 
  Copy, 
  MessageSquareText, 
  CreditCard, 
  Send, 
  Home, 
  Search, 
  X, 
  Filter, 
  Ban,
  Edit3,
  Camera
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  CommuneAbidjan, 
  MissionCartItem, 
  ServiceCategory, 
  TVSizeTier, 
  TVInstallationConfig, 
  PaymentMethod, 
  RecipientRelationship, 
  PayerType 
} from '../../types';
import { 
  SERVICES_CATALOG, 
  TV_SIZE_TIERS, 
  STANDARD_ROOM_OPTIONS, 
  CLIENT_PAYMENT_METHODS, 
  COMMUNES_ABIDJAN,
  DEFAULT_USER_PROFILE
} from '../../data/initialData';
import { formatFCFA } from '../../utils/formatters';
import { OpenStreetMap } from '../common/OpenStreetMap';
import { RatingModal } from '../modals/RatingModal';
import { CartSummaryModal } from './CartSummaryModal';
import { NotificationCenterModal } from '../modals/NotificationCenterModal';
import { CancelMissionModal } from '../modals/CancelMissionModal';
import { ProfileModal } from './ProfileModal';

const RELATIONSHIP_OPTIONS: { id: RecipientRelationship; label: string; icon: string; description: string }[] = [
  { id: 'PARENT', label: 'Parent', icon: '👨‍👩‍👧', description: 'Père, Mère...' },
  { id: 'SPOUSE', label: 'Conjoint(e)', icon: '💑', description: 'Époux(se), Partenaire...' },
  { id: 'CHILD', label: 'Enfant / Famille', icon: '🧒', description: 'Frère, Sœur, Enfant...' },
  { id: 'FRIEND', label: 'Ami(e) / Voisin', icon: '🤝', description: 'Ami, Voisin, Connaissance...' },
  { id: 'TENANT', label: 'Locataire', icon: '🏠', description: 'Bien mis en location...' },
  { id: 'COLLEAGUE', label: 'Collègue / Pro', icon: '💼', description: 'Bureau, Partenaire pro...' },
  { id: 'OTHER', label: 'Autre', icon: '🏷️', description: 'Autre personne...' },
];

export const ClientView: React.FC = () => {
  const { 
    activeMission, 
    createAndDispatchMission, 
    cancelMission, 
    submitRating, 
    unreadNotificationsCount, 
    services, 
    tvSizeTiers, 
    communePricing, 
    getServicePriceForCommune, 
    getTvTierPriceForCommune,
    userProfile
  } = useApp();

  // Booking Form States (Default initialized from userProfile)
  const [selectedCommune, setSelectedCommune] = useState<CommuneAbidjan>(userProfile?.defaultCommune || 'Cocody');
  const [addressDetail, setAddressDetail] = useState<string>(userProfile?.defaultAddress || 'Angré 8e Tranche, près de la pharmacie');
  const [landmark, setLandmark] = useState<string>(userProfile?.defaultLandmark || 'Carrefour Duncan');
  const [clientName, setClientName] = useState<string>(userProfile?.name || 'Mme Touré Awa');
  const [clientPhone, setClientPhone] = useState<string>(userProfile?.phone || '+225 07 09 88 77 66');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('CASH');

  // Synchronize with user profile when it gets updated
  useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setClientName(userProfile.name);
      if (userProfile.phone) setClientPhone(userProfile.phone);
      if (userProfile.defaultCommune) setSelectedCommune(userProfile.defaultCommune);
      if (userProfile.defaultAddress) setAddressDetail(userProfile.defaultAddress);
      if (userProfile.defaultLandmark) setLandmark(userProfile.defaultLandmark);
    }
  }, [userProfile]);

  // Third-Party Ordering ("Commander pour un tiers / pour un proche") States
  const [isForThirdParty, setIsForThirdParty] = useState<boolean>(false);
  const [recipientRelationship, setRecipientRelationship] = useState<RecipientRelationship>('PARENT');
  const [recipientName, setRecipientName] = useState<string>('Papa Kouamé');
  const [recipientPhone, setRecipientPhone] = useState<string>('+225 01 44 55 66 77');
  const [recipientNotes, setRecipientNotes] = useState<string>('2e étage, sonner fort à la porte droite');
  const [payerType, setPayerType] = useState<PayerType>('ORDERER_REMOTE');
  const [copiedShareText, setCopiedShareText] = useState<boolean>(false);

  // Selected Services in Cart (Multi-Selection enabled)
  const [selectedServices, setSelectedServices] = useState<{
    PARABOLE_TNT: boolean;
    FIXATION_TV: boolean;
    CLIMATISATION: boolean;
    VIDEOSURVEILLANCE: boolean;
  }>({
    PARABOLE_TNT: true,
    FIXATION_TV: false,
    CLIMATISATION: false,
    VIDEOSURVEILLANCE: false,
  });

  // Service Configurations & Quantities
  const [paraboleUnits, setParaboleUnits] = useState<number>(1);
  const [tvInstallations, setTvInstallations] = useState<TVInstallationConfig[]>([
    {
      id: 'tv-1',
      room: 'Salon',
      tvSize: '44-55',
    }
  ]);
  const [climUnits, setClimUnits] = useState<number>(1);
  const [cctvCameras, setCctvCameras] = useState<number>(1);
  
  // Modals state
  const [isRatingModalOpen, setIsRatingModalOpen] = useState<boolean>(false);
  const [isCartSummaryOpen, setIsCartSummaryOpen] = useState<boolean>(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState<boolean>(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Search & Category Filter States for Service Catalog
  const [catalogSearchQuery, setCatalogSearchQuery] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'ALL' | 'PARABOLE_TNT' | 'FIXATION_TV' | 'CLIMATISATION' | 'VIDEOSURVEILLANCE'>('ALL');

  // TV Multi-room handlers
  const handleAddTv = () => {
    const nextRoomCandidates = ['Chambre principale', 'Chambre enfants', 'Bureau', 'Salle à manger', 'Cuisine', 'Terrasse / Balcon'];
    const usedRooms = new Set(tvInstallations.map(t => t.room));
    const suggestedRoom = nextRoomCandidates.find(r => !usedRooms.has(r)) || `Pièce ${tvInstallations.length + 1}`;

    setTvInstallations(prev => [
      ...prev,
      {
        id: `tv-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        room: suggestedRoom,
        tvSize: '44-55',
      }
    ]);
  };

  const handleRemoveTv = (id: string) => {
    if (tvInstallations.length <= 1) {
      // Toggle off service if user deletes the only TV
      setSelectedServices(prev => ({ ...prev, FIXATION_TV: false }));
    } else {
      setTvInstallations(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleUpdateTvSize = (id: string, newSize: TVSizeTier) => {
    setTvInstallations(prev => prev.map(t => t.id === id ? { ...t, tvSize: newSize } : t));
  };

  const handleUpdateTvRoom = (id: string, newRoom: string) => {
    setTvInstallations(prev => prev.map(t => t.id === id ? { ...t, room: newRoom } : t));
  };

  // Compute Cart Items & Total dynamically in real time based on selected Commune
  const cartItems: MissionCartItem[] = [];

  if (selectedServices.PARABOLE_TNT) {
    const paraboleUnitPrice = getServicePriceForCommune('PARABOLE_TNT', selectedCommune);
    cartItems.push({
      category: 'PARABOLE_TNT',
      name: paraboleUnits > 1 
        ? `Installation / Réglage parabole & TNT (${paraboleUnits} appareils)` 
        : 'Installation / Réglage parabole & décodeur TNT',
      quantity: paraboleUnits,
      unitPrice: paraboleUnitPrice,
      totalPrice: paraboleUnits * paraboleUnitPrice,
      details: 'Réglage azimut/élévation & pointage décodeur',
    });
  }

  if (selectedServices.FIXATION_TV && tvInstallations.length > 0) {
    const tvTotal = tvInstallations.reduce((sum, item) => {
      const tierPrice = getTvTierPriceForCommune(item.tvSize, selectedCommune);
      return sum + tierPrice;
    }, 0);

    const breakdownSummary = tvInstallations
      .map((tv) => {
        const tier = tvSizeTiers.find(t => t.id === tv.tvSize) || TV_SIZE_TIERS.find(t => t.id === tv.tvSize) || TV_SIZE_TIERS[1];
        return `${tv.room} : ${tier.label}`;
      })
      .join(' • ');

    const title = tvInstallations.length > 1 
      ? `Fixation Murale TV (${tvInstallations.length} écrans dans ${tvInstallations.length} pièces)` 
      : `Fixation Murale TV (${tvInstallations[0].room} • ${tvSizeTiers.find(t => t.id === tvInstallations[0].tvSize)?.label || '44"-55"'})`;

    cartItems.push({
      category: 'FIXATION_TV',
      name: title,
      quantity: tvInstallations.length,
      tvSize: tvInstallations[0]?.tvSize,
      tvList: tvInstallations,
      unitPrice: Math.round(tvTotal / tvInstallations.length),
      totalPrice: tvTotal,
      details: breakdownSummary,
    });
  }

  if (selectedServices.CLIMATISATION) {
    const climUnitPrice = getServicePriceForCommune('CLIMATISATION', selectedCommune);
    cartItems.push({
      category: 'CLIMATISATION',
      name: `Entretien & Dépannage Climatiseur Split (${climUnits} unité${climUnits > 1 ? 's' : ''})`,
      quantity: climUnits,
      unitPrice: climUnitPrice,
      totalPrice: climUnits * climUnitPrice,
      details: 'Nettoyage haute pression filtre & turbine + test gaz',
    });
  }

  if (selectedServices.VIDEOSURVEILLANCE) {
    const cctvUnitPrice = getServicePriceForCommune('VIDEOSURVEILLANCE', selectedCommune);
    cartItems.push({
      category: 'VIDEOSURVEILLANCE',
      name: `Pose & Paramétrage Caméras Vidéosurveillance (${cctvCameras} caméra${cctvCameras > 1 ? 's' : ''})`,
      quantity: cctvCameras,
      unitPrice: cctvUnitPrice,
      totalPrice: cctvCameras * cctvUnitPrice,
      details: 'Câblage/PoE, orientation grand angle & synchro Smartphone',
    });
  }

  const totalAmount = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);

  // Toggle service selection in cart
  const toggleService = (cat: ServiceCategory) => {
    setSelectedServices(prev => {
      const nextVal = !prev[cat];
      // When turning on FIXATION_TV, ensure at least 1 TV exists
      if (cat === 'FIXATION_TV' && nextVal && tvInstallations.length === 0) {
        setTvInstallations([{ id: 'tv-1', room: 'Salon', tvSize: '44-55' }]);
      }
      return {
        ...prev,
        [cat]: nextVal
      };
    });
  };

  // Update item quantity from modal or catalog
  const handleUpdateQuantity = (category: ServiceCategory, delta: number) => {
    if (category === 'PARABOLE_TNT') {
      setParaboleUnits(prev => Math.max(1, prev + delta));
    } else if (category === 'FIXATION_TV') {
      if (delta > 0) {
        handleAddTv();
      } else {
        if (tvInstallations.length > 1) {
          setTvInstallations(prev => prev.slice(0, prev.length - 1));
        } else {
          setSelectedServices(prev => ({ ...prev, FIXATION_TV: false }));
        }
      }
    } else if (category === 'CLIMATISATION') {
      setClimUnits(prev => Math.max(1, prev + delta));
    } else if (category === 'VIDEOSURVEILLANCE') {
      setCctvCameras(prev => Math.max(1, prev + delta));
    }
  };

  // Remove item from cart
  const handleRemoveItem = (category: ServiceCategory) => {
    setSelectedServices(prev => ({
      ...prev,
      [category]: false
    }));
  };

  // Dispatch final order
  const handleConfirmAndDispatch = async () => {
    if (cartItems.length === 0) return;
    setIsCartSummaryOpen(false);
    await createAndDispatchMission(
      cartItems,
      selectedCommune,
      addressDetail,
      landmark,
      clientName,
      clientPhone,
      selectedPaymentMethod,
      {
        isForThirdParty,
        ordererName: clientName,
        ordererPhone: clientPhone,
        recipientName: isForThirdParty ? recipientName : undefined,
        recipientPhone: isForThirdParty ? recipientPhone : undefined,
        recipientRelationship: isForThirdParty ? recipientRelationship : undefined,
        recipientNotes: isForThirdParty ? recipientNotes : undefined,
        payerType: isForThirdParty ? payerType : 'RECIPIENT_ON_SITE',
      }
    );
  };

  // Share tracking link / status with beneficiary via WhatsApp or Clipboard
  const handleShareWithBeneficiary = () => {
    if (!activeMission) return;
    const statusLabel = 
      activeMission.status === 'ARRIVED' ? 'est arrivé sur place devant votre adresse' :
      activeMission.status === 'IN_PROGRESS' ? 'est en train de réaliser l\'intervention' :
      activeMission.status === 'COMPLETED' ? 'a terminé l\'intervention avec succès' :
      'a accepté la mission et fait route vers votre adresse';

    const payerNotice = activeMission.payerType === 'ORDERER_REMOTE'
      ? 'Le règlement est entièrement pris en charge à distance par le commanditaire.'
      : `Le montant de ${formatFCFA(activeMission.grossAmount)} est à régler sur place.`;

    const shareText = `Bonjour ${activeMission.recipientName || ''} ! Une intervention Vraiga a été commandée pour vous (Réf: ${activeMission.reference}). Votre technicien ${activeMission.technicianName || ''} (Tél: ${activeMission.technicianPhone || ''}) ${statusLabel} à ${activeMission.commune}. ${payerNotice}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopiedShareText(true);
        setTimeout(() => setCopiedShareText(false), 4000);
      });
    }

    const cleanPhone = (activeMission.recipientPhone || '').replace(/[^0-9]/g, '');
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  // Status Stepper Progress Calculation
  const getStepIndex = (status?: string) => {
    switch (status) {
      case 'OFFERED':
      case 'ACCEPTED':
        return 1; // En route
      case 'ARRIVED':
        return 2; // Arrivé
      case 'IN_PROGRESS':
        return 3; // En cours
      case 'COMPLETED':
        return 4; // Terminé
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(activeMission?.status);

  // IF THERE IS AN ACTIVE MISSION
  if (activeMission && activeMission.status !== 'CANCELLED') {
    const isSearching = activeMission.status === 'SEARCHING';
    const isCompleted = activeMission.status === 'COMPLETED';

    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#F0F4F8] flex flex-col pb-12 animate-in fade-in">
        {/* Header Bar */}
        <div className="bg-[#1B2A4A] text-white p-4 sticky top-0 z-20 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F59E0B] flex items-center justify-center font-black text-[#1B2A4A] text-lg shadow-xs">
                V
              </div>
              <div>
                <h1 className="font-bold text-sm leading-tight tracking-wide">Suivi d'Intervention</h1>
                <p className="text-[11px] text-amber-300 font-mono">Réf : {activeMission.reference}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isCompleted && (
                <button
                  id="btn-cancel-mission-header"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white transition-colors border border-rose-400/30 flex items-center gap-1.5 text-xs font-bold shadow-xs active:scale-95"
                  title="Annuler cette prestation"
                  aria-label="Annuler la prestation"
                >
                  <Ban className="w-3.5 h-3.5 text-rose-300" />
                  <span className="hidden sm:inline">Annuler</span>
                </button>
              )}

              {/* User Profile Button in Tracking Header */}
              <button
                id="btn-open-user-profile-tracking"
                onClick={() => setIsProfileModalOpen(true)}
                className="relative p-1 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 active:scale-95"
                title="Mon Profil & Coordonnées"
                aria-label="Mon Profil"
              >
                <img
                  src={userProfile?.avatar || DEFAULT_USER_PROFILE.avatar}
                  alt={userProfile?.name || 'Profil'}
                  className="w-7 h-7 rounded-lg object-cover border border-amber-300 bg-slate-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_USER_PROFILE.avatar;
                  }}
                />
              </button>

              <button
                id="btn-open-notifications-tracking"
                onClick={() => setIsNotifModalOpen(true)}
                className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
                title="Notifications"
                aria-label="Centre de notifications"
              >
                <Bell className="w-4 h-4 text-amber-300" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {isCompleted ? (
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Terminé
                </span>
              ) : isSearching ? (
                <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-400/30 flex items-center gap-1 animate-pulse">
                  <Clock className="w-3.5 h-3.5" /> En attente...
                </span>
              ) : (
                <span className="bg-[#F59E0B] text-[#1B2A4A] text-xs font-extrabold px-3 py-1 rounded-full shadow-xs">
                  {activeMission.status === 'ARRIVED' ? 'Arrivé 📍' : 
                   activeMission.status === 'IN_PROGRESS' ? 'En cours 🛠️' : 
                   'En route 🛵'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4 flex-1">
          {/* SPECIAL THIRD PARTY SUMMARY BANNER IF ORDER IS FOR SOMEONE ELSE */}
          {activeMission.isForThirdParty && (
            <div className="bg-gradient-to-br from-rose-50 via-white to-amber-50 border-2 border-rose-200 p-4 rounded-3xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-black text-rose-700 flex items-center gap-1.5 tracking-wide">
                  <HeartHandshake className="w-4 h-4 text-rose-600" />
                  Commande pour un proche ({activeMission.recipientRelationship ? (RELATIONSHIP_OPTIONS.find(r => r.id === activeMission.recipientRelationship)?.label || activeMission.recipientRelationship) : 'Proche'})
                </span>
                <span className="text-[10px] bg-rose-100 text-rose-900 font-bold px-2 py-0.5 rounded-full">
                  Bénéficiaire sur place
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 p-3 rounded-2xl border border-rose-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#1B2A4A]">
                      {activeMission.recipientName || 'Bénéficiaire sur place'}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {activeMission.recipientPhone}
                    </span>
                  </div>
                  {activeMission.recipientNotes && (
                    <p className="text-[11px] text-slate-500 mt-1 flex items-start gap-1">
                      <MessageSquareText className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                      <span>{activeMission.recipientNotes}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {activeMission.recipientPhone && (
                    <a
                      href={`tel:${activeMission.recipientPhone}`}
                      className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      title="Appeler le bénéficiaire sur place"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Appeler le proche</span>
                    </a>
                  )}

                  <button
                    onClick={handleShareWithBeneficiary}
                    className="py-2 px-3 bg-[#F59E0B] hover:bg-[#e08e06] text-[#1B2A4A] rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                    title="Partager le suivi par WhatsApp / SMS"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Partager suivi</span>
                  </button>
                </div>
              </div>

              {copiedShareText && (
                <div className="text-[11px] text-emerald-800 bg-emerald-100 p-2 rounded-xl flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Lien & détails du technicien copiés ! Prêt à coller sur WhatsApp/SMS.</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-rose-100">
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  Règlement : <strong className="text-[#1B2A4A]">{activeMission.payerType === 'ORDERER_REMOTE' ? 'Pris en charge à distance' : 'Sur place par le bénéficiaire'}</strong>
                </span>
                <span>Commandé par : <strong>{activeMission.ordererName || 'Vous'}</strong></span>
              </div>
            </div>
          )}

          {/* VISUAL REAL-TIME ALERT BANNER BASED ON STATUS */}
          {activeMission.status === 'ACCEPTED' && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3.5 rounded-2xl shadow-md flex items-center justify-between gap-3 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0">
                  🛵
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-xs">Technicien en route</h4>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">~15 min</span>
                  </div>
                  <p className="text-[11px] text-emerald-100 mt-0.5">
                    {activeMission.technicianName} a accepté et se déplace vers {activeMission.commune}{activeMission.isForThirdParty && activeMission.recipientName ? ` (chez ${activeMission.recipientName})` : ''}.
                  </p>
                </div>
              </div>
              {activeMission.technicianPhone && (
                <a
                  href={`tel:${activeMission.technicianPhone}`}
                  className="p-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 transition-colors shrink-0 shadow-xs"
                  title="Appeler"
                >
                  <PhoneCall className="w-4 h-4" />
                </a>
              )}
            </div>
          )}

          {activeMission.status === 'ARRIVED' && (
            <div className="bg-amber-400 text-[#1B2A4A] p-4 rounded-2xl shadow-lg border-2 border-amber-500 animate-bounce-short space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-[#1B2A4A]">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping inline-block" />
                  <span>📍 Arrivée Imminente / Sur place !</span>
                </div>
                <span className="text-[10px] font-bold bg-[#1B2A4A] text-amber-300 px-2 py-0.5 rounded-full">
                  Prêt à intervenir
                </span>
              </div>
              <p className="text-xs font-semibold leading-snug">
                {activeMission.technicianName} est arrivé {activeMission.isForThirdParty && activeMission.recipientName ? `à l'adresse de ${activeMission.recipientName}` : 'devant votre domicile'} ({activeMission.address}).
              </p>
              {activeMission.technicianPhone && (
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`tel:${activeMission.technicianPhone}`}
                    className="flex-1 py-1.5 px-3 bg-[#1B2A4A] text-white hover:bg-[#253966] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                    <span>Appeler {activeMission.technicianName?.split(' ')[0]}</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {activeMission.status === 'IN_PROGRESS' && (
            <div className="bg-blue-600 text-white p-3.5 rounded-2xl shadow-md flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0">
                🛠️
              </div>
              <div>
                <h4 className="font-extrabold text-xs">Travaux en cours</h4>
                <p className="text-[11px] text-blue-100 mt-0.5">
                  Installation et paramétrage en cours par votre technicien certifié.
                </p>
              </div>
            </div>
          )}

          {/* SEARCHING RADAR ANIMATION (4 SECONDS REQUIREMENT) */}
          {isSearching ? (
            <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 text-center space-y-6 py-10">
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                {/* Radar ripple circles */}
                <div className="absolute inset-0 rounded-full bg-[#F59E0B]/20 animate-ping" />
                <div className="absolute inset-4 rounded-full bg-[#1B2A4A]/10 animate-pulse" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#1B2A4A] to-[#2B4270] shadow-xl flex items-center justify-center text-white relative z-10 border-2 border-[#F59E0B]">
                  <Satellite className="w-9 h-9 text-[#F59E0B] animate-spin" style={{ animationDuration: '6s' }} />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-[#1B2A4A]">
                  Dispatch Intelligent Vraiga
                </h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  Localisation du technicien certifié disponible le plus proche à <strong className="text-[#1B2A4A]">{activeMission.commune}</strong>...
                </p>
                <div className="inline-flex items-center gap-2 bg-amber-50 text-[#1B2A4A] px-3 py-1.5 rounded-full text-[11px] font-semibold border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                  Vérification des certifications pour les {activeMission.items.length} services demandés
                </div>

                <div className="pt-2 max-w-xs mx-auto">
                  <button
                    id="btn-cancel-search-radar"
                    onClick={() => setIsCancelModalOpen(true)}
                    className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-rose-200 transition-colors active:scale-98"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Annuler la recherche</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* INTERACTIVE OPENSTREETMAP TRACKING */}
              <div className="bg-white rounded-3xl p-3 shadow-md border border-slate-200 space-y-3">
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
                    name: activeMission.technicianName,
                    vehicle: activeMission.technicianVehicle,
                  } : undefined}
                  height="260px"
                  missionStatus={activeMission.status}
                />

                {/* Stepper (En route -> Arrivé -> En cours -> Terminé) */}
                <div className="px-2 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between relative">
                    {/* Connecting line */}
                    <div className="absolute left-6 right-6 top-3.5 h-0.5 bg-slate-200 -z-0" />
                    <div 
                      className="absolute left-6 top-3.5 h-0.5 bg-[#F59E0B] -z-0 transition-all duration-500"
                      style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                    />

                    {[
                      { num: 1, label: 'En route', icon: '🛵' },
                      { num: 2, label: 'Arrivé', icon: '📍' },
                      { num: 3, label: 'En cours', icon: '🛠️' },
                      { num: 4, label: 'Terminé', icon: '✨' },
                    ].map((step) => {
                      const isPast = currentStep >= step.num;
                      const isCurrent = currentStep === step.num;
                      return (
                        <div key={step.num} className="relative z-10 flex flex-col items-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                            isCurrent
                              ? 'bg-[#F59E0B] border-[#1B2A4A] text-[#1B2A4A] scale-110 shadow-md ring-2 ring-amber-300'
                              : isPast
                              ? 'bg-[#1B2A4A] border-[#1B2A4A] text-white'
                              : 'bg-white border-slate-300 text-slate-400'
                          }`}>
                            {isPast && !isCurrent ? <Check className="w-3.5 h-3.5" /> : step.num}
                          </div>
                          <span className={`text-[10px] mt-1 font-semibold ${
                            isCurrent ? 'text-[#1B2A4A] font-bold' : isPast ? 'text-slate-700' : 'text-slate-400'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Technician Info Card */}
              <div className="bg-white rounded-3xl p-4 shadow-md border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={activeMission.technicianPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                        alt={activeMission.technicianName}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-[#1B2A4A]"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full ring-2 ring-white">
                        <Check className="w-3 h-3" />
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-[#1B2A4A] text-sm">{activeMission.technicianName}</h4>
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                          Certifié
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                        <span className="font-bold text-slate-700">{activeMission.technicianRating || 4.9}</span>
                        <span>• {activeMission.technicianVehicle || 'Moto outillée'}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {activeMission.technicianPhone}
                      </p>
                    </div>
                  </div>

                  {/* Direct Contact Buttons */}
                  <div className="flex gap-2">
                    <a
                      href={`tel:${activeMission.technicianPhone}`}
                      className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#1B2A4A] flex items-center justify-center transition-colors shadow-xs"
                      title="Appeler"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>
                    <a
                      href={`https://wa.me/2250708451289?text=Bonjour%20Vraiga%20Intervention%20${activeMission.reference}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 flex items-center justify-center transition-colors shadow-xs"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Job Details Card (Multi-Service Panier summary) */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                    <span>Lieu d'intervention :</span>
                    <span className="text-[#1B2A4A] font-bold">{activeMission.commune}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    {activeMission.address} {activeMission.landmark ? `(${activeMission.landmark})` : ''}
                  </p>

                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Services commandés ({activeMission.items.length}) :
                    </span>
                    {activeMission.items.map((item, i) => (
                      <div key={i} className="py-1 border-b border-slate-100 last:border-0">
                        <div className="flex justify-between text-xs">
                          <div className="text-slate-700">
                            <span className="font-bold text-[#1B2A4A] mr-1">{item.quantity}x</span> 
                            <span className="font-semibold">{item.name}</span>
                          </div>
                          <span className="font-bold font-mono text-[#1B2A4A] shrink-0 ml-2">
                            {formatFCFA(item.totalPrice)}
                          </span>
                        </div>

                        {/* If Multi-TV breakdown is present */}
                        {item.tvList && item.tvList.length > 0 ? (
                          <div className="mt-1.5 space-y-1 pl-4 border-l-2 border-amber-300">
                            {item.tvList.map((tv, tvIdx) => {
                              const tier = TV_SIZE_TIERS.find(t => t.id === tv.tvSize);
                              return (
                                <div key={tv.id || tvIdx} className="flex items-center justify-between text-[11px] text-slate-600">
                                  <span>
                                    📺 <strong>{tv.room}</strong> : {tier?.label} ({tier?.inches})
                                  </span>
                                  <span className="font-mono font-semibold text-slate-700">
                                    {formatFCFA(tier?.price || 0)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : item.details ? (
                          <span className="text-[10px] text-slate-500 block mt-0.5">{item.details}</span>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Total à régler au technicien :</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">Déplacement & diagnostic inclus</span>
                    </div>
                    <span className="text-base font-extrabold text-[#1B2A4A] font-mono">
                      {formatFCFA(activeMission.grossAmount)}
                    </span>
                  </div>

                  {/* Payment method recap badge */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Moyen de paiement sélectionné :</span>
                      <span className="text-xs font-bold text-[#1B2A4A] flex items-center gap-1.5 mt-0.5">
                        {(() => {
                          const pm = CLIENT_PAYMENT_METHODS.find(m => m.id === activeMission.paymentMethod) || CLIENT_PAYMENT_METHODS[0];
                          return (
                            <>
                              <span>{pm.iconSymbol}</span>
                              <span>{pm.label}</span>
                            </>
                          );
                        })()}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      Règlement à la fin
                    </span>
                  </div>
                </div>

                {/* Cancellation Card for In-Flight Missions */}
                {!isCompleted && (
                  <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/90 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-rose-100/80 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200/60">
                        <Ban className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-[#1B2A4A]">Besoin d'annuler ?</h5>
                        <p className="text-[10px] text-slate-500">Annulation 100% sans frais avant le début des travaux</p>
                      </div>
                    </div>

                    <button
                      id="btn-cancel-mission-card"
                      onClick={() => setIsCancelModalOpen(true)}
                      className="py-1.5 px-3 bg-white hover:bg-rose-50 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all border border-rose-200 shrink-0 shadow-xs active:scale-95"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Annuler</span>
                    </button>
                  </div>
                )}

                {/* Completed Action: Rate Modal Trigger */}
                {isCompleted && (
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => setIsRatingModalOpen(true)}
                      className="w-full py-3.5 px-4 bg-[#F59E0B] hover:bg-[#e08e06] text-[#1B2A4A] font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 text-sm transition-transform active:scale-95"
                    >
                      <Star className="w-4 h-4 fill-[#1B2A4A]" />
                      {activeMission.rating ? 'Modifier mon avis' : 'Évaluer le technicien'}
                    </button>

                    <button
                      onClick={() => cancelMission(activeMission.id, 'Nouvelle intervention demandée', 'CLIENT')}
                      className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Commander une nouvelle intervention
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Cancel Mission Modal */}
        <CancelMissionModal
          mission={activeMission}
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirmCancel={(reason) => {
            if (activeMission) {
              cancelMission(activeMission.id, reason, 'CLIENT');
            }
          }}
        />

        {/* Rating Modal */}
        <RatingModal
          mission={activeMission}
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          onSubmit={(stars, tags, comment) => {
            submitRating(stars, tags, comment);
          }}
        />

        {/* Notification Center Modal */}
        <NotificationCenterModal
          isOpen={isNotifModalOpen}
          onClose={() => setIsNotifModalOpen(false)}
        />

        {/* Profile Modal */}
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      </div>
    );
  }

  // Search & Category Filter Matching Logic for Service Catalog
  const normalize = (t: string) =>
    t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const q = normalize(catalogSearchQuery.trim());

  const searchCorpus = {
    PARABOLE_TNT: normalize("canal+ canal plus tnt parabole antenne decodeur installation pointage azimut elevation reglage reception signal satellite 5000 tele television"),
    FIXATION_TV: normalize("fixation tv murale support mural television tele ecran ecran plat salon chambre 24 32 43 55 65 75 85 96 pouces led oled laser multi-pieces"),
    CLIMATISATION: normalize("climatisation split entretien climatiseur nettoyage filtres turbine controle gaz recharge depannage froid ventilation 10000"),
    VIDEOSURVEILLANCE: normalize("videosurveillance cctv camera cameras pose cablage dvr nvr poe smartphone vision nocturne securite hd enregistreur 10000"),
  };

  const matchesParabole = 
    (activeCategoryFilter === 'ALL' || activeCategoryFilter === 'PARABOLE_TNT') &&
    (!q || searchCorpus.PARABOLE_TNT.includes(q));

  const matchesTv = 
    (activeCategoryFilter === 'ALL' || activeCategoryFilter === 'FIXATION_TV') &&
    (!q || searchCorpus.FIXATION_TV.includes(q));

  const matchesClim = 
    (activeCategoryFilter === 'ALL' || activeCategoryFilter === 'CLIMATISATION') &&
    (!q || searchCorpus.CLIMATISATION.includes(q));

  const matchesCctv = 
    (activeCategoryFilter === 'ALL' || activeCategoryFilter === 'VIDEOSURVEILLANCE') &&
    (!q || searchCorpus.VIDEOSURVEILLANCE.includes(q));

  const matchesCount = [matchesParabole, matchesTv, matchesClim, matchesCctv].filter(Boolean).length;

  // DEFAULT BOOKING CATALOG VIEW WITH MULTI-SERVICE CART
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F0F4F8] flex flex-col pb-32 animate-in fade-in">
      {/* Top Brand Hero Header */}
      <div className="bg-[#1B2A4A] text-white p-5 rounded-b-3xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F59E0B] flex items-center justify-center font-black text-[#1B2A4A] text-xl shadow-md">
              V
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                Vraiga
                <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-400 text-[#1B2A4A] px-2 py-0.5 rounded-full">
                  Abidjan
                </span>
              </h1>
              <p className="text-xs text-slate-300 font-medium">Services techniques certifiés à domicile</p>
            </div>
          </div>

          {/* Quick Actions: Mon Profil, Notifications & Cart */}
          <div className="flex items-center gap-2">
            {/* User Profile Trigger Button */}
            <button
              id="btn-open-user-profile-header"
              onClick={() => setIsProfileModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-white/15 flex items-center gap-2 transition-all"
              title="Modifier mon profil, coordonnées et adresse principale"
              aria-label="Mon Profil"
            >
              <div className="relative shrink-0">
                <img
                  src={userProfile?.avatar || DEFAULT_USER_PROFILE.avatar}
                  alt={userProfile?.name || 'Profil'}
                  className="w-7 h-7 rounded-full object-cover border-2 border-amber-300 shadow-xs bg-slate-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_USER_PROFILE.avatar;
                  }}
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#1B2A4A]" />
              </div>
              <div className="text-left hidden xs:block sm:block">
                <span className="text-[9px] text-amber-300 font-extrabold uppercase tracking-wide block leading-none">
                  Mon Profil
                </span>
                <span className="text-[11px] font-bold text-white max-w-[85px] truncate block leading-tight">
                  {userProfile?.name?.split(' ')[0] || 'Client'}
                </span>
              </div>
            </button>

            <button
              id="btn-open-notifications-catalog"
              onClick={() => setIsNotifModalOpen(true)}
              className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/15"
              title="Centre de notifications"
              aria-label="Centre de notifications"
            >
              <Bell className="w-4 h-4 text-amber-300" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Quick Cart Trigger Pill */}
            <button
              onClick={() => setIsCartSummaryOpen(true)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-2 transition-all"
              title="Consulter le panier"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4 text-[#F59E0B]" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#F59E0B] text-[#1B2A4A] font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {cartItems.length}
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-[9px] text-amber-300 uppercase font-bold block">Panier</span>
                <span className="text-xs font-mono font-bold text-white">{formatFCFA(totalAmount)}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Commune & Address Selector with Profile Sync Info */}
        <div className="bg-white text-[#1B2A4A] p-4 rounded-2xl shadow-md space-y-3">
          {/* User Coordinates Quick Badge */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-700">
            <div className="flex items-center gap-1.5 truncate">
              <User className="w-3.5 h-3.5 text-[#1B2A4A] shrink-0" />
              <span className="truncate">
                Client : <strong className="text-[#1B2A4A]">{clientName}</strong> <span className="font-mono text-slate-500">({clientPhone})</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="text-[10px] font-extrabold text-amber-900 bg-amber-100 hover:bg-amber-200 active:scale-95 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0 transition-all border border-amber-300/60"
            >
              <Edit3 className="w-3 h-3 text-amber-800" />
              <span>Modifier profil</span>
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
                Commune d'Abidjan :
              </label>

              {/* Dynamic Commune Price Indicator Badge */}
              {(() => {
                const policy = communePricing[selectedCommune];
                const isCustom = policy && ((policy.surchargeFCFA || 0) > 0 || (policy.percentageMultiplier || 1) !== 1.0 || (policy.customServicePrices && Object.keys(policy.customServicePrices).length > 0));

                if (isCustom) {
                  return (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                      📍 Zone {selectedCommune} : {policy.surchargeFCFA > 0 ? `+${formatFCFA(policy.surchargeFCFA)}` : `${((policy.percentageMultiplier - 1) * 100).toFixed(0)}%`}
                    </span>
                  );
                }
                return (
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                    Tarif standard
                  </span>
                );
              })()}
            </div>

            <select
              value={selectedCommune}
              onChange={(e) => {
                const comm = e.target.value as CommuneAbidjan;
                setSelectedCommune(comm);
                const info = COMMUNES_ABIDJAN[comm];
                if (info) {
                  setAddressDetail(`${info.neighborhoods[0]}`);
                  setLandmark(info.popularLandmarks[0] || '');
                }
              }}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold p-2.5 rounded-xl text-[#1B2A4A] focus:outline-hidden focus:ring-1 focus:ring-[#1B2A4A]"
            >
              {(Object.keys(COMMUNES_ABIDJAN) as CommuneAbidjan[]).map((comm) => (
                <option key={comm} value={comm}>
                  {comm} (Côte d'Ivoire)
                </option>
              ))}
            </select>

            {/* Public note regarding commune pricing if customized */}
            {communePricing[selectedCommune]?.note && (
              <p className="text-[10px] text-amber-800 bg-amber-50/90 p-1.5 rounded-lg border border-amber-200/60 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3 text-amber-600 shrink-0" />
                <span>{communePricing[selectedCommune].note}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 block">
                Quartier / Rue :
              </label>
              <input
                type="text"
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
                placeholder="Ex: Angré 8e Tranche"
                className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl text-[#1B2A4A] focus:outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 block">
                Repère / Carrefour :
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Ex: Carrefour Duncan"
                className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl text-[#1B2A4A] focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Body with Multi-Service Panier Selector */}
      <div className="p-4 space-y-4 flex-1 pb-28">
        {/* Section title & Cart indicator */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-[#1B2A4A] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#F59E0B]" />
              Catalogue des Prestations ({selectedCommune})
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Sélectionnez et combinez les services souhaités pour votre intervention
            </p>
          </div>
          <span className="text-xs text-amber-700 bg-amber-100/80 font-bold px-2.5 py-1 rounded-full shrink-0">
            {cartItems.length} sélectionné{cartItems.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* 🔍 BARRE DE RECHERCHE & FILTRES DE CATÉGORIES */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5">
          {/* Champ de recherche */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={catalogSearchQuery}
              onChange={(e) => setCatalogSearchQuery(e.target.value)}
              placeholder="Rechercher (ex: Canal+, Climatisation, Fixation TV, Caméra...)"
              className="w-full bg-slate-50 border border-slate-200 text-xs pl-9 pr-8 py-2.5 rounded-xl text-[#1B2A4A] placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A] transition-all"
            />
            {catalogSearchQuery && (
              <button
                type="button"
                onClick={() => setCatalogSearchQuery('')}
                className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                title="Effacer la recherche"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtres de Catégories (Pills) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeCategoryFilter === 'ALL'
                  ? 'bg-[#1B2A4A] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-[#1B2A4A]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tous</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeCategoryFilter === 'ALL' ? 'bg-white/20 text-[#F59E0B]' : 'bg-slate-200 text-slate-600'
              }`}>
                4
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategoryFilter('PARABOLE_TNT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeCategoryFilter === 'PARABOLE_TNT'
                  ? 'bg-[#1B2A4A] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-[#1B2A4A]'
              }`}
            >
              <Satellite className={`w-3.5 h-3.5 ${activeCategoryFilter === 'PARABOLE_TNT' ? 'text-[#F59E0B]' : 'text-amber-600'}`} />
              <span>Canal+ / TNT</span>
              {selectedServices.PARABOLE_TNT && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Dans le panier" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveCategoryFilter('FIXATION_TV')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeCategoryFilter === 'FIXATION_TV'
                  ? 'bg-[#1B2A4A] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-[#1B2A4A]'
              }`}
            >
              <Tv className={`w-3.5 h-3.5 ${activeCategoryFilter === 'FIXATION_TV' ? 'text-[#F59E0B]' : 'text-blue-600'}`} />
              <span>Fixation TV</span>
              {selectedServices.FIXATION_TV && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Dans le panier" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveCategoryFilter('CLIMATISATION')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeCategoryFilter === 'CLIMATISATION'
                  ? 'bg-[#1B2A4A] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-[#1B2A4A]'
              }`}
            >
              <Wind className={`w-3.5 h-3.5 ${activeCategoryFilter === 'CLIMATISATION' ? 'text-[#F59E0B]' : 'text-cyan-600'}`} />
              <span>Climatisation</span>
              {selectedServices.CLIMATISATION && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Dans le panier" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveCategoryFilter('VIDEOSURVEILLANCE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeCategoryFilter === 'VIDEOSURVEILLANCE'
                  ? 'bg-[#1B2A4A] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-[#1B2A4A]'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${activeCategoryFilter === 'VIDEOSURVEILLANCE' ? 'text-[#F59E0B]' : 'text-purple-600'}`} />
              <span>Vidéosurveillance</span>
              {selectedServices.VIDEOSURVEILLANCE && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Dans le panier" />
              )}
            </button>
          </div>

          {/* Raccourcis de recherche rapide */}
          {!catalogSearchQuery && activeCategoryFilter === 'ALL' && (
            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500 overflow-x-auto scrollbar-none">
              <span className="text-slate-400 font-semibold shrink-0">Populaires :</span>
              <button
                type="button"
                onClick={() => setCatalogSearchQuery('Canal+')}
                className="bg-slate-100 hover:bg-amber-50 hover:text-amber-800 px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors shrink-0"
              >
                📡 Parabole Canal+
              </button>
              <button
                type="button"
                onClick={() => setCatalogSearchQuery('Support TV')}
                className="bg-slate-100 hover:bg-blue-50 hover:text-blue-800 px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors shrink-0"
              >
                📺 Support TV Mur
              </button>
              <button
                type="button"
                onClick={() => setCatalogSearchQuery('Split')}
                className="bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors shrink-0"
              >
                ❄️ Entretien Split
              </button>
              <button
                type="button"
                onClick={() => setCatalogSearchQuery('Caméra')}
                className="bg-slate-100 hover:bg-purple-50 hover:text-purple-800 px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors shrink-0"
              >
                🛡️ Caméras CCTV
              </button>
            </div>
          )}

          {/* Statut de filtrage actif */}
          {(catalogSearchQuery || activeCategoryFilter !== 'ALL') && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
              <span className="text-slate-500 text-[11px]">
                {catalogSearchQuery && (
                  <span>Recherche : <strong>« {catalogSearchQuery} »</strong></span>
                )}
                {catalogSearchQuery && activeCategoryFilter !== 'ALL' && <span> • </span>}
                {activeCategoryFilter !== 'ALL' && (
                  <span>Catégorie : <strong>{activeCategoryFilter === 'PARABOLE_TNT' ? 'Canal+ / TNT' : activeCategoryFilter === 'FIXATION_TV' ? 'Fixation TV' : activeCategoryFilter === 'CLIMATISATION' ? 'Climatisation' : 'Vidéosurveillance'}</strong></span>
                )}
              </span>
              <button
                type="button"
                onClick={() => {
                  setCatalogSearchQuery('');
                  setActiveCategoryFilter('ALL');
                }}
                className="text-[11px] text-amber-700 hover:text-amber-800 font-bold underline cursor-pointer"
              >
                Tout réinitialiser
              </button>
            </div>
          )}
        </div>

        {/* Empty State si aucun résultat */}
        {matchesCount === 0 && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3 shadow-xs animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#1B2A4A] text-sm">
                Aucune prestation trouvée
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Aucun service ne correspond à votre recherche {catalogSearchQuery ? `« ${catalogSearchQuery} »` : ''} dans cette catégorie.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCatalogSearchQuery('');
                  setActiveCategoryFilter('ALL');
                }}
                className="px-4 py-2 bg-[#1B2A4A] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#24375f] transition-all"
              >
                Afficher tous les services (4)
              </button>
            </div>
          </div>
        )}

        {/* 1. CANAL+ / TNT */}
        {matchesParabole && (
          <div
            className={`p-4 rounded-2xl border-2 transition-all shadow-xs ${
              selectedServices.PARABOLE_TNT
                ? 'bg-white border-[#1B2A4A] ring-1 ring-[#1B2A4A]'
                : 'bg-white/80 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div 
              onClick={() => toggleService('PARABOLE_TNT')}
              className="flex items-start justify-between cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedServices.PARABOLE_TNT ? 'bg-[#1B2A4A] text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Satellite className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#1B2A4A] text-sm">Canal+ / TNT</h3>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                      {formatFCFA(getServicePriceForCommune('PARABOLE_TNT', selectedCommune))} / poste
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Installation complète ou réglage d'orientation parabole & décodeur
                  </p>
                </div>
              </div>

              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                selectedServices.PARABOLE_TNT
                  ? 'bg-[#1B2A4A] border-[#1B2A4A] text-white'
                  : 'border-slate-300'
              }`}>
                {selectedServices.PARABOLE_TNT && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>

            {/* Quantity Controls & Line Subtotal */}
            {selectedServices.PARABOLE_TNT && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">Nombre d'antennes / décodeurs :</span>
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity('PARABOLE_TNT', -1)}
                      className="w-6 h-6 bg-white text-slate-700 rounded-lg font-bold flex items-center justify-center shadow-xs"
                      title="Diminuer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-[#1B2A4A] w-5 text-center">{paraboleUnits}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity('PARABOLE_TNT', 1)}
                      className="w-6 h-6 bg-[#1B2A4A] text-white rounded-lg font-bold flex items-center justify-center shadow-xs"
                      title="Augmenter"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <span className="text-xs font-black text-[#1B2A4A] font-mono">
                  {formatFCFA(paraboleUnits * getServicePriceForCommune('PARABOLE_TNT', selectedCommune))}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 2. FIXATION TV (WALL MOUNTING) MULTI-TV & MULTI-ROOM CONFIGURATOR */}
        {matchesTv && (
          <div
            className={`p-4 rounded-2xl border-2 transition-all shadow-xs ${
              selectedServices.FIXATION_TV
                ? 'bg-white border-[#1B2A4A] ring-1 ring-[#1B2A4A]'
                : 'bg-white/80 border-slate-200'
            }`}
          >
          <div 
            onClick={() => toggleService('FIXATION_TV')} 
            className="flex items-start justify-between cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                selectedServices.FIXATION_TV ? 'bg-[#1B2A4A] text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <Tv className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#1B2A4A] text-sm">Fixation TV Murale (Multi-Pièces & Tailles)</h3>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                    Dès {formatFCFA(getTvTierPriceForCommune('24-43', selectedCommune))} / TV
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fixez 1 ou plusieurs téléviseurs : choisissez la pièce (Salon, Chambre...) et la taille de chaque écran.
                </p>
              </div>
            </div>

            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
              selectedServices.FIXATION_TV
                ? 'bg-[#1B2A4A] border-[#1B2A4A] text-white'
                : 'border-slate-300'
            }`}>
              {selectedServices.FIXATION_TV && <Check className="w-3.5 h-3.5" />}
            </div>
          </div>

          {/* Multi-TV Configurator List */}
          {selectedServices.FIXATION_TV && (
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Vos téléviseurs à fixer ({tvInstallations.length})
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Personnalisation par pièce
                </span>
              </div>

              {/* List of each TV configuration */}
              <div className="space-y-3">
                {tvInstallations.map((tv, idx) => {
                  const currentTier = TV_SIZE_TIERS.find(t => t.id === tv.tvSize) || TV_SIZE_TIERS[1];

                  return (
                    <div
                      key={tv.id}
                      className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-3"
                    >
                      {/* TV Header with Room & Delete */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#1B2A4A] text-white font-bold text-xs flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <span className="font-extrabold text-xs text-[#1B2A4A]">
                            Téléviseur {idx + 1} • <span className="text-amber-700 font-bold">{tv.room}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-[#1B2A4A]">
                            {formatFCFA(currentTier.price)}
                          </span>
                          {tvInstallations.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTv(tv.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Supprimer ce téléviseur"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 1. Room / Emplacement Selector */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          1. Emplacement / Pièce :
                        </label>
                        
                        {/* Quick preset chips */}
                        <div className="flex flex-wrap gap-1.5">
                          {STANDARD_ROOM_OPTIONS.slice(0, 6).map((roomOption) => (
                            <button
                              type="button"
                              key={roomOption}
                              onClick={() => handleUpdateTvRoom(tv.id, roomOption)}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                                tv.room === roomOption
                                  ? 'bg-[#1B2A4A] text-white shadow-2xs'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {roomOption}
                            </button>
                          ))}
                        </div>

                        {/* Custom room input */}
                        <div className="pt-1">
                          <input
                            type="text"
                            value={tv.room}
                            onChange={(e) => handleUpdateTvRoom(tv.id, e.target.value)}
                            placeholder="Ou saisissez un nom de pièce sur-mesure (ex: Suite Parentale, Terrasse...)"
                            className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:border-[#1B2A4A] focus:outline-hidden text-slate-700"
                          />
                        </div>
                      </div>

                      {/* 2. Diagonale / Size Tier Selector */}
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          2. Diagonale de l'écran pour cette pièce :
                        </label>

                        <div className="grid grid-cols-1 gap-1.5">
                          {tvSizeTiers.map((tier) => {
                            const dynamicPrice = getTvTierPriceForCommune(tier.id, selectedCommune);
                            return (
                              <button
                                type="button"
                                key={tier.id}
                                onClick={() => handleUpdateTvSize(tv.id, tier.id)}
                                className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                                  tv.tvSize === tier.id
                                    ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <div>
                                  <span className="text-xs font-bold block">
                                    {tier.label} <span className="font-normal opacity-80 text-[10px]">({tier.inches})</span>
                                  </span>
                                  <span className={`text-[10px] ${tv.tvSize === tier.id ? 'text-slate-300' : 'text-slate-500'}`}>
                                    {tier.description}
                                  </span>
                                </div>
                                <span className={`text-xs font-black font-mono shrink-0 ml-2 ${
                                  tv.tvSize === tier.id ? 'text-[#F59E0B]' : 'text-[#1B2A4A]'
                                }`}>
                                  {formatFCFA(dynamicPrice)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Button: Add another TV */}
              <button
                type="button"
                onClick={handleAddTv}
                className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 border border-dashed border-amber-300 text-[#1B2A4A] font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                <Plus className="w-4 h-4 text-[#F59E0B]" />
                <span>Ajouter un autre téléviseur (autre pièce ou diagonale)</span>
              </button>

                  {/* Total TV Subtotal Bar */}
                  <div className="flex items-center justify-between p-3 bg-slate-900 text-white rounded-2xl shadow-xs text-xs">
                    <div>
                      <span className="text-slate-300 block text-[10px] uppercase font-semibold">Total Fixation TV</span>
                      <span className="font-bold text-white">
                        {tvInstallations.length} écran{tvInstallations.length > 1 ? 's' : ''} configuré{tvInstallations.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="text-sm font-black text-[#F59E0B] font-mono">
                      {formatFCFA(
                        tvInstallations.reduce((acc, tv) => {
                          return acc + getTvTierPriceForCommune(tv.tvSize, selectedCommune);
                        }, 0)
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

        {/* 3. CLIMATISATION (SPLIT) */}
        {matchesClim && (
          <div
            className={`p-4 rounded-2xl border-2 transition-all shadow-xs ${
              selectedServices.CLIMATISATION
                ? 'bg-white border-[#1B2A4A] ring-1 ring-[#1B2A4A]'
                : 'bg-white/80 border-slate-200'
            }`}
          >
            <div 
              onClick={() => toggleService('CLIMATISATION')} 
              className="flex items-start justify-between cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedServices.CLIMATISATION ? 'bg-[#1B2A4A] text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Wind className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#1B2A4A] text-sm">Climatisation (Split)</h3>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                      {formatFCFA(getServicePriceForCommune('CLIMATISATION', selectedCommune))} / unité
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Entretien complet, nettoyage filtres, turbine et contrôle circuit gaz
                  </p>
                </div>
              </div>

              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                selectedServices.CLIMATISATION
                  ? 'bg-[#1B2A4A] border-[#1B2A4A] text-white'
                  : 'border-slate-300'
              }`}>
                {selectedServices.CLIMATISATION && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>

            {/* Unit Counter & Line Subtotal */}
            {selectedServices.CLIMATISATION && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Nombre de splits à entretenir :</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity('CLIMATISATION', -1)}
                      className="w-7 h-7 bg-white text-slate-700 rounded-lg font-bold flex items-center justify-center shadow-xs"
                      title="Diminuer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-[#1B2A4A] w-6 text-center">{climUnits}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity('CLIMATISATION', 1)}
                      className="w-7 h-7 bg-[#1B2A4A] text-white rounded-lg font-bold flex items-center justify-center shadow-xs"
                      title="Augmenter"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs font-black text-[#1B2A4A] font-mono">
                    {formatFCFA(climUnits * getServicePriceForCommune('CLIMATISATION', selectedCommune))}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. VIDEOSURVEILLANCE (CCTV) */}
        {matchesCctv && (
          <div
            className={`p-4 rounded-2xl border-2 transition-all shadow-xs ${
              selectedServices.VIDEOSURVEILLANCE
                ? 'bg-white border-[#1B2A4A] ring-1 ring-[#1B2A4A]'
                : 'bg-white/80 border-slate-200'
            }`}
          >
            <div 
              onClick={() => toggleService('VIDEOSURVEILLANCE')} 
              className="flex items-start justify-between cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedServices.VIDEOSURVEILLANCE ? 'bg-[#1B2A4A] text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <ShieldCheck className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#1B2A4A] text-sm">Vidéosurveillance (CCTV)</h3>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                      {formatFCFA(getServicePriceForCommune('VIDEOSURVEILLANCE', selectedCommune))} / caméra
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pose, raccordement câble/PoE, orientation et configuration DVR/Smartphone
                  </p>
                </div>
              </div>

              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                selectedServices.VIDEOSURVEILLANCE
                  ? 'bg-[#1B2A4A] border-[#1B2A4A] text-white'
                  : 'border-slate-300'
              }`}>
                {selectedServices.VIDEOSURVEILLANCE && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>

            {/* Camera Counter & Line Subtotal */}
            {selectedServices.VIDEOSURVEILLANCE && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Nombre de caméras à poser/régler :</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity('VIDEOSURVEILLANCE', -1)}
                      className="w-7 h-7 bg-white text-slate-700 rounded-lg font-bold flex items-center justify-center shadow-xs"
                      title="Diminuer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-[#1B2A4A] w-6 text-center">{cctvCameras}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity('VIDEOSURVEILLANCE', 1)}
                      className="w-7 h-7 bg-[#1B2A4A] text-white rounded-lg font-bold flex items-center justify-center shadow-xs"
                      title="Augmenter"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs font-black text-[#1B2A4A] font-mono">
                    {formatFCFA(cctvCameras * getServicePriceForCommune('VIDEOSURVEILLANCE', selectedCommune))}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phase 1 Catalog Notice */}
        <div className="p-3 bg-blue-50/80 border border-blue-200/60 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Garantie Vraiga Phase 1 :</strong> Vous pouvez combiner plusieurs types de prestations dans la même commande. Un technicien polyvalent agréé prendra en charge l'ensemble de vos travaux.
          </p>
        </div>

        {/* Mode de règlement / Payment Method Selection */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1B2A4A] block">
              Moyen de règlement préféré :
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Paiement sur place
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CLIENT_PAYMENT_METHODS.map((pm) => {
              const isSelected = selectedPaymentMethod === pm.id;
              return (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setSelectedPaymentMethod(pm.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] ring-2 ring-[#F59E0B] shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <span className="text-lg">{pm.iconSymbol}</span>
                    <span className={`text-[8px] font-bold px-1 py-0.2 rounded ${
                      isSelected ? 'bg-white/20 text-[#F59E0B]' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {pm.badge}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <span className="text-xs font-bold block truncate">{pm.shortLabel}</span>
                    <span className={`text-[9px] block truncate ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      {pm.id === 'CASH' ? 'Espèces' : 'Mobile money'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick info note */}
          {(() => {
            const curPm = CLIENT_PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod) || CLIENT_PAYMENT_METHODS[0];
            return (
              <div className="p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-900 flex items-center gap-2">
                <span className="text-sm shrink-0">{curPm.iconSymbol}</span>
                <span>
                  <strong>{curPm.label} :</strong> {curPm.instruction}
                </span>
              </div>
            );
          })()}
        </div>

        {/* Client / Recipient Contact Info Section with Third-Party Mode Switch */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#1B2A4A] uppercase tracking-wider block">
              Pour qui commandez-vous ?
            </span>
            <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
              {isForThirdParty ? '🎁 Pour un proche' : '👤 Pour moi-même'}
            </span>
          </div>

          {/* Toggle Tabs: Pour moi-même vs Pour un proche */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setIsForThirdParty(false)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                !isForThirdParty
                  ? 'bg-white text-[#1B2A4A] shadow-xs'
                  : 'text-slate-600 hover:text-[#1B2A4A]'
              }`}
            >
              <User className="w-4 h-4 text-[#F59E0B]" />
              <span>Pour moi-même</span>
            </button>

            <button
              type="button"
              onClick={() => setIsForThirdParty(true)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                isForThirdParty
                  ? 'bg-[#1B2A4A] text-white shadow-xs ring-2 ring-[#F59E0B]'
                  : 'text-slate-600 hover:text-[#1B2A4A]'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-[#F59E0B]" />
              <span>Pour un proche / tiers</span>
            </button>
          </div>

          {/* Standard Form: Pour moi-même */}
          {!isForThirdParty ? (
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-slate-500 block">
                Vos coordonnées directes pour le technicien :
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Votre nom complet"
                    className="w-full text-xs bg-slate-50 border border-slate-200 pl-8 p-2.5 rounded-xl text-[#1B2A4A] focus:bg-white focus:border-[#1B2A4A] outline-none"
                  />
                </div>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+225 07..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 pl-8 p-2.5 rounded-xl text-[#1B2A4A] focus:bg-white focus:border-[#1B2A4A] outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Rich Form: Pour un proche / un tiers */
            <div className="space-y-4 pt-1">
              {/* Relationship presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Lien avec le bénéficiaire :
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {RELATIONSHIP_OPTIONS.map((rel) => (
                    <button
                      key={rel.id}
                      type="button"
                      onClick={() => setRecipientRelationship(rel.id)}
                      className={`py-1 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-all ${
                        recipientRelationship === rel.id
                          ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{rel.icon}</span>
                      <span>{rel.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Beneficiary Details on site */}
              <div className="p-3.5 bg-rose-50/60 border border-rose-200/70 rounded-2xl space-y-3">
                <div className="flex items-center gap-1.5 text-rose-900 font-bold text-xs">
                  <Users className="w-4 h-4 text-rose-600" />
                  <span>Personne présente sur place (Bénéficiaire) :</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Nom de la personne sur place
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Ex: Papa Kouamé"
                        className="w-full text-xs bg-white border border-rose-200 pl-8 p-2.5 rounded-xl text-[#1B2A4A] focus:border-rose-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Numéro joignable du bénéficiaire
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        placeholder="+225 01 44 55 66 77"
                        className="w-full text-xs bg-white border border-rose-200 pl-8 p-2.5 rounded-xl text-[#1B2A4A] focus:border-rose-500 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Consignes d'accès sur place (optionnel)
                  </label>
                  <div className="relative">
                    <MessageSquareText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={recipientNotes}
                      onChange={(e) => setRecipientNotes(e.target.value)}
                      placeholder="Ex: 2e étage porte droite, gardien au portail"
                      className="w-full text-xs bg-white border border-rose-200 pl-8 p-2.5 rounded-xl text-[#1B2A4A] focus:border-rose-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Who is paying */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 block flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Qui prend en charge le règlement ?</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayerType('ORDERER_REMOTE')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      payerType === 'ORDERER_REMOTE'
                        ? 'bg-amber-50/90 border-[#F59E0B] ring-2 ring-[#F59E0B]'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#1B2A4A]">Je règle à distance</span>
                      <span className="text-xs">💳</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Vous payez via Mobile Money (Wave, OM, MTN) sans que votre proche n'ait à payer.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayerType('RECIPIENT_ON_SITE')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      payerType === 'RECIPIENT_ON_SITE'
                        ? 'bg-amber-50/90 border-[#F59E0B] ring-2 ring-[#F59E0B]'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#1B2A4A]">Le proche règle sur place</span>
                      <span className="text-xs">💵</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Le bénéficiaire donne l'argent en espèces ou Mobile Money directement au technicien.
                    </p>
                  </button>
                </div>
              </div>

              {/* Orderer Details (You) */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Vos coordonnées en tant que commanditaire (Donneur d'ordre) :
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Votre nom"
                      className="w-full text-xs bg-white border border-slate-200 pl-8 p-2.5 rounded-xl text-[#1B2A4A]"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="Votre numéro (+225)"
                      className="w-full text-xs bg-white border border-slate-200 pl-8 p-2.5 rounded-xl text-[#1B2A4A] font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Action Bar with Real-Time Total & Panier Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 z-20 shadow-2xl space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="cursor-pointer" onClick={() => setIsCartSummaryOpen(true)}>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Panier
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded-full">
                {cartItems.length} serv.
              </span>
            </div>
            <span className="text-xl font-black text-[#1B2A4A] font-mono">
              {formatFCFA(totalAmount)}
            </span>
          </div>

          <button
            onClick={() => setIsCartSummaryOpen(true)}
            disabled={cartItems.length === 0}
            className="flex-1 py-3.5 px-4 bg-[#F59E0B] hover:bg-[#e08e06] disabled:bg-slate-300 disabled:cursor-not-allowed text-[#1B2A4A] font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 text-xs tracking-wider uppercase"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>VOIR LE RÉCAPITULATIF</span>
            <ArrowRight className="w-4 h-4 text-[#1B2A4A]" />
          </button>
        </div>
      </div>

      {/* Cart Summary & Order Validation Modal */}
      <CartSummaryModal
        isOpen={isCartSummaryOpen}
        onClose={() => setIsCartSummaryOpen(false)}
        onConfirmOrder={handleConfirmAndDispatch}
        items={cartItems}
        totalAmount={totalAmount}
        commune={selectedCommune}
        address={addressDetail}
        landmark={landmark}
        clientName={clientName}
        clientPhone={clientPhone}
        paymentMethod={selectedPaymentMethod}
        onSelectPaymentMethod={setSelectedPaymentMethod}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        isForThirdParty={isForThirdParty}
        ordererName={clientName}
        ordererPhone={clientPhone}
        recipientName={recipientName}
        recipientPhone={recipientPhone}
        recipientRelationship={recipientRelationship}
        recipientNotes={recipientNotes}
        payerType={payerType}
      />

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};
