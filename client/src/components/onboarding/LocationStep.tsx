import React, { useState } from 'react'
import { Home, Dumbbell, HelpCircle } from 'lucide-react'
// import altri eventuali moduli e tipi...

interface LocationStepProps {
  data: Partial<OnboardingData>
  onNext: (stepData: Partial<OnboardingData>) => void
}

export default function LocationStep({ data, onNext }: LocationStepProps) {
  const [selectedLocation, setSelectedLocation] = useState<'gym' | 'home'>(
    data.trainingLocation || 'gym'
  )
  const [homeType, setHomeType] = useState<'bodyweight' | 'withequipment'>(
    data.homeType || 'bodyweight'
  )
  const [equipment, setEquipment] = useState({
    barbell: data.equipment?.barbell || false,
    dumbbellMaxKg: data.equipment?.dumbbellMaxKg || 0,
    kettlebellKg: data.equipment?.kettlebellKg || 0,
    bands: data.equipment?.bands || false,
    pullupBar: data.equipment?.pullupBar || false,
    bench: data.equipment?.bench || false
  })

  const handleNext = () => {
    onNext({
      trainingLocation: selectedLocation,
      homeType,
      equipment
    })
  }

  return (
    <div>
      <p className="text-slate-300">Scegli il tuo ambiente di allenamento</p>
      <div className="flex gap-4 mt-4">
        <button
          onClick={() => setSelectedLocation('gym')}
          className={`p-6 rounded-xl border-2 transition-all ${
            selectedLocation === 'gym'
              ? 'border-emerald-600 bg-emerald-600/10'
              : 'border-slate-700 hover:border-slate-600'
          }`}
          data-testid="button-location-gym"
        >
          <p className="font-bold text-lg text-white">Palestra</p>
        </button>
        <button
          onClick={() => setSelectedLocation('home')}
          className={`p-6 rounded-xl border-2 transition-all ${
            selectedLocation === 'home'
              ? 'border-emerald-600 bg-emerald-600/10'
              : 'border-slate-700 hover:border-slate-600'
          }`}
          data-testid="button-location-home"
        >
          <p className="font-bold text-lg text-white">Casa</p>
        </button>
      </div>

      {selectedLocation === 'home' && (
        <div className="space-y-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700 mt-6">
          <div>
            <p className="font-semibold text-white mb-3">Che attrezzatura hai a disposizione?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Qui selezioni equipaggiamento come barre, manubri, kettlebell, etc. */}
            {/* Codice per setEquipment... */}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleNext}
          className="bg-emerald-600 px-6 py-3 rounded font-bold text-white hover:bg-emerald-700"
        >
          Avanti
        </button>
      </div>
    </div>
  )
}
