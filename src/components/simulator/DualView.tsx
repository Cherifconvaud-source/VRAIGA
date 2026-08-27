import React from 'react';
import { Smartphone, Wrench, ArrowRight, Zap, Info } from 'lucide-react';
import { ClientView } from '../client/ClientView';
import { TechnicianView } from '../technician/TechnicianView';
import { useApp } from '../../context/AppContext';

export const DualView: React.FC = () => {
  const { activeMission } = useApp();

  return (
    <div className="min-h-screen bg-[#E5ECF4] p-4 lg:p-8 space-y-6">
      {/* Informative Banner */}
      <div className="max-w-6xl mx-auto bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#F59E0B] flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#1B2A4A]">
              Mode Simulateur Synchronisé en Direct
            </h3>
            <p className="text-slate-500">
              Commandez une intervention à gauche (Client) ➔ Observez l'alerte 30s et le workflow 3 étapes à droite (Technicien) en temps réel.
            </p>
          </div>
        </div>

        {activeMission && (
          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-[#1B2A4A] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
            <span>Mission active : {activeMission.reference} ({activeMission.status})</span>
          </div>
        )}
      </div>

      {/* Dual Smartphone Frames */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Client Device Frame */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#1B2A4A] flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#F59E0B]" />
              Interface Mobile Client (Abidjan)
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Écran Utilisateur</span>
          </div>

          <div className="bg-slate-900 p-3.5 rounded-[42px] shadow-2xl border-4 border-slate-700/60 max-w-md mx-auto">
            {/* Speaker notch */}
            <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-3 h-1 bg-slate-600 rounded-full" />
            </div>

            {/* Inner viewport with independent scroll */}
            <div className="rounded-[32px] overflow-hidden max-h-[780px] overflow-y-auto bg-[#F0F4F8] shadow-inner">
              <ClientView />
            </div>

            {/* Bottom bar indicator */}
            <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto mt-3 opacity-60" />
          </div>
        </div>

        {/* Right: Technician Device Frame */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#1B2A4A] flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-[#F59E0B]" />
              Interface Mobile Technicien (Vraiga Pro)
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Écran Prestataire</span>
          </div>

          <div className="bg-slate-900 p-3.5 rounded-[42px] shadow-2xl border-4 border-slate-700/60 max-w-md mx-auto">
            {/* Speaker notch */}
            <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-3 h-1 bg-slate-600 rounded-full" />
            </div>

            {/* Inner viewport with independent scroll */}
            <div className="rounded-[32px] overflow-hidden max-h-[780px] overflow-y-auto bg-[#F0F4F8] shadow-inner">
              <TechnicianView />
            </div>

            {/* Bottom bar indicator */}
            <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto mt-3 opacity-60" />
          </div>
        </div>
      </div>
    </div>
  );
};
