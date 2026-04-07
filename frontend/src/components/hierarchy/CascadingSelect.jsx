import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import './CascadingSelect.css';

/**
 * CascadingSelect - Selector Dependiente de 3 Niveles
 * 
 * Implementa flujo obligatorio:
 * Universidad → Facultad → Programa Académico
 * 
 * Basado en principios de:
 * - Interfaz Adaptativa (López Jaquero)
 * - Aplicaciones Basadas en Tareas (Unger & Chandler)
 * 
 * Props:
 * - onSelectionComplete: (university, faculty, program) => void
 * - initialValues: { universityId, facultyId, programId }
 * - required: boolean
 */

const CascadingSelect = ({
  onSelectionComplete,
  initialValues = {},
  required = true
}) => {
  const [universities, setUniversities] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [programs, setPrograms] = useState([]);

  const [selectedUniversity, setSelectedUniversity] = useState(initialValues.universityId || '');
  const [selectedFaculty, setSelectedFaculty] = useState(initialValues.facultyId || '');
  const [selectedProgram, setSelectedProgram] = useState(initialValues.programId || '');

  const [loading, setLoading] = useState({
    universities: false,
    faculties: false,
    programs: false
  });

  // Cargar universidades al montar
  useEffect(() => {
    fetchUniversities();
  }, []);

  // Cargar facultades cuando se selecciona universidad
  useEffect(() => {
    if (selectedUniversity) {
      fetchFaculties(selectedUniversity);
    } else {
      setFaculties([]);
      setPrograms([]);
      setSelectedFaculty('');
      setSelectedProgram('');
    }
  }, [selectedUniversity]);

  // Cargar programas cuando se selecciona facultad
  useEffect(() => {
    if (selectedFaculty) {
      fetchPrograms(selectedFaculty);
    } else {
      setPrograms([]);
      setSelectedProgram('');
    }
  }, [selectedFaculty]);

  // Notificar cuando se completa la selección
  useEffect(() => {
    if (selectedUniversity && selectedFaculty && selectedProgram) {
      const university = universities.find(u => u._id === selectedUniversity);
      const faculty = faculties.find(f => f._id === selectedFaculty);
      const program = programs.find(p => p._id === selectedProgram);

      onSelectionComplete({
        universityId: selectedUniversity,
        universityName: university?.name,
        facultyId: selectedFaculty,
        facultyName: faculty?.name,
        programId: selectedProgram,
        programName: program?.name,
        programLevel: program?.level
      });
    }
  }, [selectedUniversity, selectedFaculty, selectedProgram]);

  const fetchUniversities = async () => {
    try {
      setLoading(prev => ({ ...prev, universities: true }));
      const { data } = await axiosInstance.get('/api/hierarchy/universities');
      setUniversities(data.universities || []);
    } catch (error) {
      console.error('Error al cargar universidades:', error);
    } finally {
      setLoading(prev => ({ ...prev, universities: false }));
    }
  };

  const fetchFaculties = async (universityId) => {
    try {
      setLoading(prev => ({ ...prev, faculties: true }));
      const { data } = await axiosInstance.get(`/api/hierarchy/faculties/${universityId}`);
      setFaculties(data.faculties || []);
    } catch (error) {
      console.error('Error al cargar facultades:', error);
    } finally {
      setLoading(prev => ({ ...prev, faculties: false }));
    }
  };

  const fetchPrograms = async (facultyId) => {
    try {
      setLoading(prev => ({ ...prev, programs: true }));
      const { data } = await axiosInstance.get(`/api/hierarchy/programs/${facultyId}`);
      setPrograms(data.programs || []);
    } catch (error) {
      console.error('Error al cargar programas:', error);
    } finally {
      setLoading(prev => ({ ...prev, programs: false }));
    }
  };

  const handleUniversityChange = (e) => {
    setSelectedUniversity(e.target.value);
  };

  const handleFacultyChange = (e) => {
    setSelectedFaculty(e.target.value);
  };

  const handleProgramChange = (e) => {
    setSelectedProgram(e.target.value);
  };

  return (
    <div className="cascading-select-container">
      <div className="cascading-select-header">
        <h3>Información Académica</h3>
        <p className="cascading-select-description">
          Selecciona tu universidad, facultad y programa académico
        </p>
      </div>

      {/* Nivel 0: Universidad */}
      <div className="select-level">
        <label htmlFor="university" className="select-label">
          <span className="level-badge level-0">Nivel 0</span>
          Universidad {required && <span className="required">*</span>}
        </label>
        <select
          id="university"
          value={selectedUniversity}
          onChange={handleUniversityChange}
          className="select-input"
          required={required}
          disabled={loading.universities}
        >
          <option value="">
            {loading.universities ? 'Cargando universidades...' : 'Selecciona tu universidad'}
          </option>
          {universities.map(university => (
            <option key={university._id} value={university._id}>
              {university.name} ({university.code}) - {university.location?.city}
            </option>
          ))}
        </select>
        {!selectedUniversity && (
          <p className="select-hint">👆 Comienza seleccionando tu universidad</p>
        )}
      </div>

      {/* Nivel 1: Facultad */}
      <div className={`select-level ${!selectedUniversity ? 'disabled' : ''}`}>
        <label htmlFor="faculty" className="select-label">
          <span className="level-badge level-1">Nivel 1</span>
          Facultad {required && <span className="required">*</span>}
        </label>
        <select
          id="faculty"
          value={selectedFaculty}
          onChange={handleFacultyChange}
          className="select-input"
          required={required}
          disabled={!selectedUniversity || loading.faculties}
        >
          <option value="">
            {!selectedUniversity
              ? 'Primero selecciona una universidad'
              : loading.faculties
              ? 'Cargando facultades...'
              : 'Selecciona tu facultad'}
          </option>
          {faculties.map(faculty => (
            <option key={faculty._id} value={faculty._id}>
              {faculty.name} ({faculty.code})
            </option>
          ))}
        </select>
        {selectedUniversity && faculties.length === 0 && !loading.faculties && (
          <p className="select-warning">⚠️ Esta universidad no tiene facultades registradas</p>
        )}
      </div>

      {/* Nivel 2: Programa Académico */}
      <div className={`select-level ${!selectedFaculty ? 'disabled' : ''}`}>
        <label htmlFor="program" className="select-label">
          <span className="level-badge level-2">Nivel 2</span>
          Programa Académico {required && <span className="required">*</span>}
        </label>
        <select
          id="program"
          value={selectedProgram}
          onChange={handleProgramChange}
          className="select-input"
          required={required}
          disabled={!selectedFaculty || loading.programs}
        >
          <option value="">
            {!selectedFaculty
              ? 'Primero selecciona una facultad'
              : loading.programs
              ? 'Cargando programas...'
              : 'Selecciona tu programa académico'}
          </option>
          {programs.map(program => (
            <option key={program._id} value={program._id}>
              {program.name} - {program.level}
            </option>
          ))}
        </select>
        {selectedFaculty && programs.length === 0 && !loading.programs && (
          <p className="select-warning">⚠️ Esta facultad no tiene programas registrados</p>
        )}
      </div>

      {/* Indicador de progreso */}
      <div className="cascading-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${
                (selectedUniversity ? 33.33 : 0) +
                (selectedFaculty ? 33.33 : 0) +
                (selectedProgram ? 33.34 : 0)
              }%`
            }}
          />
        </div>
        <p className="progress-text">
          {selectedProgram
            ? '✅ Selección completa'
            : selectedFaculty
            ? '⏳ Selecciona tu programa académico'
            : selectedUniversity
            ? '⏳ Selecciona tu facultad'
            : '⏳ Comienza seleccionando tu universidad'}
        </p>
      </div>

      {/* Resumen de selección */}
      {selectedProgram && (
        <div className="selection-summary">
          <h4>📋 Resumen de Selección</h4>
          <div className="summary-item">
            <span className="summary-label">Universidad:</span>
            <span className="summary-value">
              {universities.find(u => u._id === selectedUniversity)?.name}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Facultad:</span>
            <span className="summary-value">
              {faculties.find(f => f._id === selectedFaculty)?.name}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Programa:</span>
            <span className="summary-value">
              {programs.find(p => p._id === selectedProgram)?.name} (
              {programs.find(p => p._id === selectedProgram)?.level})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CascadingSelect;
