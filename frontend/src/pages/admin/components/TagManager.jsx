import React, { useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import './TagManager.css';

const TagManager = ({ tags, onAddTag, onDeleteTag }) => {
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const normalizedTag = newTag.trim();

    if (!normalizedTag) {
      alert('Escribe un tag antes de guardarlo');
      return;
    }

    if (tags.some((tag) => tag.toLowerCase() === normalizedTag.toLowerCase())) {
      alert('Ese tag ya existe');
      return;
    }

    onAddTag(normalizedTag);
    setNewTag('');
    alert('Tag agregado');
  };

  return (
    <section className="tag-manager">
      <div className="tag-manager__header">
        <h2>Tags de especialidad</h2>
        <p>Crea o elimina etiquetas que luego podrán usar los estudiantes en su perfil.</p>
      </div>

      <form className="tag-manager__form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Ej: Inclusión, primera infancia"
        />
        <button type="submit"><FaPlus /> Crear tag</button>
      </form>

      <div className="tag-manager__list">
        {tags.map((tag) => (
          <div key={tag} className="tag-manager__chip">
            <span>{tag}</span>
            <button type="button" onClick={() => onDeleteTag(tag)} aria-label={`Eliminar ${tag}`}>
              <FaTimes />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TagManager;
