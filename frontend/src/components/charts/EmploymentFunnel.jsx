import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import './EmploymentFunnel.css';

const EmploymentFunnel = ({ funnelData }) => {
  if (!funnelData || !funnelData.stages) {
    return (
      <div className="funnel-empty">
        <p>No hay datos disponibles</p>
      </div>
    );
  }

  const { stages } = funnelData;

  // Preparar datos para la gráfica
  const chartData = [
    {
      name: 'Registrados',
      count: stages.registered.count,
      percentage: stages.registered.percentage,
      label: stages.registered.label
    },
    {
      name: 'Perfil Completo',
      count: stages.profileComplete.count,
      percentage: stages.profileComplete.percentage,
      label: stages.profileComplete.label
    },
    {
      name: 'Buscando',
      count: stages.searching.count,
      percentage: stages.searching.percentage,
      label: stages.searching.label
    },
    {
      name: 'Postulado',
      count: stages.applied.count,
      percentage: stages.applied.percentage,
      label: stages.applied.label
    },
    {
      name: 'En Proceso',
      count: stages.inProcess.count,
      percentage: stages.inProcess.percentage,
      label: stages.inProcess.label
    },
    {
      name: 'Vinculados',
      count: stages.placed.count,
      percentage: stages.placed.percentage,
      label: stages.placed.label
    }
  ];

  // Colores por etapa (degradado de azul a verde)
  const colors = ['#1F3C88', '#2563eb', '#3b82f6', '#60a5fa', '#34d399', '#10b981'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{data.label}</p>
          <p className="tooltip-count">{data.count} estudiantes</p>
          <p className="tooltip-percentage">{data.percentage}% del total</p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = (props) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width / 2}
        y={y - 10}
        fill="#1e293b"
        textAnchor="middle"
        fontSize={14}
        fontWeight="600"
      >
        {value}
      </text>
    );
  };

  return (
    <div className="employment-funnel">
      <div className="funnel-header">
        <h3>Embudo de Conversión</h3>
        <p className="funnel-description">
          Visualización del proceso desde registro hasta vinculación laboral
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#64748b', fontSize: 12 }}
            angle={-15}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 12 }}
            label={{ value: 'Estudiantes', angle: -90, position: 'insideLeft', fill: '#475569' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(31, 60, 136, 0.1)' }} />
          <Bar
            dataKey="count"
            radius={[8, 8, 0, 0]}
            label={<CustomLabel />}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="funnel-stats">
        {chartData.map((stage, index) => (
          <div key={index} className="stat-item">
            <div className="stat-color" style={{ backgroundColor: colors[index] }}></div>
            <div className="stat-content">
              <span className="stat-label">{stage.label}</span>
              <div className="stat-values">
                <span className="stat-count">{stage.count}</span>
                <span className="stat-percentage">{stage.percentage}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="conversion-rates">
        <h4>Tasas de Conversión</h4>
        <div className="conversion-grid">
          <div className="conversion-item">
            <span className="conversion-label">Perfil Completo → Buscando</span>
            <span className="conversion-rate">
              {stages.profileComplete.count > 0
                ? Math.round((stages.searching.count / stages.profileComplete.count) * 100)
                : 0}%
            </span>
          </div>
          <div className="conversion-item">
            <span className="conversion-label">Buscando → Postulado</span>
            <span className="conversion-rate">
              {stages.searching.count > 0
                ? Math.round((stages.applied.count / stages.searching.count) * 100)
                : 0}%
            </span>
          </div>
          <div className="conversion-item">
            <span className="conversion-label">Postulado → Vinculado</span>
            <span className="conversion-rate">
              {stages.applied.count > 0
                ? Math.round((stages.placed.count / stages.applied.count) * 100)
                : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmploymentFunnel;
