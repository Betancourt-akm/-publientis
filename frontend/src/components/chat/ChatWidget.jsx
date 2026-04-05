import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { FaComments, FaPaperPlane, FaTimes, FaCircle } from 'react-icons/fa';
import getBackendUrl from '../../utils/getBackendUrl';
import { toast } from 'react-toastify';

const ChatWidget = () => {
  const user = useSelector((state) => state?.user?.user);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Inicializar Socket.io
  useEffect(() => {
    if (!user?._id) return;

    // Determinar URL del backend
    const backendUrl = getBackendUrl();
    const socketUrl = backendUrl.replace(/\/api$/, '');

    console.log('🔌 Conectando al chat...', socketUrl);

    const newSocket = io(socketUrl, {
      auth: {
        userId: user._id,
        userRole: user.role || 'USER'
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ Chat conectado');
      setIsConnected(true);
      
      // Iniciar o recuperar chat
      newSocket.emit('chat:start', {
        userId: user._id,
        userName: user.name || 'Usuario',
        userEmail: user.email
      }, (response) => {
        if (response.success) {
          setChatId(response.chatId);
          setMessages(response.messages || []);
          setUnreadCount(response.unreadCount || 0);
        }
      });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Chat desconectado');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Error de conexión:', error);
      setIsConnected(false);
    });

    // Recibir mensajes
    newSocket.on('message:new', (message) => {
      setMessages(prev => [...prev, message]);
      
      // Si el chat está cerrado, incrementar contador
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
      
      // Marcar como leído si está abierto
      if (isOpen && message.senderId !== user._id) {
        newSocket.emit('message:read', { chatId });
      }
    });

    // Admin está escribiendo
    newSocket.on('user:typing', ({ userId, isTyping: typing }) => {
      if (userId !== user._id) {
        setIsTyping(typing);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id]);

  // Abrir/cerrar chat
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
      // Marcar mensajes como leídos
      if (socket && chatId) {
        socket.emit('message:read', { chatId });
      }
    }
  };

  // Enviar mensaje
  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket || !chatId) return;

    const messageData = {
      chatId,
      content: newMessage.trim(),
      senderId: user._id,
      senderName: user.name || 'Usuario',
      senderRole: 'user'
    };

    socket.emit('message:send', messageData, (response) => {
      if (response.success) {
        setMessages(prev => [...prev, response.message]);
        setNewMessage('');
        
        // Detener indicador de escritura
        socket.emit('user:typing', { chatId, isTyping: false });
      } else {
        toast.error('Error al enviar mensaje');
      }
    });
  };

  // Indicador de escritura
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!socket || !chatId) return;

    // Emitir que está escribiendo
    socket.emit('user:typing', { chatId, isTyping: true });

    // Limpiar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Detener indicador después de 2 segundos de inactividad
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('user:typing', { chatId, isTyping: false });
    }, 2000);
  };

  if (!user) return null;

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-2xl z-50 transition-all duration-300 hover:scale-110"
        aria-label="Abrir chat de soporte"
      >
        <FaComments className="text-2xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Ventana de chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <FaComments className="text-blue-600 text-xl" />
                </div>
                {isConnected && (
                  <FaCircle className="absolute bottom-0 right-0 text-green-400 text-xs" />
                )}
              </div>
              <div>
                <h3 className="font-bold">Soporte Publientis</h3>
                <p className="text-xs text-blue-100">
                  {isConnected ? 'En línea' : 'Desconectado'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="hover:bg-blue-800 rounded-full p-2 transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                <FaComments className="text-4xl mx-auto mb-3 text-gray-300" />
                <p className="font-medium">¡Hola! ¿En qué podemos ayudarte?</p>
                <p className="text-sm mt-2">Escribe tu mensaje y te responderemos pronto</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMyMessage = msg.senderId === user._id;
                return (
                  <div
                    key={index}
                    className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isMyMessage
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none shadow'
                      }`}
                    >
                      {!isMyMessage && (
                        <p className="text-xs font-semibold mb-1 text-blue-600">
                          {msg.senderName}
                        </p>
                      )}
                      <p className="text-sm break-words">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isMyMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('es-CO', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            
            {/* Indicador de escritura */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-200 rounded-2xl px-4 py-3 rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!isConnected}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || !isConnected}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <FaPaperPlane />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
