/**
 * Running Progress Charts Component
 * Visualizza i progressi dell'allenamento aerobico
 */

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
} from 'recharts';
import type { RunningProgressData, RunningWeeklySummary } from '@trainsmart/shared';

interface RunningProgressProps {
  data: RunningProgressData;
  weeklySummaries?: RunningWeeklySummary[];
  showMetric?: 'all' | 'hr' | 'volume' | 'pace' | 'rpe';
}

// Colori per i grafici
const COLORS = {
  restingHR: '#ef4444', // red
  avgSessionHR: '#f97316', // orange
  hrDrift: '#eab308', // yellow
  paceAtZone2: '#22c55e', // green
  volume: '#3b82f6', // blue
  distance: '#8b5cf6', // purple
  rpe: '#ec4899', // pink
  zone2: '#10b981', // emerald
  zone3: '#f59e0b', // amber
  zone4: '#ef4444', // red
};

/**
 * Grafico FC a Riposo nel tempo
 */
export function RestingHRChart({ data }: { data: RunningProgressData }) {
  const chartData = useMemo(() => {
    return data.dates.map((date, i) => ({
      date: new Date(date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
      fcRiposo: data.restingHR[i],
      trend: data.avgRestingHR,
    }));
  }, [data]);

  const improvement = data.restingHRChange < 0
    ? `↓ ${Math.abs(data.restingHRChange)} bpm`
    : data.restingHRChange > 0
      ? `↑ ${data.restingHRChange} bpm`
      : 'Stabile';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          FC a Riposo
        </h3>
        <span className={`text-sm font-medium px-2 py-1 rounded ${
          data.restingHRChange < 0
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : data.restingHRChange > 0
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        }`}>
          {improvement}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => [`${value} bpm`, 'FC Riposo']}
          />
          <Line
            type="monotone"
            dataKey="fcRiposo"
            stroke={COLORS.restingHR}
            strokeWidth={2}
            dot={{ fill: COLORS.restingHR, strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="trend"
            stroke={COLORS.restingHR}
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
        Un calo della FC a riposo indica miglioramento fitness cardiovascolare
      </p>
    </div>
  );
}

/**
 * Grafico Drift Cardiaco
 */
export function HRDriftChart({ data }: { data: RunningProgressData }) {
  const chartData = useMemo(() => {
    return data.dates.map((date, i) => ({
      date: new Date(date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
      drift: data.hrDrift[i],
      target: 5, // Target: < 5%
    }));
  }, [data]);

  const avgDrift = data.hrDrift.reduce((a, b) => a + b, 0) / data.hrDrift.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Drift Cardiaco
        </h3>
        <span className={`text-sm font-medium px-2 py-1 rounded ${
          avgDrift <= 5
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : avgDrift <= 10
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          Media: {avgDrift.toFixed(1)}%
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 'auto']} tick={{ fontSize: 12 }} unit="%" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Drift']}
          />
          <Area
            type="monotone"
            dataKey="drift"
            stroke={COLORS.hrDrift}
            fill={COLORS.hrDrift}
            fillOpacity={0.3}
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#22c55e"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
        Target: &lt;5%. Drift alto = base aerobica da migliorare
      </p>
    </div>
  );
}

/**
 * Grafico Volume Settimanale
 */
export function WeeklyVolumeChart({ data }: { data: RunningProgressData }) {
  const chartData = useMemo(() => {
    // Raggruppa per settimana
    const weeks: { week: string; volume: number; distance: number }[] = [];
    let currentWeek = 0;
    let weekVolume = 0;
    let weekDistance = 0;

    data.dates.forEach((date, i) => {
      const weekNum = Math.floor(i / 3) + 1; // Assume 3 sessioni/settimana
      if (weekNum !== currentWeek) {
        if (currentWeek > 0) {
          weeks.push({
            week: `S${currentWeek}`,
            volume: weekVolume,
            distance: weekDistance,
          });
        }
        currentWeek = weekNum;
        weekVolume = 0;
        weekDistance = 0;
      }
      weekVolume += data.volume[i] || 0;
      weekDistance += data.distance[i] || 0;
    });

    // Push ultima settimana
    if (currentWeek > 0) {
      weeks.push({
        week: `S${currentWeek}`,
        volume: weekVolume,
        distance: weekDistance,
      });
    }

    return weeks;
  }, [data]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Volume Settimanale
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Totale: {data.totalVolume} min / {data.totalDistance.toFixed(1)} km
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="week" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 12 }} unit=" min" />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} unit=" km" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="volume"
            name="Durata (min)"
            fill={COLORS.volume}
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="distance"
            name="Distanza (km)"
            stroke={COLORS.distance}
            strokeWidth={2}
            dot={{ fill: COLORS.distance, strokeWidth: 0, r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Grafico Ritmo a Parità di FC (efficienza aerobica)
 */
export function PaceEfficiencyChart({ data }: { data: RunningProgressData }) {
  const chartData = useMemo(() => {
    return data.dates.map((date, i) => ({
      date: new Date(date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
      pace: data.paceAtZone2[i] / 60, // Converti sec/km a min/km
    }));
  }, [data]);

  const formatPace = (seconds: number) => {
    const mins = Math.floor(seconds);
    const secs = Math.round((seconds - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Ritmo in Zona 2
        </h3>
        {data.paceImprovement > 0 && (
          <span className="text-sm font-medium px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            ↓ {data.paceImprovement.toFixed(0)}% più veloce
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatPace(value)}
            domain={['auto', 'auto']}
            reversed
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => [formatPace(value) + '/km', 'Ritmo']}
          />
          <Line
            type="monotone"
            dataKey="pace"
            stroke={COLORS.paceAtZone2}
            strokeWidth={2}
            dot={{ fill: COLORS.paceAtZone2, strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
        Correre più veloce mantenendo la stessa FC = base aerobica migliorata
      </p>
    </div>
  );
}

/**
 * Grafico RPE nel tempo
 */
export function RPEChart({ data }: { data: RunningProgressData }) {
  const chartData = useMemo(() => {
    return data.dates.map((date, i) => ({
      date: new Date(date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
      rpe: data.rpe[i],
    }));
  }, [data]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          RPE Percepito
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          1 = Facilissimo, 10 = Massimale
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => [`${value}/10`, 'RPE']}
          />
          <Area
            type="monotone"
            dataKey="rpe"
            stroke={COLORS.rpe}
            fill={COLORS.rpe}
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
        Target Zona 2: RPE 4-6 (puoi parlare comodamente)
      </p>
    </div>
  );
}

/**
 * Dashboard Completa Progress
 */
export default function RunningProgress({ data, showMetric = 'all' }: RunningProgressProps) {
  // Summary cards
  const summaryCards = [
    {
      label: 'Sessioni Totali',
      value: data.totalSessions.toString(),
      icon: '🏃',
    },
    {
      label: 'Volume Totale',
      value: `${Math.round(data.totalVolume / 60)}h ${data.totalVolume % 60}min`,
      icon: '⏱️',
    },
    {
      label: 'Distanza Totale',
      value: `${data.totalDistance.toFixed(1)} km`,
      icon: '📍',
    },
    {
      label: 'FC Riposo Media',
      value: `${Math.round(data.avgRestingHR)} bpm`,
      change: data.restingHRChange,
      icon: '❤️',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm text-center"
          >
            <div className="text-2xl mb-1">{card.icon}</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {card.value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {card.label}
            </div>
            {card.change !== undefined && (
              <div className={`text-xs mt-1 ${
                card.change < 0 ? 'text-green-600' : card.change > 0 ? 'text-red-600' : 'text-gray-500'
              }`}>
                {card.change < 0 ? '↓' : card.change > 0 ? '↑' : '—'} {Math.abs(card.change)} bpm
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(showMetric === 'all' || showMetric === 'hr') && (
          <>
            <RestingHRChart data={data} />
            <HRDriftChart data={data} />
          </>
        )}
        {(showMetric === 'all' || showMetric === 'volume') && (
          <WeeklyVolumeChart data={data} />
        )}
        {(showMetric === 'all' || showMetric === 'pace') && (
          <PaceEfficiencyChart data={data} />
        )}
        {(showMetric === 'all' || showMetric === 'rpe') && (
          <RPEChart data={data} />
        )}
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          📊 Indicatori di Progresso
        </h4>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          {data.restingHRChange < -2 && (
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              FC a riposo in calo: il cuore è più efficiente
            </li>
          )}
          {data.paceImprovement > 5 && (
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Ritmo migliorato a parità di FC: base aerobica più forte
            </li>
          )}
          {data.hrDrift[data.hrDrift.length - 1] < 5 && (
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Drift cardiaco basso: ottima stabilità cardiovascolare
            </li>
          )}
          {data.totalSessions >= 20 && (
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Consistenza eccellente: {data.totalSessions} sessioni completate!
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
