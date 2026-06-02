import React from 'react';

export const Sidebar = ({
  sidebarCollapsed,
  activeView,
  setActiveView,
  activeLabelId,
  setActiveLabelId,
  labels,
  onEditLabelsClick
}) => {
  const handleNavClick = (view, labelId = null) => {
    setActiveView(view);
    setActiveLabelId(labelId);
  };

  return (
    <aside id="keep-sidebar" className={`keep-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <a
        className={`sidebar-nav-item ${activeView === 'notes' ? 'active' : ''}`}
        onClick={() => handleNavClick('notes')}
      >
        <i className="bi bi-lightbulb"></i>
        <span>Notes</span>
      </a>
      <a
        className={`sidebar-nav-item ${activeView === 'reminders' ? 'active' : ''}`}
        onClick={() => handleNavClick('reminders')}
      >
        <i className="bi bi-bell"></i>
        <span>Reminders</span>
      </a>
      
      <div className="sidebar-divider"></div>
      <div className="sidebar-section-title">Labels</div>
      
      {/* Dynamic Labels List */}
      <div id="sidebar-labels-list">
        {labels.map((label) => (
          <a
            key={label.id}
            className={`sidebar-nav-item ${activeView === `label-${label.id}` ? 'active' : ''}`}
            onClick={() => handleNavClick(`label-${label.id}`, label.id)}
          >
            <i className="bi bi-tag"></i>
            <span>{label.name}</span>
          </a>
        ))}
      </div>

      <a className="sidebar-nav-item" id="btn-edit-labels" onClick={onEditLabelsClick}>
        <i className="bi bi-pencil"></i>
        <span>Edit labels</span>
      </a>

      <div className="sidebar-divider"></div>

      <a
        className={`sidebar-nav-item ${activeView === 'archive' ? 'active' : ''}`}
        onClick={() => handleNavClick('archive')}
      >
        <i className="bi bi-archive"></i>
        <span>Archive</span>
      </a>
      <a
        className={`sidebar-nav-item ${activeView === 'trash' ? 'active' : ''}`}
        onClick={() => handleNavClick('trash')}
      >
        <i className="bi bi-trash3"></i>
        <span>Trash</span>
      </a>
    </aside>
  );
};
