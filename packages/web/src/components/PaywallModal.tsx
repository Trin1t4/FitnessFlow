/**
 * Paywall Modal - Upgrade to BASE/PRO/PREMIUM plans
 * Shown after week 1 of free trial
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Crown, Star, TrendingUp, Shield, Video } from 'lucide-react';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  onSelectPlan?: (tier: 'base' | 'pro' | 'premium') => void;
  userProgress?: {
    workoutsCompleted: number;
    baselineImprovements: string[];
    injuriesAvoided: number;
  };
}

export default function PaywallModal({ open, onClose, onSelectPlan, userProgress }: PaywallModalProps) {
  const [selectedTier, setSelectedTier] = useState<'base' | 'pro' | 'premium'>('pro');

  if (!open) return null;

  const plans = [
    {
      tier: 'base' as const,
      name: 'BASE',
      price: '19.90',
      monthlyEquivalent: '13.27',
      badge: null,
      icon: TrendingUp,
      color: 'from-gray-600 to-gray-700',
      borderColor: 'border-gray-600',
      features: [
        { text: 'Programma completo 6 settimane', included: true },
        { text: 'Progressive overload automatico', included: true },
        { text: 'Pain management system', included: true },
        { text: 'Workout logger + tracking', included: true },
        { text: 'Deload week + retest', included: true },
        { text: 'Video correzioni AI', included: false, note: '0 video inclusi' }
      ]
    },
    {
      tier: 'pro' as const,
      name: 'PRO',
      price: '29.90',
      monthlyEquivalent: '19.93',
      badge: '⭐ PIÙ SCELTO',
      icon: Zap,
      color: 'from-blue-600 to-purple-600',
      borderColor: 'border-blue-500',
      features: [
        { text: 'Tutto del BASE', included: true },
        { text: '12 video correzioni AI', included: true, highlight: true, note: '2/settimana' },
        { text: 'Technique score tracking', included: true },
        { text: 'Video tutorial HD', included: true },
        { text: 'Biblioteca 100+ esercizi', included: true },
        { text: 'Export PDF programma', included: false }
      ]
    },
    {
      tier: 'premium' as const,
      name: 'PREMIUM',
      price: '44.90',
      monthlyEquivalent: '29.93',
      badge: '👑 MASSIMO',
      icon: Crown,
      color: 'from-purple-600 to-pink-600',
      borderColor: 'border-purple-500',
      features: [
        { text: 'Tutto del PRO', included: true },
        { text: 'Video correzioni ILLIMITATE', included: true, highlight: true },
        { text: 'Coach check-in ogni 2 settimane', included: true, highlight: true },
        { text: 'Export PDF programma', included: true },
        { text: 'Priority support <24h', included: true },
        { text: 'Early access nuove features', included: true }
      ]
    }
  ];

  const handleSelectPlan = (tier: 'base' | 'pro' | 'premium') => {
    onSelectPlan?.(tier);
    // TODO: Integrate Stripe payment
    alert(`Hai selezionato il piano ${tier.toUpperCase()}! Integrazione Stripe in arrivo...`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-lg max-w-6xl w-full my-8 border border-gray-700 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="p-8 text-center border-b border-gray-700">
          <h2 className="text-4xl font-bold text-white mb-3">
            🎉 Complimenti! Hai finito la settimana 1
          </h2>
          <p className="text-gray-300 text-lg mb-6">
            Sblocca le prossime 5 settimane e raggiungi i tuoi obiettivi
          </p>

          {/* User Progress */}
          {userProgress && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-blue-400">{userProgress.workoutsCompleted}</p>
                <p className="text-sm text-gray-400">Workout Completati</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-green-400">
                  {userProgress.baselineImprovements.length}
                </p>
                <p className="text-sm text-gray-400">Miglioramenti Baseline</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-yellow-400">{userProgress.injuriesAvoided}</p>
                <p className="text-sm text-gray-400">Esercizi Sostituiti (dolore evitato)</p>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Plans */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedTier === plan.tier;
              const isRecommended = plan.tier === 'pro';

              return (
                <motion.div
                  key={plan.tier}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedTier(plan.tier)}
                  className={`
                    relative bg-gray-800 rounded-lg p-6 cursor-pointer
                    transition-all duration-200 border-2
                    ${isSelected ? plan.borderColor : 'border-gray-700'}
                    ${isRecommended ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900' : ''}
                  `}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Plan Icon & Name */}
                  <div className="text-center mb-4">
                    <div className={`bg-gradient-to-r ${plan.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-gray-400">€</span>
                      <span className="text-5xl font-bold text-white">{plan.price}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">per 6 settimane</p>
                    <p className="text-gray-500 text-xs">
                      (€{plan.monthlyEquivalent}/mese equivalente)
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className={`flex items-start gap-2 text-sm ${
                          feature.included ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        {feature.included ? (
                          <Check className={`w-5 h-5 flex-shrink-0 ${feature.highlight ? 'text-green-400' : 'text-gray-400'}`} />
                        ) : (
                          <X className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        )}
                        <span>
                          {feature.text}
                          {feature.note && (
                            <span className="text-xs text-gray-500 ml-1">({feature.note})</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Select Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(plan.tier);
                    }}
                    className={`
                      w-full py-3 rounded-lg font-bold transition-all
                      ${isSelected
                        ? `bg-gradient-to-r ${plan.color} text-white`
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }
                    `}
                  >
                    {isSelected ? '✓ Selezionato' : 'Seleziona'}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Benefits Summary */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h4 className="text-white font-bold mb-4 text-center">
              Perché FitnessFlow è diverso?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-medium">Pain Management Intelligente</p>
                  <p className="text-sm text-gray-400">
                    L'app sostituisce automaticamente esercizi se hai dolore. Mai più fermi per infortuni.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-medium">Progressive Overload Automatico</p>
                  <p className="text-sm text-gray-400">
                    I carichi aumentano settimana per settimana basati sui TUOI risultati reali.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Video className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-medium">AI Video Correction (PRO/PREMIUM)</p>
                  <p className="text-sm text-gray-400">
                    Gemini AI analizza la tua tecnica e ti dice esattamente come migliorare.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-medium">Nessun Vincolo Mensile</p>
                  <p className="text-sm text-gray-400">
                    Paghi per 6 settimane, vedi i risultati, decidi TU se continuare. Zero rinnovi nascosti.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h4 className="text-white font-bold mb-4 text-center">
              FitnessFlow vs Alternative
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 pb-2"></th>
                    <th className="text-center text-gray-400 pb-2">Schede PDF</th>
                    <th className="text-center text-gray-400 pb-2">App Generiche</th>
                    <th className="text-center text-blue-400 pb-2 font-bold">FitnessFlow PRO</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-700">
                    <td className="py-3">Carichi personalizzati</td>
                    <td className="text-center">❌</td>
                    <td className="text-center">❌</td>
                    <td className="text-center text-green-400">✅</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3">Progressione automatica</td>
                    <td className="text-center">❌</td>
                    <td className="text-center">❌</td>
                    <td className="text-center text-green-400">✅</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3">Pain management</td>
                    <td className="text-center">❌</td>
                    <td className="text-center">❌</td>
                    <td className="text-center text-green-400">✅</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3">Video correzione AI</td>
                    <td className="text-center">❌</td>
                    <td className="text-center">❌</td>
                    <td className="text-center text-green-400">✅ 12 video</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold">Prezzo 6 settimane</td>
                    <td className="text-center">€0-15</td>
                    <td className="text-center">€40-60</td>
                    <td className="text-center text-blue-400 font-bold">€29.90</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Guarantee */}
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">
              🔒 <strong className="text-white">Garanzia 14 giorni</strong> soddisfatto o rimborsato
            </p>
            <p className="text-gray-500 text-xs">
              Nessun rinnovo automatico • Cancellazione in qualsiasi momento • Dati sicuri
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
