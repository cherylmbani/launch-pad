import React, { useState, useEffect } from "react";
import "../Styles/Github.css";
import PortfolioAssessment from "./PortfolioAssessment";
import ActionableFeedback from "./ActionableFeedback";

function GitHubAnalysis() {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [portfolioData, setPortfolioData] = useState(null);

    // Portfolio analysis function
    const analyzePortfolio = (repos, username) => {
        console.log("🔍 Analyzing portfolio with", repos?.length, "repos for", username);
        
        if (!repos || repos.length === 0) {
            return {
                totalScore: 0,
                completeness: 0,
                codeQuality: 0,
                bestPractices: 0,
                presentation: 0,
                stats: {
                    hasPortfolio: false,
                    repoName: 'Not found',
                    hasDescription: false,
                    hasLiveDemo: false,
                    showsProjects: false
                },
                recommendations: ['No repositories to analyze']
            };
        }

        // Find portfolio repo
        const portfolioKeywords = ['portfolio', 'personal', 'website', 'cv', 'resume', 'showcase'];
        
        // Score each repo as potential portfolio
        const scoredRepos = repos.map(repo => {
            const repoName = repo.name?.toLowerCase() || '';
            const repoDesc = repo.description?.toLowerCase() || '';
            const combined = `${repoName} ${repoDesc}`;
            
            let score = 0;
            let reasons = [];
            
            // Name contains "portfolio"
            if (repoName.includes('portfolio')) {
                score += 200;
                reasons.push('Name contains "portfolio"');
            }
            
            // Description contains "portfolio"
            if (repoDesc.includes('portfolio')) {
                score += 150;
                reasons.push('Description mentions "portfolio"');
            }
            
            // Name matches username
            if (username && repoName === username.toLowerCase()) {
                score += 100;
                reasons.push('Repository name matches username');
            }
            
            // Contains other portfolio keywords
            const hasKeywords = portfolioKeywords.some(keyword => 
                combined.includes(keyword) && keyword !== 'portfolio'
            );
            if (hasKeywords) {
                score += 50;
                reasons.push('Contains portfolio keywords');
            }
            
            // Has description
            if (repo.description) {
                score += 40;
                reasons.push('Has description');
            }
            
            // Has GitHub Pages
            if (repo.has_pages || repo.homepage) {
                score += 30;
                reasons.push('Has live deployment');
            }
            
            return { repo, score, reasons };
        });

        // Sort by score (highest first)
        scoredRepos.sort((a, b) => b.score - a.score);
        console.log("🏆 Top portfolio candidates:", scoredRepos.slice(0, 3));

        const bestCandidate = scoredRepos[0];
        
        if (!bestCandidate || bestCandidate.score < 50) {
            return {
                totalScore: 0,
                completeness: 0,
                codeQuality: 0,
                bestPractices: 0,
                presentation: 0,
                stats: {
                    hasPortfolio: false,
                    repoName: 'Not found',
                    hasDescription: false,
                    hasLiveDemo: false,
                    showsProjects: false
                },
                recommendations: ['No portfolio repository found']
            };
        }

        const foundPortfolio = bestCandidate.repo;
        console.log("✅ Selected portfolio:", foundPortfolio.name, "score:", bestCandidate.score);

        // Analyze the portfolio repo
        const hasDescription = foundPortfolio.description && foundPortfolio.description.length > 10;
        const hasLiveDemo = foundPortfolio.has_pages || foundPortfolio.homepage;
        const showsProjects = foundPortfolio.description?.toLowerCase().includes('project') || 
                            foundPortfolio.description?.toLowerCase().includes('demo');

        // Calculate score (0-100)
        let totalScore = 0;
        if (hasDescription) totalScore += 40;
        if (hasLiveDemo) totalScore += 40;
        if (showsProjects) totalScore += 20;

        const recommendations = [];
        if (!hasDescription) recommendations.push('Add description to portfolio repo');
        if (!hasLiveDemo) recommendations.push('Deploy portfolio with GitHub Pages or Netlify');
        if (!showsProjects) recommendations.push('Mention projects in description');

        if (totalScore >= 80) {
            recommendations.push('🎯 Excellent portfolio! Ready for job applications');
        } else if (totalScore >= 60) {
            recommendations.push('👍 Good portfolio, some improvements needed');
        } else {
            recommendations.push('⚠️ Portfolio needs significant improvements');
        }

        return {
            totalScore: Math.min(totalScore, 100),
            completeness: hasDescription ? 10 : 3,
            codeQuality: foundPortfolio.language ? 8 : 4,
            bestPractices: foundPortfolio.updated_at ? 7 : 3,
            presentation: hasLiveDemo ? 10 : 2,
            stats: {
                hasPortfolio: true,
                repoName: foundPortfolio.name,
                hasDescription,
                hasLiveDemo,
                showsProjects,
                lastUpdated: foundPortfolio.updated_at || 'Unknown',
                stars: foundPortfolio.stargazers_count || 0,
                descriptionLength: foundPortfolio.description?.length || 0
            },
            recommendations,
            portfolioRepo: foundPortfolio,
            detectionReason: bestCandidate.reasons.join(', ')
        };
    };

    useEffect(() => {
        // Get user from localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        setCurrentUser(user);
        
        if (!user) {
            window.location.href = "/login";
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
            console.log("✅ GitHub analysis data received:", data);
            setAnalysis(data);
            
            // Analyze portfolio
            if (data.repos) {
                const portfolioResult = analyzePortfolio(data.repos, user.github_username);
                console.log("📊 Portfolio analysis result:", portfolioResult);
                setPortfolioData(portfolioResult);
            }
            
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
            
            {/* Portfolio Assessment */}
            {analysis && portfolioData && (
                <PortfolioAssessment 
                    assessment={portfolioData}
                    username={currentUser?.github_username}
                />
            )}
            
            {/* Actionable Feedback */}
            {analysis && portfolioData && (
                <ActionableFeedback 
                    analysis={analysis}
                    portfolioAssessment={portfolioData}
                    username={currentUser?.github_username}
                />
            )}
        </div>
    );
}

export default GitHubAnalysis;