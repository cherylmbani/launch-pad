import React, {useState} from "react";
import "../Styles/Signupstyles.css";

function Signup(){
    const [userDetails, setUserDetails] = useState({
        first_name: "",
        last_name: "",
        github_username: "",
        email: "",
        password: "",
        confirm_password: ""
    });

    function handleSignup(e){
        e.preventDefault();
        
        if(userDetails.password !== userDetails.confirm_password){
            alert("Passwords do not match!");
            return;
        }
        
        fetch("http://127.0.0.1:5555/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userDetails)
        })
        .then(res => res.json())
        .then(createdData => {
            console.log("Signup successful:", createdData);
            // Store user data in localStorage
            localStorage.setItem("user", JSON.stringify(createdData));
            // Redirect to GitHub Analysis page
            window.location.href = "/github-analysis";
            // Clear form
            setUserDetails({
                first_name: "",
                last_name: "",
                github_username: "",
                email: "",
                password: "",
                confirm_password: ""
            });
        })
        .catch(err => {
            console.log("Error:", err);
            alert("Signup failed. Please try again.");
        });
    }
    
    return (
        <div className="signup-page">
            <div className="signup-box">
                <h2 className="signup-header">Join Launchpad</h2>
                <p className="signup-subtitle">Create your account to analyze your GitHub portfolio</p>
                
                <form onSubmit={handleSignup} className="signup-form">
                    <div className="form-section">
                        <label htmlFor="fname" className="input-label">First Name:</label>
                        <input 
                            type="text"
                            id="fname"
                            value={userDetails.first_name}
                            onChange={(e) => setUserDetails(prev => ({...prev, first_name: e.target.value}))}
                            className="signup-input"
                            required
                        />
                    </div>
                    
                    <div className="form-section">
                        <label htmlFor="lname" className="input-label">Last Name:</label>
                        <input 
                            type="text"
                            id="lname"
                            value={userDetails.last_name}
                            onChange={(e) => setUserDetails(prev => ({...prev, last_name: e.target.value}))}
                            className="signup-input"
                            required
                        />
                    </div>
                    
                    <div className="form-section">
                        <label htmlFor="github" className="input-label">GitHub Username:</label>
                        <input 
                            type="text"
                            id="github"
                            value={userDetails.github_username}
                            onChange={(e) => setUserDetails(prev => ({...prev, github_username: e.target.value}))}
                            className="signup-input"
                            required
                        />
                    </div>
                    
                    <div className="form-section">
                        <label htmlFor="email" className="input-label">Email:</label>
                        <input 
                            type="email"
                            id="email"
                            value={userDetails.email}
                            onChange={(e) => setUserDetails(prev => ({...prev, email: e.target.value}))}
                            className="signup-input"
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
                            className="signup-input"
                            required
                        />
                    </div>
                    
                    <div className="form-section">
                        <label htmlFor="confirm" className="input-label">Confirm Password:</label>
                        <input 
                            type="password"
                            id="confirm"
                            value={userDetails.confirm_password}
                            onChange={(e) => setUserDetails(prev => ({...prev, confirm_password: e.target.value}))}
                            className="signup-input"
                            required
                        />
                    </div>
                    
                    <button type="submit" className="signup-btn">Create Account</button>
                    
                    <p className="login-prompt">
                        Already have an account? <a href="/login" className="login-link">Log in</a>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Signup;