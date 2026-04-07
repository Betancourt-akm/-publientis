import React, { useMemo, useState } from 'react';
import { FaBuilding, FaClipboardCheck } from 'react-icons/fa';
import './AdminForm.css';

const initialInstitutionForm = {
  name: '',
  city: '',
  contactName: '',
  agreementStatus: 'pendiente'
};

const initialVacancyForm = {
  title: '',
  institutionId: '',
  pedagogicalEmphasis: '',
  availableSlots: 1,
  assignedStudents: 0
};

const AdminForm = ({ institutions, tags, onAddInstitution, onAddVacancy }) => {
  const [activeTab, setActiveTab] = useState('institution');
  const [institutionForm, setInstitutionForm] = useState(initialInstitutionForm);
  const [vacancyForm, setVacancyForm] = useState(initialVacancyForm);

  const sortedInstitutions = useMemo(
    () => [...institutions].sort((a, b) => a.name.localeCompare(b.name)),
    [institutions]
  );

  const handleInstitutionChange = (e) => {
    const { name, value } = e.target;
    setInstitutionForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVacancyChange = (e) => {
    const { name, value } = e.target;
    setVacancyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInstitutionSubmit = (e) => {
    e.preventDefault();

    if (!institutionForm.name.trim() || !institutionForm.contactName.trim()) {
      alert('Completa el nombre de la institución y el contacto principal');
      return;
    }

    onAddInstitution({
      id: `institution-${Date.now()}`,
      name: institutionForm.name.trim(),
      city: institutionForm.city.trim(),
      contactName: institutionForm.contactName.trim(),
      agreementStatus: institutionForm.agreementStatus
    });

    setInstitutionForm(initialInstitutionForm);
    alert('Institución registrada manualmente');
  };

  const handleVacancySubmit = (e) => {
    e.preventDefault();

    if (!vacancyForm.title.trim() || !vacancyForm.institutionId || !vacancyForm.pedagogicalEmphasis.trim()) {
      alert('Completa el cargo, la institución y el énfasis pedagógico');
      return;
    }

    const availableSlots = Number(vacancyForm.availableSlots);
    const assignedStudents = Number(vacancyForm.assignedStudents);

    if (assignedStudents > availableSlots) {
      alert('Los estudiantes asignados no pueden superar las plazas disponibles');
      return;
    }

    const institution = institutions.find((item) => item.id === vacancyForm.institutionId);

    onAddVacancy({
      id: `vacancy-${Date.now()}`,
      title: vacancyForm.title.trim(),
      institutionId: vacancyForm.institutionId,
      institutionName: institution?.name || 'Institución no encontrada',
      pedagogicalEmphasis: vacancyForm.pedagogicalEmphasis.trim(),
      availableSlots,
      assignedStudents,
      suggestedTags: tags.filter((tag) => vacancyForm.pedagogicalEmphasis.toLowerCase().includes(tag.toLowerCase()))
    });

    setVacancyForm(initialVacancyForm);
    alert('Vacante registrada manualmente');
  };

  return (
    <section className="admin-form">
      <div className="admin-form__tabs">
        <button
          type="button"
          className={`admin-form__tab ${activeTab === 'institution' ? 'admin-form__tab--active' : ''}`}
          onClick={() => setActiveTab('institution')}
        >
          <FaBuilding /> Instituciones
        </button>
        <button
          type="button"
          className={`admin-form__tab ${activeTab === 'vacancy' ? 'admin-form__tab--active' : ''}`}
          onClick={() => setActiveTab('vacancy')}
        >
          <FaClipboardCheck /> Vacantes
        </button>
      </div>

      {activeTab === 'institution' ? (
        <form className="admin-form__panel" onSubmit={handleInstitutionSubmit}>
          <h2>Nueva institución educativa</h2>
          <div className="admin-form__field">
            <label htmlFor="name">Nombre</label>
            <input id="name" name="name" value={institutionForm.name} onChange={handleInstitutionChange} />
          </div>
          <div className="admin-form__field">
            <label htmlFor="city">Ciudad</label>
            <input id="city" name="city" value={institutionForm.city} onChange={handleInstitutionChange} />
          </div>
          <div className="admin-form__field">
            <label htmlFor="contactName">Contacto principal</label>
            <input id="contactName" name="contactName" value={institutionForm.contactName} onChange={handleInstitutionChange} />
          </div>
          <div className="admin-form__field">
            <label htmlFor="agreementStatus">Estado de convenio</label>
            <select id="agreementStatus" name="agreementStatus" value={institutionForm.agreementStatus} onChange={handleInstitutionChange}>
              <option value="pendiente">Pendiente</option>
              <option value="activo">Activo</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>
          <button type="submit" className="admin-form__submit">Guardar institución</button>
        </form>
      ) : (
        <form className="admin-form__panel" onSubmit={handleVacancySubmit}>
          <h2>Nueva vacante de práctica</h2>
          <div className="admin-form__field">
            <label htmlFor="title">Cargo o vacante</label>
            <input id="title" name="title" value={vacancyForm.title} onChange={handleVacancyChange} />
          </div>
          <div className="admin-form__field">
            <label htmlFor="institutionId">Institución vinculada</label>
            <select id="institutionId" name="institutionId" value={vacancyForm.institutionId} onChange={handleVacancyChange}>
              <option value="">Selecciona una institución</option>
              {sortedInstitutions.map((institution) => (
                <option key={institution.id} value={institution.id}>{institution.name}</option>
              ))}
            </select>
          </div>
          <div className="admin-form__field">
            <label htmlFor="pedagogicalEmphasis">Énfasis pedagógico</label>
            <input
              id="pedagogicalEmphasis"
              name="pedagogicalEmphasis"
              value={vacancyForm.pedagogicalEmphasis}
              onChange={handleVacancyChange}
              placeholder="Ej: Inclusión y bilingüismo"
            />
          </div>
          <div className="admin-form__grid">
            <div className="admin-form__field">
              <label htmlFor="availableSlots">Plazas disponibles</label>
              <input id="availableSlots" name="availableSlots" type="number" min="1" value={vacancyForm.availableSlots} onChange={handleVacancyChange} />
            </div>
            <div className="admin-form__field">
              <label htmlFor="assignedStudents">Estudiantes asignados</label>
              <input id="assignedStudents" name="assignedStudents" type="number" min="0" value={vacancyForm.assignedStudents} onChange={handleVacancyChange} />
            </div>
          </div>
          {tags.length > 0 && (
            <div className="admin-form__suggestion-box">
              <strong>Tags disponibles:</strong>
              <div className="admin-form__tag-row">
                {tags.map((tag) => (
                  <span key={tag} className="admin-form__tag">{tag}</span>
                ))}
              </div>
            </div>
          )}
          <button type="submit" className="admin-form__submit" disabled={!institutions.length}>Guardar vacante</button>
          {!institutions.length && <p className="admin-form__hint">Primero registra una institución para vincular la vacante.</p>}
        </form>
      )}
    </section>
  );
};

export default AdminForm;
