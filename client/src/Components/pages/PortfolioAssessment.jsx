
import React from 'react';
import "../Styles/PortfolioAssessment.css";

function PortfolioAssessment({ assessment, username }) {
  console.log("📦 PortfolioAssessment received:", assessment);
  
  if (!assessment) {
    return (
      <div className="portfolio-assessment loading">
        <h2>📊 Portfolio Analysis</h2>
        <p>No portfolio data available</p>
      </div>
    );
  }

  const stats = assessment.stats || {
    hasPortfolio: false,
    repoName: 'Not found'
  };

  // Get portfolio repo from assessment or stats
  const portfolioRepo = assessment.portfolioRepo || 
                       (assessment.stats?.hasPortfolio ? { name: stats.repoName } : null);

  return (
    <div className="portfolio-assessment">
      <h2>🎯 Portfolio Repository Analysis</h2>
      
      {stats.hasPortfolio ? (
        <>
          <div className="portfolio-header">
            <h3>📁 {stats.repoName}</h3>
            <div className="portfolio-score">
              <h4>Portfolio Score: {assessment.totalScore}/100</h4>
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ width: `${assessment.totalScore}%` }}
                ></div>
              </div>
              <p className="score-message">
                {assessment.totalScore >= 80 ? 'Excellent! 🎯' : 
                 assessment.totalScore >= 60 ? 'Good, but can improve 💪' : 
                 'Needs work ⚠️'}
              </p>
            </div>
          </div>
          
          {assessment.detectionReason && (
            <div className="detection-info">
              <p><strong>Why this was detected as portfolio:</strong> {assessment.detectionReason}</p>
            </div>
          )}
          
          <div className="portfolio-details">
            <div className="detail-card">
              <span className="detail-label">Portfolio Website</span>
              <span className="detail-value">
                {stats.hasLiveDemo ? '✅ Deployed' : '❌ Not deployed'}
              </span>
            </div>
            <div className="detail-card">
              <span className="detail-label">Description</span>
              <span className="detail-value">
                {stats.hasDescription ? `✅ ${stats.descriptionLength} chars` : '❌ Missing'}
              </span>
            </div>
            <div className="detail-card">
              <span className="detail-label">Shows Projects</span>
              <span className="detail-value">
                {stats.showsProjects ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="detail-card">
              <span className="detail-label">Last Updated</span>
              <span className="detail-value">
                {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
            <div className="detail-card">
              <span className="detail-label">Stars</span>
              <span className="detail-value">⭐ {stats.stars}</span>
            </div>
          </div>
          
          <div className="portfolio-breakdown">
            <h4>📊 Breakdown</h4>
            <div className="breakdown-item">
              <span>Completeness</span>
              <div className="breakdown-bar">
                <div style={{ width: `${assessment.completeness * 10}%` }}></div>
              </div>
              <span>{assessment.completeness}/10</span>
            </div>
            <div className="breakdown-item">
              <span>Code Quality</span>
              <div className="breakdown-bar">
                <div style={{ width: `${assessment.codeQuality * 10}%` }}></div>
              </div>
              <span>{assessment.codeQuality}/10</span>
            </div>
            <div className="breakdown-item">
              <span>Best Practices</span>
              <div className="breakdown-bar">
                <div style={{ width: `${assessment.bestPractices * 10}%` }}></div>
              </div>
              <span>{assessment.bestPractices}/10</span>
            </div>
            <div className="breakdown-item">
              <span>Presentation</span>
              <div className="breakdown-bar">
                <div style={{ width: `${assessment.presentation * 10}%` }}></div>
              </div>
              <span>{assessment.presentation}/10</span>
            </div>
          </div>
        </>
        
      ) : (
        <div className="no-portfolio">
          <h3>❌ No Portfolio Repository Found</h3>
          <p>We couldn't find a repository that appears to be a portfolio.</p>
        </div>
      )}
      
      <div className="recommendations">
        <h3>📋 Recommendations</h3>
        <ul>
          {assessment.recommendations && assessment.recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>
      
      {portfolioRepo && username && (
        <div className="repo-link">
          <a 
            href={`https://github.com/${username}/${portfolioRepo.name}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            🔗 View Portfolio Repository on GitHub
          </a>
        </div>
      )}
    </div>
  );
}

export default PortfolioAssessment;