import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Context } from '../context';
import axiosInstance from '../utils/axiosInstance';
import { openChatWith } from '../components/chat/GlobalChatManager';
import {
  FaUserPlus, FaCheck, FaTimes, FaSearch, FaUserFriends,
  FaClock, FaCommentDots, FaHome, FaUsers, FaUserCheck,
} from 'react-icons/fa';

const SECTIONS = [
  { id: 'suggestions', label: 'Inicio', icon: FaHome },
  { id: 'requests',    label: 'Solicitudes',  icon: FaClock },
  { id: 'friends',     label: 'Todos los amigos', icon: FaUserFriends },
];

/* ── Avatar helper ── */
const Avatar = ({ src, name, size = 'lg' }) => {
  const dim = size === 'lg' ? 'w-full h-full' : 'w-9 h-9';
  return src
    ? <img src={src} alt={name} className={`${dim} object-cover`} />
    : <div className={`${dim} bg-gradient-to-br from-blue-500 to-blue-600
        flex items-center justify-center text-white font-semibold
        ${size === 'lg' ? 'text-3xl' : 'text-sm'}`}>
        {name?.charAt(0)}
      </div>;
};

/* ── Person card (sugerencias / búsqueda) ── */
const PersonCard = ({ person, onRequest, requestSent }) => (
  <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow border border-gray-100">
    <div className="h-36 bg-gradient-to-br from-blue-100 to-indigo-100 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow">
          <Avatar src={person.profilePic} name={person.name} size="lg" />
        </div>
      </div>
    </div>
    <div className="p-4 text-center">
      <p className="font-semibold text-gray-900 truncate">{person.name}</p>
      <p className="text-xs text-gray-500 capitalize mb-1">{person.role?.toLowerCase()}</p>
      {person.faculty && (
        <p className="text-xs text-blue-600 mb-3 truncate">{person.faculty}</p>
      )}
      {requestSent ? (
        <button disabled className="w-full py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
          <FaClock className="inline mr-1 text-xs" /> Solicitud enviada
        </button>
      ) : (
        <button
          onClick={() => onRequest(person._id)}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <FaUserPlus className="inline mr-1.5 text-xs" /> Agregar amigo
        </button>
      )}
    </div>
  </div>
);

/* ── Friend card (lista de amigos) ── */
const FriendCard = ({ friend, onRemove, onChat }) => (
  <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow border border-gray-100">
    <div className="h-28 bg-gradient-to-br from-green-50 to-teal-100 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow">
          <Avatar src={friend.profilePic} name={friend.name} size="lg" />
        </div>
      </div>
    </div>
    <div className="p-4 text-center">
      <p className="font-semibold text-gray-900 truncate">{friend.name}</p>
      <p className="text-xs text-gray-500 capitalize mb-3">{friend.role?.toLowerCase()}</p>
      <div className="flex gap-2">
        <button
          onClick={() => onChat(friend)}
          className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <FaCommentDots className="inline mr-1 text-xs" /> Mensaje
        </button>
        <button
          onClick={() => onRemove(friend.friendshipId)}
          className="flex-1 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <FaTimes className="inline mr-1 text-xs" /> Eliminar
        </button>
      </div>
    </div>
  </div>
);

const Friends = () => {
  const { user } = useContext(Context);
  const [section, setSection] = useState('suggestions');
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [sentRequests, setSentRequests] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    Promise.all([
      axiosInstance.get('/friends/list'),
      axiosInstance.get('/friends/requests/pending'),
      axiosInstance.get('/friends/suggestions'),
    ]).then(([fr, req, sug]) => {
      if (fr.data.success)  setFriends(fr.data.data);
      if (req.data.success) setPendingRequests(req.data.data);
      if (sug.data.success) setSuggestions(sug.data.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  /* Live search as user types */
  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const r = await axiosInstance.get(`/friends/search?q=${encodeURIComponent(searchQuery)}`);
        if (r.data.success) setSearchResults(r.data.data);
      } catch {} finally { setSearchLoading(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const sendRequest = async (targetId) => {
    try {
      await axiosInstance.post(`/friends/request/${targetId}`);
      setSentRequests(prev => new Set([...prev, targetId]));
    } catch (e) { console.error(e); }
  };

  const acceptRequest = async (friendshipId) => {
    await axiosInstance.put(`/friends/requests/${friendshipId}/accept`);
    setPendingRequests(prev => prev.filter(r => r._id !== friendshipId));
    const r = await axiosInstance.get('/friends/list');
    if (r.data.success) setFriends(r.data.data);
  };

  const rejectRequest = async (friendshipId) => {
    await axiosInstance.put(`/friends/requests/${friendshipId}/reject`);
    setPendingRequests(prev => prev.filter(r => r._id !== friendshipId));
  };

  const removeFriend = async (friendshipId) => {
    if (!window.confirm('¿Eliminar este amigo?')) return;
    await axiosInstance.delete(`/friends/${friendshipId}`);
    setFriends(prev => prev.filter(f => f.friendshipId !== friendshipId));
  };

  /* Display list: search overrides suggestions */
  const displayCards = searchQuery.trim().length >= 2 ? searchResults : suggestions;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex max-w-[1200px] mx-auto">

        {/* ── Left sidebar ── */}
        <div className="w-[360px] shrink-0 fixed top-16 left-0 h-[calc(100vh-4rem)] overflow-y-auto p-4 bg-white border-r border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Amigos</h1>

          {/* Search bar */}
          <div className="relative mb-4">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); if (e.target.value.trim()) setSection('suggestions'); }}
              placeholder="Buscar personas"
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {searchLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          {/* Nav sections */}
          <nav className="space-y-1">
            {SECTIONS.map(s => {
              const Icon = s.icon;
              return (
                <button key={s.id} onClick={() => { setSection(s.id); setSearchQuery(''); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                    section === s.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}>
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    section === s.id ? 'bg-blue-100' : 'bg-gray-200'
                  }`}>
                    <Icon className="text-base" />
                  </span>
                  <span className="flex-1 text-left">{s.label}</span>
                  {s.id === 'requests' && pendingRequests.length > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full px-1.5 min-w-[20px] text-center">
                      {pendingRequests.length}
                    </span>
                  )}
                  {s.id === 'friends' && (
                    <span className="text-xs text-gray-400">{friends.length}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── Main content ── */}
        <div className="ml-[360px] flex-1 p-6">

          {/* ── SUGERENCIAS / BÚSQUEDA ── */}
          {section === 'suggestions' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {searchQuery.trim().length >= 2 ? `Resultados para "${searchQuery}"` : 'Personas que quizás conozcas'}
              </h2>
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl h-56 animate-pulse border border-gray-100" />
                  ))}
                </div>
              ) : displayCards.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <FaUsers className="text-5xl mx-auto mb-3 text-gray-300" />
                  <p>{searchQuery.trim().length >= 2 ? 'Sin resultados' : 'No hay sugerencias disponibles'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayCards.map(p => (
                    <PersonCard
                      key={p._id}
                      person={p}
                      onRequest={sendRequest}
                      requestSent={sentRequests.has(p._id) || p.friendshipStatus === 'pending'}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SOLICITUDES ── */}
          {section === 'requests' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Solicitudes de amistad
                {pendingRequests.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-sm font-bold rounded-full px-2">
                    {pendingRequests.length}
                  </span>
                )}
              </h2>
              {pendingRequests.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
                  <FaClock className="text-5xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No tienes solicitudes pendientes</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {pendingRequests.map(req => (
                    <div key={req._id} className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                      <div className="h-20 bg-gradient-to-br from-blue-50 to-indigo-100 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow">
                            <Avatar src={req.requester?.profilePic} name={req.requester?.name} size="lg" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 text-center">
                        <p className="font-semibold text-gray-900">{req.requester?.name}</p>
                        <p className="text-xs text-gray-500 capitalize mb-3">{req.requester?.role?.toLowerCase()}</p>
                        <div className="flex gap-2">
                          <button onClick={() => acceptRequest(req._id)}
                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">
                            <FaCheck className="inline mr-1 text-xs" /> Confirmar
                          </button>
                          <button onClick={() => rejectRequest(req._id)}
                            className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TODOS LOS AMIGOS ── */}
          {section === 'friends' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Todos los amigos
                <span className="ml-2 text-base font-normal text-gray-500">({friends.length})</span>
              </h2>
              {friends.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
                  <FaUserFriends className="text-5xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Aún no tienes amigos agregados</p>
                  <button onClick={() => setSection('suggestions')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
                    Buscar personas
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {friends.map(f => (
                    <FriendCard
                      key={f._id}
                      friend={f}
                      onRemove={removeFriend}
                      onChat={openChatWith}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Friends;
