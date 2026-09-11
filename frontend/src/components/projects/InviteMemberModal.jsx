import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Search, UserPlus } from 'lucide-react';

export const InviteMemberModal = ({ isOpen, onClose, projectId, onMemberAdded }) => {
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter an email address.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/projects/${projectId}/members`, {
        email: email.trim().toLowerCase(),
        role,
      });
      showToast(res.data.message || 'Member added successfully.', 'success');
      onMemberAdded(res.data.members);
      setEmail('');
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to add member.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Team Member to Project"
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Invite existing team members or developers by entering their registered email address.
        </p>

        <div className="form-group">
          <label className="form-label">Member Email *</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. arun@devtrack.io"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Project Role</label>
          <select
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="member">Member (Can manage assigned tasks & comments)</option>
            <option value="manager">Manager / Lead (Full project permissions)</option>
            <option value="viewer">Viewer (Read-only access)</option>
          </select>
        </div>

        <div className="modal-footer" style={{ marginTop: '1.5rem', paddingLeft: 0, paddingRight: 0 }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <UserPlus size={15} />
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
