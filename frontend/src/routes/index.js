import React, { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminControlPanel from '../pages/admin/AdminControlPanel';
import dashboardRoutes from './dashboardRoutes';
import TalentMarketplace from '../pages/marketplace/TalentMarketplace';
import MatchmakingDashboard from '../pages/dashboards/MatchmakingDashboard';
import FacultyDashboard from '../modules/academic/pages/FacultyDashboard';

// --- LAZY LOAD DE COMPONENTES PUBLIENTIS ---

// Páginas Principales y de Autenticación
const Home = lazy(() => import('../pages/Home.jsx'));
const Login = lazy(() => import('../pages/auth/Login.jsx'));
const SignUp = lazy(() => import('../pages/auth/SignUp.jsx'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword.jsx'));
const PasswordRecoverySent = lazy(() => import('../pages/auth/PasswordRecoverySent.jsx'));
const PasswordChangedSuccess = lazy(() => import('../pages/auth/PasswordChangedSuccess.jsx'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword.jsx'));
const VerifyEmailPage = lazy(() => import('../pages/auth/VerifyEmailPage.jsx'));
const EmailVerification = lazy(() => import('../pages/auth/EmailVerification.jsx'));
const OAuthSuccess = lazy(() => import('../pages/auth/OAuthSuccess.jsx'));
const ChangePassword = lazy(() => import('../pages/auth/ChangePassword.jsx'));

// Páginas de Usuario y Perfil
const Perfil = lazy(() => import('../pages/user/Perfil.jsx'));
const Ubicacion = lazy(() => import('../pages/user/Ubicacion.jsx'));
const Vendedor = lazy(() => import('../pages/vendor/Vendedor.jsx'));

// Páginas de E-commerce
const Productos = lazy(() => import('../pages/product/Productos.jsx'));
const ProductoDetalle = lazy(() => import('../pages/product/ProductoDetalle.jsx'));
const Cart = lazy(() => import('../pages/Cart.jsx'));
const Wishlist = lazy(() => import('../pages/product/Wishlist.jsx'));
const Checkout = lazy(() => import('../pages/payment/Checkout.jsx'));
const MisOrdenes = lazy(() => import('../pages/order/MisOrdenes.jsx'));
const OrdenDetalle = lazy(() => import('../pages/order/OrdenDetalle.jsx'));
const Categorias = lazy(() => import('../pages/product/Categorias.jsx'));

// Páginas de Admin
const ProductosAdmin = lazy(() => import('../pages/admin/ProductosAdmin.jsx'));
const OrdenesAdmin = lazy(() => import('../pages/admin/OrdenesAdmin.jsx'));
const VentasPanel = lazy(() => import('../pages/admin/VentasPanel.jsx'));
const FinancieroPanel = lazy(() => import('../pages/admin/FinancieroPanel.jsx'));
const TestAuth = lazy(() => import('../pages/admin/TestAuth.jsx'));
const VendedoresAdmin = lazy(() => import('../pages/admin/VendedoresAdmin.jsx'));
const ChatAdmin = lazy(() => import('../pages/admin/ChatAdmin.jsx'));
const AdminPanel = lazy(() => import('../pages/admin/AdminPanel.jsx'));
const AllUsers = lazy(() => import('../pages/admin/AllUsers.jsx'));
const AdminManualData = lazy(() => import('../pages/admin/AdminManualData'));
const MyPortfolio = lazy(() => import('../pages/profile/MyPortfolio'));
const UpgradeToPro = lazy(() => import('../pages/subscriptions/UpgradeToPro'));
const Notifications = lazy(() => import('../pages/notifications/Notifications'));
const SavedCandidates = lazy(() => import('../pages/favorites/SavedCandidates'));
const EmployabilityDashboard = lazy(() => import('../modules/faculty/pages/EmployabilityDashboard'));
const MyEvaluations = lazy(() => import('../pages/evaluations/MyEvaluations'));

// Páginas de Pago
const PaymentSuccess = lazy(() => import('../pages/payment/PaymentSuccess.jsx'));
const PaymentSuccessSimple = lazy(() => import('../pages/payment/PaymentSuccessSimple.jsx')); // PayPal Card
const OrderConfirmation = lazy(() => import('../pages/order/OrderConfirmation.jsx')); // Contra Entrega
const CancelPayment = lazy(() => import('../pages/payment/CancelPayment.jsx'));
const TrackOrder = lazy(() => import('../pages/order/TrackOrder.jsx')); // Tracking Público

// Página de Error
const NotFound = lazy(() => import('../pages/NotFound.jsx'));

// Páginas de Contenido Estático
const Contacto = lazy(() => import('../pages/info/Contacto.jsx'));

// Página de Pruebas PayPal
const PayPalTest = lazy(() => import('../pages/payment/PayPalTest.jsx'));

// Página de Demostración de Auth Modal
const AuthModalDemo = lazy(() => import('../pages/auth/AuthModalDemo.jsx'));

// Academic Profile Page (Public)
const AcademicProfilePage = lazy(() => import('../modules/academic/pages/AcademicProfilePage'));

// --- ACADEMIC MODULE (FIS CONNECT) ---
const AcademicFeed = lazy(() => import('../modules/academic/pages/AcademicFeed.jsx'));
const CreatePublication = lazy(() => import('../modules/academic/pages/CreatePublication.jsx'));
const EditProfile = lazy(() => import('../modules/academic/pages/EditProfile.jsx'));
const Friends = lazy(() => import('../pages/Friends.jsx'));

// --- JOBS MODULE (Vinculación Laboral) ---
const JobBoard = lazy(() => import('../modules/jobs/pages/JobBoard.jsx'));
const JobDetail = lazy(() => import('../modules/jobs/pages/JobDetail.jsx'));
const CreateJobOffer = lazy(() => import('../modules/jobs/pages/CreateJobOffer.jsx'));
const MyApplications = lazy(() => import('../modules/jobs/pages/MyApplications.jsx'));
const MyOffers = lazy(() => import('../modules/jobs/pages/MyOffers.jsx'));
const JobApplicants = lazy(() => import('../modules/jobs/pages/JobApplicants.jsx'));
const JobApprovalPanel = lazy(() => import('../modules/jobs/pages/JobApprovalPanel.jsx'));
const EditJobOffer = lazy(() => import('../modules/jobs/pages/EditJobOffer.jsx'));

// --- CREACIÓN DEL ROUTER ---

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            // Ruta Principal - Marketplace (PÚBLICO - Prioridad 1)
            { path: "", element: <TalentMarketplace /> },
            
            // Comunidad Académica - Feed Social (Secundario)
            { path: "comunidad", element: <ProtectedRoute><AcademicFeed /></ProtectedRoute> },
            
            // Landing Informativa
            { path: "about", element: <Home /> }, // Landing informativa
            
            // Autenticación
            { path: "login", element: <Login /> },
            { path: "sign-up", element: <SignUp /> },
            { path: "forgot-password", element: <ForgotPassword /> },
            { path: "password-recovery-sent", element: <PasswordRecoverySent /> },
            { path: "password-changed-success", element: <PasswordChangedSuccess /> },
            { path: "reset-password/:token", element: <ResetPassword /> },
            { path: "verify-email/:token", element: <VerifyEmailPage /> },
            { path: "email-verification", element: <EmailVerification /> },
            { path: "oauth-success", element: <OAuthSuccess /> },

            // Usuario (Protegido - requiere login)
            { path: "/perfil", element: <ProtectedRoute><Perfil /></ProtectedRoute> },
            { path: "/perfil/portafolio", element: <ProtectedRoute><MyPortfolio /></ProtectedRoute> },
            { path: "/notificaciones", element: <ProtectedRoute><Notifications /></ProtectedRoute> },
            { path: "friends", element: <ProtectedRoute><Friends /></ProtectedRoute> },
            { path: "change-password", element: <ProtectedRoute><ChangePassword /></ProtectedRoute> },
            { path: "ubicacion", element: <Ubicacion /> },
            { path: "vendedor", element: <ProtectedRoute><Vendedor /></ProtectedRoute> },
            
            // E-commerce - Productos
            { path: "productos", element: <Productos /> },
            { path: "producto/:id", element: <ProductoDetalle /> },
            { path: "categorias", element: <Categorias /> },
            { path: "ofertas", element: <Productos /> },
            
            // E-commerce - Carrito y Checkout (Protegido - requiere login)
            { path: "cart", element: <ProtectedRoute><Cart /></ProtectedRoute> },
            { path: "wishlist", element: <ProtectedRoute><Wishlist /></ProtectedRoute> },
            { path: "checkout", element: <ProtectedRoute><Checkout /></ProtectedRoute> },
            
            // E-commerce - Órdenes (Protegido - requiere login)
            { path: "mis-ordenes", element: <ProtectedRoute><MisOrdenes /></ProtectedRoute> },
            { path: "orden/:id", element: <ProtectedRoute><OrdenDetalle /></ProtectedRoute> },
            
            // Contenido Estático
            { path: "contacto", element: <Contacto /> },

            // Pagos
            { path: "payment-success", element: <PaymentSuccessSimple /> }, // PayPal Card
            { path: "payment-success-order", element: <PaymentSuccess /> }, // Con Order
            { path: "order-confirmation", element: <OrderConfirmation /> }, // Contra Entrega
            { path: "cancel-order", element: <CancelPayment /> },
            { path: "paypal-test", element: <PayPalTest /> },

            // Tracking Público (NO requiere login)
            { path: "track", element: <TrackOrder /> }, // Sin orderNumber
            { path: "track/:orderNumber", element: <TrackOrder /> }, // Con orderNumber en URL

            // Demostración
            { path: "demo-auth", element: <AuthModalDemo /> }, // Demo del sistema de autenticación

            // Academic Module (FIS Connect)
            { path: "academic/profile/:userId", element: <AcademicProfilePage /> }, // Public profile
            { path: "academic/dashboard", element: <ProtectedRoute><FacultyDashboard /></ProtectedRoute> }, // Faculty only
            { path: '/jobs/my-applications', element: <ProtectedRoute><MyApplications /></ProtectedRoute> },
    
    // Suscripciones (discreta - solo organizaciones)
    { path: '/subscriptions/upgrade', element: <ProtectedRoute allowedRoles={["ORGANIZATION"]}><UpgradeToPro /></ProtectedRoute> },
            
            // Candidatos Guardados (solo organizaciones)
            { path: '/saved-candidates', element: <ProtectedRoute allowedRoles={["ORGANIZATION", "ADMIN", "OWNER"]}><SavedCandidates /></ProtectedRoute> },
            
            // Dashboard de Empleabilidad (solo Faculty/Admin)
            { path: '/employability-dashboard', element: <ProtectedRoute allowedRoles={["FACULTY", "DOCENTE", "ADMIN", "OWNER"]}><EmployabilityDashboard /></ProtectedRoute> },
            
            // Evaluaciones Post-Práctica
            { path: '/evaluaciones', element: <ProtectedRoute><MyEvaluations /></ProtectedRoute> },
            
            // Panel de Control Admin - Gestión de Vacantes
            { path: '/admin/control-panel', element: <ProtectedRoute allowedRoles={["FACULTY", "DOCENTE", "ADMIN", "OWNER"]}><AdminControlPanel /></ProtectedRoute> },
            
            // Dashboard de Matchmaking (Marketplace)
            { path: '/dashboard/matchmaking', element: <ProtectedRoute allowedRoles={["DOCENTE", "FACULTY", "ADMIN", "OWNER"]}><MatchmakingDashboard /></ProtectedRoute> },
            
            // Dashboards Adaptativos de Jerarquía Académica
            ...dashboardRoutes,
            
            { path: "academic/edit-profile", element: <ProtectedRoute><EditProfile /></ProtectedRoute> }, // Edit profile

            // Vinculación Laboral (Jobs Module) - Acceso Público (Progressive Engagement)
            { path: "jobs", element: <JobBoard /> }, // Público - ActionGate protege acciones críticas
            { path: "jobs/create", element: <ProtectedRoute allowedRoles={["ORGANIZATION", "ADMIN", "OWNER"]}><CreateJobOffer /></ProtectedRoute> },
            { path: "jobs/my-offers", element: <ProtectedRoute allowedRoles={["ORGANIZATION", "ADMIN", "OWNER"]}><MyOffers /></ProtectedRoute> },
            { path: "jobs/my-applications", element: <ProtectedRoute allowedRoles={["STUDENT", "USER", "ADMIN", "OWNER"]}><MyApplications /></ProtectedRoute> },
            { path: "jobs/approval", element: <ProtectedRoute allowedRoles={["FACULTY", "DOCENTE", "ADMIN", "OWNER"]}><JobApprovalPanel /></ProtectedRoute> },
            { path: "jobs/:id/edit", element: <ProtectedRoute allowedRoles={["ORGANIZATION", "ADMIN", "OWNER"]}><EditJobOffer /></ProtectedRoute> },
            { path: "jobs/:id/applicants", element: <ProtectedRoute allowedRoles={["ORGANIZATION", "ADMIN", "OWNER", "FACULTY", "DOCENTE"]}><JobApplicants /></ProtectedRoute> },
            { path: "jobs/:id", element: <JobDetail /> },

            // Administración
            {
                path: "admin-panel",
                element: <AdminPanel />,
                children: [
                    { path: "productos", element: <ProductosAdmin /> },
                    { path: "vendedores", element: <VendedoresAdmin /> },
                    { path: "ordenes", element: <OrdenesAdmin /> },
                    { path: "ventas", element: <VentasPanel /> },
                    { path: "financiero", element: <FinancieroPanel /> },
                    { path: "chat", element: <ChatAdmin /> },
                    { path: "all-users", element: <AllUsers /> },
                    { path: "manual-data", element: <AdminManualData /> },
                    { path: "test-auth", element: <TestAuth /> },
                ]
            },

            // Error 404
            { path: "*", element: <NotFound /> }
        ]
    }
]);

export default router;