import "./App.css";
import LoginPage from "./components/Login/login";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute/protectedRoute";
import Home from "./components/Home/home";

function App() {
  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId="270321807885-vhhtabco5p3o0q42vmsvcpqut3e2ddm6.apps.googleusercontent.com">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
        </Routes>
      </GoogleOAuthProvider>
    </BrowserRouter>
  );
}

export default App;
