import React, { useState, useEffect, useRef } from 'react';
import { ApiService } from '../services/api';

export const NoteCreator = ({ labels, onNoteCreated, showToastMessage }) => {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [reminderTime, setReminderTime] = useState('');
  const [selectedLabels, setSelectedLabels] = useState(new Set());
  
  const containerRef = useRef(null);

  // Close with auto-save if user clicks outside the creator card
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        // Prevent auto-save if clicking overlay dropdowns or modals
        const isOverlay = e.target.closest('.dropdown-menu') || e.target.closest('.modal');
        if (!isOverlay) {
          saveAndClose();
        }
      }
    };

    if (expanded) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [expanded, title, content, isPinned, reminderTime, selectedLabels]);

  const saveAndClose = async () => {
    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (cleanTitle || cleanContent) {
      try {
        const finalTitle = cleanTitle || 'Untitled Note';
        const response = await ApiService.createNote(finalTitle, cleanContent, reminderTime || null);
        
        if (response.success && response.data) {
          const createdNote = response.data;

          // Relate labels if selected
          for (const labelId of selectedLabels) {
            await ApiService.addLabelToNote(createdNote.id, labelId);
          }

          // Pin if requested
          if (isPinned) {
            await ApiService.pinNote(createdNote.id);
          }

          showToastMessage('Note created successfully!');
          onNoteCreated();
        }
      } catch (err) {
        console.error(err);
        showToastMessage('Error creating note', true);
      }
    }

    // Reset local states
    setTitle('');
    setContent('');
    setIsPinned(false);
    setReminderTime('');
    setSelectedLabels(new Set());
    setExpanded(false);
  };

  const handleLabelToggle = (labelId) => {
    const updated = new Set(selectedLabels);
    if (updated.has(labelId)) {
      updated.delete(labelId);
    } else {
      updated.add(labelId);
    }
    setSelectedLabels(updated);
  };

  const formatReminderString = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleCollapsedClick = (e) => {
    e.stopPropagation();
    setExpanded(true);
  };

  return (
    <div className="note-creator-container" ref={containerRef}>
      <div className="note-creator-card">
        
        {/* Collapsed Creator */}
        {!expanded && (
          <div className="note-creator-collapsed" onClick={handleCollapsedClick}>
            <span>Take a note...</span>
            <div className="d-flex gap-2">
              <button className="tool-btn" title="New list" onClick={(e) => e.stopPropagation()}><i className="bi bi-check-square"></i></button>
              <button className="tool-btn" title="New note with drawing" onClick={(e) => e.stopPropagation()}><i className="bi bi-brush"></i></button>
              <button className="tool-btn" title="New note with image" onClick={(e) => e.stopPropagation()}><i className="bi bi-image"></i></button>
            </div>
          </div>
        )}

        {/* Expanded Creator */}
        {expanded && (
          <div className="note-creator-expanded">
            <div className="note-creator-title-row">
              <input
                type="text"
                className="note-creator-input-title"
                placeholder="Title"
                autoComplete="off"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <button
                className={`tool-btn pin-btn ${isPinned ? 'active' : ''}`}
                title="Pin note"
                onClick={() => setIsPinned(!isPinned)}
              >
                <i className={`bi ${isPinned ? 'bi-pin-fill' : 'bi-pin'}`}></i>
              </button>
            </div>
            
            <textarea
              className="note-creator-input-content"
              placeholder="Take a note..."
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
            />

            {/* Render Selected meta chips */}
            <div className="note-chips">
              {reminderTime && (
                <div className="keep-chip reminder-chip">
                  <i className="bi bi-bell-fill"></i>
                  <span>{formatReminderString(reminderTime)}</span>
                  <button className="chip-delete" onClick={() => setReminderTime('')}>
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              )}
              {Array.from(selectedLabels).map((labelId) => {
                const label = labels.find((l) => l.id === labelId);
                return label ? (
                  <div key={label.id} className="keep-chip">
                    <span>{label.name}</span>
                    <button className="chip-delete" onClick={() => handleLabelToggle(labelId)}>
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                ) : null;
              })}
            </div>

            <div className="note-creator-actions">
              <div className="note-creator-tools">
                
                {/* Reminder Setting Dropdown */}
                <div className="dropdown d-inline-block">
                  <button
                    className="tool-btn"
                    id="creator-reminder-btn"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                    aria-expanded="false"
                    title="Remind me"
                  >
                    <i className="bi bi-bell"></i>
                  </button>
                  <div className="dropdown-menu p-3 shadow border-0" style={{ width: '250px', borderRadius: '10px' }}>
                    <h6 className="fw-bold mb-2 small">Set Reminder</h6>
                    <input
                      type="datetime-local"
                      className="form-control form-control-sm mb-2"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                    />
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-light"
                        onClick={() => setReminderTime('')}
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-keep"
                        data-bs-toggle="dropdown" // Closes dropdown
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>

                {/* Add Labels Dropdown */}
                <div className="dropdown d-inline-block">
                  <button
                    className="tool-btn"
                    id="creator-label-btn"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    title="Add label"
                  >
                    <i className="bi bi-tag"></i>
                  </button>
                  <ul className="dropdown-menu p-2 shadow border-0" style={{ borderRadius: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                    {labels.length === 0 ? (
                      <li><span className="dropdown-item-text text-muted small">No labels. Create one first!</span></li>
                    ) : (
                      labels.map((label) => (
                        <li key={label.id} className="px-2 py-1">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              value={label.id}
                              id={`label-creator-${label.id}`}
                              checked={selectedLabels.has(label.id)}
                              onChange={() => handleLabelToggle(label.id)}
                            />
                            <label className="form-check-label w-100 small" htmlFor={`label-creator-${label.id}`}>
                              {label.name}
                            </label>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

              </div>
              
              <button
                className="btn btn-sm btn-light fw-semibold px-3 py-1.5"
                style={{ borderRadius: '6px' }}
                onClick={saveAndClose}
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
