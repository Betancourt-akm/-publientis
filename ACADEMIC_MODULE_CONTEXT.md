# 🎓 FIS Connect — Módulo Académico sobre Publientis

## Contexto general
Publientis es un ecommerce en React (frontend) + Node/Express (backend) separados.
Vamos a EXTENDER este proyecto para convertirlo en una red social académica universitaria.
NO es un reemplazo, es un nuevo módulo paralelo que coexiste con el ecommerce.

## ✅ Lo que ya existe y SE REUTILIZA SIN TOCAR
- Sistema de autenticación completo (JWT, OAuth Google, recuperación de contraseña, verificación por correo)
- Modelo de Usuario base (User model)
- Middleware de roles (lo extenderemos, no lo reemplazamos)
- Upload de imágenes con Cloudinary (mismas keys)
- Componentes UI: Navbar, Sidebar, Layout, Cards, Formularios, Modales, Drawers, Tablas de admin
- Carpeta /common o /shared (cualquier componente genérico)
- Login / Register pages (se reutilizan tal cual)
- Configuración de base de datos y variables de entorno

## ❌ Lo que es EXCLUSIVO del ecommerce y NO se toca
- Modelos: Product, Order, Cart, Payment
- Rutas: /shop, /cart, /checkout, /orders
- Componentes: ProductCard, CartDrawer, CheckoutForm, OrderTable
- Lógica de precios, inventario, cupones

## 🆕 Lo que se va a CREAR (nuevo módulo académico)
- Roles nuevos: STUDENT, FACULTY, VISITOR (extender el enum existente)
- Modelo: AcademicProfile (ligado a User por userId)
- Modelo: Publication (tipos: logro, paper, libro, práctica, investigación, certificación)
- Modelo: Announcement (convocatorias y eventos de facultad)
- Modelo: Connection (seguidores)
- Modelo: Notification
- Rutas nuevas bajo prefijo: /api/academic/
- Páginas nuevas: /academic/feed, /academic/profile/:id, /academic/dashboard
- Panel de Facultad (moderación de publicaciones)
- Buscador público para visitantes/empleadores

## 📁 Estructura de carpetas propuesta (frontend)
src/
  modules/
    academic/
      components/    ← componentes específicos académicos
      pages/         ← Feed, Profile, Dashboard, FacultyPanel
      hooks/         ← usePublications, useAcademicProfile
      services/      ← llamadas a /api/academic/

## 📁 Estructura de carpetas propuesta (backend)
src/
  modules/
    academic/
      models/        ← AcademicProfile, Publication, Announcement
      routes/        ← academic.routes.js
      controllers/   ← publication.controller.js, profile.controller.js
      middlewares/   ← facultyOnly.js, studentOnly.js

## ⚠️ Reglas para Windsurf
1. Nunca modificar archivos de auth existentes, solo extenderlos si es necesario
2. Nunca tocar modelos de ecommerce
3. Reutilizar SIEMPRE los componentes de /common, /shared o equivalentes
4. Todas las rutas académicas bajo prefijo /api/academic/
5. Los nuevos dashboards deben usar el mismo Layout/Sidebar existente
6. Usar el mismo sistema de estilos (Tailwind / CSS modules / lo que ya usa el proyecto)
