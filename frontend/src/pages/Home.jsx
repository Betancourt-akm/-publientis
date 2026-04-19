import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaUsers, FaRocket, FaStar, FaCheckCircle, FaLightbulb, FaBookOpen, FaTrophy } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';
import { Context } from '../context';
import SEO from '../components/SEO';

export default function Home() {
  const { user } = useContext(Context);
  

  const stats = [
    { number: '10K+', label: 'Estudiantes' },
    { number: '500+', label: 'Publicaciones' },
    { number: '50+', label: 'Facultades' },
    { number: '200+', label: 'Proyectos' }
  ];

  const features = [
    {
      icon: FaGraduationCap,
      title: 'Perfil Académico',
      description: 'Crea tu portafolio profesional y muestra tus logros académicos'
    },
    {
      icon: FaRocket,
      title: 'Comparte Proyectos',
      description: 'Publica tus investigaciones, proyectos y certificaciones'
    },
    {
      icon: FaUsers,
      title: 'Conecta con Profesionales',
      description: 'Networking con estudiantes, facultad y empleadores'
    },
    {
      icon: FaTrophy,
      title: 'Destaca tus Logros',
      description: 'Recibe reconocimiento por tus contribuciones académicas'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Inicio"
        description="Publientis conecta practicantes y egresados de cualquier carrera universitaria con empresas e instituciones. Crea tu perfil profesional y encuentra oportunidades de práctica o empleo."
        keywords="prácticas profesionales universitarias Colombia, vinculación laboral egresados, bolsa de empleo universitarios, red social académica, portafolio profesional universitario"
        url="https://publientis.online/about"
      />
      {/* Hero Section - Red Social Académica */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <FaGraduationCap className="text-xl" />
              <span className="font-semibold">Publientis</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Construye tu{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                Futuro Académico
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              La plataforma donde estudiantes, facultad y empresas se conectan. 
              Comparte tus logros, descubre oportunidades y construye tu red profesional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user?._id ? (
                <>
                  <Link
                    to="/sign-up"
                    className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg inline-flex items-center justify-center text-lg"
                  >
                    Únete Ahora
                    <FiArrowRight className="ml-2" />
                  </Link>
                  <Link
                    to="/academic/feed"
                    className="border-2 border-white hover:bg-white hover:text-blue-600 text-white px-8 py-4 rounded-lg font-semibold transition-all inline-flex items-center justify-center text-lg"
                  >
                    Explorar Feed
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/academic/feed"
                    className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg inline-flex items-center justify-center text-lg"
                  >
                    Ver Feed Académico
                    <FiArrowRight className="ml-2" />
                  </Link>
                  <Link
                    to="/academic/create-publication"
                    className="border-2 border-white hover:bg-white hover:text-blue-600 text-white px-8 py-4 rounded-lg font-semibold transition-all inline-flex items-center justify-center text-lg"
                  >
                    Crear Publicación
                  </Link>
                </>
              )}
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-blue-200 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Características Principales */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Por qué Publientis?</h2>
            <p className="text-xl text-gray-600">Todo lo que necesitas para destacar en tu carrera académica</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center group hover:transform hover:-translate-y-2 transition-all">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-blue-600 group-hover:to-indigo-600 transition-all">
                    <Icon className="text-4xl text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Cómo Funciona</h2>
            <p className="text-xl text-gray-600">Tres pasos simples para comenzar</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center relative">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Crea tu Perfil</h3>
              <p className="text-gray-600 leading-relaxed">
                Regístrate y completa tu perfil académico con tus logros, habilidades y proyectos
              </p>
              {/* Línea conectora */}
              <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-600 to-blue-300"></div>
            </div>
            
            <div className="text-center relative">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Comparte Contenido</h3>
              <p className="text-gray-600 leading-relaxed">
                Publica tus investigaciones, proyectos y certificaciones para que otros las vean
              </p>
              <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-600 to-blue-300"></div>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Conecta y Crece</h3>
              <p className="text-gray-600 leading-relaxed">
                Interactúa con la comunidad, recibe feedback y encuentra oportunidades laborales
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Para Quién es */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Diseñado Para Ti</h2>
            <p className="text-xl text-gray-600">Sin importar tu rol en la comunidad académica</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
                <FaGraduationCap className="text-3xl" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Estudiantes</h3>
              <p className="text-blue-100 mb-6 leading-relaxed">
                Construye tu portafolio académico, comparte tus proyectos y conecta con profesionales de tu área.
              </p>
              <Link to="/sign-up" className="inline-flex items-center text-white font-semibold hover:text-blue-200 transition-colors">
                Comenzar ahora <FiArrowRight className="ml-2" />
              </Link>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
                <FaBookOpen className="text-3xl" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Facultad</h3>
              <p className="text-indigo-100 mb-6 leading-relaxed">
                Gestiona y modera publicaciones, identifica talento y mantente conectado con tus estudiantes.
              </p>
              <Link to="/sign-up" className="inline-flex items-center text-white font-semibold hover:text-indigo-200 transition-colors">
                Unirse como facultad <FiArrowRight className="ml-2" />
              </Link>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-teal-700 rounded-2xl p-8 text-white hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
                <FaUsers className="text-3xl" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Empresas</h3>
              <p className="text-green-100 mb-6 leading-relaxed">
                Descubre talento universitario, revisa portafolios y conecta con futuros profesionales.
              </p>
              <Link to="/academic/feed" className="inline-flex items-center text-white font-semibold hover:text-green-200 transition-colors">
                Explorar talento <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FaLightbulb className="text-6xl mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Tu Carrera Académica Empieza Aquí
          </h2>
          <p className="text-xl mb-8 opacity-90 leading-relaxed">
            Únete a miles de estudiantes que ya están construyendo su futuro profesional en Publientis
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/sign-up" 
              className="bg-white text-blue-600 px-10 py-4 rounded-lg font-bold hover:bg-blue-50 transition-all shadow-xl inline-flex items-center justify-center text-lg transform hover:scale-105"
            >
              Comenzar Gratis
              <FiArrowRight className="ml-2" />
            </Link>
            <Link 
              to="/academic/feed" 
              className="border-2 border-white text-white px-10 py-4 rounded-lg font-bold hover:bg-white hover:text-blue-600 transition-all inline-flex items-center justify-center text-lg"
            >
              <FaGraduationCap className="mr-2" />
              Ver Publicaciones
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
