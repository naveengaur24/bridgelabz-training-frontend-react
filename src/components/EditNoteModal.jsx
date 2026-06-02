import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';

export const EditNoteModal = ({ note, labels, onClose, onNoteSaved, showToastMessage }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [reminderTime, setReminderTime] = useState('');
  const [selectedLabels, setSelectedLabels] = useState(new Set());

  // Initialize values when modal opens or note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setIsPinned(note.isPinned);
      setReminderTime(note.reminderTime ? note.reminderTime.substring(0, 16) : '');
      
      const labelIds = new Set();
      if (note.labels) {
        Array.from(note.labels).forEach(l => labelIds.add(l.id));
      }
      setSelectedLabels(labelIds);
    }
  }, [note]);

  const handleSave = async () => {
    const finalTitle = title.trim() || 'Untitled Note';
    try {
      const res = await ApiService.updateNote(note.id, finalTitle, content, reminderTime || null);
      if (res.success) {
        showToastMessage('Note updated successfully!');
        onNoteSaved();
        onClose();
      }
    } catch (err) {
      console.error(err);
      showToastMessage('Failed to save note', true);
    }
  };

  const handlePinToggle = async () => {
    try {
      const res = await ApiService.pinNote(note.id);
      if (res.success) {
        setIsPinned(res.data.isPinned);
        showToastMessage(res.data.isPinned ? 'Note pinned' : 'Note unpinned');
        onNoteSaved();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLabelToggle = async (labelId) => {
    try {
      const updated = new Set(selectedLabels);
      if (updated.has(labelId)) {
        updated.delete(labelId);
        await ApiService.removeLabelFromNote(note.id, labelId);
      } else {
        updated.add(labelId);
        await ApiService.addLabelToNote(note.id, labelId);
      }
      setSelectedLabels(updated);
      onNoteSaved();
    } catch (err) {
      console.error(err);
    }
  };

  const formatReminderString = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (!note) return null;    // if no note is select return null..

  return (
    <div
      className="modal fade show"
      style={{ display: 'block', backgroundColor: 'rgba(32,33,36,0.6)', zIndex: 1055 }}
      tabIndex="-1"
      onClick={onClose}
    >
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content modal-keep">
          
          <div className="modal-header border-0 d-flex justify-content-between align-items-center pb-0">
            <input
              type="text"
              className="note-creator-input-title fs-5"
              placeholder="Title"
              autoComplete="off"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button
              className={`tool-btn pin-btn ${isPinned ? 'active' : ''}`}
              title={isPinned ? 'Unpin note' : 'Pin note'}
              onClick={handlePinToggle}
            >
              <i className={`bi ${isPinned ? 'bi-pin-fill' : 'bi-pin'}`}></i>
            </button>
          </div>

          <div className="modal-body py-2">
            <textarea
              className="note-creator-input-content mb-0"
              placeholder="Note"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            
            {/* Meta chips list in edit card */}
            <div className="note-chips mt-2">
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
          </div>

          <div className="modal-footer border-0 d-flex justify-content-between align-items-center pt-0">
            <div className="d-flex gap-2">
              
              {/* Edit Reminder Dropdown */}
              <div className="dropdown d-inline-block">
                <button
                  className="tool-btn"
                  id="edit-reminder-btn"
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
                      data-bs-toggle="dropdown"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              {/* Edit Labels Dropdown */}
              <div className="dropdown d-inline-block">
                <button
                  className="tool-btn"
                  id="edit-label-btn"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  title="Change labels"
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
                            id={`label-editor-${label.id}`}
                            checked={selectedLabels.has(label.id)}
                            onChange={() => handleLabelToggle(label.id)}
                          />
                          <label className="form-check-label w-100 small" htmlFor={`label-editor-${label.id}`}>
                            {label.name}
                          </label>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>

            </div>
            
            <button type="button" className="btn btn-sm btn-keep px-4" onClick={handleSave}>
              Save
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
