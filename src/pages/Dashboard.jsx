import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { NoteCreator } from '../components/NoteCreator';
import { NoteCard } from '../components/NoteCard';
import { EditNoteModal } from '../components/EditNoteModal';
import { EditLabelsModal } from '../components/EditLabelsModal';

export function normalizeNote(note) {
  if (!note) return note;
  
  let labelsSet = new Set();
  if (note.labels) {
    if (note.labels instanceof Set) {
      labelsSet = note.labels;
    } else if (Array.isArray(note.labels)) {
      labelsSet = new Set(note.labels);
    } else {
      labelsSet = new Set(Array.from(note.labels));
    }
  }

  return {
    ...note,
    isPinned: note.isPinned !== undefined ? note.isPinned : (note.pinned !== undefined ? note.pinned : false),
    isArchived: note.isArchived !== undefined ? note.isArchived : (note.archived !== undefined ? note.archived : false),
    isTrashed: note.isTrashed !== undefined ? note.isTrashed : (note.trashed !== undefined ? note.trashed : false),
    labels: labelsSet
  };
}

export const Dashboard = () => {
  // UI States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [activeView, setActiveView] = useState('notes'); // 'notes', 'reminders', 'archive', 'trash', 'label-{id}'
  const [activeLabelId, setActiveLabelId] = useState(null);

  // Data States
  const [notes, setNotes] = useState([]);
  const [labels, setLabels] = useState([]);

  // Modals States
  const [editingNote, setEditingNote] = useState(null);
  const [labelsModalOpen, setLabelsModalOpen] = useState(false);

  // Toast States
  const [toastMsg, setToastMsg] = useState('');
  const [isErrorToast, setIsErrorToast] = useState(false);
  const [showToastAlert, setShowToastAlert] = useState(false);

  const triggerToast = (msg, isErr = false) => {
    setToastMsg(msg);
    setIsErrorToast(isErr);
    setShowToastAlert(true);
    setTimeout(() => {
      setShowToastAlert(false);
    }, 4000);
  };

  // Fetch labels on mount and whenever labels are updated
  const fetchLabels = async () => {
    try {
      const res = await ApiService.getAllLabels();
      if (res.success) {
        setLabels(res.data);
      }
    } catch (err) {
      console.error('Error fetching labels:', err);
    }
  };

  // Fetch notes based on activeView
  const fetchNotes = async () => {
    try {
      let response;
      if (activeView === 'notes' || activeView === 'reminders') {
        response = await ApiService.getAllNotes();
      } else if (activeView === 'archive') {
        response = await ApiService.getArchivedNotes();
      } else if (activeView === 'trash') {
        response = await ApiService.getTrashedNotes();
      } else if (activeView.startsWith('label-')) {
        response = await ApiService.getNotesByLabel(activeLabelId);
      } else {
        response = await ApiService.getAllNotes();
      }

      if (response && response.success) {
        const normalized = response.data.map(normalizeNote);
        setNotes(normalized);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      triggerToast('Failed to load notes from server', true);
    }
  };

  // Fetch all initial metadata
  useEffect(() => {
    fetchLabels();
  }, []);

  // Fetch notes dynamically when view toggles
  useEffect(() => {
    fetchNotes();
  }, [activeView, activeLabelId]);

  // Global search handler
  const handleSearch = async (query) => {
    const cleanQuery = query.trim();
    if (cleanQuery) {
      try {
        const res = await ApiService.searchNotes(cleanQuery);
        if (res.success) {
          const normalized = res.data.map(normalizeNote);
          setNotes(normalized);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      fetchNotes();
    }
  };

  // Filter notes locally for UI display
  let displayedNotes = [];
  switch (activeView) {
    case 'notes':
      displayedNotes = notes.filter(n => !n.isArchived && !n.isTrashed);
      break;
    case 'reminders':
      displayedNotes = notes.filter(n => !n.isTrashed && n.reminderTime !== null);
      break;
    case 'archive':
      displayedNotes = notes.filter(n => n.isArchived && !n.isTrashed);
      break;
    case 'trash':
      displayedNotes = notes.filter(n => n.isTrashed);
      break;
    default:
      if (activeLabelId) {
        displayedNotes = notes.filter(n =>
          !n.isTrashed &&
          n.labels &&
          Array.from(n.labels).some(l => l.id === activeLabelId)
        );
      }
      break;
  }

  // Separate pinned vs unpinned notes (relevant for notes and reminders panels)
  const showPinSections = activeView === 'notes' || activeView === 'reminders';
  const pinnedNotes = showPinSections ? displayedNotes.filter(n => n.isPinned) : [];
  const otherNotes = showPinSections ? displayedNotes.filter(n => !n.isPinned) : displayedNotes;

  const getEmptyStateMessage = () => {
    if (activeView === 'notes') return 'Notes you add appear here';
    if (activeView === 'reminders') return 'Notes with upcoming reminders appear here';
    if (activeView === 'archive') return 'Your archived notes appear here';
    if (activeView === 'trash') return 'No notes in Trash';
    return 'No notes match this label';
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Dashboard Top Header */}
      <Header
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onSearch={handleSearch}
        onRefresh={() => { triggerToast('Refreshing...'); fetchLabels(); fetchNotes(); }}
        showToastMessage={triggerToast}
      />

      {/* Main Drawer Dashboard Layout */}
      <div className="main-layout">
        
        {/* Navigation Sidebar */}
        <Sidebar
          sidebarCollapsed={sidebarCollapsed}
          activeView={activeView}
          setActiveView={setActiveView}
          activeLabelId={activeLabelId}
          setActiveLabelId={setActiveLabelId}
          labels={labels}
          onEditLabelsClick={() => setLabelsModalOpen(true)}
        />

        {/* Notes listing main workspace */}
        <main className="content-area">
          
          {/* Collapsible Note Creator */}
          {activeView === 'notes' && (
            <NoteCreator
              labels={labels}
              onNoteCreated={fetchNotes}
              showToastMessage={triggerToast}
            />
          )}

          {/* Render Pinned Grid if present */}
          {pinnedNotes.length > 0 && (
            <div id="pinned-section" className="notes-section">
              <div className="section-heading">Pinned</div>
              <div className={`notes-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onNoteClick={() => setEditingNote(note)}
                    onNoteUpdated={fetchNotes}
                    showToastMessage={triggerToast}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Render Others Grid */}
          {otherNotes.length > 0 && (
            <div id="others-section" className="notes-section">
              {pinnedNotes.length > 0 && <div className="section-heading">Others</div>}
              <div className={`notes-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                {otherNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onNoteClick={() => setEditingNote(note)}
                    onNoteUpdated={fetchNotes}
                    showToastMessage={triggerToast}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Render Empty State Placeholder */}
          {displayedNotes.length === 0 && (
            <div id="empty-state" className="empty-state">
              <i className="bi bi-lightbulb"></i>
              <p>{getEmptyStateMessage()}</p>
            </div>
          )}

        </main>
      </div>

      {/* Modal Dialog for editing notes */}
      {editingNote && (
        <EditNoteModal
          note={editingNote}
          labels={labels}
          onClose={() => setEditingNote(null)}
          onNoteSaved={fetchNotes}
          showToastMessage={triggerToast}
        />
      )}

      {/* Modal Dialog for managing labels */}
      <EditLabelsModal
        isOpen={labelsModalOpen}
        onClose={() => setLabelsModalOpen(false)}
        labels={labels}
        onLabelsUpdated={(deletedLabelId) => {
          fetchLabels();
          fetchNotes();
          if (activeLabelId === deletedLabelId) {
            setActiveView('notes');
            setActiveLabelId(null);
          }
        }}
        showToastMessage={triggerToast}
      />

      {/* Notification toast alert */}
      {showToastAlert && (
        <div className="toast-container position-fixed bottom-0 start-0 p-3" style={{ zIndex: 1060 }}>
          <div
            className={`toast align-items-center text-white border-0 shadow show ${isErrorToast ? 'bg-danger' : 'bg-dark'}`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            style={{ borderRadius: '8px' }}
          >
            <div className="d-flex">
              <div className="toast-body">{toastMsg}</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setShowToastAlert(false)}
              ></button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
