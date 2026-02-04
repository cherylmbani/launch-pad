import React from 'react';
import "../Styles/ActionableFeedback.css";

function ActionableFeedback({ analysis, portfolioAssessment, username }) {
  // If no data yet, show loading
  if (!analysis || !portfolioAssessment) {
    return (
      <div className="actionable-feedback loading">
        <h2>📝 Generating Feedback...</h2>
        <p>Analyzing your GitHub data for personalized recommendations</p>
      </div>
    );
  }

  // Extract data
  const { 
    language_stats = {}, 
    repos = [], 
    total_repos_fetched = 0 
  } = analysis;
  
  const { 
    totalScore = 0, 
    stats: portfolioStats = {},
    recommendations: portfolioRecs = []
  } = portfolioAssessment;

  // Calculate insights
  const totalRepos = total_repos_fetched;
  const topLanguages = Object.entries(language_stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  const reposWithDescription = repos.filter(r => r.description && r.description.length > 0).length;
  const reposWithDemo = repos.filter(r => r.has_pages || r.homepage).length;

  return (
    <div className="actionable-feedback">
      <h2>🎯 Actionable Feedback & Recommendations</h2>
      
      <div className="feedback-summary">
        <h3>📊 Your Current Status</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Total Repositories</span>
            <span className="status-value">{totalRepos}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Portfolio Score</span>
            <span className="status-value">{totalScore}/100</span>
          </div>
          <div className="status-item">
            <span className="status-label">Repos with Descriptions</span>
            <span className="status-value">{reposWithDescription}/{totalRepos}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Live Demos</span>
            <span className="status-value">{reposWithDemo}</span>
          </div>
        </div>
      </div>

      {/* We'll add more sections in next steps */}
      
    </div>
  );
}

export default ActionableFeedback;