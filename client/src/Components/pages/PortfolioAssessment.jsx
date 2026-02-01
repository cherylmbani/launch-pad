
import React, { useState, useEffect } from 'react';
import "../Styles/PortfolioAssessment.css";

function PortfolioAssessment({ repos, username }) {
  console.log("📦 Analyzing for user:", username);
  
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portfolioRepo, setPortfolioRepo] = useState(null);

  useEffect(() => {
    console.log("🔍 Looking for portfolio repositories...");
    
    if (!repos || repos.length === 0) {
      console.log("⚠️ No repos to analyze");
      setAssessment({
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
        recommendations: ['No repositories found']
      });
      setLoading(false);
      return;
    }

    // GENERIC: Find portfolio repos for ANY user
    const portfolioKeywords = [
      'portfolio', 'personal', 'website', 'cv', 'resume', 
      'showcase', 'projects', 'me', 'homepage', 'site'
    ];
    
    // Find ALL potential portfolio repos
    const potentialPortfolios = repos.filter(repo => {
      const repoName = repo.name?.toLowerCase() || '';
      const repoDesc = repo.description?.toLowerCase() || '';
      const combined = `${repoName} ${repoDesc}`;
      
      // Check for portfolio indicators
      const hasPortfolioKeyword = portfolioKeywords.some(keyword => 
        combined.includes(keyword)
      );
      
      // Also check if repo name matches username (common pattern: username.github.io)
      const matchesUsername = username && repoName.includes(username.toLowerCase());
      
      return hasPortfolioKeyword || matchesUsername;
    });

    console.log("🎯 Potential portfolio repos:", potentialPortfolios.length);

    if (potentialPortfolios.length === 0) {
      console.log("❌ No portfolio repo found");
      setAssessment({
        totalScore: 0,
        completeness: 0,
        codeQuality: 0,
        bestPractices: 0,
        presentation: 0,
        stats: {
          hasPortfolio: false,
          repoCount: 0,
          hasDescription: false,
          hasLiveDemo: false,
          showsProjects: false
        },
        recommendations: [
          'Create a portfolio repository on GitHub',
          'Name it something like "portfolio", "personal-website", or include your username',
          'Add a description mentioning your projects and skills'
        ]
      });
      setLoading(false);
      return;
    }

    // Take the best candidate (prioritize repos with descriptions)
    const foundPortfolio = potentialPortfolios.sort((a, b) => {
      // Sort by: has description, has live demo, name matches username
      const scoreA = (a.description ? 100 : 0) + (a.has_pages || a.homepage ? 50 : 0);
      const scoreB = (b.description ? 100 : 0) + (b.has_pages || b.homepage ? 50 : 0);
      return scoreB - scoreA;
    })[0];

    setPortfolioRepo(foundPortfolio);
    
    // Generic analysis for ANY user's portfolio
    const analyzePortfolioRepo = (repo) => {
      console.log("📊 Analyzing portfolio repo:", repo.name);
      
      // Scoring criteria (generic for all users)
      let score = 0;
      let recommendations = [];
      
      // 1. Has description? (25 points)
      const hasDescription = repo.description && repo.description.length > 10;
      if (hasDescription) {
        score += 25;
        // Bonus for longer descriptions
        if (repo.description.length > 50) score += 5;
      } else {
        recommendations.push('Add a description to your portfolio repository');
      }
      
      // 2. Has live demo/website? (40 points)
      const deploymentPlatforms = [
        'netlify.app', 'vercel.app', 'github.io', 'herokuapp.com',
        'firebaseapp.com', 'render.com', 'pages.dev'
      ];
      
      const hasLiveDemo = repo.has_pages || repo.homepage || 
        deploymentPlatforms.some(platform => 
          repo.description?.toLowerCase().includes(platform)
        );
      
      if (hasLiveDemo) {
        score += 40;
        if (repo.has_pages) {
          recommendations.push('✅ GitHub Pages enabled - great for portfolio!');
        }
      } else {
        recommendations.push('Deploy your portfolio using GitHub Pages, Netlify, or Vercel');
        recommendations.push('Add the deployment URL to your repo description');
      }
      
      // 3. Shows projects or skills? (20 points)
      const projectKeywords = ['project', 'demo', 'live', 'deployed', 'showcase', 'skill', 'experience'];
      const showsProjects = projectKeywords.some(keyword => 
        repo.description?.toLowerCase().includes(keyword)
      );
      
      if (showsProjects) {
        score += 20;
      } else if (hasDescription) {
        recommendations.push('Mention your projects, skills, or experience in the description');
      }
      
      // 4. Technologies used (10 points)
      const hasTech = repo.language && repo.language !== 'Unknown';
      if (hasTech) score += 10;
      
      // 5. Recent updates (5 points)
      if (repo.updated_at) {
        const updatedDate = new Date(repo.updated_at);
        const now = new Date();
        const monthsDiff = (now - updatedDate) / (1000 * 60 * 60 * 24 * 30);
        if (monthsDiff < 6) score += 5;
        else if (monthsDiff < 12) score += 3;
      }
      
      // Detect deployment platform
      let deploymentType = 'Not deployed';
      if (repo.has_pages) deploymentType = 'GitHub Pages';
      else if (repo.homepage) deploymentType = 'Custom Domain';
      else if (repo.description?.includes('netlify')) deploymentType = 'Netlify';
      else if (repo.description?.includes('vercel')) deploymentType = 'Vercel';
      else if (repo.description?.includes('heroku')) deploymentType = 'Heroku';
      
      // Calculate stats
      const stats = {
        hasPortfolio: true,
        repoName: repo.name,
        hasDescription: hasDescription,
        hasLiveDemo: hasLiveDemo,
        showsProjects: showsProjects,
        lastUpdated: repo.updated_at || 'Unknown',
        stars: repo.stargazers_count || 0,
        descriptionLength: repo.description?.length || 0,
        deploymentType: deploymentType,
        isGitHubPages: repo.has_pages || false
      };
      
      // Ensure score doesn't exceed 100
      score = Math.min(score, 100);
      
      // Add score-based feedback
      if (score >= 80) {
        recommendations.push('🎯 Excellent portfolio! Ready for job applications');
      } else if (score >= 60) {
        recommendations.push('👍 Good start, but could be improved');
      } else if (score >= 40) {
        recommendations.push('⚠️ Needs significant improvement for job applications');
      } else {
        recommendations.push('🚨 Major improvements needed');
      }
      
      // Add platform-specific recommendations
      if (!repo.has_pages && !repo.homepage) {
        recommendations.push('💡 Enable GitHub Pages in repository settings');
      }
      
      return {
        totalScore: score,
        completeness: hasDescription ? (repo.description.length > 50 ? 10 : 8) : 3,
        codeQuality: hasTech ? 8 : 4,
        bestPractices: repo.updated_at ? 7 : 3,
        presentation: hasLiveDemo ? 10 : 2,
        stats,
        recommendations: recommendations.length > 0 ? recommendations : ['✅ Your portfolio looks good!']
      };
    };
    
    const result = analyzePortfolioRepo(foundPortfolio);
    setAssessment(result);
    setLoading(false);
    
  }, [repos, username]);

  if (loading || !assessment) {
    return (
      <div className="portfolio-assessment loading">
        <h2>🔍 Analyzing Portfolio...</h2>
        <p>Checking {repos?.length || 0} repositories for {username || 'user'}</p>
      </div>
    );
  }

  const stats = assessment.stats || {
    hasPortfolio: false,
    repoName: 'Not found'
  };

  return (
    <div className="portfolio-assessment">
      <h2>🎯 Portfolio Analysis</h2>
      
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
                 assessment.totalScore >= 40 ? 'Needs work ⚠️' : 
                 'Requires major improvements 🚨'}
              </p>
            </div>
          </div>
          
          <div className="portfolio-details">
            <div className="detail-card">
              <span className="detail-label">Portfolio Website</span>
              <span className="detail-value">
                {stats.hasLiveDemo ? '✅ Deployed' : '❌ Not deployed'}
                {stats.deploymentType !== 'Not deployed' && ` (${stats.deploymentType})`}
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
            {stats.isGitHubPages && (
              <div className="detail-card highlight">
                <span className="detail-label">GitHub Pages</span>
                <span className="detail-value">🚀 Enabled</span>
              </div>
            )}
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
          <div className="portfolio-tips">
            <h4>💡 Tips for creating a portfolio:</h4>
            <ul>
              <li>Create a repository named "portfolio", "my-website", or "[username].github.io"</li>
              <li>Add a description mentioning your projects and skills</li>
              <li>Enable GitHub Pages in repository settings</li>
              <li>Include links to live project demos</li>
            </ul>
          </div>
        </div>
      )}
      
      <div className="recommendations">
        <h3>📋 Recommendations</h3>
        <ul>
          {assessment.recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>
      
      {portfolioRepo && username && (
        <div className="repo-links">
          <a 
            href={`https://github.com/${username}/${portfolioRepo.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
          >
            🔗 View on GitHub
          </a>
          
          {portfolioRepo.homepage && (
            <a 
              href={portfolioRepo.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="deployment-link"
            >
              🌐 Visit Live Website
            </a>
          )}
          
          {stats.isGitHubPages && !portfolioRepo.homepage && (
            <a 
              href={`https://${username}.github.io/${portfolioRepo.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="deployment-link"
            >
              🌐 Visit GitHub Pages
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default PortfolioAssessment;