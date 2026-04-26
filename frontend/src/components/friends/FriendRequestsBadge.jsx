import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaUserPlus } from 'react-icons/fa';
import { Context } from '../../context';
import axiosInstance from '../../utils/axiosInstance';

const FriendRequestsBadge = () => {
  const { user } = useContext(Context);
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    try {
      const r = await axiosInstance.get('/friends/requests/pending');
      if (r.data.success) setCount(r.data.data.length);
    } catch {}
  };

  useEffect(() => {
    if (!user?._id) { setCount(0); return; }
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user?._id]);

  /* Real-time: increment when socket event fires */
  useEffect(() => {
    const onRequest = () => setCount(n => n + 1);
    window.addEventListener('publientis:friend-request', onRequest);
    return () => window.removeEventListener('publientis:friend-request', onRequest);
  }, []);

  if (!user?._id) return null;

  return (
    <Link
      to="/amigos"
      className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-blue-600"
      title="Solicitudes de amistad"
    >
      <FaUserPlus className="text-[18px]" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold
          rounded-full w-4 h-4 flex items-center justify-center leading-none">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
};

export default FriendRequestsBadge;
