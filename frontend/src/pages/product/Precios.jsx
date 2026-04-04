import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { Context } from '../../context';

const Precios = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(Context);
  const { user } = state;
  // eslint-disable-next-line no-unused-vars
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' o 'yearly'

  // Planes disponibles
  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Para estudiantes que buscan aprender',
      price: {
        monthly: 0,
        yearly: 0
      },
      features: [
        { text: 'Acceso a 5 exámenes básicos', included: true },
        { text: 'Perfil básico de estudiante', included: true },
        { text: 'Contacto con 2 profesores al mes', included: true },
        { text: 'Acceso a foros comunitarios', included: true },
        { text: 'Soporte por email', included: true },
        { text: 'Acceso a clases premium', included: false },
        { text: 'Certificados de finalización', included: false },
        { text: 'Tutorías personalizadas', included: false }
      ],
      popular: false,
      color: 'bg-gray-100'
    },
    {
      id: 'profesional',
      name: 'Profesional',
      description: 'Para estudiantes comprometidos',
      price: {
        monthly: 29900,
        yearly: 299900
      },
      features: [
        { text: 'Acceso a todos los exámenes', included: true },
        { text: 'Perfil destacado de estudiante', included: true },
        { text: 'Contacto ilimitado con profesores', included: true },
        { text: 'Acceso a foros comunitarios', included: true },
        { text: 'Soporte prioritario', included: true },
        { text: 'Acceso a clases premium', included: true },
        { text: 'Certificados de finalización', included: true },
        { text: 'Tutorías personalizadas', included: false }
      ],
      popular: true,
      color: 'bg-blue-50'
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Para profesionales y educadores',
      price: {
        monthly: 49900,
        yearly: 499900
      },
      features: [
        { text: 'Acceso a todos los exámenes', included: true },
        { text: 'Perfil verificado premium', included: true },
        { text: 'Contacto ilimitado con profesores', included: true },
        { text: 'Acceso a foros comunitarios', included: true },
        { text: 'Soporte VIP 24/7', included: true },
        { text: 'Acceso a clases premium', included: true },
        { text: 'Certificados de finalización', included: true },
        { text: 'Tutorías personalizadas', included: true }
      ],
      popular: false,
      color: 'bg-purple-50'
    }
  ];

  // Función para formatear precio en COP
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Función para agregar plan al carrito
  const addToCart = (plan) => {
    if (!user) {
      toast.info('Debes iniciar sesión para continuar');
      navigate('/login');
      return;
    }

    setSelectedPlan(plan);
    
    // Crear objeto de suscripción para el carrito
    const subscription = {
      id: plan.id,
      name: `Plan ${plan.name}`,
      price: plan.price[billingCycle],
      cycle: billingCycle,
      type: 'subscription',
      quantity: 1
    };

    // Agregar al carrito (usando localStorage como ejemplo simple)
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Eliminar cualquier suscripción previa
    const filteredCart = cart.filter(item => item.type !== 'subscription');
    
    // Agregar la nueva suscripción
    filteredCart.push(subscription);
    localStorage.setItem('cart', JSON.stringify(filteredCart));
    
    // Actualizar estado global si es necesario
    if (dispatch) {
      dispatch({
        type: 'UPDATE_CART',
        payload: filteredCart
      });
    }

    toast.success(`Plan ${plan.name} agregado al carrito`);
    navigate('/subscription-cart');
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Planes y Precios
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Elige el plan perfecto para tu desarrollo profesional en MaestroMatch
          </p>
        </div>

        {/* Selector de ciclo de facturación */}
        <div className="mt-12 flex justify-center">
          <div className="relative bg-white rounded-lg p-1 flex shadow-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700'
              } py-2 px-6 rounded-md text-sm font-medium transition-all duration-200`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700'
              } py-2 px-6 rounded-md text-sm font-medium transition-all duration-200`}
            >
              Anual <span className="text-xs opacity-75">(20% descuento)</span>
            </button>
          </div>
        </div>

        {/* Tarjetas de planes */}
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-1 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`${
                plan.popular ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'
              } ${plan.color} rounded-lg shadow-sm border p-8 relative flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 -mt-3 -mr-3 px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full uppercase tracking-wide shadow-md">
                  Popular
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-2 text-gray-500">{plan.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {formatPrice(plan.price[billingCycle])}
                  </span>
                  <span className="text-base font-medium text-gray-500">
                    {billingCycle === 'monthly' ? '/mes' : '/año'}
                  </span>
                </p>
                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        {feature.included ? (
                          <FaCheck className="h-5 w-5 text-green-500" />
                        ) : (
                          <FaTimes className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <p className="ml-3 text-base text-gray-700">{feature.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <button
                  onClick={() => addToCart(plan)}
                  className={`${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : plan.id === 'free'
                      ? 'bg-gray-800 hover:bg-gray-900 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  } w-full py-3 px-4 rounded-md shadow font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
                >
                  {plan.id === 'free' ? 'Comenzar Gratis' : 'Seleccionar Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ o información adicional */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900">Preguntas frecuentes</h2>
          <p className="mt-4 text-gray-500">
            ¿Tienes dudas sobre nuestros planes? Contáctanos en{' '}
            <a href="mailto:soporte@maestromatch.com" className="text-blue-600 hover:text-blue-500">
              soporte@maestromatch.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Precios;
