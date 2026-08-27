import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Phone, 
  MapPin, 
  Camera, 
  Upload, 
  Check, 
  X, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  Home, 
  Compass, 
  Mail, 
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CommuneAbidjan, UserProfile } from '../../types';
import { COMMUNES_ABIDJAN, DEFAULT_USER_PROFILE } from '../../data/initialData';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  {
    id: 'avatar-1',
    label: 'Awa (Pro)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'avatar-2',
    label: 'Kouassi (Cadre)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'avatar-3',
    label: 'Aminata (Souriante)',
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'avatar-4',
    label: 'Moussa (Dynamique)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'avatar-5',
    label: 'Fatou (Élégante)',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'avatar-6',
    label: 'Jean-Marc (Casual)',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
  }
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateUserProfile, playNotificationSound } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Profile Form States
  const [name, setName] = useState<string>(userProfile?.name || '');
  const [phone, setPhone] = useState<string>(userProfile?.phone || '');
  const [email, setEmail] = useState<string>(userProfile?.email || '');
  const [avatar, setAvatar] = useState<string>(userProfile?.avatar || '');
  const [defaultCommune, setDefaultCommune] = useState<CommuneAbidjan>(userProfile?.defaultCommune || 'Cocody');
  const [defaultAddress, setDefaultAddress] = useState<string>(userProfile?.defaultAddress || '');
  const [defaultLandmark, setDefaultLandmark] = useState<string>(userProfile?.defaultLandmark || '');

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Re-sync when modal opens
  useEffect(() => {
    if (isOpen && userProfile) {
      setName(userProfile.name);
      setPhone(userProfile.phone);
      setEmail(userProfile.email || '');
      setAvatar(userProfile.avatar);
      setDefaultCommune(userProfile.defaultCommune);
      setDefaultAddress(userProfile.defaultAddress);
      setDefaultLandmark(userProfile.defaultLandmark);
      setSavedSuccess(false);
      setUploadError(null);
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  // Handle Photo File Upload (Convert to Base64 data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setUploadError("L'image est trop volumineuse (maximum 4 Mo).");
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
        setShowAvatarPicker(false);
        playNotificationSound('complete');
      }
    };
    reader.onerror = () => {
      setUploadError("Erreur lors de la lecture du fichier image.");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setUploadError('Veuillez renseigner votre nom.');
      return;
    }
    if (!phone.trim()) {
      setUploadError('Veuillez renseigner votre numéro de téléphone.');
      return;
    }

    const updatedData: Partial<UserProfile> = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      avatar: avatar.trim() || DEFAULT_USER_PROFILE.avatar,
      defaultCommune,
      defaultAddress: defaultAddress.trim(),
      defaultLandmark: defaultLandmark.trim(),
    };

    updateUserProfile(updatedData);
    setSavedSuccess(true);
    playNotificationSound('complete');

    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 850);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Voulez-vous réinitialiser vos coordonnées par défaut ?')) {
      setName(DEFAULT_USER_PROFILE.name);
      setPhone(DEFAULT_USER_PROFILE.phone);
      setEmail(DEFAULT_USER_PROFILE.email);
      setAvatar(DEFAULT_USER_PROFILE.avatar);
      setDefaultCommune(DEFAULT_USER_PROFILE.defaultCommune);
      setDefaultAddress(DEFAULT_USER_PROFILE.defaultAddress);
      setDefaultLandmark(DEFAULT_USER_PROFILE.defaultLandmark);
      setUploadError(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Dark Navy Brand Style */}
        <div className="bg-[#1B2A4A] text-white p-4 sm:p-5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Fermer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 pr-8">
            <div className="w-10 h-10 rounded-2xl bg-[#F59E0B] flex items-center justify-center text-[#1B2A4A] shadow-md font-black text-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>Mon Profil Client</span>
                <span className="text-[10px] font-bold uppercase bg-amber-400 text-[#1B2A4A] px-2 py-0.5 rounded-full">
                  Coordonnées
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Gérez vos coordonnées et votre adresse principale à Abidjan pour vos interventions
              </p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSaveProfile} className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 text-slate-800">
          {/* Avatar Section */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={avatar || DEFAULT_USER_PROFILE.avatar}
                alt="Photo de profil"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#1B2A4A] shadow-md bg-slate-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_USER_PROFILE.avatar;
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-[#F59E0B] hover:bg-[#d98206] text-[#1B2A4A] shadow-md border-2 border-white transition-transform active:scale-90"
                title="Téléverser une photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div>
                <h4 className="text-xs font-bold text-[#1B2A4A] uppercase tracking-wider">
                  Photo de profil
                </h4>
                <p className="text-[11px] text-slate-500">
                  Visible par vos techniciens certifiés lors de vos interventions
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-100 text-[#1B2A4A] border border-slate-300 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Importer une photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Choisir un avatar</span>
                </button>

                {avatar !== DEFAULT_USER_PROFILE.avatar && (
                  <button
                    type="button"
                    onClick={() => setAvatar(DEFAULT_USER_PROFILE.avatar)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Réinitialiser l'avatar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preset Avatar Picker Grid */}
          {showAvatarPicker && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Sélectionnez un avatar prêt à l'emploi :
                </span>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(false)}
                  className="text-xs text-amber-800 hover:underline"
                >
                  Fermer
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PRESET_AVATARS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setAvatar(p.url);
                      setShowAvatarPicker(false);
                      playNotificationSound('dispatch');
                    }}
                    className={`relative p-1 rounded-xl border-2 transition-all ${
                      avatar === p.url 
                        ? 'border-[#F59E0B] bg-amber-100 ring-2 ring-[#F59E0B]/30 scale-105' 
                        : 'border-slate-200 hover:border-amber-300 bg-white'
                    }`}
                  >
                    <img 
                      src={p.url} 
                      alt={p.label} 
                      className="w-full h-12 rounded-lg object-cover" 
                    />
                    <span className="text-[9px] font-semibold text-slate-600 block truncate mt-1 text-center">
                      {p.label.split(' ')[0]}
                    </span>
                    {avatar === p.url && (
                      <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#F59E0B] text-[#1B2A4A] flex items-center justify-center font-bold text-[8px]">
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#1B2A4A]" />
              Identité & Coordonnées de Contact
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Nom et Prénoms <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Mme Touré Awa"
                    required
                    className="w-full text-xs font-semibold bg-white border border-slate-300 pl-9 pr-3 py-2.5 rounded-xl focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A] text-slate-900 shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Numéro de téléphone <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+225 07 09 88 77 66"
                    required
                    className="w-full text-xs font-semibold bg-white border border-slate-300 pl-9 pr-3 py-2.5 rounded-xl focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A] text-slate-900 font-mono shadow-2xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Adresse email <span className="text-slate-400 font-normal">(optionnel pour reçus et factures)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="awa.toure@gmail.com"
                  className="w-full text-xs font-semibold bg-white border border-slate-300 pl-9 pr-3 py-2.5 rounded-xl focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A] text-slate-900 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Address in Abidjan */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
                Adresse Principale de Desserte (Abidjan)
              </h3>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                Pré-remplie aux commandes
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Commune de résidence par défaut
              </label>
              <div className="relative">
                <Home className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={defaultCommune}
                  onChange={(e) => setDefaultCommune(e.target.value as CommuneAbidjan)}
                  className="w-full text-xs font-bold bg-white border border-slate-300 pl-9 pr-8 py-2.5 rounded-xl focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A] text-slate-900 shadow-2xs"
                >
                  {(Object.keys(COMMUNES_ABIDJAN) as CommuneAbidjan[]).map((c) => (
                    <option key={c} value={c}>
                      📍 {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Adresse détaillée / Quartier / Immeuble
              </label>
              <div className="relative">
                <Compass className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={defaultAddress}
                  onChange={(e) => setDefaultAddress(e.target.value)}
                  placeholder="Ex: Angré 8e Tranche, Rue L12, Immeuble Horizon, Apt 3B"
                  className="w-full text-xs font-semibold bg-white border border-slate-300 pl-9 pr-3 py-2.5 rounded-xl focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A] text-slate-900 shadow-2xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Point de repère principal pour le technicien
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#F59E0B] absolute left-3 top-3" />
                <input
                  type="text"
                  value={defaultLandmark}
                  onChange={(e) => setDefaultLandmark(e.target.value)}
                  placeholder="Ex: Carrefour Duncan, face à la pharmacie"
                  className="w-full text-xs font-semibold bg-white border border-slate-300 pl-9 pr-3 py-2.5 rounded-xl focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A] text-slate-900 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Privacy note */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-start gap-2.5 text-[11px] text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-tight">
              Vos coordonnées sont conservées localement en toute sécurité et ne sont transmises qu'au technicien certifié affecté à votre prestation.
            </p>
          </div>

          {/* Form Footer */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Réinitialiser</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors shadow-2xs"
              >
                Fermer
              </button>

              <button
                type="submit"
                disabled={savedSuccess}
                className={`px-5 py-2 text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 transition-all ${
                  savedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#F59E0B] hover:bg-[#d98206] text-[#1B2A4A] active:scale-95'
                }`}
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Enregistré !</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Enregistrer mon profil</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
