import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Plus, Trash2, Send, CheckSquare, Square, Calendar } from 'lucide-react';

export const TaskModal = ({
  isOpen,
  onClose,
  task = null,
  initialStatus = 'TODO',
  projectId,
  members = [],
  milestones = [],
  onSaved,
  onDeleted,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const isEdit = !!task;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState('MEDIUM');
  const [assignedTo, setAssignedTo] = useState('');
  const [deadline, setDeadline] = useState('');
  const [milestone, setMilestone] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'TODO');
      setPriority(task.priority || 'MEDIUM');
      setAssignedTo(task.assignedTo?._id || task.assignedTo || '');
      setDeadline(task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '');
      setMilestone(task.milestone?._id || task.milestone || '');
      setTagsInput(task.tags ? task.tags.join(', ') : '');
      setSubtasks(task.subtasks || []);
      setComments(task.comments || []);
    } else {
      setTitle('');
      setDescription('');
      setStatus(initialStatus);
      setPriority('MEDIUM');
      setAssignedTo('');
      setDeadline('');
      setMilestone('');
      setTagsInput('');
      setSubtasks([]);
      setComments([]);
    }
  }, [task, initialStatus, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please provide a task title.', 'warning');
      return;
    }

    setSaving(true);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignedTo: assignedTo || null,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      milestone: milestone || null,
      tags,
      subtasks,
    };

    try {
      if (isEdit) {
        const res = await api.put(`/tasks/${task._id}`, payload);
        showToast('Task updated successfully.', 'success');
        onSaved(res.data.task);
      } else {
        const res = await api.post(`/projects/${projectId}/tasks`, payload);
        showToast('Task created successfully.', 'success');
        onSaved(res.data.task);
      }
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to save task.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.delete(`/tasks/${task._id}`);
      showToast('Task deleted.', 'info');
      onDeleted(task._id);
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to delete task.', 'error');
    }
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([...subtasks, { title: newSubtaskTitle.trim(), completed: false }]);
    setNewSubtaskTitle('');
  };

  const toggleSubtask = (index) => {
    setSubtasks(
      subtasks.map((s, idx) => (idx === index ? { ...s, completed: !s.completed } : s))
    );
  };

  const removeSubtask = (index) => {
    setSubtasks(subtasks.filter((_, idx) => idx !== index));
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !task) return;

    try {
      const res = await api.post(`/tasks/${task._id}/comments`, { text: newCommentText.trim() });
      setComments([...comments, res.data.comment]);
      setNewCommentText('');
      showToast('Comment added.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to add comment.', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Task' : 'Create New Task'}
      maxWidth="720px"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Task Title *</label>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Design MongoDB Schema for Classrooms"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide task requirements, acceptance criteria, or links..."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Assignee</label>
            <select
              className="form-select"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Unassigned</option>
              {members.map((m) => {
                const u = m.user;
                return (
                  <option key={u._id} value={u._id}>
                    {u.name} ({m.role})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Deadline</label>
            <input
              type="date"
              className="form-input"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Milestone</label>
            <select
              className="form-select"
              value={milestone}
              onChange={(e) => setMilestone(e.target.value)}
            >
              <option value="">None</option>
              {milestones.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input
              type="text"
              className="form-input"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Backend, API, Database"
            />
          </div>
        </div>

        {/* Subtasks Checklist */}
        <div style={{ marginTop: '1rem', marginBottom: '1.25rem' }}>
          <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
            Checklist / Subtasks
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.6rem' }}>
            {subtasks.map((st, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-subtle)',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                  onClick={() => toggleSubtask(idx)}
                >
                  {st.completed ? (
                    <CheckSquare size={16} color="#10b981" />
                  ) : (
                    <Square size={16} color="var(--text-muted)" />
                  )}
                  <span
                    style={{
                      fontSize: '0.85rem',
                      textDecoration: st.completed ? 'line-through' : 'none',
                      color: st.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                    }}
                  >
                    {st.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeSubtask(idx)}
                  className="btn-ghost"
                  style={{ padding: '0.2rem', cursor: 'pointer' }}
                >
                  <Trash2 size={13} color="#f43f5e" />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Add a subtask item..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
            <button
              type="button"
              onClick={handleAddSubtask}
              className="btn btn-secondary btn-sm"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        {/* Discussion / Comments Feed (if editing existing task) */}
        {isEdit && (
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Discussion & Updates</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
              {comments.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                  No comments yet on this task.
                </div>
              ) : (
                comments.map((c, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <Avatar user={c.user} size="sm" />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.825rem', color: 'var(--text-primary)' }}>
                          {c.user?.name || 'User'}
                        </span>
                        <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {c.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Write a comment..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
              <button
                type="button"
                onClick={handleAddComment}
                className="btn btn-primary btn-sm"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="modal-footer" style={{ marginTop: '1.5rem', paddingLeft: 0, paddingRight: 0 }}>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              className="btn btn-danger btn-sm"
              style={{ marginRight: 'auto' }}
            >
              <Trash2 size={15} /> Delete Task
            </button>
          )}
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
