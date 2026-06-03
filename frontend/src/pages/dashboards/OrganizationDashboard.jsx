import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Context } from '../../context';
import jobService from '../../modules/jobs/services/jobService';
import SEO from '../../components/SEO';
import {
  FaBriefcase, FaPlus, FaUsers, FaBookmark, FaCheckCircle,
  FaClock, FaPause, FaBan, FaEdit, FaEye, FaArrowRight, FaBuilding
} from 'react-icons/fa';

const STATUS_CONFIG = {
  borrador:             { label: 'Borrador',   color: 'bg-gray-100 text-gray-600' },
  pendiente_aprobacion: { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700' },
  activa:               { label: 'Activa',     color: 'bg-green-100 text-green-700' },
  pausada:              { label: 'Pausada',    color: 'bg-orange-100 text-orange-700' },
  cerrada:              { label: 'Cerrada',    color: 'bg-gray-100 text-gray-500' },
  rechazada:            { label: 'Rechazada', color: 'bg-red-100 text-red-700' },
};

const OrganizationDashboard = () => {
  const { user } = useContext(Context);
  const navigate = useNavigate();

  const [offers, setOffers]     = useState([]);
  const [stats, setStats]       = useState({ active: 0, pending: 0, total: 0 });
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (user && user.role !== 'ORGANIZATION') {
      navigate('/', { replace: true });
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const result = await jobService.getMyOffers({ page: 1, limit: 5 });
      if (result.success) {
        const all = result.offers || result.data || [];
        setOffers(all.slice(0, 5));
        setStats({
          active:  all.filter(o => o.status === 'activa').length,
          pending: all.filter(o => o.status === 'pendiente_aprobacion').length,
          total:   result.pagination?.total || all.length,
        });
      }
    } catch (err) {
      console.error('Error cargando ofertas:', err);
    } finally {
      setLoading(false);
    }
  };

  const companyName = user?.name || 'Tu empresa';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <SEO title="Dashboard Empresa" description="Panel de gestión de ofertas laborales" />

      <div className="max-w-5xl mx-auto">

        {/* Welcome header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <FaBuilding className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{companyName}</h1>
              <p className="text-sm text-gray-500">Panel de organización</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            <p className="text-sm text-gray-500 mt-1">Ofertas activas</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
            <p className="text-sm text-gray-500 mt-1">En revisión</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-gray-500 mt-1">Total publicadas</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link
            to="/jobs/create"
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-4 shadow transition-colors"
          >
            <FaPlus className="text-xl shrink-0" />
            <div>
              <p className="font-semibold">Publicar oferta</p>
              <p className="text-xs text-blue-100">Nueva convocatoria</p>
            </div>
          </Link>

          <Link
            to="/jobs/my-offers"
            className="flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl px-5 py-4 shadow-sm border border-gray-200 transition-colors"
          >
            <FaBriefcase className="text-xl text-blue-600 shrink-0" />
            <div>
              <p className="font-semibold">Mis ofertas</p>
              <p className="text-xs text-gray-400">Gestionar publicaciones</p>
            </div>
          </Link>

          <Link
            to="/talento"
            className="flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl px-5 py-4 shadow-sm border border-gray-200 transition-colors"
          >
            <FaUsers className="text-xl text-indigo-600 shrink-0" />
            <div>
              <p className="font-semibold">Explorar talento</p>
              <p className="text-xs text-gray-400">Perfiles de candidatos</p>
            </div>
          </Link>
        </div>

        {/* Recent offers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Ofertas recientes</h2>
            <Link to="/jobs/my-offers" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              Ver todas <FaArrowRight className="text-xs" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FaBriefcase className="text-4xl text-gray-200 mx-auto mb-3" />
              <p className="font-medium">Aún no has publicado ninguna oferta</p>
              <Link to="/jobs/create" className="mt-3 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                <FaPlus /> Publicar primera oferta
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {offers.map(offer => {
                const cfg = STATUS_CONFIG[offer.status] || STATUS_CONFIG.borrador;
                return (
                  <li key={offer._id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{offer.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {offer.modality || ''}{offer.modality && offer.location ? ' · ' : ''}{offer.location || ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <Link to={`/jobs/${offer._id}/applicants`} className="text-gray-400 hover:text-blue-600 transition-colors" title="Ver postulantes">
                        <FaUsers />
                      </Link>
                      <Link to={`/jobs/${offer._id}/edit`} className="text-gray-400 hover:text-blue-600 transition-colors" title="Editar">
                        <FaEdit />
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
};

export default OrganizationDashboard;
