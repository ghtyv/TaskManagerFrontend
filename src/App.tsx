import {BrowserRouter, Navigate, Route, Routes} from "react-router";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import LoginPage from "./pages/LoginPage.tsx";

function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path={"/"} element={<Navigate to={"/login"} replace={true} />} />
              <Route path={"/login"} element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                  <Route path={"/tasks"} element={<div>Tasks Page</div>} />
              </Route>
          </Routes>
    </BrowserRouter>
  );
}

export default App
