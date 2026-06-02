import React, { useState } from 'react';
import { ApiService } from '../services/api';

export const EditLabelsModal = ({ isOpen, onClose, labels, onLabelsUpdated, showToastMessage }) => {
  const [newLabelName, setNewLabelName] = useState('');

  const handleCreateLabel = async () => {
    const cleanName = newLabelName.trim();
    if (cleanName) {
      try {
        const response = await ApiService.createLabel(cleanName);
        if (response.success) {
          showToastMessage(`Label "${cleanName}" created!`);
          setNewLabelName('');
          onLabelsUpdated();
        }
      } catch (err) {
        console.error(err);
        showToastMessage(err.message || 'Failed to create label', true);
      }
    }
  };

  const handleDeleteLabel = async (labelId, labelName) => {
    if (window.confirm(`Are you sure you want to delete label "${labelName}"? It will be removed from all notes.`)) {
      try {
        const response = await ApiService.deleteLabel(labelId);
        if (response.success) {
          showToastMessage('Label deleted');
          onLabelsUpdated(labelId);
        }
      } catch (err) {
        console.error(err);
        showToastMessage('Failed to delete label', true);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: 'block', backgroundColor: 'rgba(32,33,36,0.6)', zIndex: 1055 }}
      tabIndex="-1"
      onClick={onClose}
    >
      <div className="modal-dialog modal-dialog-centered modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content modal-keep">
          
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title font-title fw-bold fs-6">Edit Labels</h5>
            <button type="button" className="btn-close small" aria-label="Close" onClick={onClose}></button>
          </div>

          <div className="modal-body py-2">
            {/* Create Label Row */}
            <div className="d-flex align-items-center mb-3">
              <button className="tool-btn p-1 me-2" title="Clear" onClick={() => setNewLabelName('')}>
                <i className="bi bi-x-lg"></i>
              </button>
              <input
                type="text"
                className="form-control form-control-sm border-0 border-bottom"
                placeholder="Create new label..."
                style={{ borderRadius: 0 }}
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateLabel()}
              />
              <button className="tool-btn p-1 ms-2" title="Create label" onClick={handleCreateLabel}>
                <i className="bi bi-check-lg"></i>
              </button>
            </div>
            
            {/* Label List Manager */}
            <div className="label-manager-list">
              {labels.map((label) => (
                <div key={label.id} className="label-manager-item">
                  <button
                    className="tool-btn p-1 text-danger btn-delete-label"
                    title="Delete label"
                    onClick={() => handleDeleteLabel(label.id, label.name)}
                  >
                    <i className="bi bi-trash3"></i>
                  </button>
                  <input
                    type="text"
                    className="form-control-sm border-0 border-bottom mx-2 label-item-input"
                    value={label.name}
                    readOnly
                    style={{ backgroundColor: 'transparent' }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer border-0 pt-0">
            <button type="button" className="btn btn-sm btn-keep w-100" onClick={onClose}>
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
