import { useEffect } from "react";
import Navbar from "./components/Navbar";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import ChatDashboard from "./pages/ChatDashboard";
import { useAuthStore } from "./store/useAuthStore";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  // Show home variant if on / and not authenticated
  const isHomeVariant = location.pathname === "/" && !authUser;

  return (
    <div data-theme={theme}>
      <Navbar variant={isHomeVariant ? "home" : undefined} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/app"
          element={authUser ? <ChatDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUp /> : <Navigate to="/app" />}
        />
        <Route
          path="/login"
          element={!authUser ? <Login /> : <Navigate to="/app" />}
        />
        <Route path="/settings" element={<Settings />} />
        <Route
          path="/profile"
          element={authUser ? <Profile /> : <Navigate to="/login" />}
        />
      </Routes>
      <Toaster position="top-right" reverseOrder={true} />
    </div>
  );
};

export default App;
