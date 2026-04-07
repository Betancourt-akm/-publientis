# Estrategia de Monetización y UX - Publientis

## 🎯 Visión Principal

**Publientis es PRIMERO una plataforma de vinculación laboral pedagógica.**

El marketplace y las suscripciones son **características secundarias y discretas** que:
- ✅ NO deben dominar la experiencia del usuario
- ✅ NO deben crear percepción de "tienda online"
- ✅ Solo aparecen cuando son relevantes

---

## 💰 Modelo de Monetización

### **Principio Fundamental: GRATIS POR DEFECTO**

Publientis es **completamente gratuito** para:
- ✅ Estudiantes y egresados
- ✅ Organizaciones (plan básico)
- ✅ Facultades y docentes
- ✅ Postulación a prácticas
- ✅ Red social académica
- ✅ Chat y mensajería

---

## 🏢 Planes para Organizaciones (Opcional)

### **Plan FREE (Gratuito - Por defecto)**
```
✅ Publicar ofertas de práctica (ilimitadas)
✅ Recibir postulaciones
✅ Chat con candidatos
✅ Gestión básica de vacantes
✅ Visibilidad estándar
```

### **Plan PRO ($1 USD / ~$4.500 COP mes)**
```
⭐ TODO lo del plan FREE +
⭐ Ofertas destacadas (aparecen primero)
⭐ Badge "Organización Verificada PRO"
⭐ Estadísticas de visualizaciones
⭐ Filtros avanzados de candidatos
⭐ Soporte prioritario
```

**Mensaje clave al usuario:**
> "Publientis es 100% gratuito. Mejora tu experiencia con PRO por solo $1 USD/mes para destacar tus ofertas y recibir candidatos más rápido."

---

## 📚 Marketplace de Recursos Educativos (Discreto)

### **Visibilidad Condicional**

El carrito y el marketplace **NO están visibles** en la navegación principal.

#### **Cuándo SÍ aparece:**

1. **Usuario busca recursos pedagógicos**
   - Entra a sección "Recursos" (opcional en menú secundario)
   - Ve catálogo de libros, cursos, materiales
   - Puede agregar al carrito

2. **Docente/Egresado publica un recurso**
   - Activa cuenta de "Creador de contenido"
   - Sube libro/curso propio
   - Gestiona ventas desde panel privado

3. **Referencia desde red social**
   - "Acabo de publicar mi libro sobre inclusión" → Link directo
   - Usuario interesado hace clic y puede comprar

#### **Cuándo NO aparece:**

- ❌ **Nunca en menú principal** (no hay "Tienda" o "Productos")
- ❌ **Nunca en módulo de prácticas** (Jobs)
- ❌ **Nunca en red social académica** (Academic)
- ❌ **Nunca en perfil pedagógico**

**El usuario solo ve el marketplace cuando ACTIVAMENTE busca comprar recursos.**

---

## 🎨 Experiencia de Usuario (UX)

### **Navegación Principal (Visible siempre)**

```
┌─────────────────────────────────────────────────┐
│  PUBLIENTIS                           👤 Perfil │
├─────────────────────────────────────────────────┤
│                                                 │
│  🏠 Inicio    💼 Prácticas    🎓 Red Académica  │
│                                                 │
└─────────────────────────────────────────────────┘

ENFOQUE: Vinculación laboral y comunidad académica
```

### **Menú Secundario / Footer (Discreto)**

```
────────────────────────────────────────────────
  Sobre Nosotros  |  Ayuda  |  📖 Recursos*
────────────────────────────────────────────────

* "Recursos" lleva al marketplace (solo si buscan)
```

### **Flujo de Compra (Solo cuando se necesita)**

```
1. Usuario ve publicación: "Publiqué mi libro sobre pedagogía infantil"
2. Click en link → Página del libro
3. Botón "Agregar a biblioteca" (no "comprar")
4. Carrito aparece (icono discreto en esquina)
5. Checkout simple
6. Descarga/acceso inmediato
```

---

## 🔒 Roles y Permisos

### **Estudiante/Egresado (USER, STUDENT)**
- ✅ Busca prácticas (gratis)
- ✅ Red social académica (gratis)
- 📚 Puede comprar recursos (opcional)
- 💡 Puede convertirse en "Creador" y vender

### **Organización (ORGANIZATION)**
- ✅ Publica ofertas (gratis)
- ⭐ Puede actualizar a PRO ($1/mes)
- ❌ NO accede a marketplace

### **Facultad/Docente (FACULTY, DOCENTE)**
- ✅ Aprueba ofertas (gratis)
- ✅ Supervisa estudiantes (gratis)
- 📚 Puede comprar recursos (opcional)
- 💡 Puede vender materiales propios

### **Creador de Contenido (nuevo flag en User)**
- Cualquier usuario puede solicitar ser "Creador"
- Sube libros, cursos, materiales
- Recibe pagos (menos comisión 10%)

---

## 💳 Pasarelas de Pago (Discretas)

### **Plan PRO (Suscripción)**
```javascript
Producto especial en base de datos:
{
  name: "Plan PRO - Mensual",
  category: "Suscripción", // Categoría especial
  price: 1.00, // USD
  isSubscription: true,
  subscriptionDetails: {
    duration: 30, // días
    features: ['priority_listing', 'verified_badge', 'analytics']
  }
}
```

**Flujo:**
1. Organización va a /jobs/create
2. Banner discreto: "Destaca esta oferta con PRO ($1/mes)"
3. Click → Modal con beneficios
4. "Activar PRO" → Pago con Wompi/PayPal
5. Oferta se marca como prioritaria automáticamente

### **Recursos Educativos (Compra única)**
```javascript
Producto normal:
{
  name: "Manual de Educación Inclusiva",
  category: "Libros y Textos Educativos",
  price: 15000, // COP
  isSubscription: false,
  vendor: ObjectId // Creador
}
```

**Flujo:**
1. Usuario busca "educación inclusiva" en /recursos (opcional)
2. Ve libro → "Agregar a biblioteca" ($15.000)
3. Checkout → Pago → Descarga PDF

---

## 📊 Métricas de Éxito

### **Core (Prioritarias)**
- Número de prácticas publicadas
- Tasa de postulaciones
- Tiempo promedio hasta contratación
- Satisfacción de estudiantes y organizaciones
- **Actividad en red académica**

### **Monetización (Secundarias)**
- % de organizaciones con Plan PRO
- Ingresos por suscripciones
- Ventas de recursos educativos
- Comisión por transacciones

**Objetivo:** 
- 90% del valor viene de vinculación laboral
- 10% del valor viene de monetización

---

## 🚫 Lo que NO Hacer (Anti-patrones)

❌ **NO mostrar carrito de compras en menú principal**
❌ **NO banners de "Compra ahora" en módulo de prácticas**
❌ **NO popup de "Actualiza a PRO" cada vez que entran**
❌ **NO lenguaje comercial agresivo**
❌ **NO hacer el marketplace prominente**

✅ **SÍ sugerencias discretas contextuales**
✅ **SÍ valor gratuito primero**
✅ **SÍ monetización opcional y transparente**

---

## 🎯 Propuesta de Valor por Usuario

### **Para Estudiantes:**
> "Encuentra tu práctica ideal gratis. Conecta con instituciones que valoran tu perfil pedagógico. Opcional: accede a recursos de docentes expertos."

### **Para Organizaciones:**
> "Publica ofertas gratis y encuentra candidatos calificados. Por $1/mes, destaca tus vacantes y recibe postulaciones más rápido."

### **Para Docentes/Egresados:**
> "Conecta con estudiantes, comparte conocimiento, y si quieres, monetiza tus materiales didácticos."

---

## 🔄 Flujo de Onboarding

### **Estudiante se registra:**
```
1. "Bienvenido a Publientis - Encuentra tu práctica ideal"
2. Completa perfil pedagógico (facultad, programa, tags)
3. Ve ofertas de práctica recomendadas
4. (Sin mención de marketplace ni pagos)
```

### **Organización se registra:**
```
1. "Bienvenido a Publientis - Encuentra talento pedagógico"
2. Completa perfil institucional
3. "Publica tu primera oferta (gratis)"
4. Después de publicar: Banner discreto "Mejora con PRO"
```

### **Usuario busca recursos:**
```
1. En perfil o menú: Link discreto "Recursos educativos"
2. Catálogo simple (sin énfasis comercial)
3. Compra opcional cuando encuentre algo útil
```

---

## 💡 Ejemplos de Mensajería

### **En lugar de:**
❌ "Compra el Plan PRO ahora - Oferta limitada"
❌ "Tienda de productos educativos"
❌ "Añadir al carrito de compras"

### **Usar:**
✅ "Destaca tu oferta con PRO (opcional, $1/mes)"
✅ "Recursos educativos de la comunidad"
✅ "Agregar a mi biblioteca"

---

## 📈 Roadmap de Monetización

### **Fase 1 (Actual) - Gratis Total**
- Todo gratuito
- Construir comunidad
- Validar modelo de vinculación

### **Fase 2 (Q2 2026) - Freemium Discreto**
- Plan PRO para organizaciones ($1/mes)
- Marketplace de recursos (oculto en menú)
- Sin presión comercial

### **Fase 3 (Q3 2026) - Optimización**
- Analytics para organizaciones PRO
- Más funciones premium opcionales
- Comisión en recursos educativos (10%)

### **Fase 4 (Futuro) - Escalamiento**
- Planes corporativos para universidades
- API para integración institucional
- Certificaciones y cursos premium

---

## ✅ Checklist de Implementación

- [ ] Crear modelo `Subscription` con plan FREE por defecto
- [ ] Productos tipo "Suscripción" con precio $1 USD
- [ ] Lógica de visibilidad condicional del carrito
- [ ] Ocultar "Tienda/Productos" del menú principal
- [ ] Agregar sección "Recursos" en menú secundario/footer
- [ ] Badge "PRO" para organizaciones premium
- [ ] Banner discreto "Mejora con PRO" solo al publicar oferta
- [ ] Renombrar "Comprar" → "Agregar a biblioteca"
- [ ] Dashboard de suscripción para organizaciones
- [ ] Analytics solo para usuarios PRO

---

## 🎯 Conclusión

**Publientis es una plataforma de vinculación pedagógica que SE SOSTIENE con monetización discreta.**

- **Core:** Conectar estudiantes con prácticas (GRATIS)
- **Valor agregado:** Plan PRO opcional ($1/mes)
- **Complemento:** Recursos educativos (marketplace oculto)

**El usuario nunca debe sentir que está en una tienda. Debe sentir que está en una red profesional pedagógica.**
