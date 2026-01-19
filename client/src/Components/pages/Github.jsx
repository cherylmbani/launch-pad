import React, { useState, useEffect } from "react";
import "../Styles/Github.css"

function GitHubAnalysis() {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Get user from localStorage (set during login)
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            window.location.href = "/login";  // Redirect to login if not authenticated
            return;
        }
        
        if (!user.github_username) {
            setError("No GitHub username found. Please update your profile.");
            setLoading(false);
            return;
        }

        // Automatically analyze their GitHub
        fetch("http://127.0.0.1:5555/githubanalysis", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                github_username: user.github_username 
            })
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            setAnalysis(data);
            setLoading(false);
        })
        .catch(err => {
            console.error("Analysis error:", err);
            setError("Failed to analyze GitHub. Please try again.");
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="analysis-loading">
                <h2>Analyzing your GitHub portfolio...</h2>
                <p>Please wait while we fetch your repositories.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="analysis-error">
                <h2>Error</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="github-analysis">
            <h1 className="analysis-title">Your GitHub Portfolio Analysis</h1>
            
            <div className="analysis-summary">
                <h2>Summary</h2>
                <div className="summary-cards">
                    <div className="summary-card">
                        <h3>Total Repositories</h3>
                        <p className="summary-number">{analysis.total_repos_fetched || analysis.total_repos}</p>
                    </div>
                    
                    <div className="summary-card">
                        <h3>Most Used Language</h3>
                        <p className="summary-language">{analysis.most_used_language || "N/A"}</p>
                    </div>
                    
                    <div className="summary-card">
                        <h3>Repos Saved</h3>
                        <p className="summary-number">{analysis.repos_saved || 0}</p>
                    </div>
                </div>
            </div>

            {analysis.language_stats && (
                <div className="language-section">
                    <h2>Language Distribution</h2>
                    <div className="language-list">
                        {Object.entries(analysis.language_stats).map(([lang, count]) => (
                            <div key={lang} className="language-item">
                                <span className="language-name">{lang === "null" ? "No language" : lang}</span>
                                <span className="language-count">{count} repos</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="recent-repos">
                <h2>Your Repositories</h2>
                {analysis.repos && analysis.repos.length > 0 ? (
                    <ul className="repo-list">
                        {analysis.repos.slice(0, 10).map((repo, index) => (
                            <li key={index} className="repo-item">
                                <span className="repo-name">{repo.name || repo}</span>
                                {repo.language && (
                                    <span className="repo-language">{repo.language}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No repositories found or loaded yet.</p>
                )}
            </div>

            <div className="analysis-note">
                <p>Analysis performed on: {new Date().toLocaleDateString()}</p>
                <button 
                    className="refresh-btn"
                    onClick={() => window.location.reload()}
                >
                    Refresh Analysis
                </button>
            </div>
        </div>
    );
}

export default GitHubAnalysis;