# 🔐 Sistema de Autenticación Requerida - Guía de Uso

Este sistema reemplaza los toasts genéricos por modales profesionales cuando el usuario intenta acceder a funcionalidades que requieren autenticación.

## 📦 Componentes Creados

### 1. `AuthRequiredModal.jsx`
Modal profesional con diseño moderno que muestra:
- Mensaje personalizado según la acción
- Botones para Login y Registro
- Lista de beneficios de crear cuenta
- Diseño responsive con gradientes

### 2. `useAuthRequired.js` (Hook)
Hook personalizado que proporciona:
- Función `requireAuth()` para verificar autenticación
- Estado del modal
- Información de autenticación del usuario

### 3. `WithAuthRequired.jsx` (HOC)
Componente wrapper que combina el hook y el modal.

---

## 🚀 Cómo Usar

### **Opción 1: Hook + Modal Manual (Recomendado)**

```jsx
import React, { useContext } from 'react';
import useAuthRequired from '../hooks/useAuthRequired';
import AuthRequiredModal from '../components/AuthRequiredModal';
import Context from '../context';

const MyComponent = () => {
  const { user } = useContext(Context);
  const { requireAuth, isAuthModalOpen, currentAction, closeModal } = useAuthRequired();

  const handleAddToFavorites = (walkerId) => {
    // Verificar autenticación antes de continuar
    if (!requireAuth('favoritos')) return;
    
    // Si llega aquí, el usuario está autenticado
    console.log('Agregando a favoritos:', walkerId);
    // Tu lógica aquí...
  };

  const handleAddToCart = (productId) => {
    if (!requireAuth('carrito')) return;
    
    // Lógica del carrito
    console.log('Agregando al carrito:', productId);
  };

  const handleReserve = (walkerId) => {
    if (!requireAuth('reserva')) return;
    
    // Lógica de reserva
    console.log('Reservando servicio:', walkerId);
  };

  return (
    <>
      <button onClick={() => handleAddToFavorites('123')}>
        ❤️ Agregar a Favoritos
      </button>
      
      <button onClick={() => handleAddToCart('456')}>
        🛒 Agregar al Carrito
      </button>

      <button onClick={() => handleReserve('789')}>
        📅 Reservar Ahora
      </button>

      {/* Modal se muestra automáticamente cuando sea necesario */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={closeModal}
        action={currentAction}
      />
    </>
  );
};

export default MyComponent;
```

---

### **Opción 2: Wrapper Component (Más Simple)**

```jsx
import React from 'react';
import WithAuthRequired from '../components/WithAuthRequired';

const MyComponent = () => {
  return (
    <WithAuthRequired>
      {({ requireAuth, isAuthenticated }) => (
        <div>
          <button 
            onClick={() => {
              if (!requireAuth('favoritos')) return;
              console.log('Agregar a favoritos');
            }}
          >
            ❤️ Favoritos
          </button>

          {/* Mostrar botón solo si está autenticado */}
          {isAuthenticated && (
            <button>Mi Perfil</button>
          )}
        </div>
      )}
    </WithAuthRequired>
  );
};

export default MyComponent;
```

---

## 🎯 Tipos de Acciones Soportadas

El parámetro `action` personaliza el mensaje del modal:

| Acción | Descripción | Mensaje Modal |
|--------|-------------|---------------|
| `'carrito'` | Agregar al carrito | "Agrega productos a tu carrito" |
| `'favoritos'` | Guardar favoritos | "Guarda tus favoritos" |
| `'perfil'` | Acceder al perfil | "Accede a tu perfil" |
| `'reserva'` | Hacer una reserva | "Reserva un paseador" |
| `'continuar'` | (default) | "Inicia sesión para continuar" |

---

## 📝 Ejemplos Prácticos

### **Ejemplo 1: Botón de Favoritos en Card de Paseador**

```jsx
import React from 'react';
import { FaHeart } from 'react-icons/fa';
import useAuthRequired from '../hooks/useAuthRequired';
import AuthRequiredModal from '../components/AuthRequiredModal';

const WalkerCard = ({ walker }) => {
  const { requireAuth, isAuthModalOpen, currentAction, closeModal } = useAuthRequired();

  const handleToggleFavorite = () => {
    if (!requireAuth('favoritos')) return;
    
    // Usuario autenticado, ejecutar lógica
    console.log('Agregar/quitar favorito:', walker.id);
    // API call aquí...
  };

  return (
    <>
      <div className="card">
        <h3>{walker.name}</h3>
        
        <button 
          onClick={handleToggleFavorite}
          className="favorite-btn"
        >
          <FaHeart /> Favorito
        </button>
      </div>

      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={closeModal}
        action={currentAction}
      />
    </>
  );
};
```

---

### **Ejemplo 2: Botón de Reservar**

```jsx
import React from 'react';
import useAuthRequired from '../hooks/useAuthRequired';
import AuthRequiredModal from '../components/AuthRequiredModal';

const BookingButton = ({ walkerId, service }) => {
  const { requireAuth, isAuthModalOpen, currentAction, closeModal } = useAuthRequired();

  const handleBooking = () => {
    if (!requireAuth('reserva')) return;
    
    // Abrir modal de reserva
    console.log('Abriendo modal de reserva para:', walkerId);
  };

  return (
    <>
      <button 
        onClick={handleBooking}
        className="btn-primary"
      >
        📅 Reservar Servicio
      </button>

      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={closeModal}
        action={currentAction}
      />
    </>
  );
};
```

---

### **Ejemplo 3: Header con Ícono de Carrito**

```jsx
import React, { useContext } from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import useAuthRequired from '../hooks/useAuthRequired';
import AuthRequiredModal from '../components/AuthRequiredModal';
import Context from '../context';

const Header = () => {
  const navigate = useNavigate();
  const { user } = useContext(Context);
  const { requireAuth, isAuthModalOpen, currentAction, closeModal } = useAuthRequired();

  const handleCartClick = () => {
    if (!requireAuth('carrito')) return;
    
    // Usuario autenticado, ir al carrito
    navigate('/cart');
  };

  return (
    <>
      <header>
        <div className="cart-icon" onClick={handleCartClick}>
          <FiShoppingCart />
          {user?.cartCount > 0 && (
            <span className="badge">{user.cartCount}</span>
          )}
        </div>
      </header>

      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={closeModal}
        action={currentAction}
      />
    </>
  );
};
```

---

## 🎨 Personalización

### Cambiar Colores del Modal

Edita `AuthRequiredModal.jsx`:

```jsx
// Cambiar gradiente del header
<div className="bg-gradient-to-r from-blue-500 to-purple-600">
  ↓
<div className="bg-gradient-to-r from-green-500 to-teal-600">

// Cambiar color del botón principal
<button className="bg-blue-600 hover:bg-blue-700">
  ↓
<button className="bg-green-600 hover:bg-green-700">
```

### Agregar Nuevos Tipos de Acción

En `AuthRequiredModal.jsx`, añade casos en `getActionMessage()`:

```jsx
case 'chat':
  return {
    title: 'Chatea con el paseador',
    description: 'Necesitas una cuenta para comunicarte con los paseadores.'
  };
```

---

## ✅ Beneficios vs Toasts

| Característica | Toast Genérico ❌ | Modal Profesional ✅ |
|----------------|-------------------|---------------------|
| **UX** | Interrumpe, desaparece rápido | Claro, permite acción |
| **Conversión** | Bajo (usuario confundido) | Alto (CTAs directos) |
| **Diseño** | Poco atractivo | Moderno y atractivo |
| **Funcionalidad** | Solo informa | Login/Registro directo |
| **Contexto** | Genérico | Personalizado por acción |

---

## 🐛 Troubleshooting

### El modal no se muestra
```jsx
// ✅ Correcto: incluir el modal en el JSX
<>
  <button onClick={...}>Acción</button>
  <AuthRequiredModal isOpen={...} />
</>

// ❌ Incorrecto: olvidar incluir el modal
<button onClick={...}>Acción</button>
```

### requireAuth siempre retorna false
Verifica que el Context esté configurado correctamente y que `user._id` exista cuando hay sesión activa.

### El usuario sigue viendo toasts
Busca y reemplaza todos los `toast.error('Debes iniciar sesión')` por el nuevo sistema:

```bash
# Buscar en tu proyecto
grep -r "toast.*login" frontend/src/
grep -r "toast.*autenticar" frontend/src/
```

---

## 📚 Recursos Adicionales

- **Context API**: `frontend/src/context/index.js`
- **Componentes**: `frontend/src/components/`
- **Hooks**: `frontend/src/hooks/`
- **Rutas**: `frontend/src/routes/index.js`

---

## 🚀 Próximos Pasos

1. ✅ Reemplazar toasts en todos los componentes
2. ✅ Agregar animaciones de entrada/salida al modal
3. ✅ Implementar redirección al path original después de login
4. ✅ Agregar analytics para tracking de conversiones
5. ✅ A/B testing de mensajes del modal
