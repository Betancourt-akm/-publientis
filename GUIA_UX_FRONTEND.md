# Guía de Implementación UX - Frontend Publientis

## 🎯 Principio de Diseño

**Publientis es una plataforma de vinculación pedagógica, NO una tienda online.**

El marketplace debe ser **discreto, contextual y opcional**.

---

## 🚫 Reglas de Visibilidad del Marketplace

### **Header/Navegación Principal**

#### ❌ NO Mostrar:
```jsx
// MAL - No hacer esto
<nav>
  <Link to="/">Inicio</Link>
  <Link to="/jobs">Prácticas</Link>
  <Link to="/productos">Tienda</Link>  {/* ❌ NO */}
  <Link to="/carrito">                 {/* ❌ NO */}
    <FaShoppingCart />
  </Link>
</nav>
```

#### ✅ SÍ Mostrar:
```jsx
// BIEN - Navegación enfocada en vinculación
<nav>
  <Link to="/">Inicio</Link>
  <Link to="/jobs">Prácticas</Link>
  <Link to="/academic/feed">Red Académica</Link>
  <Link to="/perfil">Mi Perfil</Link>
</nav>
```

### **Carrito de Compras**

#### Mostrar SOLO si:
```jsx
const [showCart, setShowCart] = useState(false);

useEffect(() => {
  // Verificar si hay items en el carrito
  const cartItems = localStorage.getItem('cart');
  const hasItems = cartItems && JSON.parse(cartItems).length > 0;
  
  // Verificar si está en rutas de marketplace
  const isInMarketplace = location.pathname.includes('/recursos') || 
                          location.pathname.includes('/producto/');
  
  // Solo mostrar si tiene items O está navegando recursos
  setShowCart(hasItems || isInMarketplace);
}, [location]);

return (
  <>
    {showCart && (
      <Link to="/cart" className="cart-icon-discrete">
        <FaShoppingCart />
        {cartCount > 0 && <span className="badge">{cartCount}</span>}
      </Link>
    )}
  </>
);
```

---

## 📍 Acceso al Marketplace

### **Opción 1: Footer Discreto**

```jsx
// Footer.jsx
<footer>
  <div className="footer-links">
    <Link to="/about">Sobre Nosotros</Link>
    <Link to="/ayuda">Ayuda</Link>
    <Link to="/recursos" className="footer-link-discrete">
      📖 Recursos Educativos
    </Link>
  </div>
</footer>

// CSS
.footer-link-discrete {
  color: #888;
  font-size: 0.9rem;
}
```

### **Opción 2: Desde Red Social (Contextual)**

```jsx
// Post.jsx - Cuando alguien comparte un recurso
<div className="post">
  <p>{post.content}</p>
  
  {post.linkedResource && (
    <div className="resource-preview">
      <h4>{post.linkedResource.name}</h4>
      <p>{post.linkedResource.description}</p>
      <Link to={`/producto/${post.linkedResource._id}`}>
        Ver recurso →
      </Link>
    </div>
  )}
</div>
```

### **Opción 3: Menú de Usuario (Perfil)**

```jsx
// UserMenu.jsx
<DropdownMenu>
  <DropdownItem to="/perfil">Mi Perfil</DropdownItem>
  <DropdownItem to="/jobs/my-applications">Mis Postulaciones</DropdownItem>
  
  {/* Solo si es creador o ha comprado antes */}
  {(user.isCreator || hasPurchases) && (
    <>
      <DropdownDivider />
      <DropdownItem to="/recursos/mis-compras">
        Mis Recursos
      </DropdownItem>
    </>
  )}
  
  <DropdownDivider />
  <DropdownItem onClick={logout}>Cerrar Sesión</DropdownItem>
</DropdownMenu>
```

---

## 💎 Plan PRO para Organizaciones

### **Banner Discreto (Solo al publicar oferta)**

```jsx
// CreateJobOffer.jsx
const [showProBanner, setShowProBanner] = useState(false);

useEffect(() => {
  // Verificar si tiene plan PRO
  const checkSubscription = async () => {
    const res = await api.get('/api/subscriptions/my-subscription');
    const isPro = res.data.isPro;
    
    // Solo mostrar banner si NO es PRO
    setShowProBanner(!isPro);
  };
  
  checkSubscription();
}, []);

return (
  <div className="create-job-offer">
    <h1>Publicar Oferta de Práctica</h1>
    
    {/* Banner discreto */}
    {showProBanner && (
      <div className="pro-banner-discrete">
        <div className="pro-banner-content">
          <span>💡 Destaca esta oferta con Plan PRO</span>
          <button 
            onClick={() => navigate('/subscriptions/upgrade')}
            className="btn-pro-subtle"
          >
            Conocer PRO ($1/mes)
          </button>
        </div>
      </div>
    )}
    
    {/* Formulario de oferta */}
    <form>
      {/* ... campos ... */}
    </form>
  </div>
);
```

### **Badge PRO en Ofertas Destacadas**

```jsx
// JobCard.jsx
const JobCard = ({ job }) => {
  const [isPro, setIsPro] = useState(false);
  
  useEffect(() => {
    // Verificar si la organización tiene PRO
    api.get(`/api/subscriptions/check-pro/${job.organization._id}`)
      .then(res => setIsPro(res.data.isPro));
  }, [job.organization._id]);
  
  return (
    <div className={`job-card ${isPro ? 'job-card-pro' : ''}`}>
      {isPro && (
        <span className="badge-pro">
          ⭐ Organización PRO
        </span>
      )}
      
      <h3>{job.title}</h3>
      <p>{job.organization.name}</p>
      {/* ... resto del card ... */}
    </div>
  );
};
```

---

## 🎨 Estilos Discretos

### **CSS para Marketplace**

```css
/* Navegación principal - SIN referencias a tienda */
.main-nav {
  display: flex;
  gap: 2rem;
}

.main-nav-link {
  font-weight: 500;
  color: #333;
  transition: color 0.2s;
}

.main-nav-link:hover {
  color: #1F3C88; /* Color principal Publientis */
}

/* Footer - Links discretos */
.footer-link-discrete {
  color: #888;
  font-size: 0.9rem;
  text-decoration: none;
}

.footer-link-discrete:hover {
  color: #555;
}

/* Carrito - Icono discreto (solo cuando hay items) */
.cart-icon-discrete {
  position: relative;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.cart-icon-discrete:hover {
  opacity: 1;
}

.cart-icon-discrete .badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #1F3C88;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 0.75rem;
}

/* Banner PRO - Sutil y contextual */
.pro-banner-discrete {
  background: linear-gradient(135deg, #FFF9E6 0%, #FFF5CC 100%);
  border: 1px solid #F2C94C;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
}

.pro-banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-pro-subtle {
  background: transparent;
  border: 1px solid #F2C94C;
  color: #856404;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-pro-subtle:hover {
  background: #F2C94C;
  color: white;
}

/* Badge PRO en ofertas */
.badge-pro {
  display: inline-block;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #333;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.job-card-pro {
  border: 2px solid #FFD700;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
}
```

---

## 🔄 Flujos de Usuario

### **Flujo 1: Estudiante busca práctica (CORE)**

```
1. Entra a Publientis
2. Ve ofertas de práctica en /jobs
3. Filtra por programa/tags
4. Ve ofertas (algunas con badge PRO)
5. Postula
6. Chat con organización
7. ✅ Sin menciones de marketplace
```

### **Flujo 2: Organización publica oferta (CORE + PRO opcional)**

```
1. Entra a /jobs/create
2. Completa formulario
3. Ve banner discreto: "Destaca con PRO ($1/mes)"
4. Opciones:
   a) Ignora banner → Publica gratis
   b) Click en PRO → Modal con beneficios
      → Paga $1 → Oferta destacada
5. Oferta publicada (con o sin PRO)
```

### **Flujo 3: Docente busca recurso (MARKETPLACE - opcional)**

```
1. Entra a red social /academic/feed
2. Ve post: "Publiqué mi libro sobre inclusión"
3. Click en link del libro
4. Página del libro (/producto/:id)
5. "Agregar a biblioteca" → Carrito aparece
6. Checkout → Pago → Descarga
7. Vuelve a red social
```

### **Flujo 4: Egresado vende recurso (CREADOR)**

```
1. Perfil → "Convertirme en creador"
2. Solicitud de aprobación (admin revisa)
3. Aprobado → Acceso a panel de vendedor
4. Sube libro/curso
5. Publica en red social con link
6. Recibe pagos (menos comisión)
```

---

## 📱 Responsive y Mobile

### **Mobile - Navegación**

```jsx
// MobileNav.jsx
<nav className="mobile-nav">
  <Link to="/" className="nav-icon">
    <FaHome />
    <span>Inicio</span>
  </Link>
  
  <Link to="/jobs" className="nav-icon">
    <FaBriefcase />
    <span>Prácticas</span>
  </Link>
  
  <Link to="/academic/feed" className="nav-icon">
    <FaGraduationCap />
    <span>Red</span>
  </Link>
  
  <Link to="/perfil" className="nav-icon">
    <FaUser />
    <span>Perfil</span>
  </Link>
  
  {/* Carrito solo si tiene items */}
  {cartCount > 0 && (
    <Link to="/cart" className="nav-icon">
      <FaShoppingCart />
      <span className="badge">{cartCount}</span>
    </Link>
  )}
</nav>
```

---

## 🎯 Componentes Clave

### **1. ConditionalCart.jsx**

```jsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';

const ConditionalCart = () => {
  const [showCart, setShowCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();
  
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    setCartCount(count);
    
    // Mostrar solo si hay items o está en marketplace
    const inMarketplace = location.pathname.includes('/recursos') ||
                         location.pathname.includes('/producto/');
    
    setShowCart(count > 0 || inMarketplace);
  }, [location]);
  
  if (!showCart) return null;
  
  return (
    <Link to="/cart" className="cart-discrete">
      <FaShoppingCart />
      {cartCount > 0 && <span className="badge">{cartCount}</span>}
    </Link>
  );
};

export default ConditionalCart;
```

### **2. ProBanner.jsx**

```jsx
const ProBanner = ({ show = true }) => {
  const [isPro, setIsPro] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    api.get('/api/subscriptions/my-subscription')
      .then(res => setIsPro(res.data.isPro))
      .catch(() => setIsPro(false));
  }, []);
  
  if (!show || isPro) return null;
  
  return (
    <div className="pro-banner-discrete">
      <span>💡 Destaca tus ofertas con Plan PRO</span>
      <button onClick={() => navigate('/subscriptions/upgrade')}>
        Solo $1/mes
      </button>
    </div>
  );
};
```

### **3. ResourceCard.jsx (NO ProductCard)**

```jsx
const ResourceCard = ({ resource }) => {
  return (
    <div className="resource-card">
      <img src={resource.images[0]} alt={resource.name} />
      <h3>{resource.name}</h3>
      <p className="author">Por {resource.vendor.name}</p>
      <p className="price">${resource.price.toLocaleString()}</p>
      
      <button className="btn-add-to-library">
        Agregar a mi biblioteca
      </button>
    </div>
  );
};
```

---

## ✅ Checklist de Implementación

### **Fase 1: Ocultar Marketplace del Menú Principal**
- [ ] Remover link "Productos/Tienda" de Header
- [ ] Remover icono de carrito del Header principal
- [ ] Agregar link "Recursos" en Footer
- [ ] Implementar `ConditionalCart.jsx`

### **Fase 2: Plan PRO Discreto**
- [ ] Crear componente `ProBanner.jsx`
- [ ] Integrar en `/jobs/create`
- [ ] Crear página `/subscriptions/upgrade`
- [ ] Badge PRO en JobCard
- [ ] Ordenar ofertas (PRO primero)

### **Fase 3: Marketplace Contextual**
- [ ] Crear ruta `/recursos` (sin menú principal)
- [ ] Link desde Footer
- [ ] Links desde publicaciones en red social
- [ ] Renombrar "Comprar" → "Agregar a biblioteca"
- [ ] Checkout simplificado

### **Fase 4: Testing UX**
- [ ] Usuario nuevo NO ve referencias a tienda
- [ ] Carrito aparece solo cuando es relevante
- [ ] Banner PRO solo en contexto adecuado
- [ ] Flujo de práctica libre de comercio

---

## 🚀 Implementación Prioritaria

### **Cambios Inmediatos:**

1. **Header.jsx** - Remover carrito
2. **Footer.jsx** - Agregar link discreto "Recursos"
3. **CreateJobOffer.jsx** - Agregar ProBanner
4. **JobList.jsx** - Badge PRO y ordenamiento

### **Cambios Próximos:**

5. Página `/subscriptions/upgrade`
6. `ConditionalCart.jsx`
7. Renombrar labels comerciales
8. Testing con usuarios reales

---

## 📊 Métricas de Éxito UX

**Objetivo:** El 90% de usuarios deben completar el flujo de postulación sin ver el marketplace.

- ❌ Usuario confundido pensando que es e-commerce
- ✅ Usuario enfocado en encontrar prácticas
- ✅ Marketplace descubierto solo cuando lo necesita
- ✅ Plan PRO percibido como beneficio opcional

**Publientis es una RED PROFESIONAL PEDAGÓGICA, no una tienda.**
