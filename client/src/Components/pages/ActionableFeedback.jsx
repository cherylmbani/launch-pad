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
  const uniqueLanguages = new Set(repos.map(r => r.language).filter(Boolean)).size;

  // Generate actionable feedback
  const generateFeedback = () => {
    const strengths = [];
    const quickWins = [];
    const improvements = [];
    const benchmarks = {};

    // Strengths
    if (totalRepos >= 10) strengths.push(`Active GitHub profile (${totalRepos} repositories)`);
    if (topLanguages.length > 0) strengths.push(`Strong ${topLanguages[0][0]} skills (${topLanguages[0][1]} repos)`);
    if (portfolioStats.hasLiveDemo) strengths.push("Portfolio is deployed and accessible");
    if (reposWithDemo > 0) strengths.push(`${reposWithDemo} projects with live demos`);
    if (uniqueLanguages >= 3) strengths.push(`Diverse tech stack (${uniqueLanguages} languages)`);

    // Quick Wins (can fix in 1-2 days)
    if (reposWithDescription < totalRepos * 0.7) {
      quickWins.push(`Add descriptions to ${Math.ceil(totalRepos * 0.7) - reposWithDescription} repositories`);
    }
    if (portfolioStats.hasDescription === false) {
      quickWins.push("Add a detailed description to your portfolio repository");
    }
    if (reposWithDemo === 0 && totalRepos > 0) {
      quickWins.push("Deploy at least 1 project using GitHub Pages");
    }
    if (portfolioRecs.some(rec => rec.includes('GitHub Pages'))) {
      quickWins.push("Enable GitHub Pages on your portfolio repository");
    }

    // Improvements (1-2 weeks)
    if (uniqueLanguages < 2) improvements.push("Learn and add a second programming language");
    if (totalRepos < 5) improvements.push("Build 2-3 more projects to showcase");
    if (!portfolioStats.hasLiveDemo) improvements.push("Deploy your portfolio website");

    // Benchmarks
    if (totalRepos >= 15) benchmarks.junior = "✅ Above average for junior developers";
    else if (totalRepos >= 8) benchmarks.junior = "👍 On track for junior developer level";
    else benchmarks.junior = "⚠️ Below average - add more projects";

    if (totalScore >= 80) benchmarks.portfolio = "✅ Portfolio is job-ready";
    else if (totalScore >= 60) benchmarks.portfolio = "👍 Portfolio needs minor improvements";
    else benchmarks.portfolio = "⚠️ Portfolio needs significant work";

    return { strengths, quickWins, improvements, benchmarks };
  };

  const feedback = generateFeedback();

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

      {/* Strengths */}
      {feedback.strengths.length > 0 && (
        <div className="feedback-section strengths">
          <h3>✅ Your Strengths</h3>
          <ul>
            {feedback.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Wins */}
      {feedback.quickWins.length > 0 && (
        <div className="feedback-section quick-wins">
          <h3>⚡ Quick Wins (1-2 days)</h3>
          <p>These improvements will have the biggest immediate impact:</p>
          <ul>
            {feedback.quickWins.map((win, index) => (
              <li key={index}>{win}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {feedback.improvements.length > 0 && (
        <div className="feedback-section improvements">
          <h3>📈 Recommended Improvements (1-2 weeks)</h3>
          <ul>
            {feedback.improvements.map((improvement, index) => (
              <li key={index}>{improvement}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Benchmarks */}
      <div className="feedback-section benchmarks">
        <h3>📊 How You Compare</h3>
        <div className="benchmark-list">
          <div className="benchmark-item">
            <span className="benchmark-label">GitHub Profile:</span>
            <span className="benchmark-value">{feedback.benchmarks.junior}</span>
          </div>
          <div className="benchmark-item">
            <span className="benchmark-label">Portfolio Quality:</span>
            <span className="benchmark-value">{feedback.benchmarks.portfolio}</span>
          </div>
        </div>
      </div>

      {/* Top Languages */}
      {topLanguages.length > 0 && (
        <div className="feedback-section languages">
          <h3>💻 Your Top Languages</h3>
          <div className="language-list">
            {topLanguages.map(([lang, count]) => (
              <div key={lang} className="language-item">
                <span className="language-name">{lang === "null" ? "No language" : lang}</span>
                <span className="language-count">{count} repos</span>
              </div>
            ))}
          </div>
          <p className="language-note">
            You're using <strong>{uniqueLanguages}</strong> different programming languages
          </p>
        </div>
      )}

      {/* Portfolio Recommendations */}
      {portfolioRecs.length > 0 && (
        <div className="feedback-section portfolio-rec">
          <h3>🎯 Portfolio-Specific Feedback</h3>
          <ul>
            {portfolioRecs.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Plan */}
      <div className="action-plan">
        <h3>📋 Your 30-Day Action Plan</h3>
        <ol>
          {feedback.quickWins.slice(0, 2).map((win, index) => (
            <li key={`quick-${index}`}><strong>Week 1:</strong> {win}</li>
          ))}
          {feedback.improvements.slice(0, 2).map((imp, index) => (
            <li key={`imp-${index}`}><strong>Week 2-3:</strong> {imp}</li>
          ))}
          <li><strong>Week 4:</strong> Review and update your portfolio with new improvements</li>
        </ol>
        <p className="motivation">
          💪 <strong>Next step:</strong> Start with the first quick win today!
        </p>
      </div>
      
    </div>
  );
}

export default ActionableFeedback;