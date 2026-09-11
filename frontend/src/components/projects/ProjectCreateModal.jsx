import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const ProjectCreateModal = ({ isOpen, onClose, onProjectCreated }) => {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Capstone');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState('');
  const [techInput, setTechInput] = useState('React, Node.js, Express, MongoDB');
  const [githubUrl, setGithubUrl] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Project name is required.', 'warning');
      return;
    }
    if (!description.trim()) {
      showToast('Project description is required.', 'warning');
      return;
    }
    if (!deadline) {
      showToast('Expected completion deadline is required.', 'warning');
      return;
    }

    setLoading(true);

    const technologies = techInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      category,
      startDate: new Date(startDate).toISOString(),
      deadline: new Date(deadline).toISOString(),
      technologies,
      githubUrl: githubUrl.trim(),
      visibility,
    };

    try {
      const res = await api.post('/projects', payload);
      showToast('Project created successfully!', 'success');
      onProjectCreated(res.data.project);
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to create project.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project Workspace"
      maxWidth="640px"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Project Name *</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. AI Attendance & Face Recognition System"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the project goals, deliverables, and architecture..."
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Capstone">Capstone Project</option>
              <option value="Hackathon">Hackathon Project</option>
              <option value="Open Source">Open Source</option>
              <option value="Startup">Startup / Commercial</option>
              <option value="Coursework">Coursework</option>
              <option value="General">General</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Visibility</label>
            <select
              className="form-select"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="private">Private (Team Members Only)</option>
              <option value="public">Public (Visible to Campus)</option>
            </select>
          </div>
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
            <label className="form-label">Target Completion Deadline *</label>
            <input
              type="date"
              className="form-input"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Technologies (comma separated)</label>
          <input
            type="text"
            className="form-input"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            placeholder="React, TypeScript, Node.js, MongoDB"
          />
        </div>

        <div className="form-group">
          <label className="form-label">GitHub Repository URL (Optional)</label>
          <input
            type="url"
            className="form-input"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/facebook/react"
          />
        </div>

        <div className="modal-footer" style={{ marginTop: '1.5rem', paddingLeft: 0, paddingRight: 0 }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Project...' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
