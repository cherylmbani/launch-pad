import React, {useState} from "react";
import "../Styles/Login.css";

function Login(){
    const [userDetails, setUserDetails] = useState({
        email: "",
        password: ""
    });
    
    function handleLogin(e){
        e.preventDefault();
    
        fetch("http://127.0.0.1:5555/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userDetails)
        })
        .then(res => res.json())
        .then(loginDetails => {
            console.log("Successful login:", loginDetails);
            // Store user data in localStorage
            localStorage.setItem("user", JSON.stringify(loginDetails));
            // Redirect to GitHub Analysis page
            window.location.href = "/github-analysis";
            // Clear form
            setUserDetails({
                email: "",
                password: ""
            });
        })
        .catch(err => {
            console.log("Error:", err);
            alert("Login failed. Please check your password or email.");
        });
    }
    
    return (
        <div className="login-page">
            <div className="login-box">
                <h2 className="login-header">Login to Launchpad</h2>
                <p className="login-subtitle">Access your GitHub portfolio analysis</p>
                
                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-section">
                        <label htmlFor="email" className="input-label">Email:</label>
                        <input 
                            type="email"
                            id="email"
                            value={userDetails.email}
                            onChange={(e) => setUserDetails(prev => ({...prev, email: e.target.value}))}
                            className="login-input"
                            required
                        />
                    </div>
                    
                    <div className="form-section">
                        <label htmlFor="password" className="input-label">Password:</label>
                        <input 
                            type="password"
                            id="password"
                            value={userDetails.password}
                            onChange={(e) => setUserDetails(prev => ({...prev, password: e.target.value}))}
                            className="login-input"
                            required
                        />
                    </div>
                    
                    <button type="submit" className="login-btn">Login</button>
                    
                    <p className="signup-prompt">
                        Don't have an account? <a href="/signup" className="signup-link">Sign up</a>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Login;