import React, { useEffect, useMemo, useState } from 'react';
import { FaBuilding, FaClipboardList, FaTags } from 'react-icons/fa';
import AdminForm from './components/AdminForm';
import AdminStats from './components/AdminStats';
import TagManager from './components/TagManager';
import './AdminManualData.css';

const STORAGE_KEY = 'publientis_admin_manual_data';

const initialData = {
  institutions: [],
  vacancies: [],
  tags: ['Inclusión', 'Bilingüismo']
};

const AdminManualData = () => {
  const [manualData, setManualData] = useState(initialData);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setManualData({
          institutions: Array.isArray(parsed.institutions) ? parsed.institutions : [],
          vacancies: Array.isArray(parsed.vacancies) ? parsed.vacancies : [],
          tags: Array.isArray(parsed.tags) && parsed.tags.length ? parsed.tags : initialData.tags
        });
      }
    } catch (error) {
      console.error('Error loading manual admin data:', error);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(manualData));
  }, [manualData]);

  const handleAddInstitution = (institution) => {
    setManualData((prev) => ({
      ...prev,
      institutions: [institution, ...prev.institutions]
    }));
  };

  const handleAddVacancy = (vacancy) => {
    setManualData((prev) => ({
      ...prev,
      vacancies: [vacancy, ...prev.vacancies]
    }));
  };

  const handleAddTag = (tag) => {
    setManualData((prev) => {
      if (prev.tags.some((item) => item.toLowerCase() === tag.toLowerCase())) {
        return prev;
      }

      return {
        ...prev,
        tags: [...prev.tags, tag]
      };
    });
  };

  const handleDeleteTag = (tagToDelete) => {
    setManualData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToDelete)
    }));
  };

  const stats = useMemo(() => {
    const totalInstitutions = manualData.institutions.length;
    const activeAgreements = manualData.institutions.filter((item) => item.agreementStatus === 'activo').length;
    const totalVacancies = manualData.vacancies.length;
    const totalAvailableSlots = manualData.vacancies.reduce((sum, item) => sum + Number(item.availableSlots || 0), 0);
    const totalAssignedStudents = manualData.vacancies.reduce((sum, item) => sum + Number(item.assignedStudents || 0), 0);

    return {
      totalInstitutions,
      activeAgreements,
      totalVacancies,
      totalAvailableSlots,
      totalAssignedStudents
    };
  }, [manualData]);

  return (
    <div className="admin-manual-data">
      <div className="admin-manual-data__hero">
        <div>
          <h1>Gestión Manual de Convenios y Plazas</h1>
          <p>Administra instituciones, vacantes pedagógicas y tags de especialidad sin depender de datos estáticos.</p>
        </div>
        <div className="admin-manual-data__summary-grid">
          <div className="admin-manual-data__summary-card">
            <FaBuilding />
            <div>
              <strong>{stats.totalInstitutions}</strong>
              <span>Instituciones registradas</span>
            </div>
          </div>
          <div className="admin-manual-data__summary-card">
            <FaClipboardList />
            <div>
              <strong>{stats.totalVacancies}</strong>
              <span>Vacantes creadas</span>
            </div>
          </div>
          <div className="admin-manual-data__summary-card">
            <FaTags />
            <div>
              <strong>{manualData.tags.length}</strong>
              <span>Tags activos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-manual-data__layout">
        <div className="admin-manual-data__left-column">
          <AdminForm
            institutions={manualData.institutions}
            tags={manualData.tags}
            onAddInstitution={handleAddInstitution}
            onAddVacancy={handleAddVacancy}
          />
          <TagManager
            tags={manualData.tags}
            onAddTag={handleAddTag}
            onDeleteTag={handleDeleteTag}
          />
        </div>

        <div className="admin-manual-data__right-column">
          <AdminStats vacancies={manualData.vacancies} />

          <section className="admin-manual-data__panel">
            <h2>Instituciones registradas</h2>
            {manualData.institutions.length === 0 ? (
              <p className="admin-manual-data__empty">Aún no has registrado instituciones manualmente.</p>
            ) : (
              <div className="admin-manual-data__list">
                {manualData.institutions.map((institution) => (
                  <article key={institution.id} className="admin-manual-data__list-card">
                    <div>
                      <h3>{institution.name}</h3>
                      <p>{institution.city} · {institution.contactName}</p>
                    </div>
                    <span className={`admin-manual-data__badge admin-manual-data__badge--${institution.agreementStatus}`}>
                      {institution.agreementStatus}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="admin-manual-data__panel">
            <h2>Vacantes pedagógicas</h2>
            {manualData.vacancies.length === 0 ? (
              <p className="admin-manual-data__empty">No hay vacantes cargadas todavía.</p>
            ) : (
              <div className="admin-manual-data__table-wrapper">
                <table className="admin-manual-data__table">
                  <thead>
                    <tr>
                      <th>Vacante</th>
                      <th>Institución</th>
                      <th>Énfasis</th>
                      <th>Plazas</th>
                      <th>Asignados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manualData.vacancies.map((vacancy) => (
                      <tr key={vacancy.id}>
                        <td>{vacancy.title}</td>
                        <td>{vacancy.institutionName}</td>
                        <td>{vacancy.pedagogicalEmphasis}</td>
                        <td>{vacancy.availableSlots}</td>
                        <td>{vacancy.assignedStudents}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminManualData;
