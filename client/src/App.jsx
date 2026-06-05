import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import BuilderChat from './pages/BuilderChat';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Templates from './pages/Templates';
import Settings from './pages/Settings';

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="build" element={<BuilderChat />} />
          <Route path="build/:projectId" element={<BuilderChat />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:projectId" element={<ProjectDetail />} />
          <Route path="templates" element={<Templates />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
