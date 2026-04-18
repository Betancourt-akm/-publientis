import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList
} from 'recharts';
import './EmploymentFunnel.css';

// Helper: safely read a stage from either camelCase or snake_case keys
const getStage = (stages, key) => {
  const aliases = {
    profileComplete: ['profileComplete', 'profile_complete'],
    inProcess: ['inProcess', 'in_process'],
  };
  const keys = aliases[key] || [key];
  for (const k of keys) {
    if (stages[k]) return stages[k];
  }
  return { count: 0, percentage: 0, label: key };
};

const COLORS = ['#1F3C88', '#2563EB', '#3B82F6', '#60A5FA', '#34D399', '#10B981'];
const ICONS  = ['👥', '📋', '🔍', '📨', '⏳', '✅'];

const EmploymentFunnel = ({ funnelData }) => {
  if (!funnelData || !funnelData.stages) {
    return (
      <div className="funnel-empty">
        <p>No hay datos del embudo disponibles</p>
      </div>
    );
  }

  const { stages } = funnelData;

  const stageList = [
    { key: 'registered',      label: 'Registrados' },
    { key: 'profileComplete', label: 'Perfil Completo' },
    { key: 'searching',       label: 'Buscando' },
    { key: 'applied',         label: 'Postulados' },
    { key: 'inProcess',       label: 'En Proceso' },
    { key: 'placed',          label: 'Vinculados' },
  ];

  const chartData = stageList.map((s, i) => {
    const stage = getStage(stages, s.key);
    return {
      name: s.label,
      count: stage.count || 0,
      percentage: stage.percentage || 0,
      label: stage.label || s.label,
      color: COLORS[i],
      icon: ICONS[i],
    };
  });

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  const safe = (a, b) => b > 0 ? Math.round((a / b) * 100) : 0;
  const profileStage  = getStage(stages, 'profileComplete');
  const searchStage   = getStage(stages, 'searching');
  const appliedStage  = getStage(stages, 'applied');
  const placedStage   = getStage(stages, 'placed');

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{d.icon} {d.label}</p>
          <p className="tooltip-count">{d.count.toLocaleString()} personas</p>
          <p className="tooltip-percentage">{d.percentage}% del total registrado</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="employment-funnel">
      <div className="funnel-header">
        <h3>🎯 Embudo de Conversión de Vinculación</h3>
        <p className="funnel-description">
          De registro hasta vinculación laboral — {funnelData.total || 0} personas en total
        </p>
      </div>

      {/* Visual funnel bars (CSS-based) */}
      <div className="funnel-visual">
        {chartData.map((stage, i) => {
          const widthPct = maxCount > 0 ? Math.max((stage.count / maxCount) * 100, 8) : 8;
          return (
            <div key={i} className="funnel-step">
              <div className="funnel-bar-wrap">
                <div
                  className="funnel-bar"
                  style={{ width: `${widthPct}%`, background: stage.color }}
                >
                  <span className="funnel-bar-count">{stage.count.toLocaleString()}</span>
                </div>
              </div>
              <div className="funnel-step-label">
                <span className="funnel-step-icon">{stage.icon}</span>
                <span>{stage.label}</span>
                <span className="funnel-step-pct">{stage.percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recharts bar for comparison */}
      <div className="funnel-chart-wrap">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(31,60,136,0.05)' }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
              <LabelList dataKey="count" position="top" style={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Conversion rates */}
      <div className="conversion-rates">
        <h4>Tasas de Conversión por Etapa</h4>
        <div className="conversion-grid">
          <div className="conversion-item">
            <span className="conversion-label">📋 Perfil completo / Registrados</span>
            <span className="conversion-rate">{safe(profileStage.count, funnelData.total || 1)}%</span>
          </div>
          <div className="conversion-item">
            <span className="conversion-label">📨 Postulados / Con perfil completo</span>
            <span className="conversion-rate">{safe(appliedStage.count, profileStage.count)}%</span>
          </div>
          <div className="conversion-item">
            <span className="conversion-label">✅ Vinculados / Postulados</span>
            <span className="conversion-rate conversion-rate--highlight">{safe(placedStage.count, appliedStage.count)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmploymentFunnel;
