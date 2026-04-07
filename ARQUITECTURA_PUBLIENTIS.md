# Arquitectura Publientis - Ecosistema Dual Coherente

## 🎯 Visión General

**Publientis** es una plataforma web centralizada (SPA) que integra dos ejes complementarios bajo un mismo ecosistema institucional educativo:

---

## 1️⃣ Eje Principal: Vinculación Profesional Pedagógica (Core)

Plataforma de intermediación entre **Universidades/Facultades** y el **sector educativo** para gestión de **Prácticas Profesionales** y **Egresados en Pedagogía**.

### Características Core:
- ✅ Red social profesional académica
- ✅ Gestión de convenios institucionales
- ✅ Matching entre perfiles docentes y vacantes pedagógicas
- ✅ Trazabilidad institucional con respaldo de Facultades
- ✅ Segmentación por programas/licenciaturas
- ✅ Tags de especialidad pedagógica (Inclusión, Bilingüismo, Primera Infancia)
- ✅ Aprobación universitaria de ofertas
- ✅ Sistema de postulaciones rastreables

### Roles Pedagógicos:
- **`FACULTY` / `DOCENTE`** - Gestión académica, aprobación de ofertas, supervisión
- **`STUDENT` / `USER`** - Estudiantes y egresados en pedagogía que buscan prácticas
- **`ORGANIZATION`** - Instituciones educativas que publican vacantes
- **`ADMIN`** - Administración del ecosistema completo

### Flujo de Vinculación Pedagógica:

```
1. Estudiante se registra
   → Selecciona Facultad y Programa (Ej: Educación → Lic. Pedagogía Infantil)
   → Elige Tags pedagógicos (Inclusión, Bilingüismo, etc.)
   
2. Organización publica vacante
   → Indica énfasis pedagógico requerido
   → Se vincula a institución educativa
   → Espera aprobación de Facultad
   
3. Facultad aprueba oferta
   → Valida coherencia con programas académicos
   → La oferta se hace visible
   
4. Matching preciso
   → Sistema sugiere vacantes según tags del estudiante
   → Énfasis de vacante coincide con perfil
   
5. Estudiante postula
   → Facultad puede revisar postulación
   → Trazabilidad completa del proceso
   → Respaldo académico institucional
```

---

## 2️⃣ Eje Complementario: Marketplace Educativo

Comercio electrónico de **materiales didácticos**, **recursos pedagógicos** y **productos de apoyo** para docentes.

### Características:
- ✅ Catálogo de recursos educativos
- ✅ Sistema de ventas y logística
- ✅ Panel financiero para sostenibilidad
- ✅ Vendedores registrados (docentes emprendedores, editoriales)
- ✅ Categorías orientadas a pedagogía

### Categorías de Recursos:
1. **Materiales Didácticos** - Fichas, láminas, actividades impresas
2. **Libros y Textos Educativos** - Bibliografía pedagógica
3. **Recursos Digitales** - Software, apps educativas, contenido multimedia
4. **Material para Primera Infancia** - Juguetes didácticos, material sensorial
5. **Herramientas Pedagógicas** - Instrumentos de evaluación, planeadores
6. **Tecnología Educativa** - Hardware educativo, robótica
7. **Recursos de Inclusión** - Material adaptado, apoyos especiales
8. **Material de Apoyo Bilingüe** - Recursos para educación bilingüe
9. **Kits Educativos** - Conjuntos temáticos completos

### Coherencia con el Eje Pedagógico:
- Los **ingresos del marketplace** financian la operación gratuita de la plataforma pedagógica
- Los **vendedores** pueden ser egresados/docentes emprendedores
- Los **productos** apoyan directamente la labor docente
- El **panel financiero** mide sostenibilidad del ecosistema

---

## 📦 Módulos Implementados

### Módulo Academic (Red Social Profesional)
**Ruta:** `/` (feed), `/academic/*`

**Funcionalidades:**
- Feed de publicaciones académicas
- Perfiles de estudiantes y docentes
- Dashboard de facultad
- Gestión de publicaciones
- Búsqueda de perfiles

---

### Módulo Jobs (Vinculación Laboral Pedagógica)
**Rutas:**
- `/jobs` - Tablero de ofertas de práctica
- `/jobs/create` - Crear oferta (organizaciones)
- `/jobs/my-offers` - Mis ofertas publicadas
- `/jobs/my-applications` - Mis postulaciones
- `/jobs/approval` - Panel de aprobación institucional
- `/jobs/:id` - Detalle de oferta
- `/jobs/:id/edit` - Editar oferta
- `/jobs/:id/applicants` - Gestión de postulantes

**Flujo por Rol:**
- **Organizaciones** → Publican vacantes pedagógicas
- **Facultad/Docente** → Aprueban ofertas antes de publicación
- **Estudiantes** → Postulan a vacantes aprobadas
- **Admin** → Supervisión y reportes generales

**Backend:** 
- `jobOfferRoutes.js` - Rutas protegidas por rol
- `jobApplicationRoutes.js` - Sistema de postulaciones
- `jobOfferController.js` - Lógica de aprobación
- `applicationController.js` - Gestión de postulaciones

---

### Módulo Admin Manual Data (Gestión Manual)
**Ruta:** `/admin-panel/manual-data`

**Componentes:**
- **`AdminForm.jsx`** - Alta manual de instituciones educativas y vacantes
- **`TagManager.jsx`** - Gestión de tags de especialidad pedagógica
- **`AdminStats.jsx`** - Gráfica de cobertura de plazas (Recharts)

**Persistencia:** `localStorage` (fase 1, migrar a backend en fase 2)

**Datos gestionados:**
- Instituciones educativas con estado de convenio
- Vacantes de práctica vinculadas a énfasis pedagógico
- Tags de especialidad (Inclusión, Bilingüismo, etc.)
- Estadísticas de cobertura (plazas vs. asignados)

---

### Módulo E-commerce (Marketplace Educativo)
**Rutas:**
- `/productos` - Catálogo de recursos educativos
- `/categorias` - Navegación por categorías
- `/producto/:id` - Detalle de recurso
- `/cart` - Carrito de compras
- `/checkout` - Finalizar compra
- `/mis-ordenes` - Historial de órdenes
- `/vendedor` - Panel de vendedor

**Backend:**
- `productModel.js` - Modelo con categorías educativas
- `orderModel.js` - Gestión de órdenes
- `vendorModel.js` - Vendedores registrados

---

## 🗄️ Modelo de Datos Unificado

### User Model (Extendido para Pedagogía)

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  role: Enum['ADMIN', 'OWNER', 'ORGANIZATION', 'USER', 'DOCENTE', 'STUDENT', 'FACULTY', 'VISITOR'],
  
  // 📚 Perfil Pedagógico
  faculty: String,              // Facultad de origen (Educación, Ingeniería, etc.)
  program: String,              // Programa/Licenciatura (Ej: Lic. Pedagogía Infantil)
  academicLevel: String,        // Pregrado/Posgrado/Egresado
  pedagogicalTags: [String],    // Tags de especialidad del TagManager
  academicStatus: String,       // Activo/Graduado/Practicante
  
  // 🛒 Perfil Comercial (opcional)
  isVendor: Boolean,
  vendorData: {...},
  
  // 🔐 Datos de autenticación
  provider: String,             // local/google/facebook
  isVerified: Boolean,
  password: String,
  
  // 📍 Datos comunes
  profilePic: String,
  tel: String,
  address: {...},
  createdAt: Date
}
```

### JobOffer Model (Ofertas Pedagógicas)

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  organization: ObjectId,       // Ref a User con role ORGANIZATION
  
  // 🎓 Vinculación Pedagógica
  pedagogicalEmphasis: String,  // Énfasis requerido
  requiredTags: [String],       // Tags que debe tener el candidato
  targetPrograms: [String],     // Programas académicos elegibles
  
  // ✅ Aprobación Institucional
  approvalStatus: String,       // pending/approved/rejected
  approvedBy: ObjectId,         // Ref a User con role FACULTY
  approvalDate: Date,
  approvalNotes: String,
  
  // 📋 Detalles de la vacante
  location: String,
  compensation: Number,
  practiceType: String,         // Práctica I, II, Rural, etc.
  availableSlots: Number,
  status: String,               // active/closed/filled
  
  createdAt: Date
}
```

### Application Model (Postulaciones con Trazabilidad)

```javascript
{
  _id: ObjectId,
  applicant: ObjectId,          // Ref a User con role STUDENT
  jobOffer: ObjectId,
  
  // 📊 Estado y seguimiento
  status: String,               // pending/accepted/rejected/withdrawn
  statusHistory: [{
    status: String,
    changedAt: Date,
    changedBy: ObjectId,
    notes: String
  }],
  
  // 🎓 Respaldo Académico
  institutionalTracking: {
    facultyReview: Boolean,
    reviewedBy: ObjectId,
    reviewNotes: String,
    programMatch: Boolean,      // ¿La vacante encaja con el programa?
    pedagogicalAlignment: Number // Score de matching por tags
  },
  
  // 📄 Documentos
  coverLetter: String,
  resume: String,
  
  createdAt: Date
}
```

### Product Model (Recursos Educativos)

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  
  // 📚 Categorización Educativa
  category: Enum[
    'Materiales Didácticos',
    'Libros y Textos Educativos',
    'Recursos Digitales',
    'Material para Primera Infancia',
    'Herramientas Pedagógicas',
    'Tecnología Educativa',
    'Recursos de Inclusión',
    'Material de Apoyo Bilingüe',
    'Kits Educativos'
  ],
  
  // 📖 Información Editorial
  brand: String,                // Editorial/Autor (alias: publisher)
  publisher: String,            // Alias de brand
  
  // 🏷️ Clasificación
  tags: [String],
  pedagogicalLevel: String,     // Preescolar/Primaria/Secundaria/Superior
  
  // 📦 Stock y ventas
  stock: Number,
  vendor: ObjectId,
  images: [String],
  
  createdAt: Date
}
```

---

## 🔄 Flujo de Coherencia Pedagógica Completo

### 1. Registro y Perfil del Estudiante
```
Usuario se registra → Selecciona role: STUDENT
→ Completa perfil pedagógico:
  - Faculty: "Educación"
  - Program: "Licenciatura en Pedagogía Infantil"
  - AcademicLevel: "Pregrado"
  - PedagogicalTags: ["Inclusión", "Primera Infancia"]
  - AcademicStatus: "Activo"
```

### 2. Publicación de Vacante por Organización
```
Organización educativa publica vacante
→ Título: "Docente de apoyo en inclusión"
→ PedagogicalEmphasis: "Educación inclusiva primera infancia"
→ RequiredTags: ["Inclusión", "Primera Infancia"]
→ Status inicial: "pending" (pendiente de aprobación)
```

### 3. Aprobación por Facultad
```
Docente de Facultad revisa vacante
→ Valida coherencia con programa académico
→ Verifica que énfasis es apropiado
→ Aprueba oferta
→ Status cambia a: "approved"
→ La oferta se hace visible para estudiantes
```

### 4. Matching Automático
```
Sistema compara:
- Tags del estudiante: ["Inclusión", "Primera Infancia"]
- Tags requeridos: ["Inclusión", "Primera Infancia"]
- Programa del estudiante: "Pedagogía Infantil"
→ Matching score alto
→ Vacante aparece destacada para este estudiante
```

### 5. Postulación con Trazabilidad
```
Estudiante postula
→ Se crea Application con:
  - InstitutionalTracking.programMatch = true
  - InstitutionalTracking.pedagogicalAlignment = 95%
→ Facultad puede revisar y agregar notas
→ Organización revisa candidatos
→ Historial completo queda registrado
```

---

## 🚀 Roadmap de Evolución

### ✅ Fase Actual (Implementada)
- Red social académica básica
- Módulo de vinculación laboral con roles diferenciados
- Aprobación institucional de ofertas
- Gestión manual de convenios y vacantes (localStorage)
- Tags de especialidad pedagógica
- E-commerce funcional con categorías educativas
- Gráfica de cobertura de plazas (Recharts)

### 🔄 Fase 2 (Próxima - Backend Robusto)
- **Backend para datos manuales** - Migrar desde localStorage a MongoDB
- **Matching automático mejorado** - Algoritmo de sugerencias por tags
- **Notificaciones institucionales** - Email/Push para eventos clave
- **Reportes de trazabilidad** - Dashboard por programa académico
- **Integración de mensajería** - Chat interno al flujo de prácticas
- **API de convenios** - CRUD completo de instituciones

### 📈 Fase 3 (Futuro - Analytics y Expansión)
- **Dashboard de empleabilidad** - Métricas por licenciatura
- **Sistema de evaluación** - Calificación de prácticas
- **Calendarios académicos** - Integración con períodos universitarios
- **Analytics institucional** - Satisfacción y efectividad
- **API pública** - Integraciones con sistemas universitarios externos
- **Módulo de egresados** - Seguimiento post-graduación

---

## 🔗 Coherencia del Ecosistema Dual

| Aspecto | Eje Pedagógico (Core) | Marketplace Educativo (Complemento) |
|---------|----------------------|-------------------------------------|
| **Objetivo** | Vinculación laboral pedagógica con trazabilidad | Recursos y materiales didácticos |
| **Usuarios principales** | Estudiantes, Facultad, Organizaciones | Docentes, Compradores, Vendedores |
| **Modelo de negocio** | Servicio institucional (gratuito para universidades) | Comisión por venta (5-10%) |
| **Sostenibilidad** | Financiado por marketplace + convenios | Autosostenible con margen |
| **Categorías** | Vacantes pedagógicas por énfasis | Recursos educativos por tipo |
| **Aprobación** | Facultad aprueba ofertas | Admin aprueba vendedores/productos |
| **Relación** | **CORE** del proyecto | **Complemento financiero** |

### Sinergias del Ecosistema:
1. **Financiamiento cruzado** - Ingresos del marketplace financian la plataforma pedagógica
2. **Usuarios compartidos** - Egresados pueden ser vendedores de sus propios materiales
3. **Infraestructura común** - Mismo backend, autenticación, roles
4. **Valor agregado** - Docentes encuentran empleo Y recursos en un solo lugar
5. **Sostenibilidad** - Modelo híbrido (servicio gratuito + marketplace)

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - SPA con componentes funcionales
- **React Router 6** - Navegación y rutas protegidas
- **Redux Toolkit** - Estado global (usuario, auth)
- **CSS puro modular** - Sin frameworks externos
- **Recharts** - Visualización de datos (AdminStats)
- **Lazy Loading** - Code splitting por módulo

### Backend
- **Node.js + Express** - API RESTful
- **MongoDB + Mongoose** - Base de datos NoSQL
- **JWT** - Autenticación stateless
- **Passport.js** - OAuth (Google, Facebook)
- **bcryptjs** - Hash de contraseñas
- **Multer + Cloudinary** - Upload de imágenes

### Persistencia Temporal
- **localStorage** - Datos manuales (convenios, vacantes, tags)
- Migración a MongoDB en Fase 2

### Infraestructura
- **PM2** - Process manager para producción
- **HTTPS** - Certificados SSL
- **CORS** - Control de acceso cross-origin
- **Trust Proxy** - Para producción detrás de reverse proxy

---

## 📊 Métricas de Éxito

### Eje Pedagógico
- **Tasa de cobertura** - % de plazas cubiertas vs. disponibles
- **Tiempo de vinculación** - Días desde publicación hasta contratación
- **Satisfacción institucional** - NPS de universidades
- **Matching efectivo** - % de postulaciones que resultan en contratación
- **Trazabilidad completa** - 100% de procesos documentados

### Marketplace Educativo
- **GMV** - Gross Merchandise Value mensual
- **Tasa de conversión** - % visitantes que compran
- **Ticket promedio** - Valor promedio por orden
- **Vendedores activos** - Docentes/editoriales publicando
- **Categorías más vendidas** - Qué recursos tienen mayor demanda

---

## ✅ Conclusión

**Publientis** es un **ecosistema dual coherente** donde:

1. El **eje pedagógico** (vinculación de prácticas) cumple la visión de intermediación profesional con trazabilidad institucional completa

2. El **marketplace educativo** aporta sostenibilidad financiera y servicios complementarios valiosos para la comunidad docente

3. Ambos ejes **comparten infraestructura**, usuarios y se potencian mutuamente sin generar conflictos

4. El modelo permite **crecer en ambas direcciones** mientras mantiene el foco en la calidad de la vinculación pedagógica

Esta arquitectura garantiza que Publientis sea una plataforma **sostenible, escalable y centrada en el éxito profesional de los egresados en pedagogía**, con el respaldo institucional de las universidades y la autonomía financiera del marketplace.
