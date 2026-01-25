
import React, { useState, useEffect } from 'react';
import "../Styles/PortfolioAssessment.css";

function PortfolioAssessment({ repos }) {
  console.log("📦 PortfolioAssessment received repos:", repos);
  
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔍 Analyzing portfolio...");
    
    if (!repos || repos.length === 0) {
      console.log("⚠️ No repos to analyze");
      setAssessment({
        totalScore: 0,
        completeness: 0,
        codeQuality: 0,
        bestPractices: 0,
        presentation: 0,
        stats: {
          totalRepos: 0,
          reposWithDescription: 0,
          reposWithLiveDemo: 0,
          uniqueLanguages: 0,
          recentlyUpdated: 0
        },
        recommendations: ['No repositories to analyze']
      });
      setLoading(false);
      return;
    }

    // Simple analysis
    const hasDescription = repos.filter(r => r.description && r.description.length > 10).length;
    const hasLiveDemo = repos.filter(r => r.has_pages || r.homepage).length;
    const languages = new Set(repos.map(r => r.language).filter(Boolean));
    
    const completeness = Math.round((hasDescription / repos.length) * 10);
    const codeQuality = Math.min(10, languages.size * 2);
    const totalScore = Math.round((completeness + codeQuality) / 2);

    const recommendations = [];
    if (hasLiveDemo === 0) recommendations.push('Add live demos to your projects');
    if (languages.size < 2) recommendations.push('Diversify your technology stack');

    setAssessment({
      totalScore,
      completeness,
      codeQuality,
      bestPractices: 5, // Placeholder
      presentation: Math.round((hasLiveDemo / repos.length) * 10),
      stats: {
        totalRepos: repos.length,
        reposWithDescription: hasDescription,
        reposWithLiveDemo: hasLiveDemo,
        uniqueLanguages: languages.size,
        recentlyUpdated: Math.floor(repos.length / 2) // Placeholder
      },
      recommendations
    });
    
    console.log("✅ Analysis complete:", assessment);
    setLoading(false);
  }, [repos]);

  if (loading || !assessment) {
    return (
      <div className="portfolio-assessment loading">
        <h2>📊 Analyzing Portfolio Quality...</h2>
        <p>Evaluating {repos?.length || 0} repositories</p>
      </div>
    );
  }

  // Safe access to stats
  const stats = assessment.stats || {
    totalRepos: 0,
    reposWithDescription: 0,
    reposWithLiveDemo: 0,
    uniqueLanguages: 0,
    recentlyUpdated: 0
  };

  return (
    <div className="portfolio-assessment" style={{border: "3px solid green", padding: "20px"}}>
      <h2>📊 Portfolio Assessment (WORKING!)</h2>
      
      <div className="score-card">
        <div className="total-score">
          <h3>Portfolio Health Score</h3>
          <div className="score-circle">
            <span className="score-number">{assessment.totalScore}/10</span>
          </div>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Total Repos</span>
          <span className="stat-value">{stats.totalRepos}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">With Descriptions</span>
          <span className="stat-value">{stats.reposWithDescription}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Live Demos</span>
          <span className="stat-value">{stats.reposWithLiveDemo}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Languages</span>
          <span className="stat-value">{stats.uniqueLanguages}</span>
        </div>
      </div>
      
      <div className="recommendations">
        <h3>📋 Recommendations</h3>
        <ul>
          {assessment.recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>
      
      <button className="improve-button" onClick={() => alert('Detailed analysis coming soon!')}>
        View Improvement Plan
      </button>
    </div>
  );
}

export default PortfolioAssessment;