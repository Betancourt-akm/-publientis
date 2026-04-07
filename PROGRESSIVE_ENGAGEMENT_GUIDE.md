# 🚀 Guía de Progressive Engagement - Publientis

## 📚 Fundamento Teórico

Este sistema implementa el principio de **Progressive Engagement** (Compromiso Progresivo) basado en la teoría de **Russ Unger y Carolyn Chandler**, autores de "A Project Guide to UX Design".

### **Concepto Clave:**
> "Permite que los usuarios experimenten el valor de tu producto ANTES de pedirles un compromiso (registro). Reduce la fricción, aumenta la conversión."

---

## 🎯 Objetivo

Transformar Publientis de un sistema cerrado (todo tras login) a una plataforma abierta donde:
- **Instituciones** pueden explorar talento pedagógico
- **Egresados** pueden ver vacantes disponibles
- **Ambos** se registran solo cuando deciden tomar una **acción de vinculación real**

---

## 📦 Componentes Implementados

### **1. ActionGate** - Componente de Intercepción
**Ubicación:** `frontend/src/components/engagement/ActionGate.jsx`

**Propósito:** Higher Order Component que intercepta clics en acciones críticas y muestra un modal de conversión si el usuario no está autenticado.

**Uso Básico:**
```jsx
import ActionGate from '../components/engagement/ActionGate';

// Ejemplo 1: Botón de "Ver Perfil Completo"
<ActionGate
  action="view_profile"
  onProceed={() => navigate(`/profile/${userId}`)}
>
  <button className="view-details-btn">
    Ver Detalles
  </button>
</ActionGate>

// Ejemplo 2: Postular a Vacante
<ActionGate
  action="apply_job"
  onProceed={() => handleApply(jobId)}
>
  <button className="apply-btn">
    Postularse Ahora
  </button>
</ActionGate>

// Ejemplo 3: Descargar CV
<ActionGate
  action="download_cv"
  onProceed={() => downloadCV(userId)}
  customMessage="Descarga CVs profesionales verificados por la Universidad"
>
  <button className="download-cv-btn">
    <FaFilePdf /> Descargar CV
  </button>
</ActionGate>
```

**Props Disponibles:**
- `action` (string): Tipo de acción ('view_profile', 'apply_job', 'contact', 'save_candidate', 'download_cv')
- `onProceed` (function): Función a ejecutar si el usuario está autenticado
- `customMessage` (string, opcional): Mensaje personalizado para el modal
- `disabled` (boolean, opcional): Deshabilitar el gate

**Tipos de Acción:**
- `view_profile` / `view_portfolio` → Modal de "Descubre el Talento"
- `apply_job` → Modal de "¿Listo para Aplicar?"
- `contact` → Modal de "Conecta con Candidatos"
- `save_candidate` → Modal de "Guarda tus Favoritos"
- `download_cv` → Modal de "Descarga CV Profesionales"

---

### **2. EngagementModal** - Modal de Conversión
**Ubicación:** `frontend/src/components/engagement/EngagementModal.jsx`

**Características:**
- ✅ Diseño visual atractivo con gradientes institucionales
- ✅ Iconos animados (bounce effect)
- ✅ Lista de beneficios clara
- ✅ Dos CTAs: "Crear Cuenta" (primario) y "Ya tengo cuenta" (secundario)
- ✅ Badges de confianza ("Verificado por la Universidad")
- ✅ Nota de privacidad ("100% gratuito • Sin spam")

**Psicología del Diseño:**
1. **Enfoque en beneficios**, no barreras
2. **Reducción de ansiedad** con badges de confianza
3. **Urgencia visual** con colores vibrantes
4. **Claridad extrema** en CTAs

---

### **3. Blur Content Styles** - Protección Visual
**Ubicación:** `frontend/src/styles/blur-content.css`

**Clases Disponibles:**

#### **Blur Genérico:**
```jsx
<div className="blur-protected">
  <div className="blur-protected-content">
    Contenido sensible aquí
  </div>
  <div className="blur-protected-overlay">
    <FaLock className="blur-lock-icon" />
  </div>
</div>
```

#### **Email y Teléfono:**
```jsx
// Email difuminado
<span className="blur-email">usuario@ejemplo.com</span>

// Teléfono difuminado
<span className="blur-phone">+57 300 123 4567</span>
```

#### **Documentos (CV, Certificados):**
```jsx
<div className="blur-document">
  <a href="/cv.pdf">Descargar CV</a>
</div>
```
*Nota: Automáticamente muestra overlay "🔒 Contenido Protegido"*

#### **Portfolio Items:**
```jsx
<div className="blur-portfolio-item">
  <img src="/plan-aula.png" alt="Plan de Aula" />
</div>
```

#### **Texto Parcial:**
```jsx
<p className="blur-partial-text">
  Soy docente especializado en matemáticas con 5 años de experiencia...
</p>
```
*Muestra los primeros 30% y el resto dice "... (Regístrate para ver más)"*

#### **Badge "Requiere Registro":**
```jsx
<span className="requires-auth-badge">
  <FaLock /> Solo para Usuarios
</span>
```

---

## 🔧 Integración en Componentes Existentes

### **Paso 1: Modificar Rutas para Acceso Público**

**Archivo:** `frontend/src/routes/index.js`

**ANTES:**
```jsx
{ path: "jobs", element: <ProtectedRoute><JobBoard /></ProtectedRoute> }
```

**DESPUÉS:**
```jsx
{ path: "jobs", element: <JobBoard /> } // Sin ProtectedRoute
```

**Rutas a Abrir:**
- `/jobs` - JobBoard (Vacantes)
- `/` - Home/AcademicFeed (Feed público con perfiles)
- `/academic/profile/:userId` - Perfiles públicos

**Rutas que PERMANECEN Protegidas:**
- `/perfil` - Perfil del usuario actual
- `/jobs/my-applications` - Mis postulaciones
- `/saved-candidates` - Candidatos guardados
- `/evaluaciones` - Evaluaciones

---

### **Paso 2: Integrar ActionGate en Componentes**

#### **Ejemplo: JobBoard.jsx (Lista de Vacantes)**
```jsx
import ActionGate from '../../components/engagement/ActionGate';
import { useSelector } from 'react-redux';

const JobBoard = () => {
  const user = useSelector(state => state?.user?.user);
  const isAuthenticated = !!user;

  return (
    <div className="job-board">
      {jobs.map(job => (
        <div key={job._id} className="job-card">
          <h3>{job.title}</h3>
          <p>{job.description}</p>
          
          {/* Botón de Postular con ActionGate */}
          <ActionGate
            action="apply_job"
            onProceed={() => handleApply(job._id)}
          >
            <button className="apply-button">
              Postularse
            </button>
          </ActionGate>

          {/* Ver detalles siempre visible */}
          <button onClick={() => navigate(`/jobs/${job._id}`)}>
            Ver Detalles
          </button>
        </div>
      ))}
    </div>
  );
};
```

#### **Ejemplo: TalentoCard.jsx (Tarjeta de Egresado)**
```jsx
import ActionGate from '../../components/engagement/ActionGate';
import { FaEye, FaPhone, FaEnvelope } from 'react-icons/fa';
import '../../styles/blur-content.css';

const TalentoCard = ({ user }) => {
  const currentUser = useSelector(state => state?.user?.user);
  const isAuthenticated = !!currentUser;

  return (
    <div className="talento-card">
      <img src={user.profilePic} alt={user.name} />
      <h3>{user.name}</h3>
      <p>{user.program}</p>
      
      {/* Email con blur si no autenticado */}
      <div className="contact-info">
        <FaEnvelope />
        <span className={!isAuthenticated ? 'blur-email' : ''}>
          {user.email}
        </span>
      </div>

      {/* Teléfono con blur */}
      <div className="contact-info">
        <FaPhone />
        <span className={!isAuthenticated ? 'blur-phone' : ''}>
          {user.phone}
        </span>
      </div>

      {/* Botones de acción */}
      <ActionGate
        action="view_portfolio"
        onProceed={() => navigate(`/academic/profile/${user._id}`)}
      >
        <button className="view-portfolio-btn">
          <FaEye /> Ver Portafolio Completo
        </button>
      </ActionGate>

      {/* CV con blur */}
      <ActionGate
        action="download_cv"
        onProceed={() => downloadCV(user._id)}
      >
        <div className={!isAuthenticated ? 'blur-document' : ''}>
          <button className="download-cv-btn">
            Descargar CV
          </button>
        </div>
      </ActionGate>
    </div>
  );
};
```

#### **Ejemplo: Perfil Público (Parcialmente Visible)**
```jsx
import ActionGate from '../../components/engagement/ActionGate';
import '../../styles/blur-content.css';

const PublicProfile = ({ userId }) => {
  const currentUser = useSelector(state => state?.user?.user);
  const isAuthenticated = !!currentUser;

  return (
    <div className="public-profile">
      {/* Sección siempre visible */}
      <div className="basic-info">
        <img src={profileData.profilePic} alt={profileData.name} />
        <h1>{profileData.name}</h1>
        <p>{profileData.program} - {profileData.faculty}</p>
      </div>

      {/* Bio parcial */}
      <div className={!isAuthenticated ? 'blur-partial-text' : ''}>
        <p>{profileData.bio}</p>
      </div>

      {/* Portfolio con blur */}
      <div className="portfolio-section">
        <h2>Portafolio Pedagógico</h2>
        {profileData.portfolio.map(item => (
          <div 
            key={item._id} 
            className={!isAuthenticated ? 'blur-portfolio-item' : ''}
          >
            <img src={item.thumbnail} alt={item.title} />
            <h3>{item.title}</h3>
          </div>
        ))}
        
        {!isAuthenticated && (
          <ActionGate
            action="view_portfolio"
            onProceed={() => navigate(`/academic/profile/${userId}`)}
          >
            <button className="unlock-portfolio-btn">
              🔓 Desbloquear Portafolio Completo
            </button>
          </ActionGate>
        )}
      </div>

      {/* Contacto protegido */}
      <div className="contact-section">
        <h2>Información de Contacto</h2>
        {!isAuthenticated && (
          <span className="requires-auth-badge">
            <FaLock /> Solo para Usuarios Registrados
          </span>
        )}
        <div className={!isAuthenticated ? 'blur-protected' : ''}>
          <div className={!isAuthenticated ? 'blur-protected-content' : ''}>
            <p><FaEnvelope /> {profileData.email}</p>
            <p><FaPhone /> {profileData.phone}</p>
          </div>
          {!isAuthenticated && (
            <ActionGate action="contact">
              <div className="blur-protected-overlay">
                <FaLock className="blur-lock-icon" />
              </div>
            </ActionGate>
          )}
        </div>
      </div>
    </div>
  );
};
```

---

## 🎨 Mejores Prácticas UX

### **1. ¿Qué Mostrar Públicamente?**
✅ **SÍ mostrar sin login:**
- Nombres y fotos de perfil
- Títulos de vacantes
- Programas académicos
- Áreas de especialización
- Tags pedagógicos
- Número de años de experiencia
- Ubicación general (ciudad)

❌ **NO mostrar sin login:**
- Emails
- Teléfonos
- Documentos completos (CVs, certificados)
- Planes de aula completos
- Información personal detallada

### **2. Principios de Blur**
- **Visible pero inaccesible:** El contenido debe ser "tentador" (se ve que existe) pero protegido
- **No frustrar:** Nunca ocultar completamente - usar blur, no "display: none"
- **Curiosidad visual:** El blur debe generar interés, no rechazo

### **3. Timing del Modal**
- **Mostrar modal en el momento exacto de la acción:** No antes, no después
- **Una vez por sesión:** Si el usuario cierra el modal, no mostrar de nuevo hasta refrescar
- **Guardar contexto:** Usar localStorage para recordar qué acción quería hacer

---

## 📊 Métricas de Éxito

### **KPIs a Monitorear:**
1. **Tasa de Conversión:** % de visitantes que se registran
2. **Acciones pre-registro:** Cuántos clics en ActionGate antes de registrarse
3. **Bounce Rate:** % que abandonan sin interactuar
4. **Time to Action:** Tiempo promedio hasta primera acción (ver perfil, postular)
5. **Completion Rate:** % que completa el registro después de ver modal

### **Análisis Esperado:**
- **Antes Progressive Engagement:** 5-10% conversión (típico de sitios cerrados)
- **Después Progressive Engagement:** 15-25% conversión (objetivo realista)

---

## 🚦 Implementación por Fases

### **Fase 1: Componentes Base** ✅ COMPLETADO
- [x] ActionGate component
- [x] EngagementModal component
- [x] blur-content.css styles

### **Fase 2: Integración Frontend** ⏳ PENDIENTE
- [ ] Modificar rutas en index.js (quitar ProtectedRoute de JobBoard y Home)
- [ ] Integrar ActionGate en TalentoCard.jsx
- [ ] Integrar ActionGate en JobCard.jsx
- [ ] Agregar blur styles a perfiles públicos
- [ ] Importar blur-content.css en componentes necesarios

### **Fase 3: Optimización UX** ⏳ PENDIENTE
- [ ] A/B Testing de mensajes del modal
- [ ] Analytics de conversión
- [ ] Ajuste de textos según datos

---

## 🛠️ Solución de Problemas

### **Problema: El modal se muestra infinitamente**
**Solución:** Verificar que onClose cierra el modal correctamente
```jsx
const [showModal, setShowModal] = useState(false);
// Asegurar que onClose setea false
<EngagementModal onClose={() => setShowModal(false)} />
```

### **Problema: El blur no se aplica**
**Solución:** Importar el CSS en el componente
```jsx
import '../styles/blur-content.css';
```

### **Problema: La acción se ejecuta sin pasar por el gate**
**Solución:** Verificar que el onClick está en el wrapper correcto
```jsx
// ❌ INCORRECTO
<button onClick={action}>
  <ActionGate>...</ActionGate>
</button>

// ✅ CORRECTO
<ActionGate onProceed={action}>
  <button>...</button>
</ActionGate>
```

---

## 📚 Referencias

- **Libro:** "A Project Guide to UX Design" - Russ Unger & Carolyn Chandler
- **Concepto:** Progressive Engagement (Capítulo 8: Engagement Strategies)
- **Ejemplos reales:** LinkedIn (ver perfiles), Medium (leer artículos), Pinterest (explorar pins)

---

## ✅ Checklist de Implementación

- [x] ActionGate creado
- [x] EngagementModal creado
- [x] blur-content.css creado
- [ ] Rutas públicas configuradas
- [ ] ActionGate integrado en JobBoard
- [ ] ActionGate integrado en TalentoCard
- [ ] Blur aplicado a emails/teléfonos
- [ ] Blur aplicado a documentos
- [ ] Testing de flujo completo
- [ ] Analytics configurado

---

**🎉 Con este sistema, Publientis pasa de ser una plataforma cerrada a una experiencia de "Prueba antes de Comprometerte", aumentando significativamente la conversión y reduciendo la fricción del usuario.**
