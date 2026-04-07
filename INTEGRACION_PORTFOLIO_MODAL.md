# Guía de Integración - PortfolioModal

## 📍 Ubicación del Componente

**Ya creado:**
- `frontend/src/components/PortfolioModal/PortfolioModal.jsx`
- `frontend/src/components/PortfolioModal/PortfolioModal.css`

---

## 🔧 Paso 1: Integrar en JobApplicants.jsx

**Archivo:** `frontend/src/modules/jobs/pages/JobApplicants.jsx`

### Importar el Modal

```jsx
import PortfolioModal from '../../../components/PortfolioModal/PortfolioModal';
```

### Agregar Estado

```jsx
const [selectedCandidate, setSelectedCandidate] = useState(null);
const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
```

### Función para abrir el modal

```jsx
const handleViewPortfolio = (application) => {
  // Combinar datos del aplicante con datos de la aplicación
  const candidateData = {
    ...application.applicant,
    coverLetter: application.coverLetter,
    resumeUrl: application.resumeUrl,
    portfolio: application.applicant.portfolio || {}
  };
  
  setSelectedCandidate(candidateData);
  setPortfolioModalOpen(true);
};
```

### Agregar Botón en la Lista

```jsx
{applications.map((app) => (
  <div key={app._id} className="applicant-card">
    <div className="applicant-info">
      <h4>{app.applicant.name}</h4>
      <p>{app.applicant.program}</p>
      <span className={`status-badge ${app.status}`}>{app.status}</span>
    </div>
    
    <div className="applicant-actions">
      {/* Botón para ver portafolio */}
      <button 
        className="btn-view-portfolio"
        onClick={() => handleViewPortfolio(app)}
      >
        Ver Portafolio
      </button>
      
      {/* Otros botones... */}
    </div>
  </div>
))}
```

### Renderizar el Modal

```jsx
return (
  <div className="job-applicants-page">
    {/* ... contenido existente ... */}
    
    {/* Modal de Portafolio */}
    <PortfolioModal
      isOpen={portfolioModalOpen}
      onClose={() => setPortfolioModalOpen(false)}
      candidato={selectedCandidate}
    />
  </div>
);
```

---

## 🗄️ Paso 2: Extender Modelos de Backend

### User Model - Agregar Campo Portfolio

**Archivo:** `backend/models/userModel.js`

```javascript
const userSchema = new mongoose.Schema({
  // ... campos existentes ...
  
  // Portafolio del estudiante/egresado
  portfolio: {
    cv: {
      type: String, // URL de Cloudinary
      default: null
    },
    planesAula: [{
      name: String,
      subject: String, // Asignatura
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    certificados: [{
      name: String,
      institution: String,
      url: String,
      issueDate: Date,
      uploadedAt: { type: Date, default: Date.now }
    }],
    proyectos: [{
      name: String,
      description: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }]
  }
});
```

### Application Model - Ya tiene resumeUrl

El modelo `Application` ya tiene:
```javascript
resumeUrl: {
  type: String,
  default: ''
}
```

Esto se puede usar como el CV principal. Los documentos adicionales vienen del campo `portfolio` del User.

---

## 📤 Paso 3: Endpoint para Subir Documentos al Portafolio

### Controller: `userController.js`

```javascript
// Subir documento al portafolio
exports.uploadPortfolioDocument = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, name, subject, institution, description, url } = req.body;
    
    // type: 'cv' | 'planAula' | 'certificado' | 'proyecto'
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Inicializar portfolio si no existe
    if (!user.portfolio) {
      user.portfolio = {
        planesAula: [],
        certificados: [],
        proyectos: []
      };
    }
    
    switch (type) {
      case 'cv':
        user.portfolio.cv = url;
        break;
        
      case 'planAula':
        user.portfolio.planesAula.push({
          name,
          subject,
          url,
          uploadedAt: new Date()
        });
        break;
        
      case 'certificado':
        user.portfolio.certificados.push({
          name,
          institution,
          url,
          uploadedAt: new Date()
        });
        break;
        
      case 'proyecto':
        user.portfolio.proyectos.push({
          name,
          description,
          url,
          uploadedAt: new Date()
        });
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Tipo de documento no válido'
        });
    }
    
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Documento agregado al portafolio',
      data: user.portfolio
    });
  } catch (error) {
    console.error('Error en uploadPortfolioDocument:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al subir documento'
    });
  }
};

// Eliminar documento del portafolio
exports.deletePortfolioDocument = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, documentId } = req.body;
    
    const user = await User.findById(userId);
    if (!user || !user.portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portafolio no encontrado'
      });
    }
    
    switch (type) {
      case 'cv':
        user.portfolio.cv = null;
        break;
        
      case 'planAula':
        user.portfolio.planesAula = user.portfolio.planesAula.filter(
          doc => doc._id.toString() !== documentId
        );
        break;
        
      case 'certificado':
        user.portfolio.certificados = user.portfolio.certificados.filter(
          doc => doc._id.toString() !== documentId
        );
        break;
        
      case 'proyecto':
        user.portfolio.proyectos = user.portfolio.proyectos.filter(
          doc => doc._id.toString() !== documentId
        );
        break;
    }
    
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Documento eliminado',
      data: user.portfolio
    });
  } catch (error) {
    console.error('Error en deletePortfolioDocument:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al eliminar documento'
    });
  }
};
```

### Rutas: `user.routes.js`

```javascript
router.post('/portfolio/upload', protect, userController.uploadPortfolioDocument);
router.delete('/portfolio/document', protect, userController.deletePortfolioDocument);
router.get('/portfolio', protect, userController.getMyPortfolio);
```

---

## 🎨 Paso 4: Crear Página de Gestión de Portafolio

### Componente: `MyPortfolio.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import uploadImage from '../../helpers/uploadImage';

const MyPortfolio = () => {
  const [portfolio, setPortfolio] = useState({
    cv: null,
    planesAula: [],
    certificados: [],
    proyectos: []
  });
  
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    institution: '',
    description: ''
  });
  
  useEffect(() => {
    fetchPortfolio();
  }, []);
  
  const fetchPortfolio = async () => {
    try {
      const res = await axiosInstance.get('/api/users/portfolio');
      setPortfolio(res.data.data || {
        cv: null,
        planesAula: [],
        certificados: [],
        proyectos: []
      });
    } catch (error) {
      console.error('Error al cargar portafolio:', error);
    }
  };
  
  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    setUploadType(type);
    
    try {
      // Subir archivo a Cloudinary
      const uploadedUrl = await uploadImage(file);
      
      // Guardar en backend
      await axiosInstance.post('/api/users/portfolio/upload', {
        type,
        url: uploadedUrl,
        ...formData
      });
      
      // Recargar portafolio
      await fetchPortfolio();
      
      // Limpiar formulario
      setFormData({
        name: '',
        subject: '',
        institution: '',
        description: ''
      });
      
      alert('Documento subido exitosamente');
    } catch (error) {
      console.error('Error al subir documento:', error);
      alert('Error al subir documento');
    } finally {
      setUploading(false);
      setUploadType('');
    }
  };
  
  const handleDeleteDocument = async (type, documentId) => {
    if (!confirm('¿Eliminar este documento?')) return;
    
    try {
      await axiosInstance.delete('/api/users/portfolio/document', {
        data: { type, documentId }
      });
      
      await fetchPortfolio();
      alert('Documento eliminado');
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar documento');
    }
  };
  
  return (
    <div className="my-portfolio-page">
      <h1>Mi Portafolio Profesional</h1>
      
      {/* Sección CV */}
      <section className="portfolio-section">
        <h2>Hoja de Vida (CV)</h2>
        {portfolio.cv ? (
          <div className="document-item">
            <a href={portfolio.cv} target="_blank" rel="noopener noreferrer">
              Ver CV
            </a>
            <button onClick={() => handleDeleteDocument('cv')}>
              Eliminar
            </button>
          </div>
        ) : (
          <div className="upload-zone">
            <label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileUpload(e, 'cv')}
                disabled={uploading}
              />
              {uploading && uploadType === 'cv' ? 'Subiendo...' : 'Subir CV (PDF)'}
            </label>
          </div>
        )}
      </section>
      
      {/* Sección Planes de Aula */}
      <section className="portfolio-section">
        <h2>Planes de Aula</h2>
        
        <div className="upload-form">
          <input
            type="text"
            placeholder="Nombre del plan"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <input
            type="text"
            placeholder="Asignatura"
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
          />
          <label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileUpload(e, 'planAula')}
              disabled={uploading || !formData.name}
            />
            Subir Plan de Aula
          </label>
        </div>
        
        <div className="documents-list">
          {portfolio.planesAula?.map((plan) => (
            <div key={plan._id} className="document-item">
              <h4>{plan.name}</h4>
              <p>{plan.subject}</p>
              <a href={plan.url} target="_blank" rel="noopener noreferrer">Ver</a>
              <button onClick={() => handleDeleteDocument('planAula', plan._id)}>
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </section>
      
      {/* Sección Certificados */}
      <section className="portfolio-section">
        <h2>Certificados</h2>
        {/* Similar a planes de aula */}
      </section>
      
      {/* Sección Proyectos */}
      <section className="portfolio-section">
        <h2>Proyectos Pedagógicos</h2>
        {/* Similar a planes de aula */}
      </section>
    </div>
  );
};

export default MyPortfolio;
```

---

## 🚀 Flujo Completo

### 1. Estudiante Sube Documentos

```
Perfil → Mi Portafolio (/perfil/portafolio)
→ Sube CV
→ Sube planes de aula
→ Sube certificados
→ Guarda en backend
```

### 2. Estudiante Postula a Oferta

```
Ve oferta → Postula
→ CV del portafolio se adjunta automáticamente
→ Carta de presentación
→ Envía postulación
```

### 3. Organización Revisa Postulantes

```
Mis Ofertas → Ver Postulantes (/jobs/:id/applicants)
→ Lista de aplicantes
→ Click "Ver Portafolio" en candidato
→ Modal se abre mostrando:
   - Información personal
   - CV
   - Planes de aula
   - Certificados
   - Proyectos
→ Puede ver/descargar documentos
→ Decide aceptar/rechazar
```

---

## ✅ Checklist de Implementación

### Backend
- [ ] Agregar campo `portfolio` a `userModel.js`
- [ ] Crear `uploadPortfolioDocument` en `userController.js`
- [ ] Crear `deletePortfolioDocument` en `userController.js`
- [ ] Registrar rutas en `user.routes.js`
- [ ] Migrar datos existentes (opcional)

### Frontend
- [x] Crear `PortfolioModal.jsx` ✅
- [x] Crear `PortfolioModal.css` ✅
- [ ] Integrar en `JobApplicants.jsx`
- [ ] Crear página `MyPortfolio.jsx`
- [ ] Agregar ruta `/perfil/portafolio`
- [ ] Link en menú de usuario

### Testing
- [ ] Subir documentos al portafolio
- [ ] Ver portafolio desde postulaciones
- [ ] Eliminar documentos
- [ ] Verificar permisos (solo owner)
- [ ] Responsive en móvil

---

## 🎨 Ejemplo de Uso

```jsx
// En JobApplicants.jsx
import PortfolioModal from '../../../components/PortfolioModal/PortfolioModal';

function JobApplicants() {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  return (
    <>
      {/* Lista de postulantes */}
      <div className="applicants-list">
        {applications.map(app => (
          <div key={app._id}>
            <h3>{app.applicant.name}</h3>
            <button onClick={() => {
              setSelectedCandidate(app.applicant);
              setModalOpen(true);
            }}>
              Ver Portafolio
            </button>
          </div>
        ))}
      </div>
      
      {/* Modal */}
      <PortfolioModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        candidato={selectedCandidate}
      />
    </>
  );
}
```

---

## 🎯 Resultado Final

Las organizaciones podrán:
- ✅ Ver información completa del candidato
- ✅ Revisar CV y documentos
- ✅ Visualizar PDFs sin descargar
- ✅ Evaluar múltiples perfiles rápidamente
- ✅ Reducir carga cognitiva con UI limpia

**Interfaz profesional, intuitiva y enfocada en decisiones rápidas de vinculación.**
