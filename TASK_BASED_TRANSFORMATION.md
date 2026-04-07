# 🎯 Transformación a Task-Based Application

**Fecha:** 7 de abril, 2026  
**Objetivo:** Reorientar Publientis de red social académica a plataforma de match profesional

**Basado en:**
- Unger & Chandler (Task-Based Applications)
- López Jaquero (Interfaces Adaptativas)

---

## 📊 Análisis: Estado Actual vs. Visión

### **Estado Actual (Red Social Genérica):**
```
Ruta principal: / → AcademicFeed.jsx (feed de posts)
Prioridad 1: Publicaciones académicas
Prioridad 2: Networking social
Prioridad 3: Vinculación laboral
```

### **Visión Task-Based (Match Profesional):**
```
Ruta principal: / → EmployabilityHub.jsx (buscador + oportunidades)
Prioridad 1: Match Egresado ↔ Organización (validado por Facultad)
Prioridad 2: Gestión de portafolio y vacantes
Prioridad 3: Comunidad académica (feed social)
```

---

## ✅ Lo que YA TENEMOS (Aprovechable)

### **Backend:**
```javascript
✅ Jerarquía académica (University → Faculty → Program)
✅ userModel con university, facultyRef, academicProgramRef
✅ FacultyDashboard.jsx (nivel 1 de jerarquía)
✅ EmployabilityDashboard.jsx (métricas de empleabilidad)
✅ SavedCandidates.jsx (favoritos de organizaciones)
✅ MyPortfolio.jsx (portafolio pedagógico)
✅ JobOffer + JobApplication (sistema de vacantes)
✅ Evaluaciones post-práctica
✅ CV Generator
```

### **Componentes Reutilizables:**
- `hierarchyController.js` - Gestión de programas
- `favoritesController.js` - Ya guarda candidatos
- `portfolioController.js` - Evidencias pedagógicas
- `employabilityStatsController.js` - Métricas

---

## ❌ Lo que FALTA (A Implementar)

### **1. Sistema de Verificación Académica**

**Objetivo:** La Facultad certifica que el egresado está listo para vinculación.

**Modelo de Datos:**
```javascript
// Agregar a userModel.js:
profileStatus: {
  type: String,
  enum: ['incomplete', 'pending_verification', 'verified', 'rejected'],
  default: 'incomplete'
},
verifiedBy: {
  facultyCoordinator: { type: ObjectId, ref: 'User' },
  verificationDate: Date,
  verificationNotes: String
},
profileCompleteness: {
  type: Number,
  default: 0,
  min: 0,
  max: 100
},
visibilityLevel: {
  type: String,
  enum: ['hidden', 'internal', 'public'],
  default: 'hidden'
  // hidden: No aparece en búsquedas
  // internal: Solo Facultad lo ve
  // public: Organizaciones pueden verlo
}
```

**Flujo de Verificación:**
1. Egresado completa perfil + portafolio
2. Sistema calcula `profileCompleteness` (0-100%)
3. Si ≥80%, egresado puede solicitar verificación
4. Coordinador de programa (DOCENTE) revisa en FacultyDashboard
5. Coordinador aprueba/rechaza con comentarios
6. Si aprueba → `profileStatus: 'verified'` + Badge en perfil
7. Solo perfiles verificados aparecen en búsqueda de Organizaciones

---

### **2. Dashboard de Curaduría (Facultad)**

**Archivo:** `frontend/src/pages/dashboards/FacultyCurationPanel.jsx`

**Funcionalidades:**
```javascript
// Secciones del Panel:
1. Pendientes de Verificación (tabla)
   - Nombre, Programa, % Completitud, Fecha solicitud
   - Acción: "Revisar Perfil" → Modal con portafolio
   
2. Egresados Verificados (grid de cards)
   - Filtros: Programa, Énfasis pedagógico, Fecha egreso
   - Estadísticas: X verificados / Y total
   
3. Métricas de Calidad
   - Tiempo promedio de verificación
   - % de verificados que consiguen práctica
   - Rating promedio de evaluaciones post-práctica
   
4. Alertas
   - Egresados con portafolio incompleto
   - Verificaciones pendientes >7 días
```

**Integración:**
- Añadir pestaña en `FacultyDashboard.jsx`: "Verificación de Egresados"
- Endpoint: `GET /api/hierarchy/program/:id/students?status=pending_verification`

---

### **3. Buscador de Talento (Organizaciones)**

**Archivo:** `frontend/src/modules/jobs/pages/TalentFinder.jsx`

**Características:**
```javascript
// Filtros Avanzados (Match Técnico):
- Programa académico (dropdown jerárquico)
- Énfasis pedagógico (tags: Inclusión, TIC, Artística...)
- Nivel educativo de experiencia (Inicial, Básica, Media)
- Disponibilidad (Inmediata, En 1 mes, En 3 meses)
- Ubicación geográfica (ciudad)
- Rating mínimo (estrellas de evaluaciones)

// Visualización de Resultados:
- Card con foto + nombre + programa
- Badge "✓ Verificado por UPN" (destacado)
- Preview de portafolio (últimas 3 evidencias)
- Botón "Ver Portafolio Completo" → Modal
- Botón "Guardar Candidato" (ya existe en favoritesController)
- Botón "Invitar a Postular" → Envía notificación

// Ordenamiento:
- Por relevancia (match con requisitos)
- Por rating (mejor evaluados primero)
- Por recencia (recién egresados primero)
```

**Endpoint Nuevo:**
```javascript
// backend/controller/talentController.js
exports.searchTalent = async (req, res) => {
  const {
    programId,
    pedagogicalEmphasis,
    educationalLevel,
    availability,
    location,
    minRating
  } = req.query;
  
  const query = {
    profileStatus: 'verified', // SOLO VERIFICADOS
    role: { $in: ['STUDENT', 'USER'] },
    academicProgramRef: programId
  };
  
  // Filtros adicionales...
  
  const talents = await User.find(query)
    .populate('academicProgramRef')
    .populate('university')
    .select('name profilePic portfolio academicLevel location')
    .sort({ 'evaluations.averageRating': -1 });
    
  res.json({ success: true, talents });
};
```

---

### **4. Rediseño de Home.jsx**

**Concepto:** "LinkedIn Pedagógico" no "Facebook Académico"

**Nueva Estructura:**
```jsx
<Home>
  {/* Hero Section - Empleabilidad */}
  <section className="hero-employability">
    <h1>Conecta Talento Pedagógico con Oportunidades Reales</h1>
    <p>Validado por las Facultades de Educación</p>
    
    {/* Buscador Dual */}
    <div className="dual-search">
      {/* Para Egresados */}
      <SearchBox 
        type="opportunities"
        placeholder="Busca vacantes por nivel educativo, ubicación..."
        cta="Explorar Oportunidades"
      />
      
      {/* Para Organizaciones */}
      <SearchBox 
        type="talent"
        placeholder="Busca egresados por programa, énfasis pedagógico..."
        cta="Encontrar Talento"
      />
    </div>
  </section>
  
  {/* Sección de Confianza */}
  <section className="trust-indicators">
    <div>
      <FaCheckCircle />
      <h3>Perfiles Verificados</h3>
      <p>Cada egresado es validado por su Facultad</p>
    </div>
    <div>
      <FaFileAlt />
      <h3>Portafolios Completos</h3>
      <p>Evidencias pedagógicas reales, no solo CVs</p>
    </div>
    <div>
      <FaStar />
      <h3>Evaluaciones Reales</h3>
      <p>Rating de instituciones donde practicaron</p>
    </div>
  </section>
  
  {/* CTA por Rol */}
  {!user && (
    <section className="role-based-cta">
      <Card>
        <h3>¿Eres Egresado?</h3>
        <p>Crea tu portafolio y obtén tu certificación</p>
        <Link to="/sign-up?role=STUDENT">Registrarme</Link>
      </Card>
      <Card>
        <h3>¿Representas una Institución?</h3>
        <p>Encuentra docentes en formación certificados</p>
        <Link to="/sign-up?role=ORGANIZATION">Explorar Talento</Link>
      </Card>
    </section>
  )}
  
  {/* Testimonios (Social Proof) */}
  <section className="testimonials">
    {/* Casos de éxito: "María encontró práctica en 2 semanas" */}
  </section>
</Home>
```

---

### **5. Reorganización del Routing**

**Cambios en `frontend/src/routes/index.js`:**
```javascript
// ANTES:
{ path: "", element: <ProtectedRoute><AcademicFeed /></ProtectedRoute> },

// DESPUÉS:
{ path: "", element: <Home /> }, // Landing de empleabilidad (público)
{ path: "comunidad", element: <ProtectedRoute><AcademicFeed /></ProtectedRoute> }, // Feed social (secundario)
{ path: "oportunidades", element: <JobBoard /> }, // Vacantes (público)
{ path: "talento", element: <ProtectedRoute allowedRoles={["ORGANIZATION"]}><TalentFinder /></ProtectedRoute> },
```

**Navegación Adaptativa (Header.jsx):**
```javascript
// Por Rol:
if (role === 'STUDENT' || role === 'USER') {
  <NavLink to="/oportunidades">Buscar Vacantes</NavLink>
  <NavLink to="/perfil/portafolio">Mi Portafolio</NavLink>
  <NavLink to="/comunidad">Comunidad</NavLink> // Tercer lugar
}

if (role === 'ORGANIZATION') {
  <NavLink to="/talento">Encontrar Candidatos</NavLink>
  <NavLink to="/jobs/my-offers">Mis Vacantes</NavLink>
  <NavLink to="/saved-candidates">Favoritos</NavLink>
}

if (role === 'FACULTY' || role === 'DOCENTE') {
  <NavLink to="/dashboard/faculty">Panel de Gestión</NavLink>
  <NavLink to="/dashboard/faculty?tab=verificacion">Verificar Egresados</NavLink>
  <NavLink to="/employability-dashboard">Métricas</NavLink>
}
```

---

## 🏗️ Plan de Implementación (3 Fases)

### **Fase 1: Sistema de Verificación (Prioridad Alta)**
**Tiempo estimado:** 2-3 horas

1. **Backend:**
   - [ ] Agregar campos de verificación a `userModel.js`
   - [ ] Crear `verificationController.js`:
     - `requestVerification()` - Egresado solicita
     - `getPendingVerifications()` - Facultad consulta
     - `approveProfile()` - Coordinador aprueba
     - `rejectProfile()` - Coordinador rechaza con comentarios
   - [ ] Crear rutas en `verificationRoutes.js`
   - [ ] Middleware: Solo DOCENTE puede verificar

2. **Frontend:**
   - [ ] Botón "Solicitar Verificación" en `MyPortfolio.jsx`
   - [ ] Pestaña "Verificación" en `FacultyDashboard.jsx`
   - [ ] Componente `VerificationPanel.jsx` (tabla + modal de revisión)
   - [ ] Badge "✓ Verificado" en cards de perfil

3. **Lógica de Negocio:**
   - [ ] Calcular `profileCompleteness` (portafolio + CV + evaluaciones)
   - [ ] Solo perfiles ≥80% pueden solicitar verificación
   - [ ] Notificación a coordinador cuando hay solicitud pendiente

---

### **Fase 2: Buscador de Talento (Prioridad Alta)**
**Tiempo estimado:** 3-4 horas

1. **Backend:**
   - [ ] Crear `talentController.js` con `searchTalent()`
   - [ ] Endpoint: `GET /api/talent/search?programId=...&emphasis=...`
   - [ ] Filtro automático: `profileStatus: 'verified'`
   - [ ] Agregar campo `pedagogicalEmphasis` a userModel (array de tags)

2. **Frontend:**
   - [ ] Crear `TalentFinder.jsx` en `modules/jobs/pages/`
   - [ ] Filtros avanzados con jerarquía académica
   - [ ] Visualización en grid con preview de portafolio
   - [ ] Integración con `SavedCandidates` (favoritos)
   - [ ] Botón "Invitar a Postular" → Notificación

3. **UX:**
   - [ ] Diseño tipo "búsqueda de empleo" (Indeed, LinkedIn)
   - [ ] Destacar badge de verificación visualmente
   - [ ] Portafolio en modal antes de contactar

---

### **Fase 3: Rediseño de Navegación (Prioridad Media)**
**Tiempo estimado:** 2-3 horas

1. **Home.jsx:**
   - [ ] Rediseñar hacia empleabilidad (hero + buscador dual)
   - [ ] Eliminar enfoque de "red social"
   - [ ] CTAs por rol (egresado vs organización)

2. **Routing:**
   - [ ] Mover `AcademicFeed` de `/` a `/comunidad`
   - [ ] Hacer `/` público (landing de empleabilidad)
   - [ ] Agregar `/talento` (solo ORGANIZATION)

3. **Header.jsx:**
   - [ ] Reorganizar links por rol
   - [ ] Priorizar empleabilidad sobre social
   - [ ] "Comunidad" en tercer lugar

---

## 📐 Arquitectura de Navegación Adaptativa

```
┌─────────────────────────────────────────────────────────┐
│                    PUBLIENTIS HOME                      │
│         (Público - Landing de Empleabilidad)            │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌─────▼─────┐      ┌────▼────┐
   │ EGRESADO│       │  FACULTAD │      │  ORG.   │
   └────┬────┘       └─────┬─────┘      └────┬────┘
        │                  │                  │
   1. Oportunidades   1. Panel Curación  1. Buscador Talento
   2. Mi Portafolio   2. Métricas        2. Mis Vacantes
   3. Comunidad       3. Estadísticas    3. Candidatos Guardados
```

---

## 🎯 Diferenciación Estratégica

### **Antes (Red Social):**
- "Sube posts académicos"
- "Conecta con colegas"
- "Comparte logros"

### **Después (Task-Based):**
- "Obtén tu certificación institucional"
- "Encuentra tu práctica validada por tu Facultad"
- "Accede a talento pre-validado por universidades"

---

## 📊 Métricas de Éxito

1. **% de egresados verificados** (objetivo: >70% en 3 meses)
2. **Tiempo promedio de verificación** (objetivo: <48 horas)
3. **% de organizaciones que usan buscador de talento** (objetivo: >80%)
4. **Ratio match → contratación** (objetivo: >30%)
5. **Engagement en /comunidad vs /oportunidades** (evidenciar prioridad)

---

## 🚀 Próximo Paso Inmediato

**Crear el Panel de Verificación para Facultad:**

1. Agregar campos a `userModel.js`
2. Crear `verificationController.js`
3. Implementar pestaña en `FacultyDashboard.jsx`
4. Probar flujo: Solicitud → Revisión → Aprobación → Badge

**¿Procedemos con la Fase 1?**
