import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaGraduationCap, FaChalkboardTeacher, FaStar } from 'react-icons/fa';
import { getCategories } from '../../helpers/categoryApi';
import { getFeaturedCourses } from '../../helpers/courseApi';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar categorías y cursos destacados
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Obtener categorías usando el helper
        const categoriesData = await getCategories();
        setCategories(categoriesData || []);
        
        // Obtener cursos destacados usando el helper
        const featuredCoursesData = await getFeaturedCourses(6); // Limitar a 6 cursos destacados
        setFeaturedCourses(featuredCoursesData || []);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('No se pudieron cargar los datos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filtrar categorías según el término de búsqueda
  const filteredCategories = categories.filter(category => 
    category.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Renderizar un curso destacado
  const renderFeaturedCourse = (course) => {
    return (
      <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          {course.imageUrl ? (
            <img 
              src={course.imageUrl} 
              alt={course.title} 
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <FaChalkboardTeacher className="text-gray-400 text-5xl" />
            </div>
          )}
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            Destacado
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{course.title}</h3>
          
          <div className="flex items-center mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FaStar 
                  key={i} 
                  className={i < Math.round(course.rating?.average || 0) ? "text-yellow-400" : "text-gray-300"} 
                />
              ))}
            </div>
            <span className="ml-1 text-sm text-gray-600">
              ({course.rating?.average?.toFixed(1) || 'N/A'})
            </span>
          </div>
          
          <div className="flex items-center mb-2">
            <FaChalkboardTeacher className="text-gray-500 mr-1" />
            <span className="text-sm text-gray-600">
              {course.teacher?.name || 'Profesor no asignado'}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Categoría:</span> {course.category?.label || 'Sin categoría'}
          </p>
          
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {course.description?.substring(0, 100)}{course.description?.length > 100 ? '...' : ''}
          </p>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-bold text-blue-600">
              ${course.price?.toLocaleString() || '0'} {course.currency || 'COP'}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {course.level === 'PRINCIPIANTE' ? 'Principiante' : 
               course.level === 'INTERMEDIO' ? 'Intermedio' : 
               course.level === 'AVANZADO' ? 'Avanzado' : 'Todos los niveles'}
            </span>
          </div>
          
          <Link 
            to={`/courses/${course._id}`} 
            className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-colors"
          >
            Ver Curso
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Categorías de Cursos</h1>
      
      {/* Buscador */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Buscar categorías..."
            className="w-full px-4 py-2 pl-10 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <Link 
                key={category._id} 
                to={`/courses/category/${category._id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="p-6 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <FaGraduationCap className="text-blue-600 text-3xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{category.label}</h3>
                  <p className="text-sm text-gray-600">
                    Explora todos los cursos en esta categoría
                  </p>
                  <div className="mt-4 w-full">
                    <span className="inline-block w-full py-2 px-4 bg-blue-50 text-blue-700 font-medium rounded group-hover:bg-blue-100 transition-colors">
                      Ver Cursos
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-600">No se encontraron categorías que coincidan con tu búsqueda.</p>
            </div>
          )}
        </div>
      )}
      
      {/* Cursos Destacados */}
      {featuredCourses.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Cursos Destacados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map(renderFeaturedCourse)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
