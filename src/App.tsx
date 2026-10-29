import { ConfigProvider } from 'antd';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import SignupPage from './pages/SignupPage.tsx';
import TaskDetailsPage from './pages/TaskDetailsPage.tsx';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage.tsx';

function App() {
  return (
      <ConfigProvider
          theme={{
              token: {
                  colorPrimary: '#2f8f57',
                  borderRadius: 14,
                  fontFamily: '"Inter", "Segoe UI", sans-serif',
              },
          }}
      >
          <BrowserRouter>
              <Routes>
                  <Route path={"/"} element={<Navigate to={"/projects"} replace={true} />} />
                  <Route path={"/login"} element={<LoginPage />} />
                  <Route path={"/signup"} element={<SignupPage />} />
                  <Route element={<ProtectedRoute />}>
                      <Route path="/projects" element={<ProjectsPage />} />
                      <Route path="/projects/:projectId" element={<TasksPage />} />
                      <Route path="/tasks" element={<Navigate to="/projects" replace />} />
                      <Route path="/projects/:projectId/tasks/:id" element={<TaskDetailsPage />} />
                  </Route>
              </Routes>
          </BrowserRouter>
      </ConfigProvider>
  );
}

export default App
