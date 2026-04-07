import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import './AdminStats.css';

const AdminStats = ({ vacancies }) => {
  const coverageData = useMemo(() => {
    if (!vacancies.length) {
      return [];
    }

    return vacancies.map((vacancy) => ({
      name: vacancy.title,
      disponibles: Number(vacancy.availableSlots || 0),
      asignados: Number(vacancy.assignedStudents || 0)
    }));
  }, [vacancies]);

  const totals = useMemo(() => {
    const disponibles = coverageData.reduce((sum, item) => sum + item.disponibles, 0);
    const asignados = coverageData.reduce((sum, item) => sum + item.asignados, 0);
    const coverageRate = disponibles > 0 ? ((asignados / disponibles) * 100).toFixed(1) : '0.0';

    return { disponibles, asignados, coverageRate };
  }, [coverageData]);

  return (
    <section className="admin-stats">
      <div className="admin-stats__header">
        <div>
          <h2>Cobertura de Plazas</h2>
          <p>Compara plazas disponibles frente a estudiantes asignados en cada vacante.</p>
        </div>
        <div className="admin-stats__kpis">
          <div>
            <strong>{totals.disponibles}</strong>
            <span>Plazas</span>
          </div>
          <div>
            <strong>{totals.asignados}</strong>
            <span>Asignados</span>
          </div>
          <div>
            <strong>{totals.coverageRate}%</strong>
            <span>Cobertura</span>
          </div>
        </div>
      </div>

      {coverageData.length === 0 ? (
        <div className="admin-stats__empty">Registra vacantes manuales para visualizar la gráfica de cobertura.</div>
      ) : (
        <div className="admin-stats__chart-wrapper">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={coverageData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="disponibles" name="Plazas disponibles" fill="#0f766e" radius={[8, 8, 0, 0]} />
              <Bar dataKey="asignados" name="Estudiantes asignados" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};

export default AdminStats;
