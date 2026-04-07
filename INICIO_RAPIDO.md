# 🚀 Inicio Rápido - Jerarquía Académica

## 📋 Pre-requisitos

- Node.js v14+ instalado
- MongoDB en ejecución
- Variables de entorno configuradas

---

## ⚡ Pasos para Iniciar

### **1. Ejecutar el Seeder (PRIMERA VEZ)**

El seeder crea la estructura inicial de UPN con facultades y programas:

```bash
cd backend
node seeders/hierarchySeeder.js
```

**Salida esperada:**
```
🎉 SEEDER COMPLETADO EXITOSAMENTE

📊 Resumen:
   Universidad: Universidad Pedagógica Nacional (UPN)
   Facultad: Facultad de Educación (EDU)
   Programas creados: 4
   Total programas: 4

💡 Credenciales de prueba:
   Super Admin: admin@upn.edu.co / Admin123!
   Decano: decano.educacion@upn.edu.co / Dean123!
   Coordinadores: coordinador.lpi-2024@upn.edu.co / Coord123!
```

---

### **2. Iniciar Backend**

```bash
cd backend
npm install  # Solo si no has instalado dependencias
npm start
```

**Puerto:** `http://localhost:8080`

---

### **3. Iniciar Frontend**

En otra terminal:

```bash
cd frontend
npm install  # Solo si no has instalado dependencias
npm start
```

**Puerto:** `http://localhost:3000`

---

## 🧪 Flujos de Prueba

### **A. Registro de Estudiante con CascadingSelect**

1. Ir a: `http://localhost:3000/sign-up?role=STUDENT`
2. Completar datos básicos (nombre, email, teléfono, contraseña)
3. **Ver CascadingSelect:**
   - Nivel 1: Seleccionar "Universidad Pedagógica Nacional"
   - Nivel 2: Seleccionar "Facultad de Educación"
   - Nivel 3: Seleccionar "Licenciatura en Pedagogía Infantil"
4. Ver barra de progreso: 0% → 33% → 66% → 100%
5. Hacer clic en "Crear Cuenta"
6. Verificar email (si está habilitado) o hacer login

**Resultado:** Usuario creado con `university`, `facultyRef` y `academicProgramRef`

---

### **B. Login como Super Admin (Nivel 0)**

**Credenciales:**
```
Email: admin@upn.edu.co
Password: Admin123!
```

**Qué verás:**
- Redirección automática a `/dashboard/university`
- Vista macro de toda la universidad
- KPIs globales (facultades, programas, estudiantes)
- Gráficas de rendimiento por facultad
- Tabla de todas las facultades con sus programas

**Nivel de acceso:** Ve TODO sin restricciones

---

### **C. Login como Decano de Facultad (Nivel 1)**

**Credenciales:**
```
Email: decano.educacion@upn.edu.co
Password: Dean123!
```

**Qué verás:**
- Redirección automática a `/dashboard/faculty`
- Vista intermedia de Facultad de Educación
- KPIs de la facultad
- Solo programas de su facultad
- Gráfica de estudiantes por programa

**Nivel de acceso:** Solo ve su facultad

---

### **D. Login como Coordinador de Programa (Nivel 2)**

**Credenciales:**
```
Email: coordinador.lpi-2024@upn.edu.co
Password: Coord123!
```

**Qué verás:**
- Redirección automática a `/dashboard/program`
- Vista específica de Licenciatura en Pedagogía Infantil
- KPIs operativos del programa
- Validaciones pendientes (alertas)
- Lista de estudiantes del programa
- Profesores tutores vinculados

**Nivel de acceso:** Solo ve su programa

---

## 🎯 Verificación de Jerarquía

### **Verificar en MongoDB:**

```javascript
// Conectar a MongoDB
mongosh

// Usar la base de datos
use publientis

// Verificar Universidad
db.universities.find().pretty()

// Verificar Facultades
db.faculties.find().pretty()

// Verificar Programas
db.academicprograms.find().pretty()

// Verificar Usuarios con jerarquía
db.users.find({ 
  university: { $exists: true } 
}).pretty()
```

---

## 📊 Endpoints API Disponibles

### **Cascading Select (Públicos):**
```
GET  /api/hierarchy/universities
GET  /api/hierarchy/faculties/:universityId
GET  /api/hierarchy/programs/:facultyId
```

### **Gestión (Protegidos):**
```
POST /api/hierarchy/university          [Admin only]
POST /api/hierarchy/faculty             [Admin/Faculty]
POST /api/hierarchy/program             [Admin/Faculty]
GET  /api/hierarchy/full/:universityId  [Protegido]
PUT  /api/hierarchy/program/:programId/professors
```

---

## 🐛 Troubleshooting

### **Error: "Cannot find module 'University'"**
**Solución:** Asegúrate de que los modelos estén correctamente exportados en `backend/models/`

### **CascadingSelect no carga universidades**
**Solución:** 
1. Verificar que el backend esté corriendo
2. Verificar que el seeder se haya ejecutado
3. Verificar en consola del navegador (F12) si hay errores de CORS

### **Dashboard no redirige correctamente**
**Solución:**
1. Verificar que el usuario tenga los campos `university`, `facultyRef` o `academicProgramRef` según su rol
2. Verificar que las rutas de dashboard estén montadas en `routes/index.js`

### **Error 401 en endpoints de jerarquía**
**Solución:** Los endpoints de gestión requieren autenticación. Solo los endpoints de cascading select son públicos.

---

## 📁 Estructura de Archivos Clave

```
backend/
├── models/
│   ├── universityModel.js          ← Nivel 0
│   ├── facultyModel.js             ← Nivel 1
│   ├── academicProgramModel.js     ← Nivel 2
│   ├── userModel.js                ← Modificado con jerarquía
│   └── jobOfferModel.js            ← Modificado con targetPrograms
├── controller/
│   └── hierarchyController.js      ← Lógica de jerarquía
├── routes/
│   └── hierarchyRoutes.js          ← Rutas de API
└── seeders/
    └── hierarchySeeder.js          ← Datos iniciales

frontend/
├── components/
│   └── hierarchy/
│       ├── CascadingSelect.jsx     ← Selector dependiente
│       └── CascadingSelect.css
├── pages/
│   ├── dashboards/
│   │   ├── UniversityDashboard.jsx ← Nivel 0
│   │   ├── FacultyDashboard.jsx    ← Nivel 1
│   │   └── ProgramDashboard.jsx    ← Nivel 2
│   └── auth/
│       └── SignUp.jsx              ← Modificado con CascadingSelect
├── routes/
│   ├── dashboardRoutes.js          ← Rutas protegidas
│   └── index.js                    ← Rutas principales
└── utils/
    └── dashboardSwitcher.js        ← Redirección automática
```

---

## ✅ Checklist de Funcionalidad

Después de iniciar todo, verifica:

- [ ] Seeder ejecutado exitosamente
- [ ] Backend corriendo en puerto 8080
- [ ] Frontend corriendo en puerto 3000
- [ ] Registro muestra CascadingSelect para STUDENT/FACULTY
- [ ] CascadingSelect carga universidades
- [ ] Al seleccionar universidad, carga facultades
- [ ] Al seleccionar facultad, carga programas
- [ ] Login como Super Admin redirige a `/dashboard/university`
- [ ] Login como Decano redirige a `/dashboard/faculty`
- [ ] Login como Coordinador redirige a `/dashboard/program`
- [ ] Cada dashboard muestra datos según nivel de autoridad

---

## 🎉 ¡Listo!

Si todos los pasos funcionan correctamente, la **Jerarquía Académica está 100% operativa**.

**Próximos pasos opcionales:**
1. Agregar más universidades (ejecutar seeder modificado)
2. Crear usuarios de prueba (estudiantes, profesores)
3. Probar match de vacantes con targetPrograms
4. Implementar dashboard switcher en el Header

---

**Documentación completa:** Ver `JERARQUIA_ACADEMICA_IMPLEMENTACION.md` y `FASE_2_COMPLETADA.md`
