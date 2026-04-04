import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { 
  FaComments, 
  FaPaperPlane, 
  FaUser, 
  FaRobot, 
  FaClock, 
  FaCheck,
  FaCheckDouble,
  FaTimes,
  FaCircle,
  FaSearch,
  FaFilter,
  FaExclamationCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { toast } from 'react-toastify';

const ChatAdmin = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, waiting, closed
  const [searchQuery, setSearchQuery] = useState('');

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const user = useSelector((state) => state?.user?.user);

  // Inicializar Socket.io
  useEffect(() => {
    if (!user?._id || user?.role !== 'ADMIN') return;

    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const backendUrl = isDevelopment ? 'http://localhost:8070' : 'https://clickpublicidad.click';
    
    socketRef.current = io(backendUrl, {
      auth: {
        userId: user._id,
        userRole: 'admin'
      },
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ Admin conectado al chat');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Admin desconectado del chat');
      setIsConnected(false);
    });

    // Recibir lista de chats activos
    socket.on('admin:active-chats', (activeChats) => {
      console.log('📋 Chats activos recibidos:', activeChats);
      setChats(activeChats);
    });

    // Nuevo chat creado
    socket.on('chat:new', ({ chat, message }) => {
      console.log('🆕 Nuevo chat:', chat);
      setChats(prev => [chat, ...prev]);
      toast.info(`Nuevo chat de ${chat.userName}`);
    });

    // Chat actualizado
    socket.on('chat:updated', (updatedChat) => {
      setChats(prev => {
        const index = prev.findIndex(c => c._id === updatedChat._id);
        if (index >= 0) {
          const newChats = [...prev];
          newChats[index] = updatedChat;
          return newChats;
        }
        return [updatedChat, ...prev];
      });
    });

    // Nuevo mensaje
    socket.on('message:new', (message) => {
      console.log('💬 Nuevo mensaje:', message);
      setMessages(prev => [...prev, message]);
    });

    // Usuario escribiendo
    socket.on('typing:start', ({ chatId, userName }) => {
      if (selectedChat?._id === chatId) {
        setIsTyping(true);
      }
    });

    socket.on('typing:stop', () => {
      setIsTyping(false);
    });

    // Usuarios online
    socket.on('users:online', ({ count, users }) => {
      setOnlineUsers(users);
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [user]);

  // Auto-scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Seleccionar chat y cargar mensajes
  const handleSelectChat = (chat) => {
    if (!socketRef.current) return;

    setSelectedChat(chat);
    setMessages([]);

    // Unirse a la sala del chat
    socketRef.current.emit('chat:start', {
      chatId: chat._id
    }, (response) => {
      if (response.success) {
        setMessages(response.messages || []);
        
        // Asignar el chat al admin si no está asignado
        if (!chat.assignedTo) {
          assignChatToMe(chat._id);
        }
        
        // Marcar mensajes como leídos
        socketRef.current.emit('messages:read', { chatId: chat._id });
      }
    });
  };

  // Asignar chat al admin actual
  const assignChatToMe = (chatId) => {
    if (!socketRef.current) return;

    socketRef.current.emit('admin:assign-chat', { chatId }, (response) => {
      if (response.success) {
        console.log('✅ Chat asignado');
        toast.success('Chat asignado a ti');
      }
    });
  };

  // Enviar mensaje
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socketRef.current || !selectedChat) return;

    const messageToSend = inputMessage.trim();
    setInputMessage('');

    socketRef.current.emit('message:send', {
      chatId: selectedChat._id,
      content: messageToSend,
      type: 'text'
    }, (response) => {
      if (response.success) {
        console.log('✅ Mensaje enviado');
      } else {
        toast.error('Error enviando mensaje');
      }
    });
  };

  // Cerrar chat
  const handleCloseChat = () => {
    if (!socketRef.current || !selectedChat) return;

    if (window.confirm('¿Cerrar esta conversación?')) {
      socketRef.current.emit('admin:close-chat', {
        chatId: selectedChat._id
      }, (response) => {
        if (response.success) {
          toast.success('Chat cerrado');
          setSelectedChat(null);
          setMessages([]);
        }
      });
    }
  };

  // Filtrar chats
  const filteredChats = chats.filter(chat => {
    // Filtro por estado
    if (filterStatus !== 'all' && chat.status !== filterStatus) return false;
    
    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        chat.userName?.toLowerCase().includes(query) ||
        chat.userEmail?.toLowerCase().includes(query) ||
        chat.subject?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Formatear hora
  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  };

  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Hoy';
    if (d.toDateString() === yesterday.toDateString()) return 'Ayer';
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
  };

  // Badge de estado mejorado con iconos
  const getStatusBadge = (chat) => {
    const status = chat.status;
    const hasUnread = chat.unreadCount?.admin > 0;
    
    // Estados:
    // 1. waiting + unread = Pendiente por ver (rojo)
    // 2. waiting + no unread = Visto, por solucionar (amarillo)
    // 3. active = En atención (verde)
    // 4. closed = Cerrado (gris)
    
    let badge = {};
    
    if (status === 'waiting' && hasUnread) {
      // Pendiente por ver - NUEVO
      badge = {
        color: 'bg-red-100 text-red-800 border border-red-300',
        text: 'Pendiente',
        icon: <FaExclamationCircle className="mr-1" />
      };
    } else if (status === 'waiting' && !hasUnread) {
      // Visto pero sin solucionar
      badge = {
        color: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
        text: 'Por Solucionar',
        icon: <FaEye className="mr-1" />
      };
    } else if (status === 'active') {
      // En atención
      badge = {
        color: 'bg-green-100 text-green-800 border border-green-300',
        text: 'En Atención',
        icon: <FaCheckCircle className="mr-1" />
      };
    } else if (status === 'closed') {
      // Cerrado/Solucionado
      badge = {
        color: 'bg-gray-100 text-gray-700 border border-gray-300',
        text: 'Cerrado',
        icon: <FaTimesCircle className="mr-1" />
      };
    } else {
      badge = {
        color: 'bg-gray-100 text-gray-600',
        text: 'Archivado',
        icon: null
      };
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center ${badge.color}`}>
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaTimes className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">Solo administradores pueden acceder a esta página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Lista de Chats */}
      <div className="w-96 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-[#1F3C88] to-[#F2B705]">
          <div className="flex items-center justify-between text-white mb-4">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <FaComments />
                Chat Admin
              </h1>
              <p className="text-xs opacity-90">
                {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{filteredChats.length}</div>
              <div className="text-xs opacity-90">Conversaciones</div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="p-3 border-b bg-gray-50">
          <div className="flex gap-2 text-xs">
            {['all', 'waiting', 'active', 'closed'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-[#F2B705] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status === 'all' ? 'Todos' : status === 'waiting' ? 'En espera' : status === 'active' ? 'Activos' : 'Cerrados'}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Chats */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FaComments className="text-5xl mb-4 opacity-50" />
              <p>No hay chats {filterStatus !== 'all' ? `${filterStatus === 'waiting' ? 'en espera' : filterStatus === 'active' ? 'activos' : 'cerrados'}` : ''}</p>
            </div>
          ) : (
            filteredChats.map(chat => (
              <div
                key={chat._id}
                onClick={() => handleSelectChat(chat)}
                className={`p-4 border-b cursor-pointer transition-colors ${
                  selectedChat?._id === chat._id
                    ? 'bg-[#FFF9E6] border-l-4 border-l-[#F2B705]'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {chat.userName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{chat.userName || 'Usuario'}</h3>
                      <p className="text-xs text-gray-500">{chat.userEmail}</p>
                    </div>
                  </div>
                  {chat.unreadCount?.admin > 0 && (
                    <div className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shadow-lg animate-pulse">
                      {chat.unreadCount.admin > 9 ? '9+' : chat.unreadCount.admin}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between gap-2 text-xs mt-2">
                  {getStatusBadge(chat)}
                  <span className="text-gray-500 text-xs">
                    {formatDate(chat.lastMessage?.timestamp || chat.updatedAt)}
                  </span>
                </div>
                
                {chat.lastMessage && (
                  <p className="text-sm text-gray-600 mt-2 truncate">
                    {chat.lastMessage.content}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {selectedChat.userName?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="font-bold text-lg text-gray-900">{selectedChat.userName}</h2>
                  <p className="text-sm text-gray-500">{selectedChat.userEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedChat)}
                {selectedChat.status !== 'closed' && (
                  <button
                    onClick={handleCloseChat}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <MdClose />
                    Cerrar Chat
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
              {messages.map((msg, index) => {
                const isAdmin = msg.senderRole === 'admin';
                const isBot = msg.senderName?.includes('🤖');
                
                return (
                  <div
                    key={msg._id || index}
                    className={`mb-4 flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[70%] ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                        isAdmin ? (isBot ? 'bg-purple-500' : 'bg-blue-500') : 'bg-gray-500'
                      } text-white text-sm`}>
                        {isAdmin ? (isBot ? <FaRobot /> : <FaUser />) : <FaUser />}
                      </div>
                      
                      <div>
                        <div className={`rounded-2xl px-4 py-2 shadow ${
                          isAdmin
                            ? (isBot ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-gray-800' : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white')
                            : 'bg-white text-gray-800 border'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                        <p className={`text-xs text-gray-400 mt-1 flex items-center gap-1 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          {formatTime(msg.createdAt)}
                          {msg.read && isAdmin && <FaCheckDouble className="text-blue-500" />}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
                    <FaUser />
                  </div>
                  <div className="bg-white border rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {selectedChat.status !== 'closed' && (
              <div className="p-4 bg-white border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    disabled={!isConnected}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F2B705] focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || !isConnected}
                    className="bg-[#F2B705] text-white rounded-full px-6 py-3 hover:bg-[#d9a305] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FaPaperPlane />
                    Enviar
                  </button>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <FaComments className="text-7xl mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Selecciona un chat</h3>
              <p>Elige una conversación para comenzar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatAdmin;
