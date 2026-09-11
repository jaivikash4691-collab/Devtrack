import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useSocket } from './SocketContext';
import { useToast } from './ToastContext';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const { socket, joinProject, leaveProject } = useSocket();
  const { showToast } = useToast();

  const [activeProject, setActiveProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [health, setHealth] = useState(null);
  const [activities, setActivities] = useState([]);
  const [githubStats, setGithubStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all related project data
  const loadProject = useCallback(async (projectId) => {
    if (!projectId) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Project Details
      const projRes = await api.get(`/projects/${projectId}`);
      const proj = projRes.data.project;
      setActiveProject(proj);

      // 2. Fetch Tasks
      const tasksRes = await api.get(`/projects/${projectId}/tasks`);
      setTasks(tasksRes.data.tasks || []);

      // 3. Fetch Milestones
      const milestonesRes = await api.get(`/projects/${projectId}/milestones`);
      setMilestones(milestonesRes.data.milestones || []);

      // 4. Fetch Health Score & Insights
      const healthRes = await api.get(`/projects/${projectId}/health`);
      setHealth(healthRes.data.health || null);

      // 5. Fetch Activity Feed
      const actRes = await api.get(`/projects/${projectId}/activity?limit=30`);
      setActivities(actRes.data.activities || []);

      // 6. Fetch GitHub if configured
      if (proj.githubUrl) {
        try {
          const ghRes = await api.get(`/projects/${projectId}/github`);
          setGithubStats(ghRes.data.data);
        } catch (ghErr) {
          console.warn('GitHub stats load notice:', ghErr.message);
        }
      } else {
        setGithubStats(null);
      }

      // Join socket room
      joinProject(projectId);
    } catch (err) {
      console.error('Error loading project:', err);
      setError(err.message || 'Failed to load project details.');
      showToast(err.message || 'Failed to load project.', 'error');
    } finally {
      setLoading(false);
    }
  }, [joinProject, showToast]);

  // Real-time Socket Event Listeners
  useEffect(() => {
    if (!socket || !activeProject) return;

    const handleTaskCreated = (newTask) => {
      setTasks((prev) => [newTask, ...prev.filter((t) => t._id !== newTask._id)]);
    };

    const handleTaskUpdated = (updatedTask) => {
      setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
    };

    const handleTaskDeleted = ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    };

    const handleMilestoneUpdated = (updatedM) => {
      setMilestones((prev) => prev.map((m) => (m._id === updatedM._id ? updatedM : m)));
    };

    const handleHealthUpdated = (updatedHealth) => {
      setHealth(updatedHealth);
      setActiveProject((prev) =>
        prev
          ? {
              ...prev,
              healthScore: updatedHealth.overallScore,
              healthStatus: updatedHealth.healthStatus,
            }
          : prev
      );
    };

    const handleActivityNew = (newAct) => {
      setActivities((prev) => [newAct, ...prev]);
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('milestone:updated', handleMilestoneUpdated);
    socket.on('health:updated', handleHealthUpdated);
    socket.on('activity:new', handleActivityNew);

    return () => {
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('milestone:updated', handleMilestoneUpdated);
      socket.off('health:updated', handleHealthUpdated);
      socket.off('activity:new', handleActivityNew);
    };
  }, [socket, activeProject]);

  // Quick action helpers
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
      if (res.data.success) {
        setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data.task : t)));
        // Refresh health score
        if (activeProject) {
          const healthRes = await api.get(`/projects/${activeProject._id}/health`);
          setHealth(healthRes.data.health);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to update task status.', 'error');
    }
  };

  const refreshHealth = async () => {
    if (!activeProject) return;
    try {
      const res = await api.get(`/projects/${activeProject._id}/health`);
      setHealth(res.data.health);
    } catch (err) {
      console.warn('Error refreshing health:', err.message);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        activeProject,
        tasks,
        milestones,
        health,
        activities,
        githubStats,
        loading,
        error,
        loadProject,
        updateTaskStatus,
        refreshHealth,
        setActiveProject,
        setTasks,
        setMilestones,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
