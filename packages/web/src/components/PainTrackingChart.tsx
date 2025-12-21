/**
 * PAIN TRACKING CHART
 *
 * Grafico dedicato SOLO al tracking del dolore nel tempo.
 * Separato dalla progressione per maggiore chiarezza.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import { Activity, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, ChevronDown, HeartPulse } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface PainTrackingChartProps {
  userId: string;
  className?: string;
}

// Colori per le diverse zone di dolore
const PAIN_AREA_COLORS: Record<string, string> = {
  knee: '#ef4444',
  lower_back: '#f97316',
  shoulder: '#eab308',
  wrist: '#22c55e',
  ankle: '#3b82f6',
  elbow: '#8b5cf6',
  hip: '#ec4899',
  neck: '#06b6d4',
  general: '#6b7280',
};

// Traduzioni zone dolore
const PAIN_AREA_LABELS: Record<string, string> = {
  knee: 'Ginocchio',
  lower_back: 'Schiena Bassa',
  shoulder: 'Spalla',
  wrist: 'Polso',
  ankle: 'Caviglia',
  elbow: 'Gomito',
  hip: 'Anca',
  neck: 'Collo',
  general: 'Generale',
};

interface PainLog {
  id: string;
  user_id: string;
  session_date: string;
  pain_location: string;
  pain_level: number;
  pain_type?: string;
  notes?: string;
}

interface AggregatedPainData {
  date: string;
  formattedDate: string;
  [key: string]: number | string | undefined;
}

export default function PainTrackingChart({ userId, className = '' }: PainTrackingChartProps) {
  const [painLogs, setPainLogs] = useState<PainLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    loadPainData();
  }, [userId, timeRange]);

  const loadPainData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('pain_logs')
        .select('*')
        .eq('user_id', userId)
        .order('session_date', { ascending: true });

      if (timeRange !== 'all') {
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        query = query.gte('session_date', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading pain data:', error);
        return;
      }

      setPainLogs(data || []);

      const uniqueAreas = [...new Set((data || []).map(log => log.pain_location).filter(Boolean))];
      if (selectedAreas.length === 0 && uniqueAreas.length > 0) {
        setSelectedAreas(uniqueAreas as string[]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Aggrega dati per data
  const aggregatedData = useMemo(() => {
    if (painLogs.length === 0) return [];

    const byDate = new Map<string, PainLog[]>();
    painLogs.forEach(log => {
      const date = log.session_date?.split('T')[0] || '';
      if (!byDate.has(date)) {
        byDate.set(date, []);
      }
      byDate.get(date)!.push(log);
    });

    const result: AggregatedPainData[] = [];
    byDate.forEach((logs, date) => {
      const dataPoint: AggregatedPainData = {
        date,
        formattedDate: new Date(date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
      };

      const painByArea = new Map<string, number[]>();
      logs.forEach(log => {
        const area = log.pain_location || 'general';
        if (!painByArea.has(area)) {
          painByArea.set(area, []);
        }
        painByArea.get(area)!.push(log.pain_level);
      });

      painByArea.forEach((levels, area) => {
        const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
        dataPoint[`pain_${area}`] = Math.round(avg * 10) / 10;
      });

      result.push(dataPoint);
    });

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [painLogs]);

  const uniqueAreas = useMemo(() => {
    return [...new Set(painLogs.map(log => log.pain_location).filter(Boolean))] as string[];
  }, [painLogs]);

  // Calcola trend per ogni zona
  const trends = useMemo(() => {
    const result: Record<string, { trend: 'up' | 'down' | 'stable'; change: number; current: number }> = {};

    uniqueAreas.forEach(area => {
      const areaLogs = painLogs
        .filter(l => l.pain_location === area)
        .sort((a, b) => (a.session_date || '').localeCompare(b.session_date || ''));

      if (areaLogs.length < 2) {
        result[area] = { trend: 'stable', change: 0, current: areaLogs[0]?.pain_level || 0 };
        return;
      }

      const mid = Math.floor(areaLogs.length / 2);
      const firstHalf = areaLogs.slice(0, mid);
      const secondHalf = areaLogs.slice(mid);

      const avgFirst = firstHalf.reduce((sum, l) => sum + l.pain_level, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((sum, l) => sum + l.pain_level, 0) / secondHalf.length;

      const change = avgSecond - avgFirst;
      const current = areaLogs[areaLogs.length - 1].pain_level;

      result[area] = {
        trend: change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'stable',
        change: Math.round(change * 10) / 10,
        current,
      };
    });

    return result;
  }, [painLogs, uniqueAreas]);

  const toggleArea = (area: string) => {
    setSelectedAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
        <p className="font-medium text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
          const area = entry.dataKey.replace('pain_', '');
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-400">{PAIN_AREA_LABELS[area] || area}:</span>
              <span className="font-medium" style={{ color: entry.color }}>{entry.value}/10</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Calcola statistiche generali
  const overallStats = useMemo(() => {
    if (painLogs.length === 0) return null;

    const avgPain = painLogs.reduce((sum, l) => sum + l.pain_level, 0) / painLogs.length;
    const maxPain = Math.max(...painLogs.map(l => l.pain_level));
    const minPain = Math.min(...painLogs.map(l => l.pain_level));
    const recentLogs = painLogs.slice(-5);
    const recentAvg = recentLogs.reduce((sum, l) => sum + l.pain_level, 0) / recentLogs.length;

    return {
      avgPain: Math.round(avgPain * 10) / 10,
      maxPain,
      minPain,
      recentAvg: Math.round(recentAvg * 10) / 10,
      trend: recentAvg < avgPain ? 'improving' : recentAvg > avgPain ? 'worsening' : 'stable',
    };
  }, [painLogs]);

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-slate-700 rounded"></div>
      </div>
    );
  }

  const hasNoData = painLogs.length === 0;

  return (
    <div className={`bg-slate-800/50 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <HeartPulse className="w-5 h-5 text-red-400" />
          <h3 className="font-semibold text-white">Monitoraggio Dolore</h3>
          {uniqueAreas.length > 0 && (
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
              {uniqueAreas.length} zone
            </span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4">
              {/* Time Range */}
              <div className="flex gap-1 bg-slate-700/50 rounded-lg p-1 mb-4 w-fit">
                {(['7d', '30d', '90d', 'all'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      timeRange === range
                        ? 'bg-red-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {range === 'all' ? 'Tutto' : range}
                  </button>
                ))}
              </div>

              {/* Overall Stats */}
              {overallStats && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-400">Media</p>
                    <p className="text-xl font-bold text-white">{overallStats.avgPain}</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-400">Recente</p>
                    <p className={`text-xl font-bold ${
                      overallStats.trend === 'improving' ? 'text-emerald-400' :
                      overallStats.trend === 'worsening' ? 'text-red-400' : 'text-white'
                    }`}>{overallStats.recentAvg}</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-400">Max</p>
                    <p className="text-xl font-bold text-red-400">{overallStats.maxPain}</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-400">Min</p>
                    <p className="text-xl font-bold text-emerald-400">{overallStats.minPain}</p>
                  </div>
                </div>
              )}

              {/* Area Selector */}
              {!hasNoData && uniqueAreas.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {uniqueAreas.map(area => {
                    const trend = trends[area];
                    const isSelected = selectedAreas.includes(area);
                    const color = PAIN_AREA_COLORS[area] || PAIN_AREA_COLORS.general;

                    return (
                      <button
                        key={area}
                        onClick={() => toggleArea(area)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                          isSelected
                            ? 'bg-slate-700 border-2'
                            : 'bg-slate-800/50 border border-slate-600 opacity-50'
                        }`}
                        style={{ borderColor: isSelected ? color : undefined }}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-white">{PAIN_AREA_LABELS[area] || area}</span>
                        {trend && (
                          <span className={`text-xs ${
                            trend.trend === 'down' ? 'text-emerald-400' :
                            trend.trend === 'up' ? 'text-red-400' : 'text-slate-400'
                          }`}>
                            {trend.trend === 'down' && <TrendingDown className="w-3 h-3 inline" />}
                            {trend.trend === 'up' && <TrendingUp className="w-3 h-3 inline" />}
                            {trend.current}/10
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Zone Summary Cards */}
              {!hasNoData && uniqueAreas.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {uniqueAreas.filter(a => selectedAreas.includes(a)).map(area => {
                    const trend = trends[area];
                    if (!trend) return null;

                    const color = PAIN_AREA_COLORS[area] || PAIN_AREA_COLORS.general;
                    const isImproving = trend.trend === 'down';
                    const isWorsening = trend.trend === 'up';

                    return (
                      <div
                        key={area}
                        className="bg-slate-700/50 rounded-lg p-3 border-l-4"
                        style={{ borderColor: color }}
                      >
                        <p className="text-xs text-slate-400 mb-1">{PAIN_AREA_LABELS[area]}</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-white">{trend.current}</span>
                          <span className="text-slate-400">/10</span>
                        </div>
                        <div className={`text-xs mt-1 flex items-center gap-1 ${
                          isImproving ? 'text-emerald-400' :
                          isWorsening ? 'text-red-400' : 'text-slate-400'
                        }`}>
                          {isImproving && <><TrendingDown className="w-3 h-3" /><CheckCircle className="w-3 h-3" /></>}
                          {isWorsening && <><TrendingUp className="w-3 h-3" /><AlertTriangle className="w-3 h-3" /></>}
                          <span>
                            {isImproving ? `${Math.abs(trend.change)} in meno` :
                             isWorsening ? `+${trend.change} aumento` : 'Stabile'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Main Chart */}
              <div className="h-64">
                {hasNoData ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <HeartPulse className="w-12 h-12 text-slate-500 mb-3" />
                    <p className="text-slate-400">Nessun dato dolore nel periodo</p>
                    <p className="text-sm text-slate-500 mt-1">
                      I dati appariranno dopo aver registrato il dolore durante gli allenamenti
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={aggregatedData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="formattedDate"
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                      />
                      <YAxis
                        domain={[0, 10]}
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        label={{ value: 'Dolore', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                      />
                      <Tooltip content={<CustomTooltip />} />

                      {/* Zona verde (dolore accettabile) */}
                      <ReferenceLine y={3} stroke="#22c55e" strokeDasharray="5 5" />
                      {/* Zona rossa (dolore alto) */}
                      <ReferenceLine y={7} stroke="#ef4444" strokeDasharray="5 5" />

                      {/* Aree per ogni zona selezionata */}
                      {selectedAreas.map(area => (
                        <Area
                          key={area}
                          type="monotone"
                          dataKey={`pain_${area}`}
                          name={PAIN_AREA_LABELS[area] || area}
                          stroke={PAIN_AREA_COLORS[area] || PAIN_AREA_COLORS.general}
                          fill={PAIN_AREA_COLORS[area] || PAIN_AREA_COLORS.general}
                          fillOpacity={0.2}
                          strokeWidth={2}
                          connectNulls
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Legend */}
              {!hasNoData && (
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-0.5 border-t border-dashed border-emerald-500"></div>
                    <span>Soglia sicura (0-3)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-0.5 border-t border-dashed border-red-500"></div>
                    <span>Zona attenzione (7+)</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
