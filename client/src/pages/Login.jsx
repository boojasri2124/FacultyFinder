import { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        setMessage("Logging in...");

        try {
            const response = await fetch(
                "https://facultyfinder-hc9s.onrender.com/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Login failed");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            onLogin();

        } catch (error) {
            setMessage("Unable to connect to server");
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">

                <div className="login-brand">
                    <h1>FacultyFinder</h1>

                    <p>
                        Find the right faculty.
                        <br />
                        Meet at the right time.
                    </p>
                </div>

                <div className="login-form-section">

                    <h2>Welcome Back</h2>

                    <p className="login-description">
                        Login to continue to FacultyFinder
                    </p>

                    <form onSubmit={handleLogin}>

                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button type="submit">
                            Login
                        </button>

                    </form>

                    {message && (
                        <p className="login-message">
                            {message}
                        </p>
                    )}

                </div>

            </div>
        </div>
    );
}

export default Login;