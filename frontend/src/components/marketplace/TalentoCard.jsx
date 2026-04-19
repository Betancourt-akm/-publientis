import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUniversity, FaStar, FaFileAlt, FaBriefcase, FaThumbsUp,
  FaBookmark, FaCheckCircle, FaChalkboardTeacher
} from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';

const TalentoCard = ({ talent, onAction }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const goToProfile = () => {
    navigate(`/academic/profile/${talent._id}`);
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (isSaved || saving) return;
    setSaving(true);
    try {
      await axiosInstance.post('/api/favorites/add', { candidateId: talent._id });
      setIsSaved(true);
      if (onAction) onAction('saved', talent);
    } catch (err) {
      console.error('Error guardando candidato:', err);
    } finally {
      setSaving(false);
    }
  };

  const rating = talent.evaluations?.averageRating?.toFixed(1);
  const evalCount = talent.evaluations?.count || 0;
  const emphasis = talent.pedagogicalEmphasis || [];
  const isVerified = talent.profileStatus === 'verified';

  return (
    <div
      onClick={goToProfile}
      className="relative bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-4 flex items-start gap-3">
        <div className="relative shrink-0">
          <img
            src={talent.profilePic || '/default-avatar.png'}
            alt={talent.name}
            className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow"
            onError={e => { e.target.src = '/default-avatar.png'; }}
          />
          {isVerified && (
            <span className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
              <FaCheckCircle className="text-xs" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">{talent.name}</h3>
          {isVerified && (
            <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium mt-0.5">
              <FaCheckCircle className="text-green-500" /> Verificado
            </span>
          )}
        </div>

        {rating && (
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
              <FaStar className="text-xs" />{rating}
            </div>
            <div className="text-xs text-gray-400">({evalCount})</div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-3 flex-1 flex flex-col gap-2">
        {/* Programa */}
        <div className="flex items-start gap-2">
          <FaUniversity className="text-indigo-400 text-xs mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-800 leading-tight line-clamp-2">
              {talent.academicProgramRef?.name || 'Programa no especificado'}
            </p>
            {talent.facultyRef?.name && (
              <p className="text-xs text-gray-500 truncate">{talent.facultyRef.name}</p>
            )}
          </div>
        </div>

        {/* Énfasis */}
        {emphasis.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {emphasis.slice(0, 3).map((em, i) => (
              <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                {em}
              </span>
            ))}
            {emphasis.length > 3 && (
              <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                +{emphasis.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-50 mt-auto">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <FaFileAlt className="text-gray-400" />
            <span>{talent.portfolio?.length || 0} evidencias</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <FaChalkboardTeacher className="text-gray-400" />
            <span>{talent.experienceCount || 0} prácticas</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <FaThumbsUp className="text-gray-400" />
            <span>{talent.socialScore || 0} pts</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={goToProfile}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
        >
          Ver Perfil
        </button>
        <button
          onClick={handleSave}
          disabled={saving || isSaved}
          className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
            isSaved
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FaBookmark className={isSaved ? 'text-green-500' : ''} />
        </button>
      </div>

      {talent.socialScore >= 75 && (
        <div className="absolute top-2 right-2 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
          ⭐ Destacado
        </div>
      )}
    </div>
  );
};

export default TalentoCard;
