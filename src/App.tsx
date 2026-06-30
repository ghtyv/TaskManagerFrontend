import { ConfigProvider } from 'antd';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import TaskDetailsPage from './pages/TaskDetailsPage.tsx';
import TasksPage from './pages/TasksPage.tsx';

function App() {
  return (
      <ConfigProvider
          theme={{
              token: {
                  colorPrimary: '#b55a1f',
                  borderRadius: 14,
                  fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
              },
          }}
      >
          <BrowserRouter>
              <Routes>
                  <Route path={"/"} element={<Navigate to={"/tasks"} replace={true} />} />
                  <Route path={"/login"} element={<LoginPage />} />
                  <Route element={<ProtectedRoute />}>
                      <Route path={"/tasks"} element={<TasksPage />} />
                      <Route path={"/tasks/:id"} element={<TaskDetailsPage />} />
                  </Route>
              </Routes>
          </BrowserRouter>
      </ConfigProvider>
  );
}

export default App
