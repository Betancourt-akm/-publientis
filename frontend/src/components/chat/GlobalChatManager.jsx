import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { Context } from '../../context';
import axiosInstance from '../../utils/axiosInstance';
import io from 'socket.io-client';
import getBackendUrl from '../../utils/getBackendUrl';
import {
  FaTimes, FaPaperPlane, FaUserFriends, FaChevronDown,
  FaCircle, FaSearch, FaMinus,
} from 'react-icons/fa';

const MAX_WINDOWS = 3;

/* ────────────────────────────────────────────
   ChatWindow – ventana individual de conversación
──────────────────────────────────────────── */
const ChatWindow = ({ chat, currentUser, onClose, onMinimize, onSend, onChange, style }) => {
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  useEffect(() => {
    if (!chat.minimized) inputRef.current?.focus();
  }, [chat.minimized]);

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="flex flex-col bg-white rounded-t-xl shadow-2xl border border-gray-200"
      style={{ width: 312, ...style }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200 rounded-t-xl cursor-pointer select-none"
        onClick={onMinimize}
      >
        <div className="relative shrink-0">
          {chat.friend.profilePic ? (
            <img src={chat.friend.profilePic} alt={chat.friend.name}
              className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600
              flex items-center justify-center text-white text-sm font-semibold">
              {chat.friend.name?.charAt(0)}
            </div>
          )}
          <FaCircle className="absolute -bottom-0.5 -right-0.5 text-green-500 text-[9px] bg-white rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{chat.friend.name}</p>
          {chat.typing && <p className="text-xs text-blue-500">Escribiendo…</p>}
        </div>
        <div className="flex gap-1">
          {chat.unread > 0 && !chat.minimized && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 min-w-[20px] text-center">
              {chat.unread}
            </span>
          )}
          <button onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <FaMinus className="text-xs" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <FaTimes className="text-xs" />
          </button>
        </div>
      </div>

      {/* Messages */}
      {!chat.minimized && (
        <>
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50 space-y-2"
            style={{ height: 320 }}>
            {chat.loading ? (
              <div className="text-center text-gray-400 text-sm mt-16">Cargando…</div>
            ) : chat.messages.length === 0 ? (
              <div className="text-center text-gray-400 text-sm mt-16">
                Inicia la conversación con {chat.friend.name.split(' ')[0]} 👋
              </div>
            ) : (
              chat.messages.map((msg, i) => {
                const mine = msg.senderId?.toString() === currentUser._id?.toString();
                return (
                  <div key={msg._id || i}
                    className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm break-words ${
                      mine
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                    }`}>
                      {msg.content}
                      <div className={`text-[10px] mt-0.5 ${mine ? 'text-blue-200' : 'text-gray-400'}`}>
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); onSend(); }}
            className="flex items-center gap-2 px-3 py-2 border-t border-gray-200 bg-white"
          >
            <input
              ref={inputRef}
              type="text"
              value={chat.newMsg}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Aa"
              className="flex-1 px-3 py-1.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:bg-gray-200 transition-colors"
            />
            <button
              type="submit"
              disabled={!chat.newMsg.trim()}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full disabled:text-gray-300 transition-colors"
            >
              <FaPaperPlane className="text-sm" />
            </button>
          </form>
        </>
      )}

      {/* Minimized unread badge */}
      {chat.minimized && chat.unread > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs
          rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {chat.unread}
        </div>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────
   GlobalChatManager – gestor global montado en App.js
──────────────────────────────────────────── */
const GlobalChatManager = () => {
  const { user } = useContext(Context);
  const [socket, setSocket] = useState(null);
  const [friends, setFriends] = useState([]);
  const [friendSearch, setFriendSearch] = useState('');
  const [showFriends, setShowFriends] = useState(false);
  const [openChats, setOpenChats] = useState([]);
  const typingTimers = useRef({});
  const socketRef = useRef(null);

  /* ── Socket connection ── */
  useEffect(() => {
    if (!user?._id) {
      socketRef.current?.disconnect();
      setSocket(null);
      return;
    }

    const backendUrl = getBackendUrl();
    const sock = io(backendUrl, {
      auth: { userId: user._id, userRole: user.role },
      reconnectionAttempts: 5,
    });

    sock.on('connect', () => console.log('✅ GlobalChat socket conectado'));

    /* Incoming message → route to correct window */
    sock.on('message:new', (message) => {
      const chatId = message.chatId?.toString?.() || message.chatId;
      setOpenChats(prev => prev.map(c => {
        if (c.conversation?._id?.toString() !== chatId) return c;
        const mine = message.senderId?.toString() === user._id?.toString();
        if (mine) return c; // already added optimistically
        return {
          ...c,
          messages: [...c.messages, message],
          unread: c.minimized ? (c.unread || 0) + 1 : 0,
        };
      }));
    });

    /* Typing */
    sock.on('typing:start', ({ chatId }) => {
      setOpenChats(prev => prev.map(c =>
        c.conversation?._id?.toString() === chatId?.toString() ? { ...c, typing: true } : c
      ));
    });
    sock.on('typing:stop', ({ chatId }) => {
      setOpenChats(prev => prev.map(c =>
        c.conversation?._id?.toString() === chatId?.toString() ? { ...c, typing: false } : c
      ));
    });

    /* Someone started a chat with me → join the room */
    sock.on('chat:direct:invitation', ({ chatId }) => {
      sock.emit('join:chat', { chatId });
    });

    socketRef.current = sock;
    setSocket(sock);

    return () => { sock.disconnect(); socketRef.current = null; };
  }, [user?._id]);

  /* ── Load friends ── */
  useEffect(() => {
    if (!user?._id) { setFriends([]); return; }
    axiosInstance.get('/friends/list')
      .then(r => { if (r.data.success) setFriends(r.data.data); })
      .catch(() => {});
  }, [user?._id]);

  /* ── Listen for global openChat events (from profile pages, etc.) ── */
  useEffect(() => {
    const handler = (e) => openChat(e.detail.friend);
    window.addEventListener('publientis:open-chat', handler);
    return () => window.removeEventListener('publientis:open-chat', handler);
  }, [socket]); // eslint-disable-line

  /* ── Open / focus a chat ── */
  const openChat = useCallback((friend) => {
    setShowFriends(false);
    setOpenChats(prev => {
      const existing = prev.find(c => c.friend._id === friend._id);
      if (existing) {
        return prev.map(c => c.friend._id === friend._id
          ? { ...c, minimized: false } : c);
      }
      const entry = {
        friend,
        messages: [],
        conversation: null,
        minimized: false,
        typing: false,
        newMsg: '',
        unread: 0,
        loading: true,
      };
      const next = [entry, ...prev].slice(0, MAX_WINDOWS);
      return next;
    });

    const sock = socketRef.current;
    if (!sock) return;

    sock.emit('chat:direct:start', { otherUserId: friend._id }, (res) => {
      if (res.success) {
        sock.emit('join:chat', { chatId: res.chat._id });
        setOpenChats(prev => prev.map(c => c.friend._id === friend._id
          ? { ...c, conversation: res.chat, messages: res.messages || [], loading: false }
          : c
        ));
      }
    });
  }, []);

  const closeChat = (friendId) =>
    setOpenChats(prev => prev.filter(c => c.friend._id !== friendId));

  const toggleMin = (friendId) =>
    setOpenChats(prev => prev.map(c => c.friend._id === friendId
      ? { ...c, minimized: !c.minimized, unread: 0 } : c));

  const handleChange = (friendId, value) => {
    setOpenChats(prev => prev.map(c => c.friend._id === friendId ? { ...c, newMsg: value } : c));
    const sock = socketRef.current;
    const chat = openChats.find(c => c.friend._id === friendId);
    if (!sock || !chat?.conversation) return;
    sock.emit('typing:start', { chatId: chat.conversation._id });
    clearTimeout(typingTimers.current[friendId]);
    typingTimers.current[friendId] = setTimeout(() => {
      sock.emit('typing:stop', { chatId: chat.conversation._id });
    }, 1500);
  };

  const sendMessage = (friendId) => {
    const chat = openChats.find(c => c.friend._id === friendId);
    if (!chat?.newMsg.trim() || !socketRef.current || !chat.conversation) return;
    const content = chat.newMsg.trim();
    const tempMsg = {
      _id: `tmp_${Date.now()}`,
      chatId: chat.conversation._id,
      senderId: user._id,
      content,
      createdAt: new Date().toISOString(),
    };
    setOpenChats(prev => prev.map(c => c.friend._id === friendId
      ? { ...c, messages: [...c.messages, tempMsg], newMsg: '' } : c));

    socketRef.current.emit('message:send', { chatId: chat.conversation._id, content }, (res) => {
      if (res.success) {
        setOpenChats(prev => prev.map(c => c.friend._id === friendId
          ? { ...c, messages: c.messages.map(m => m._id === tempMsg._id ? res.message : m) }
          : c));
      }
    });
    socketRef.current.emit('typing:stop', { chatId: chat.conversation._id });
  };

  if (!user?._id) return null;

  const filteredFriends = friends.filter(f =>
    f.name?.toLowerCase().includes(friendSearch.toLowerCase())
  );

  const totalUnread = openChats.reduce((acc, c) => acc + (c.unread || 0), 0);

  return (
    <>
      {/* ── Floating friends toggle button ── */}
      <div className="fixed bottom-6 z-40" style={{ right: 88 }}>
        <button
          onClick={() => setShowFriends(v => !v)}
          className="relative w-12 h-12 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center shadow-md transition-colors"
          title="Contactos"
        >
          <FaUserFriends className="text-xl" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold
              rounded-full w-4 h-4 flex items-center justify-center">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </button>

        {/* Friends panel */}
        {showFriends && (
          <div className="absolute bottom-14 right-0 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 pt-3 pb-2">
              <h3 className="font-bold text-gray-900 mb-2">Contactos</h3>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  value={friendSearch}
                  onChange={e => setFriendSearch(e.target.value)}
                  placeholder="Buscar contactos"
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-100 rounded-full text-sm focus:outline-none"
                />
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto pb-2">
              {filteredFriends.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-6">
                  {friends.length === 0 ? 'Aún no tienes amigos agregados' : 'Sin resultados'}
                </p>
              ) : (
                filteredFriends.map(f => (
                  <button
                    key={f._id}
                    onClick={() => openChat(f)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="relative shrink-0">
                      {f.profilePic ? (
                        <img src={f.profilePic} alt={f.name} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600
                          flex items-center justify-center text-white text-sm font-semibold">
                          {f.name?.charAt(0)}
                        </div>
                      )}
                      <FaCircle className="absolute -bottom-0.5 -right-0.5 text-green-500 text-[9px]
                        bg-white rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{f.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{f.role?.toLowerCase()}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Stacked chat windows ── */}
      <div className="fixed bottom-0 z-50 flex gap-2 items-end" style={{ right: 160 }}>
        {[...openChats].reverse().map((chat) => (
          <div key={chat.friend._id} className="relative">
            <ChatWindow
              chat={chat}
              currentUser={user}
              onClose={() => closeChat(chat.friend._id)}
              onMinimize={() => toggleMin(chat.friend._id)}
              onSend={() => sendMessage(chat.friend._id)}
              onChange={(v) => handleChange(chat.friend._id, v)}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default GlobalChatManager;

/* ── Helper to open a chat from anywhere ── */
export const openChatWith = (friend) => {
  window.dispatchEvent(new CustomEvent('publientis:open-chat', { detail: { friend } }));
};
