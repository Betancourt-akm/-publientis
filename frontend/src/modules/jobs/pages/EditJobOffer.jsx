import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBriefcase, FaPlus, FaTimes, FaSave, FaArrowLeft } from 'react-icons/fa';
import jobService from '../services/jobService';
import SEO from '../../../components/common/SEO';
import './CreateJobOffer.css';

const FACULTIES = [
  'Ingeniería', 'Medicina', 'Derecho', 'Administración', 'Educación',
  'Ciencias', 'Artes', 'Arquitectura', 'Psicología', 'Comunicación'
];

const EditJobOffer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'practica',
    modality: 'presencial',
    locationCity: '',
    locationState: '',
    requirements: [''],
    targetFaculties: [],
    compensationType: 'por_definir',
    compensationAmount: '',
    slots: 1,
    durationValue: '',
    durationUnit: 'meses',
    applicationDeadline: '',
    startDate: '',
    tags: ''
  });

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const result = await jobService.getOfferById(id);
        if (result.success) {
          const job = result.data;
          setForm({
            title: job.title || '',
            description: job.description || '',
            type: job.type || 'practica',
            modality: job.modality || 'presencial',
            locationCity: job.location?.city || '',
            locationState: job.location?.state || '',
            requirements: job.requirements?.length > 0 ? job.requirements : [''],
            targetFaculties: job.targetFaculties || [],
            compensationType: job.compensation?.type || 'por_definir',
            compensationAmount: job.compensation?.amount || '',
            slots: job.slots || 1,
            durationValue: job.duration?.value || '',
            durationUnit: job.duration?.unit || 'meses',
            applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : '',
            startDate: job.startDate ? job.startDate.split('T')[0] : '',
            tags: job.tags?.join(', ') || ''
          });
        }
      } catch (error) {
        console.error('Error loading offer:', error);
        alert('No se pudo cargar la oferta');
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFacultyToggle = (faculty) => {
    setForm(prev => ({
      ...prev,
      targetFaculties: prev.targetFaculties.includes(faculty)
        ? prev.targetFaculties.filter(f => f !== faculty)
        : [...prev.targetFaculties, faculty]
    }));
  };

  const handleRequirementChange = (index, value) => {
    setForm(prev => {
      const updated = [...prev.requirements];
      updated[index] = value;
      return { ...prev, requirements: updated };
    });
  };

  const addRequirement = () => {
    setForm(prev => ({ ...prev, requirements: [...prev.requirements, ''] }));
  };

  const removeRequirement = (index) => {
    setForm(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert('El título es obligatorio');
      return;
    }
    if (!form.description.trim()) {
      alert('La descripción es obligatoria');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        modality: form.modality,
        location: {
          city: form.locationCity.trim(),
          state: form.locationState.trim(),
          country: 'Colombia'
        },
        requirements: form.requirements.filter(r => r.trim() !== ''),
        targetFaculties: form.targetFaculties,
        compensation: {
          type: form.compensationType,
          amount: form.compensationType === 'remunerada' ? Number(form.compensationAmount) : 0,
          currency: 'COP'
        },
        slots: Number(form.slots) || 1,
        duration: form.durationValue ? {
          value: Number(form.durationValue),
          unit: form.durationUnit
        } : undefined,
        applicationDeadline: form.applicationDeadline || undefined,
        startDate: form.startDate || undefined,
        tags: form.tags.split(',').map(t => t.trim()).filter(t => t)
      };

      const result = await jobService.updateOffer(id, payload);
      if (result.success) {
        alert('Oferta actualizada exitosamente');
        navigate('/jobs/my-offers');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al actualizar la oferta';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="create-job" style={{ textAlign: 'center', padding: '4rem' }}>
        <p>Cargando oferta...</p>
      </div>
    );
  }

  return (
    <div className="create-job">
      <SEO title="Editar Oferta Laboral" description="Modifica tu oferta laboral" />

      <button className="create-job__cancel" onClick={() => navigate(-1)} style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'none', color: '#6366f1', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
        <FaArrowLeft /> Volver
      </button>

      <h1 className="create-job__title"><FaBriefcase /> Editar Oferta</h1>
      <p className="create-job__subtitle">Si cambias datos significativos, la oferta podría requerir re-aprobación</p>

      <form className="create-job__form" onSubmit={handleSubmit}>
        <section className="create-job__section">
          <h2>Información básica</h2>
          <div className="create-job__field">
            <label htmlFor="title">Título de la oferta *</label>
            <input id="title" name="title" value={form.title} onChange={handleChange} maxLength={150} required />
          </div>
          <div className="create-job__field">
            <label htmlFor="description">Descripción *</label>
            <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={6} maxLength={5000} required />
          </div>
          <div className="create-job__row">
            <div className="create-job__field">
              <label htmlFor="type">Tipo</label>
              <select id="type" name="type" value={form.type} onChange={handleChange}>
                <option value="practica">Práctica Profesional</option>
                <option value="empleo">Empleo</option>
                <option value="voluntariado">Voluntariado</option>
                <option value="investigacion">Investigación</option>
              </select>
            </div>
            <div className="create-job__field">
              <label htmlFor="modality">Modalidad</label>
              <select id="modality" name="modality" value={form.modality} onChange={handleChange}>
                <option value="presencial">Presencial</option>
                <option value="remoto">Remoto</option>
                <option value="hibrido">Híbrido</option>
              </select>
            </div>
          </div>
        </section>

        <section className="create-job__section">
          <h2>Ubicación</h2>
          <div className="create-job__row">
            <div className="create-job__field">
              <label htmlFor="locationCity">Ciudad</label>
              <input id="locationCity" name="locationCity" value={form.locationCity} onChange={handleChange} />
            </div>
            <div className="create-job__field">
              <label htmlFor="locationState">Departamento</label>
              <input id="locationState" name="locationState" value={form.locationState} onChange={handleChange} />
            </div>
          </div>
        </section>

        <section className="create-job__section">
          <h2>Requisitos</h2>
          {form.requirements.map((req, i) => (
            <div key={i} className="create-job__requirement-row">
              <input value={req} onChange={(e) => handleRequirementChange(i, e.target.value)} placeholder={`Requisito ${i + 1}`} />
              {form.requirements.length > 1 && (
                <button type="button" className="create-job__remove-btn" onClick={() => removeRequirement(i)}><FaTimes /></button>
              )}
            </div>
          ))}
          <button type="button" className="create-job__add-btn" onClick={addRequirement}><FaPlus /> Agregar requisito</button>
        </section>

        <section className="create-job__section">
          <h2>Facultades objetivo</h2>
          <div className="create-job__faculties">
            {FACULTIES.map(f => (
              <button key={f} type="button"
                className={`create-job__faculty-btn ${form.targetFaculties.includes(f) ? 'create-job__faculty-btn--active' : ''}`}
                onClick={() => handleFacultyToggle(f)}>
                {f}
              </button>
            ))}
          </div>
        </section>

        <section className="create-job__section">
          <h2>Compensación y condiciones</h2>
          <div className="create-job__row">
            <div className="create-job__field">
              <label htmlFor="compensationType">Compensación</label>
              <select id="compensationType" name="compensationType" value={form.compensationType} onChange={handleChange}>
                <option value="por_definir">Por definir</option>
                <option value="remunerada">Remunerada</option>
                <option value="no_remunerada">No remunerada</option>
              </select>
            </div>
            {form.compensationType === 'remunerada' && (
              <div className="create-job__field">
                <label htmlFor="compensationAmount">Monto (COP)</label>
                <input id="compensationAmount" name="compensationAmount" type="number" value={form.compensationAmount} onChange={handleChange} min={0} />
              </div>
            )}
            <div className="create-job__field">
              <label htmlFor="slots">Vacantes</label>
              <input id="slots" name="slots" type="number" value={form.slots} onChange={handleChange} min={1} />
            </div>
          </div>
          <div className="create-job__row">
            <div className="create-job__field">
              <label htmlFor="durationValue">Duración</label>
              <input id="durationValue" name="durationValue" type="number" value={form.durationValue} onChange={handleChange} min={0} />
            </div>
            <div className="create-job__field">
              <label htmlFor="durationUnit">Unidad</label>
              <select id="durationUnit" name="durationUnit" value={form.durationUnit} onChange={handleChange}>
                <option value="dias">Días</option>
                <option value="semanas">Semanas</option>
                <option value="meses">Meses</option>
              </select>
            </div>
          </div>
        </section>

        <section className="create-job__section">
          <h2>Fechas</h2>
          <div className="create-job__row">
            <div className="create-job__field">
              <label htmlFor="applicationDeadline">Fecha límite de postulación</label>
              <input id="applicationDeadline" name="applicationDeadline" type="date" value={form.applicationDeadline} onChange={handleChange} />
            </div>
            <div className="create-job__field">
              <label htmlFor="startDate">Fecha de inicio</label>
              <input id="startDate" name="startDate" type="date" value={form.startDate} onChange={handleChange} />
            </div>
          </div>
        </section>

        <section className="create-job__section">
          <h2>Tags</h2>
          <div className="create-job__field">
            <label htmlFor="tags">Etiquetas (separadas por coma)</label>
            <input id="tags" name="tags" value={form.tags} onChange={handleChange} />
          </div>
        </section>

        <div className="create-job__actions">
          <button type="submit" className="create-job__submit" disabled={saving}>
            {saving ? 'Guardando...' : <><FaSave /> Guardar cambios</>}
          </button>
          <button type="button" className="create-job__cancel" onClick={() => navigate(-1)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJobOffer;
