import { useState } from "react";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import "./App.css";

function App() {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user")) || null
    );

    const handleLogin = () => {
        const savedUser = JSON.parse(localStorage.getItem("user"));
        setUser(savedUser);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    if (!user) {
        return <Login onLogin={handleLogin} />;
    }

    if (user.role === "student") {
        return <StudentDashboard onLogout={handleLogout} />;
    }

    if (user.role === "admin") {
        return <AdminDashboard onLogout={handleLogout} />;
    }

    if (user.role === "faculty") {
        return <FacultyDashboard onLogout={handleLogout} />;
    }

    return <Login onLogin={handleLogin} />;
}

export default App;