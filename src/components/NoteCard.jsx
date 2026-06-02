import React from 'react';
import { ApiService } from '../services/api';

export const NoteCard = ({ note, onNoteClick, onNoteUpdated, showToastMessage }) => {
  const isPinned = note.isPinned;
  const isArchived = note.isArchived;
  const isTrashed = note.isTrashed;

  const handlePinToggle = async (e) => {
    e.stopPropagation();   //when we click pin button then only pin handled but without this [pin + note] both open
    try {
      const res = await ApiService.pinNote(note.id);
      if (res.success) {
        showToastMessage(res.data.isPinned ? 'Note pinned' : 'Note unpinned');
        onNoteUpdated();   //refresh-notify to parent..
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveToggle = async (e) => {
    e.stopPropagation();
    try {
      const res = await ApiService.archiveNote(note.id);
      if (res.success) {
        showToastMessage(res.data.isArchived ? 'Note archived' : 'Note unarchived');
        onNoteUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrashToggle = async (e) => {
    e.stopPropagation();
    try {
      const res = await ApiService.trashNote(note.id);
      if (res.success) {
        showToastMessage(res.data.isTrashed ? 'Note sent to trash' : 'Note restored');
        onNoteUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePermanently = async (e) => {
    e.stopPropagation();
    if (window.confirm('Permanently delete this note? This action is irreversible.')) {
      try {
        const res = await ApiService.deleteNotePermanently(note.id);
        if (res.success) {
          showToastMessage('Note permanently deleted');
          onNoteUpdated();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const formatReminder = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);  // convert string to dateObject..
      if (isNaN(d.getTime())) return dateStr;   // invalid date check..
      
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      
      const tom = new Date();
      tom.setDate(now.getDate() + 1);
      const isTomorrow = d.toDateString() === tom.toDateString();
      
      const timeFormatted = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      if (isToday) {
        return `Today, ${timeFormatted}`;
      } else if (isTomorrow) {
        return `Tomorrow, ${timeFormatted}`;
      } else {
        return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeFormatted}`;
      }
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="note-card" onClick={onNoteClick}>
      
      <div className="note-card-title-row">
        <h6 className="note-card-title">{note.title}</h6>
        {!isTrashed && (
          <button
            className={`note-card-pin ${isPinned ? 'active' : ''}`}
            title={isPinned ? 'Unpin note' : 'Pin note'}
            onClick={handlePinToggle}
          >
            <i className={`bi ${isPinned ? 'bi-pin-fill' : 'bi-pin'}`}></i>
          </button>
        )}
      </div>

      <div className="note-card-content">{note.content}</div>

      {/* Meta Chips Grid */}
      <div className="note-chips mt-2">
        {note.reminderTime && (
          <div className="keep-chip reminder-chip">
            <i className="bi bi-bell-fill"></i>
            <span>{formatReminder(note.reminderTime)}</span>
          </div>
        )}
        {note.labels && Array.from(note.labels).map((label) => (
          <div key={label.id} className="keep-chip">
            <span>{label.name}</span>
            <button
              className="chip-delete"
              title="Remove label"
              onClick={async (e) => {
                e.stopPropagation(); // Prevent opening the note edit modal
                try {
                  const res = await ApiService.removeLabelFromNote(note.id, label.id);
                  if (res.success) {
                    showToastMessage('Label removed from note');
                    onNoteUpdated();
                  }
                } catch (err) {
                  console.error(err);
                  showToastMessage('Failed to remove label', true);
                }
              }}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
        ))}
      </div>

      {/* Action Toolbar on Hover */}
      <div className="note-card-actions">
        {isTrashed ? (
          <>
            <button className="card-action-btn btn-delete-forever" title="Delete forever" onClick={handleDeletePermanently}>
              <i className="bi bi-trash3-fill text-danger"></i>
            </button>
            <button className="card-action-btn btn-restore" title="Restore note" onClick={handleTrashToggle}>
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
          </>
        ) : (
          <>
            <button className="card-action-btn" title="Reminders" onClick={(e) => { e.stopPropagation(); onNoteClick(); }}>
              <i className="bi bi-bell"></i>
            </button>
            <button className="card-action-btn" title="Labels" onClick={(e) => { e.stopPropagation(); onNoteClick(); }}>
              <i className="bi bi-tag"></i>
            </button>
            <button
              className="card-action-btn"
              title={isArchived ? 'Unarchive' : 'Archive'}
              onClick={handleArchiveToggle}
            >
              <i className={`bi ${isArchived ? 'bi-archive-fill' : 'bi-archive'}`}></i>
            </button>
            <button className="card-action-btn" title="Delete" onClick={handleTrashToggle}>
              <i className="bi bi-trash3"></i>
            </button>
          </>
        )}
      </div>

    </div>
  );
};
