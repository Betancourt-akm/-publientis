import React, { useState, useEffect, useContext, useRef } from 'react';
import { Context } from '../../context';
import { FaTimes, FaPaperPlane, FaCircle } from 'react-icons/fa';
import io from 'socket.io-client';

const MessagesPanel = ({ otherUser, onClose }) => {
  const { user } = useContext(Context);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user?._id || !otherUser?._id) return;

    // Conectar socket
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8070';
    const newSocket = io(backendUrl, {
      auth: {
        userId: user._id,
        userRole: user.role
      }
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket conectado para chat directo');
      
      // Iniciar o obtener conversación
      newSocket.emit('chat:direct:start', { otherUserId: otherUser._id }, (response) => {
        if (response.success) {
          setConversation(response.chat);
          setMessages(response.messages || []);
          newSocket.emit('messages:read', { chatId: response.chat._id });
        } else {
          console.error('Error al iniciar chat:', response.error);
        }
      });
    });

    // Escuchar nuevos mensajes
    newSocket.on('message:new', (message) => {
      setMessages(prev => [...prev, message]);
      if (conversation) {
        newSocket.emit('messages:read', { chatId: conversation._id });
      }
    });

    // Escuchar evento de escribiendo
    newSocket.on('typing:start', ({ userName }) => {
      setIsTyping(true);
    });

    newSocket.on('typing:stop', () => {
      setIsTyping(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, otherUser]);

  const handleTyping = () => {
    if (!socket || !conversation) return;

    socket.emit('typing:start', { chatId: conversation._id });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { chatId: conversation._id });
    }, 1000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket || !conversation) return;

    const messageData = {
      chatId: conversation._id,
      content: newMessage.trim()
    };

    socket.emit('message:send', messageData, (response) => {
      if (response.success) {
        setNewMessage('');
        socket.emit('typing:stop', { chatId: conversation._id });
      } else {
        console.error('Error al enviar mensaje:', response.error);
      }
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="fixed bottom-0 right-20 w-[350px] bg-white rounded-t-lg shadow-2xl border border-gray-300 z-50 flex flex-col h-[500px]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            {otherUser.profilePic ? (
              <img 
                src={otherUser.profilePic} 
                alt={otherUser.name} 
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                {otherUser.name?.charAt(0)}
              </div>
            )}
            <FaCircle className="absolute bottom-0 right-0 text-green-500 text-xs bg-white rounded-full" />
          </div>
          <div>
            <p className="font-semibold text-sm">{otherUser.name}</p>
            <p className="text-xs text-gray-500">
              {isTyping ? 'Escribiendo...' : 'Activo ahora'}
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaTimes className="text-gray-600" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm mt-10">
            <p>Inicia la conversación con {otherUser.name}</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMyMessage = msg.senderId === user._id;
            return (
              <div 
                key={msg._id || index} 
                className={`mb-3 flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isMyMessage ? 'order-2' : 'order-1'}`}>
                  <div 
                    className={`rounded-2xl px-4 py-2 ${
                      isMyMessage 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm break-words">{msg.content}</p>
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${isMyMessage ? 'text-right' : 'text-left'}`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:bg-gray-200 transition-colors"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <FaPaperPlane className="text-sm" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessagesPanel;
