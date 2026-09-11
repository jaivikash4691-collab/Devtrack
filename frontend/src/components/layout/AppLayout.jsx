import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ProjectCreateModal } from '../projects/ProjectCreateModal';
import { Loader } from '../common/Loader';

export const AppLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)' }}>
        <Loader text="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onNewProject={() => setCreateProjectModalOpen(true)}
        />
        <main className="main-content">
          <Outlet context={{ openCreateProject: () => setCreateProjectModalOpen(true) }} />
        </main>
      </div>

      <ProjectCreateModal
        isOpen={createProjectModalOpen}
        onClose={() => setCreateProjectModalOpen(false)}
        onProjectCreated={(newProj) => {
          window.location.href = `/projects/${newProj._id}`;
        }}
      />
    </div>
  );
};
