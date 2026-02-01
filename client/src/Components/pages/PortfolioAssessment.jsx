
import React, { useState, useEffect } from 'react';
import "../Styles/PortfolioAssessment.css";

function PortfolioAssessment({ repos }) {
  console.log("📦 All repos received:", repos?.length);
  
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portfolioRepo, setPortfolioRepo] = useState(null);

  useEffect(() => {
    console.log("🔍 Looking for portfolio repository...");
    
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

    // Find portfolio repo (case-insensitive search)
    const portfolioKeywords = ['portfolio', 'personal-site', 'my-website', 'cv', 'resume', 'cherylmbani'];
    
    const foundPortfolio = repos.find(repo => {
      const repoName = repo.name?.toLowerCase() || '';
      const repoDesc = repo.description?.toLowerCase() || '';
      
      return portfolioKeywords.some(keyword => 
        repoName.includes(keyword) || 
        repoDesc.includes(keyword)
      );
    });

    console.log("🎯 Found portfolio repo:", foundPortfolio);

    if (!foundPortfolio) {
      console.log("❌ No portfolio repo found");
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
        recommendations: [
          'Create a portfolio repository on GitHub',
          'Name it something like "portfolio", "personal-website", or include "cherylmbani"'
        ]
      });
      setLoading(false);
      return;
    }

    setPortfolioRepo(foundPortfolio);
    
    // Analyze ONLY the portfolio repo
    const analyzePortfolioRepo = (repo) => {
      console.log("📊 Analyzing portfolio repo:", repo.name);
      
      // Scoring criteria for portfolio repo
      let score = 0;
      let recommendations = [];
      
      // 1. Has description? (20 points)
      const hasDescription = repo.description && repo.description.length > 20;
      if (hasDescription) score += 20;
      else recommendations.push('Add a detailed description to your portfolio repo');
      
      // 2. Has live demo/website? (40 points)
      // Check for: GitHub Pages, homepage, or Netlify/Vercel URL in description
      const deploymentPlatforms = [
        'netlify.app',
        'vercel.app', 
        'github.io',
        'herokuapp.com',
        'firebaseapp.com',
        'render.com',
        'cherylmbani.netlify.app' // Your specific URL
      ];
      
      const hasLiveDemo = repo.has_pages || 
                         repo.homepage || 
                         deploymentPlatforms.some(platform => 
                           repo.description?.toLowerCase().includes(platform.toLowerCase())
                         );
      
      if (hasLiveDemo) {
        score += 40;
        // Check if it's YOUR portfolio URL
        if (repo.description?.toLowerCase().includes('cherylmbani')) {
          score += 10; // Bonus for personal domain
        }
      } else {
        recommendations.push('Add deployment URL to your portfolio repo description');
        recommendations.push('Example: "Deployed at https://cherylmbani.netlify.app"');
      }
      
      // 3. Shows multiple projects in description? (20 points)
      const projectKeywords = ['project', 'demo', 'live', 'deployed', 'showcase'];
      const showsMultipleProjects = projectKeywords.some(keyword => 
        repo.description?.toLowerCase().includes(keyword)
      );
      
      if (showsMultipleProjects) score += 20;
      else recommendations.push('Mention your projects in the repo description');
      
      // 4. Technologies used (10 points)
      const hasTech = repo.language && repo.language !== 'Unknown';
      if (hasTech) score += 10;
      
      // 5. Recent updates (10 points)
      if (repo.updated_at) {
        const updatedDate = new Date(repo.updated_at);
        const now = new Date();
        const monthsDiff = (now - updatedDate) / (1000 * 60 * 60 * 24 * 30);
        if (monthsDiff < 6) score += 10;
        else recommendations.push('Keep your portfolio updated regularly');
      }
      
      // Calculate stats
      const stats = {
        hasPortfolio: true,
        repoName: repo.name,
        hasDescription: hasDescription,
        hasLiveDemo: hasLiveDemo,
        showsProjects: showsMultipleProjects,
        lastUpdated: repo.updated_at || 'Unknown',
        stars: repo.stargazers_count || 0,
        descriptionLength: repo.description?.length || 0,
        deploymentType: repo.has_pages ? 'GitHub Pages' : 
                       repo.homepage ? 'Custom Domain' :
                       repo.description?.includes('netlify') ? 'Netlify' :
                       repo.description?.includes('vercel') ? 'Vercel' : 'Unknown'
      };
      
      // Ensure score doesn't exceed 100
      score = Math.min(score, 100);
      
      // Add general recommendations
      if (score < 60) {
        recommendations.push('Your portfolio needs improvement for job applications');
      }
      if (score >= 80) {
        recommendations.push('Great portfolio! It should impress employers');
      }
      
      return {
        totalScore: score,
        completeness: hasDescription ? 10 : 3,
        codeQuality: hasTech ? 8 : 4,
        bestPractices: repo.updated_at ? 7 : 3,
        presentation: hasLiveDemo ? 10 : 2,
        stats,
        recommendations: recommendations.length > 0 ? recommendations : ['Your portfolio looks good!']
      };
    };
    
    const result = analyzePortfolioRepo(foundPortfolio);
    setAssessment(result);
    setLoading(false);
    
  }, [repos]);

  if (loading || !assessment) {
    return (
      <div className="portfolio-assessment loading">
        <h2>🔍 Looking for your portfolio...</h2>
        <p>Checking {repos?.length || 0} repositories</p>
      </div>
    );
  }

  const stats = assessment.stats || {
    hasPortfolio: false,
    repoName: 'Not found'
  };

  // Get username for GitHub link
  const user = JSON.parse(localStorage.getItem("user"));
  const githubUsername = user?.github_username || 'your-username';

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
            {stats.deploymentType && stats.deploymentType !== 'Unknown' && (
              <div className="detail-card">
                <span className="detail-label">Deployment</span>
                <span className="detail-value">🚀 {stats.deploymentType}</span>
              </div>
            )}
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
          <p>We couldn't find a repository named "portfolio", "personal-website", or containing "cherylmbani".</p>
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
      
      {portfolioRepo && (
        <div className="repo-links">
          <a 
            href={`https://github.com/${githubUsername}/${portfolioRepo.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
          >
            🔗 View on GitHub
          </a>
          
          {/* Show deployment link if we detect one */}
          {(portfolioRepo.homepage || portfolioRepo.description?.includes('cherylmbani.netlify.app')) && (
            <a 
              href={portfolioRepo.homepage || "https://cherylmbani.netlify.app"}
              target="_blank"
              rel="noopener noreferrer"
              className="deployment-link"
            >
              🌐 Visit Live Website
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default PortfolioAssessment;