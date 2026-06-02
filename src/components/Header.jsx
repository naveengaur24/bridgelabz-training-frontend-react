import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../pages/Login'; // We will export showToast or build a simple alert toast

export const Header = ({
  sidebarCollapsed,
  setSidebarCollapsed,
  viewMode,
  setViewMode,
  onSearch,
  onRefresh,
  showToastMessage
}) => {
  const { user, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    onSearch(val);
  };

  const handleClearSearch = () => {
    setSearchVal('');
    onSearch('');   // Saare notes wapas show.
  };

  const handleDelete = async () => {
    if (window.confirm('WARNING: Are you absolutely sure you want to delete your account? All notes and labels will be permanently deleted and cannot be recovered.')) {
      try {
        await deleteAccount();
        showToastMessage('Your account was successfully deleted.');
      } catch (err) {
        showToastMessage(err.message || 'Failed to delete account', true);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="keep-header">
      <div className="brand-section">
        <button
          id="sidebar-toggle"
          className="menu-toggle"
          title="Main menu"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <i className="bi bi-list"></i>
        </button>
        <a href="#" className="logo-container" onClick={(e) => e.preventDefault()}>
          <i className="bi bi-lightbulb-fill"></i>
          <span className="logo-title">Fundoo Notes</span>
        </a>
      </div>

      {/* Global Search Bar */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <span className="search-icon"><i class="bi bi-search"></i></span>
          <input
            type="text"
            id="global-search"
            className="search-input"
            placeholder="Search your notes..."
            value={searchVal}
            onChange={handleSearchChange}
          />
          {searchVal && (
            <button className="action-btn" title="Clear search" onClick={handleClearSearch}>
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
      </div>

      {/* Action tool buttons */}
      <div className="header-actions">
        <button
          id="btn-refresh"
          className="action-btn"
          title="Refresh"
          onClick={onRefresh}
        >
          <i className="bi bi-arrow-clockwise"></i>
        </button>
        <button
          id="btn-view-toggle"
          className="action-btn"
          title={viewMode === 'grid' ? 'List view' : 'Grid view'}
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          <i className={`bi ${viewMode === 'grid' ? 'bi-grid' : 'bi-view-list'}`}></i>
        </button>
        
        {/* User profile dropdown */}
        <div className="dropdown">
          <button
            className="profile-dropdown-btn"
            type="button"
            id="profileMenuButton"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <div id="user-avatar" className="profile-avatar">{initial}</div>
          </button>
          <ul
            className="dropdown-menu dropdown-menu-end shadow border-0"
            aria-labelledby="profileMenuButton"
            style={{ borderRadius: '12px', minWidth: '250px' }}
          >
            <li className="p-3 text-center border-bottom">
              <div
                id="user-profile-avatar"
                className="profile-avatar mx-auto mb-2"
                style={{ width: '50px', height: '50px', fontSize: '1.5rem' }}
              >
                {initial}
              </div>
              <h6 className="mb-0 fw-bold">{user?.name || 'User Name'}</h6>
              <span className="text-muted small">{user?.email || 'user@example.com'}</span>
            </li>
            <li>
              <a className="dropdown-item py-2 text-danger" href="#" onClick={(e) => { e.preventDefault(); handleDelete(); }}>
                <i className="bi bi-person-x me-2"></i> Delete Account
              </a>
            </li>
            <li>
              <a className="dropdown-item py-2" href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                <i className="bi bi-box-arrow-right me-2"></i> Sign Out
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};
