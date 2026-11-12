import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Context } from '../context';
import axiosInstance from '../utils/axiosInstance';
import { openChatWith } from '../components/chat/GlobalChatManager';
import {
  FaUserPlus, FaCheck, FaTimes, FaSearch, FaUserFriends,
  FaClock, FaCommentDots, FaHome, FaUsers, FaUserCheck,
  FaEye, FaEyeSlash
} from 'react-icons/fa';

const SECTIONS = [
  { id: 'suggestions', label: 'Potenciales', icon: FaHome },
  { id: 'requests',    label: 'Solicitudes',  icon: FaClock },
  { id: 'friends',     label: 'Todos los amigos', icon: FaUserFriends },
  { id: 'following',   label: 'Siguiendo', icon: FaEye },
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
const PersonCard = ({ person, onRequest, onFollow, onUnfollow, requestSent }) => (
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
        <button disabled className="w-full py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium mb-2">
          <FaClock className="inline mr-1 text-xs" /> Solicitud enviada
        </button>
      ) : person.friendshipStatus === 'accepted' ? (
        <button disabled className="w-full py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium mb-2">
          <FaUserCheck className="inline mr-1 text-xs" /> Ya son amigos
        </button>
      ) : (
        <button
          onClick={() => onRequest(person._id)}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors mb-2"
        >
          <FaUserPlus className="inline mr-1.5 text-xs" /> Agregar amigo
        </button>
      )}
      {person.isFollowing ? (
        <button
          onClick={() => onUnfollow(person._id)}
          className="w-full py-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <FaEyeSlash className="inline mr-1.5 text-xs" /> Dejar de seguir
        </button>
      ) : (
        <button
          onClick={() => onFollow(person._id)}
          className="w-full py-2 bg-white hover:bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-sm font-semibold transition-colors"
        >
          <FaEye className="inline mr-1.5 text-xs" /> Seguir
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

const FollowingCard = ({ person, onUnfollow, onRequest }) => (
  <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow border border-gray-100">
    <div className="p-4 flex items-center gap-3">
      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
        <Avatar src={person.profilePic} name={person.name} size="sm" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{person.name}</p>
        <p className="text-xs text-gray-500 capitalize">{person.role?.toLowerCase()}</p>
      </div>
    </div>
    <div className="px-4 pb-4 flex gap-2">
      <button
        onClick={() => onRequest(person._id)}
        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
      >
        <FaUserPlus className="inline mr-1 text-xs" /> Amigo
      </button>
      <button
        onClick={() => onUnfollow(person._id)}
        className="flex-1 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 rounded-lg text-sm font-medium transition-colors"
      >
        <FaEyeSlash className="inline mr-1 text-xs" /> Dejar
      </button>
    </div>
  </div>
);

const Friends = () => {
  const { user } = useContext(Context);
  const [section, setSection] = useState('suggestions');
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [following, setFollowing] = useState([]);
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
      axiosInstance.get('/friends/following'),
    ]).then(([fr, req, sug, fol]) => {
      if (fr.data.success)  setFriends(fr.data.data);
      if (req.data.success) setPendingRequests(req.data.data);
      if (sug.data.success) setSuggestions(sug.data.data);
      if (fol.data.success) setFollowing(fol.data.data);
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

  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const sendRequest = async (targetId) => {
    try {
      const r = await axiosInstance.post(`/friends/request/${targetId}`);
      setSentRequests(prev => new Set([...prev, targetId]));
      showToast(r.data.message || 'Solicitud enviada');
    } catch (e) {
      const msg = e.response?.data?.message || 'Error al enviar solicitud';
      showToast(msg, 'error');
    }
  };

  const followUser = async (targetId) => {
    try {
      const r = await axiosInstance.post(`/friends/follow/${targetId}`);
      setSuggestions(prev => prev.map(p => p._id === targetId ? { ...p, isFollowing: true } : p));
      setSearchResults(prev => prev.map(p => p._id === targetId ? { ...p, isFollowing: true } : p));
      const fol = await axiosInstance.get('/friends/following');
      if (fol.data.success) setFollowing(fol.data.data);
      showToast(r.data.message || 'Ahora sigues a este usuario');
    } catch (e) {
      showToast(e.response?.data?.message || 'Error al seguir usuario', 'error');
    }
  };

  const unfollowUser = async (targetId) => {
    try {
      const r = await axiosInstance.delete(`/friends/follow/${targetId}`);
      setFollowing(prev => prev.filter(p => p._id !== targetId));
      setSuggestions(prev => prev.map(p => p._id === targetId ? { ...p, isFollowing: false } : p));
      setSearchResults(prev => prev.map(p => p._id === targetId ? { ...p, isFollowing: false } : p));
      showToast(r.data.message || 'Dejaste de seguir a este usuario');
    } catch (e) {
      showToast(e.response?.data?.message || 'Error al dejar de seguir', 'error');
    }
  };

  const acceptRequest = async (friendshipId) => {
    try {
      await axiosInstance.put(`/friends/requests/${friendshipId}/accept`);
      setPendingRequests(prev => prev.filter(r => r._id !== friendshipId));
      const r = await axiosInstance.get('/friends/list');
      if (r.data.success) setFriends(r.data.data);
      showToast('Solicitud aceptada');
    } catch (e) {
      showToast(e.response?.data?.message || 'Error al aceptar solicitud', 'error');
    }
  };

  const rejectRequest = async (friendshipId) => {
    try {
      await axiosInstance.put(`/friends/requests/${friendshipId}/reject`);
      setPendingRequests(prev => prev.filter(r => r._id !== friendshipId));
      showToast('Solicitud rechazada');
    } catch (e) {
      showToast(e.response?.data?.message || 'Error al rechazar solicitud', 'error');
    }
  };

  const removeFriend = async (friendshipId) => {
    if (!window.confirm('¿Eliminar este amigo?')) return;
    try {
      await axiosInstance.delete(`/friends/${friendshipId}`);
      setFriends(prev => prev.filter(f => f.friendshipId !== friendshipId));
      showToast('Amigo eliminado');
    } catch (e) {
      showToast(e.response?.data?.message || 'Error al eliminar amigo', 'error');
    }
  };

  /* Real-time: refresh requests when someone sends you one */
  useEffect(() => {
    const refresh = () => {
      axiosInstance.get('/friends/requests/pending')
        .then(r => { if (r.data.success) setPendingRequests(r.data.data); })
        .catch(() => {});
    };
    window.addEventListener('publientis:friend-request', refresh);
    window.addEventListener('publientis:friend-accepted', () => {
      axiosInstance.get('/friends/list').then(r => { if (r.data.success) setFriends(r.data.data); }).catch(() => {});
    });
    return () => {
      window.removeEventListener('publientis:friend-request', refresh);
    };
  }, []);

  /* Display list: search overrides suggestions */
  const displayCards = searchQuery.trim().length >= 2 ? searchResults : suggestions;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="flex max-w-[1200px] mx-auto">

        {/* ── Left sidebar (desktop) ── */}
        <div className="hidden lg:block w-[360px] shrink-0 fixed top-16 left-0 h-[calc(100vh-4rem)] overflow-y-auto p-4 bg-white border-r border-gray-200">
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
                  {s.id === 'following' && (
                    <span className="text-xs text-gray-400">{following.length}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── Mobile header: search + tabs ── */}
        <div className="lg:hidden w-full bg-white border-b border-gray-200 sticky top-16 z-20">
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
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
          </div>
          <div className="flex">
            {SECTIONS.map(s => {
              const Icon = s.icon;
              return (
                <button key={s.id} onClick={() => { setSection(s.id); setSearchQuery(''); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-colors ${
                    section === s.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  <Icon className="text-sm" />
                  <span>{s.label}</span>
                  {s.id === 'requests' && pendingRequests.length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1 min-w-[16px] text-center">
                      {pendingRequests.length}
                    </span>
                  )}
                  {s.id === 'following' && following.length > 0 && (
                    <span className="text-gray-400 text-[10px] font-bold">
                      {following.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="lg:ml-[360px] flex-1 p-4 lg:p-6">

          {/* ── SUGERENCIAS / BÚSQUEDA ── */}
          {section === 'suggestions' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {searchQuery.trim().length >= 2 ? `Resultados para "${searchQuery}"` : 'Personas que quizás conozcas'}
              </h2>
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
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
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                  {displayCards.map(p => (
                    <PersonCard
                      key={p._id}
                      person={p}
                      onRequest={sendRequest}
                      onFollow={followUser}
                      onUnfollow={unfollowUser}
                      requestSent={sentRequests.has(p._id) || p.friendshipStatus === 'pending' || p.friendshipStatus === 'accepted'}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
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
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
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

          {/* ── SIGUIENDO ── */}
          {section === 'following' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Personas que sigues
                <span className="ml-2 text-base font-normal text-gray-500">({following.length})</span>
              </h2>
              {following.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
                  <FaEye className="text-5xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Aún no sigues a nadie</p>
                  <button onClick={() => setSection('suggestions')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
                    Ver potenciales amigos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
                  {following.map(p => (
                    <FollowingCard
                      key={p._id}
                      person={p}
                      onRequest={sendRequest}
                      onUnfollow={unfollowUser}
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
