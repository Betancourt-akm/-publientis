# 🎯 Publientis: Marketplace de Talento + Red Social Educativa

**Fecha:** 7 de abril, 2026  
**Visión:** Híbrido Marketplace-Social con Facultad como Broker

**Principios:**
- **Gratuito e Institucional** - La moneda es la reputación académica
- **Marketplace First** - Buscador y match como prioridad visual
- **Red Social Integrada** - Validación de competencias y networking
- **Facultad como Broker** - Garantiza calidad sin cobrar

**Basado en:**
- Unger & Chandler (Aplicaciones de Búsqueda)
- López Jaquero (Interfaces Adaptativas por Rol)

---

## 🏗️ Arquitectura Visual

```
┌─────────────────────────────────────────────────────────┐
│                    PUBLIENTIS HOME                      │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  🔍 BUSCADOR DUAL                                 │ │
│  │  ┌──────────────┬──────────────┐                 │ │
│  │  │ Buscar Talento│ Buscar Empleo│                │ │
│  │  └──────────────┴──────────────┘                 │ │
│  │  Filtros: Programa | Énfasis | Ubicación         │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │ TalentoCard │  │ TalentoCard │  │ TalentoCard │   │
│  │ ✓ Verificado│  │ ✓ Verificado│  │ ✓ Verificado│   │
│  │ UPN - Educ. │  │ UPN - Educ. │  │ UPN - Educ. │   │
│  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                         │
│  Sidebar: Feed Comunidad (secundario) ───────────────► │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Dashboard de Matchmaking (Corazón del Sistema)

### **Ubicación:**
`frontend/src/pages/dashboards/MatchmakingDashboard.jsx`

### **Acceso por Rol:**

| Rol | Vista | Métricas |
|-----|-------|----------|
| **Admin Universidad** | Macro (todas facultades) | Total matches institución |
| **Decano Facultad** | Meso (todos programas) | Qué programas tienen más éxito |
| **Coordinador Programa** | Micro (su programa) | Postulaciones + Recomendaciones activas |

### **KPIs de Gratuidad (No Monetarios):**

```javascript
const kpis = {
  // Indicadores de Calidad
  verificacionIndex: {
    label: "Índice de Verificación",
    formula: "(Egresados verificados / Total egresados) * 100",
    meta: ">70%",
    color: "#10B981" // Verde éxito
  },
  
  matchesActivos: {
    label: "Matches Activos (7 días)",
    formula: "COUNT(contactos organizaciones → egresados)",
    meta: ">50/semana",
    color: "#3B82F6" // Azul información
  },
  
  tasaRespuesta: {
    label: "Tasa de Respuesta Organizaciones",
    formula: "Tiempo promedio respuesta a postulaciones",
    meta: "<48 horas",
    color: "#F59E0B" // Amarillo atención
  },
  
  empleabilidadIndex: {
    label: "Índice de Empleabilidad",
    formula: "(Egresados empleados / Total egresados) * 100",
    meta: ">60%",
    color: "#8B5CF6" // Púrpura prestigio
  },
  
  reputacionSocial: {
    label: "Engagement Red Social",
    formula: "AVG(interacciones validadas por egresado)",
    meta: ">10/mes",
    color: "#EC4899" // Rosa social
  }
};
```

### **Componentes del Dashboard:**

#### **1. Panel de KPIs (Superior)**
```jsx
<div className="kpi-grid">
  <KPICard 
    value="73%" 
    label="Índice de Verificación"
    trend="+5% vs mes anterior"
    status="success"
  />
  <KPICard 
    value="62" 
    label="Matches Activos"
    trend="+12 esta semana"
    status="success"
  />
  <KPICard 
    value="36h" 
    label="Tiempo Respuesta"
    trend="-8h vs promedio"
    status="warning"
  />
  <KPICard 
    value="58%" 
    label="Empleabilidad"
    trend="+3% trimestre"
    status="info"
  />
</div>
```

#### **2. Tabla de Matches en Tiempo Real**
```jsx
<MatchTable>
  <thead>
    <tr>
      <th>Egresado</th>
      <th>Organización</th>
      <th>Programa</th>
      <th>Estado</th>
      <th>Fecha</th>
      <th>Acción</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>María López</td>
      <td>Colegio San José</td>
      <td>Lic. Primera Infancia</td>
      <td><Badge>Contactada</Badge></td>
      <td>Hace 2h</td>
      <td><Button>Hacer Seguimiento</Button></td>
    </tr>
  </tbody>
</MatchTable>
```

#### **3. Alertas de Acción (Coordinador)**
```jsx
<AlertPanel>
  <Alert type="verification">
    <Icon>⚠️</Icon>
    <Message>5 egresados pendientes de verificación</Message>
    <Action>Revisar Ahora</Action>
  </Alert>
  
  <Alert type="match">
    <Icon>🔔</Icon>
    <Message>Colegio La Salle busca docente TIC</Message>
    <Action>Recomendar Candidato</Action>
  </Alert>
  
  <Alert type="followup">
    <Icon>📊</Icon>
    <Message>3 matches sin respuesta >48h</Message>
    <Action>Contactar Organización</Action>
  </Alert>
</AlertPanel>
```

#### **4. Gráfica de Tendencias**
```jsx
<ChartSection>
  <LineChart data={matchesPorSemana}>
    <Line name="Matches" stroke="#3B82F6" />
    <Line name="Contrataciones" stroke="#10B981" />
  </LineChart>
  
  <BarChart data={programasMasActivos}>
    <Bar name="Postulaciones" fill="#8B5CF6" />
  </BarChart>
</ChartSection>
```

---

## 🔍 Sistema de Búsqueda (Marketplace)

### **Componente Principal:**
`frontend/src/pages/marketplace/TalentMarketplace.jsx`

### **Buscador Dual:**

```jsx
<SearchHero>
  <Tabs>
    <Tab active={searchMode === 'talent'}>
      <Icon>👥</Icon> Buscar Talento
    </Tab>
    <Tab active={searchMode === 'jobs'}>
      <Icon>💼</Icon> Buscar Empleo
    </Tab>
  </Tabs>
  
  {searchMode === 'talent' ? (
    <TalentSearch>
      <Input 
        placeholder="Ej: Docente de Matemáticas con énfasis TIC"
        icon={<FaSearch />}
      />
      <FilterBar>
        <Select label="Universidad" />
        <Select label="Programa" />
        <MultiSelect label="Énfasis Pedagógico" />
        <Select label="Ubicación" />
        <RangeSlider label="Rating Mínimo" min={1} max={5} />
      </FilterBar>
    </TalentSearch>
  ) : (
    <JobSearch>
      <Input 
        placeholder="Ej: Práctica en educación inicial"
        icon={<FaBriefcase />}
      />
      <FilterBar>
        <Select label="Tipo" options={['Práctica', 'Empleo', 'Freelance']} />
        <Select label="Nivel Educativo" />
        <Select label="Ciudad" />
      </FilterBar>
    </JobSearch>
  )}
</SearchHero>
```

### **TalentoCard (Diseño Marketplace):**

```jsx
<TalentoCard>
  <Header>
    <Avatar src={user.profilePic} />
    <div>
      <Name>{user.name}</Name>
      <Badge verified>✓ Verificado por UPN</Badge>
    </div>
    <Rating>⭐ 4.8 (12 eval.)</Rating>
  </Header>
  
  <Body>
    <AcademicInfo>
      <Icon><FaUniversity /></Icon>
      <Text>
        <Strong>{user.academicProgramRef.name}</Strong>
        <Small>{user.facultyRef.name}</Small>
      </Text>
    </AcademicInfo>
    
    <EmphasisTags>
      {user.pedagogicalEmphasis.map(tag => (
        <Tag key={tag}>{tag}</Tag>
      ))}
    </EmphasisTags>
    
    <PortfolioPreview>
      <Label>Portafolio Destacado:</Label>
      <MiniGallery>
        {user.portfolio.slice(0, 3).map(item => (
          <Thumbnail key={item._id} src={item.thumbnail} />
        ))}
      </MiniGallery>
    </PortfolioPreview>
    
    <Stats>
      <Stat>
        <Icon><FaFileAlt /></Icon>
        <Value>{user.portfolio.length}</Value>
        <Label>Evidencias</Label>
      </Stat>
      <Stat>
        <Icon><FaBriefcase /></Icon>
        <Value>{user.experienceCount}</Value>
        <Label>Prácticas</Label>
      </Stat>
      <Stat>
        <Icon><FaThumbsUp /></Icon>
        <Value>{user.socialScore}</Value>
        <Label>Reputación</Label>
      </Stat>
    </Stats>
  </Body>
  
  <Footer>
    <Button primary onClick={viewPortfolio}>
      <Icon><FaEye /></Icon> Ver Portafolio
    </Button>
    <Button secondary onClick={saveCandidate}>
      <Icon><FaBookmark /></Icon> Guardar
    </Button>
    <Button success onClick={inviteToApply}>
      <Icon><FaPaperPlane /></Icon> Invitar
    </Button>
  </Footer>
</TalentoCard>
```

---

## 🏆 Algoritmo de Visibilidad Social

### **Objetivo:**
Los egresados que participan activamente en la red social ganan posiciones en el Marketplace.

### **Fórmula de Ranking:**

```javascript
const calculateSocialScore = (user) => {
  const weights = {
    publicationsQuality: 0.30,      // 30% - Publicaciones validadas
    peerValidations: 0.25,          // 25% - Likes de profesores/coordinadores
    portfolioCompleteness: 0.20,    // 20% - % de portafolio completo
    evaluationRating: 0.15,         // 15% - Rating de prácticas
    responseTime: 0.10              // 10% - Rapidez respondiendo
  };
  
  const scores = {
    publicationsQuality: (user.validatedPublications / 10) * 100,
    peerValidations: Math.min(user.facultyEndorsements * 10, 100),
    portfolioCompleteness: user.profileCompleteness,
    evaluationRating: (user.averageRating / 5) * 100,
    responseTime: 100 - (user.avgResponseHours * 2)
  };
  
  const finalScore = Object.keys(weights).reduce((total, key) => {
    return total + (scores[key] * weights[key]);
  }, 0);
  
  return Math.round(finalScore);
};
```

### **Modelo de Datos:**

```javascript
// Agregar a userModel.js:
socialScore: {
  type: Number,
  default: 0,
  min: 0,
  max: 100
},
socialMetrics: {
  validatedPublications: { type: Number, default: 0 },
  facultyEndorsements: { type: Number, default: 0 },
  peerInteractions: { type: Number, default: 0 },
  avgResponseHours: { type: Number, default: 24 }
},
lastSocialScoreUpdate: Date
```

### **Trigger de Actualización:**

```javascript
// backend/middleware/socialScoreUpdater.js
const updateSocialScore = async (userId) => {
  const user = await User.findById(userId)
    .populate('portfolio')
    .populate('publications');
    
  const validatedPubs = user.publications.filter(p => p.facultyValidated).length;
  const endorsements = user.endorsements?.filter(e => e.role === 'DOCENTE').length || 0;
  
  const newScore = calculateSocialScore({
    validatedPublications: validatedPubs,
    facultyEndorsements: endorsements,
    profileCompleteness: user.profileCompleteness,
    averageRating: user.evaluations?.averageRating || 0,
    avgResponseHours: user.socialMetrics?.avgResponseHours || 24
  });
  
  await User.findByIdAndUpdate(userId, {
    socialScore: newScore,
    'socialMetrics.validatedPublications': validatedPubs,
    'socialMetrics.facultyEndorsements': endorsements,
    lastSocialScoreUpdate: Date.now()
  });
};

// Ejecutar después de:
// - Crear publicación
// - Recibir endorsement
// - Completar portafolio
// - Recibir evaluación
```

---

## 🔔 Sistema de Alertas de Match

### **Flujo:**

1. **Organización ve TalentoCard** → Click "Ver Portafolio"
2. **Sistema registra interés** → Crea notificación
3. **Coordinador recibe alerta** → "Colegio X interesado en María L."
4. **Coordinador puede:**
   - Ver perfil de la organización
   - Contactar al egresado para prepararlo
   - Hacer seguimiento del match

### **Componente:**

```jsx
// frontend/src/components/matchmaking/MatchAlert.jsx
<MatchAlert>
  <Header>
    <Icon type={alert.type} />
    <Time>{formatTimeAgo(alert.createdAt)}</Time>
  </Header>
  
  <Body>
    <Organization>
      <Logo src={alert.organization.logo} />
      <Name>{alert.organization.name}</Name>
    </Organization>
    
    <Action>mostró interés en</Action>
    
    <Student>
      <Avatar src={alert.student.profilePic} />
      <Name>{alert.student.name}</Name>
      <Program>{alert.student.academicProgramRef.name}</Program>
    </Student>
  </Body>
  
  <Footer>
    <Button onClick={viewDetails}>Ver Detalles</Button>
    <Button onClick={contactStudent}>Contactar Estudiante</Button>
    <Button onClick={markAsFollowed}>Marcar Seguimiento</Button>
  </Footer>
</MatchAlert>
```

### **Backend:**

```javascript
// backend/controller/matchmakingController.js
exports.registerMatchInterest = async (req, res) => {
  const { studentId, action } = req.body;
  const organizationId = req.user._id;
  
  // Registrar interés
  const matchEvent = await MatchEvent.create({
    student: studentId,
    organization: organizationId,
    action, // 'viewed_portfolio', 'saved_candidate', 'invited_to_apply'
    timestamp: Date.now()
  });
  
  // Notificar a Coordinador del Programa
  const student = await User.findById(studentId).populate('academicProgramRef');
  const coordinator = await User.findOne({
    role: 'DOCENTE',
    academicProgramRef: student.academicProgramRef._id
  });
  
  if (coordinator) {
    await createNotification({
      recipient: coordinator._id,
      type: 'match_interest',
      title: 'Nueva Organización Interesada',
      message: `${req.user.name} mostró interés en ${student.name}`,
      relatedEntity: {
        entityType: 'MatchEvent',
        entityId: matchEvent._id
      }
    });
  }
  
  res.json({ success: true, matchEvent });
};
```

---

## 🎨 Reorganización Visual

### **Routing:**

```javascript
// frontend/src/routes/index.js

// ANTES (Red Social Primero):
{ path: "", element: <AcademicFeed /> }
{ path: "about", element: <Home /> }

// DESPUÉS (Marketplace Primero):
{ path: "", element: <TalentMarketplace /> }  // Buscador principal
{ path: "comunidad", element: <AcademicFeed /> }  // Feed social secundario
{ path: "dashboard/matchmaking", element: <MatchmakingDashboard /> }  // Facultad
{ path: "perfil/:id", element: <CVProfile /> }  // Perfil como CV
```

### **Header.jsx (Navegación Adaptativa):**

```jsx
// Por Rol:
{user.role === 'STUDENT' || user.role === 'USER' ? (
  <>
    <NavLink to="/">Buscar Empleo</NavLink>
    <NavLink to="/perfil/portafolio">Mi Portafolio</NavLink>
    <NavLink to="/comunidad">Comunidad</NavLink>
  </>
) : null}

{user.role === 'ORGANIZATION' ? (
  <>
    <NavLink to="/">Buscar Talento</NavLink>
    <NavLink to="/jobs/my-offers">Mis Vacantes</NavLink>
    <NavLink to="/saved-candidates">Favoritos</NavLink>
  </>
) : null}

{user.role === 'DOCENTE' || user.role === 'FACULTY' ? (
  <>
    <NavLink to="/dashboard/matchmaking">Matchmaking</NavLink>
    <NavLink to="/dashboard/faculty">Gestión</NavLink>
    <NavLink to="/comunidad">Comunidad</NavLink>
  </>
) : null}
```

---

## 📋 Plan de Implementación

### **Prioridad 1: Dashboard de Matchmaking**
- [ ] Crear `MatchmakingDashboard.jsx` con KPIs
- [ ] Implementar `MatchEvent` model (backend)
- [ ] Sistema de alertas a coordinadores
- [ ] Gráficas de tendencias

### **Prioridad 2: Marketplace UI**
- [ ] Rediseñar Home como `TalentMarketplace.jsx`
- [ ] Crear `TalentoCard` y `VacanteCard`
- [ ] Buscador dual con filtros avanzados
- [ ] Sistema de guardar favoritos

### **Prioridad 3: Algoritmo Social**
- [ ] Implementar cálculo de `socialScore`
- [ ] Triggers automáticos de actualización
- [ ] Ordenamiento por reputación en resultados

### **Prioridad 4: Reorganización**
- [ ] Mover `AcademicFeed` a `/comunidad`
- [ ] Adaptar Header por roles
- [ ] Perfil como CV evolucionado

---

## 🎯 Métricas de Éxito

1. **% Organizaciones que usan el buscador** (objetivo: >80%)
2. **Matches generados/semana** (objetivo: >50)
3. **% Egresados con socialScore >60** (objetivo: >70%)
4. **Tiempo promedio de contratación** (objetivo: <30 días)
5. **Engagement en red social** (objetivo: >10 interacciones/mes)

---

**¿Empezamos con el MatchmakingDashboard?**
