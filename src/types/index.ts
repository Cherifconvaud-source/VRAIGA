export type ServiceCategory = 'PARABOLE_TNT' | 'FIXATION_TV' | 'CLIMATISATION' | 'VIDEOSURVEILLANCE' | string;

export type TVSizeTier = '24-43' | '44-55' | '56-75' | '76-95' | '96+' | string;

export interface TVInstallationConfig {
  id: string;
  room: string;
  tvSize: TVSizeTier;
  customRoom?: string;
}

export interface TVSizeOption {
  id: TVSizeTier;
  label: string;
  inches: string;
  price: number; // in FCFA
  description: string;
}

export interface ServiceItem {
  id: ServiceCategory;
  name: string;
  shortTitle: string;
  iconName: string; // 'SatelliteDish' | 'Tv' | 'Wind' | 'ShieldCheck' | 'Zap' | 'Wrench' | 'Sparkles' | 'Camera' | 'Home' | 'Settings' etc.
  badge: string;
  basePrice: number;
  unitLabel?: string;
  priceDescription: string;
  description?: string;
  isUnitBased?: boolean;
  minUnits?: number;
  maxUnits?: number;
  requiresParaboleCert?: boolean;
  requiredCertKey?: string; // 'paraboleTnt' | 'fixationTv' | 'climatisation' | 'videosurveillance' or other
  isActive?: boolean;
}

export interface CommunePricingPolicy {
  commune: CommuneAbidjan;
  surchargeFCFA: number; // e.g. 0, 1000, 1500 FCFA
  percentageMultiplier: number; // e.g. 1.0, 1.10, 1.15
  customServicePrices?: Partial<Record<string, number>>; // override specific service by ID
  customTvTierPrices?: Partial<Record<string, number>>; // override specific TV tier by ID
  note?: string; // reason, e.g. "Frais de déplacement zone périphérique / péage"
  isCustomized?: boolean;
}

export type CommuneAbidjan = 
  | 'Cocody' 
  | 'Yopougon' 
  | 'Marcory' 
  | 'Plateau' 
  | 'Koumassi' 
  | 'Treichville' 
  | 'Port-Bouët' 
  | 'Adjamé' 
  | 'Attécoubé' 
  | 'Bingerville'
  | 'Abobo';

export interface CommuneInfo {
  name: CommuneAbidjan;
  lat: number;
  lng: number;
  neighborhoods: string[];
  popularLandmarks: string[];
}

export type MissionStatus = 
  | 'SEARCHING'      // Radar search 4s
  | 'OFFERED'        // Offered to tech (30s timer)
  | 'ACCEPTED'       // Tech accepted, en route
  | 'ARRIVED'        // 1. Arrivé sur place
  | 'IN_PROGRESS'    // 2. Prestation en cours
  | 'COMPLETED'      // 3. Terminé (Commission deducted)
  | 'CANCELLED';

export interface MissionCartItem {
  category: ServiceCategory;
  name: string;
  quantity: number;
  tvSize?: TVSizeTier;
  tvList?: TVInstallationConfig[];
  unitPrice: number;
  totalPrice: number;
  details?: string;
  room?: string;
}

export type RecipientRelationship = 'PARENT' | 'CHILD' | 'SPOUSE' | 'FRIEND' | 'TENANT' | 'COLLEAGUE' | 'OTHER';

export type PayerType = 'ORDERER_REMOTE' | 'RECIPIENT_ON_SITE';

export interface MissionThirdPartyInfo {
  isForThirdParty: boolean;
  ordererName?: string;
  ordererPhone?: string;
  recipientName?: string;
  recipientPhone?: string;
  recipientRelationship?: RecipientRelationship;
  recipientNotes?: string;
  payerType?: PayerType;
}

export interface Mission {
  id: string;
  reference: string;
  clientName: string;
  clientPhone: string;
  // Third party ordering support
  isForThirdParty?: boolean;
  ordererName?: string;
  ordererPhone?: string;
  recipientName?: string;
  recipientPhone?: string;
  recipientRelationship?: RecipientRelationship;
  recipientNotes?: string;
  payerType?: PayerType;
  commune: CommuneAbidjan;
  address: string;
  landmark?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  items: MissionCartItem[];
  grossAmount: number;        // Total FCFA to be paid by client
  commissionRate: number;     // 0.175 (17.5%)
  commissionAmount: number;   // 17.5% of gross
  technicianNetEarnings: number; // gross - commission
  status: MissionStatus;
  technicianId?: string;
  technicianName?: string;
  technicianPhone?: string;
  technicianPhoto?: string;
  technicianRating?: number;
  technicianVehicle?: string;
  technicianCoordinates?: {
    lat: number;
    lng: number;
  };
  paymentMethod?: PaymentMethod;
  createdAt: string;
  acceptedAt?: string;
  arrivedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  cancelledBy?: 'CLIENT' | 'TECHNICIAN' | 'ADMIN';
  rating?: {
    stars: number;
    tags: string[];
    comment?: string;
    createdAt: string;
  };
  hasDispute?: boolean;
}

export type TechnicianStatus = 'ONLINE' | 'OFFLINE' | 'BUSY';

export interface TechnicianCertifications {
  paraboleTnt: boolean;
  fixationTv: boolean; // Note: Linked to paraboleTnt by rule
  climatisation: boolean;
  videosurveillance: boolean;
}

export interface TechnicianKYC {
  cniValidated: boolean;
  residenceCertValidated: boolean;
  criminalRecordClean: boolean;
  photoValidated: boolean;
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  email: string;
  photo: string;
  commune: CommuneAbidjan;
  secondaryCommunes?: CommuneAbidjan[];
  interventionRadiusKm?: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  rating: number;
  reviewCount: number;
  completedMissionsCount: number;
  status: TechnicianStatus;
  walletBalance: number; // FCFA
  certifications: TechnicianCertifications;
  kyc: TechnicianKYC;
  vehicle: string;
  registrationDate: string;
}

export type PaymentMethod = 'CASH' | 'WAVE' | 'ORANGE_MONEY' | 'MTN_MOMO' | 'MOOV_MONEY' | 'WALLET';

export interface WalletTransaction {
  id: string;
  technicianId: string;
  type: 'COMMISSION_DEDUCTION' | 'RECHARGE' | 'REFUND' | 'BONUS';
  amount: number; // FCFA
  balanceAfter: number;
  reference: string;
  missionId?: string;
  paymentMethod?: PaymentMethod;
  description: string;
  createdAt: string;
}

export interface UserWalletTransaction {
  id: string;
  userId?: string;
  type: 'RECHARGE' | 'PAYMENT' | 'REFUND' | 'BONUS';
  amount: number; // in FCFA (+ for credit, - for debit)
  balanceAfter: number;
  reference: string;
  paymentMethod: PaymentMethod;
  phoneNumber?: string;
  description: string;
  createdAt: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  operatorRef?: string;
  missionRef?: string;
}

export type DisputeStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'REFUNDED';

export interface DisputeTicket {
  id: string;
  reference: string;
  missionId: string;
  clientName: string;
  clientPhone: string;
  technicianId: string;
  technicianName: string;
  stars: number;
  tags: string[];
  clientComment?: string;
  reason: string;
  status: DisputeStatus;
  resolutionNote?: string;
  refundAmount?: number;
  createdAt: string;
  resolvedAt?: string;
}

export type NotificationType = 
  | 'MISSION_ACCEPTED' 
  | 'TECHNICIAN_ARRIVED' 
  | 'MISSION_IN_PROGRESS' 
  | 'MISSION_COMPLETED' 
  | 'MISSION_CANCELLED' 
  | 'INFO';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  missionId?: string;
  missionRef?: string;
  technicianName?: string;
  technicianPhoto?: string;
  technicianPhone?: string;
  commune?: string;
  badge?: string;
  actionUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  defaultCommune: CommuneAbidjan;
  defaultAddress: string;
  defaultLandmark: string;
  walletBalance: number; // Solde en FCFA
  walletTransactions?: UserWalletTransaction[];
  createdAt?: string;
}
