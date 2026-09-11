import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const MilestoneCreateModal = ({
  isOpen,
  onClose,
  projectId,
  milestone = null,
  onSaved,
}) => {
  const { showToast } = useToast();
  const isEdit = !!milestone;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('UPCOMING');
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (milestone) {
      setName(milestone.name || '');
      setDescription(milestone.description || '');
      setStartDate(milestone.startDate ? new Date(milestone.startDate).toISOString().split('T')[0] : '');
      setDeadline(milestone.deadline ? new Date(milestone.deadline).toISOString().split('T')[0] : '');
      setStatus(milestone.status || 'UPCOMING');
      setProgress(milestone.progress ?? 0);
    } else {
      setName('');
      setDescription('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setDeadline('');
      setStatus('UPCOMING');
      setProgress(0);
    }
  }, [milestone, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Milestone name is required.', 'warning');
      return;
    }
    if (!deadline) {
      showToast('Milestone deadline is required.', 'warning');
      return;
    }

    setSaving(true);
    const payload = {
      name: name.trim(),
      description: description.trim(),
      startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      deadline: new Date(deadline).toISOString(),
      status,
      progress: Number(progress),
    };

    try {
      if (isEdit) {
        const res = await api.put(`/milestones/${milestone._id}`, payload);
        showToast('Milestone updated successfully.', 'success');
        onSaved(res.data.milestone);
      } else {
        const res = await api.post(`/projects/${projectId}/milestones`, payload);
        showToast('Milestone created successfully.', 'success');
        onSaved(res.data.milestone);
      }
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to save milestone.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Milestone' : 'Create New Milestone'}
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Milestone Name *</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. M1: Architecture & Data Schema"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key deliverables and acceptance criteria for this milestone..."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Deadline *</label>
            <input
              type="date"
              className="form-input"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="UPCOMING">Upcoming</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="DELAYED">Delayed</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Manual Progress ({progress}%)</label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              style={{ width: '100%', marginTop: '0.5rem', accentColor: 'var(--primary)' }}
            />
          </div>
        </div>

        <div className="modal-footer" style={{ marginTop: '1.5rem', paddingLeft: 0, paddingRight: 0 }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Milestone'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
