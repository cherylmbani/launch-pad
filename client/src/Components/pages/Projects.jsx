import React, { useState, useEffect } from 'react';
import "../Styles/Projects.css";
import { useNavigate } from 'react-router-dom';

function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        difficulty: '',
        project_type: '',
        min_budget: '',
        max_budget: ''
    });
    const navigate=useNavigate();

    useEffect(() => {
        fetchProjects();
    }, [filters]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://127.0.0.1:5555/projects');
            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }
            const data = await response.json();
            setProjects(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            difficulty: '',
            project_type: '',
            min_budget: '',
            max_budget: ''
        });
    };

    // Filter projects
    const filteredProjects = projects.filter(project => {
        if (filters.difficulty && project.difficulty !== filters.difficulty) return false;
        if (filters.project_type && project.project_type !== filters.project_type) return false;
        if (filters.min_budget && project.budget_min < parseInt(filters.min_budget)) return false;
        if (filters.max_budget && project.budget_max > parseInt(filters.max_budget)) return false;
        return true;
    });

    if (loading) {
        return (
            <div className="projects-loading">
                <h2>Loading available projects...</h2>
                <p>Finding the best opportunities for you</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="projects-error">
                <h2>Error loading projects</h2>
                <p>{error}</p>
                <button onClick={fetchProjects}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="projects-container">
            <div className="projects-header">
                <h1>🎯 Available Projects</h1>
                <p>Find real projects to build your experience and portfolio</p>
            </div>

            {/* Filters */}
            <div className="projects-filters">
                <h3>🔍 Filter Projects</h3>
                <div className="filter-grid">
                    <div className="filter-group">
                        <label>Difficulty</label>
                        <select 
                            name="difficulty" 
                            value={filters.difficulty}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Levels</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Project Type</label>
                        <select 
                            name="project_type" 
                            value={filters.project_type}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Types</option>
                            <option value="individual">Individual</option>
                            <option value="team">Team</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Min Budget ($)</label>
                        <input
                            type="number"
                            name="min_budget"
                            placeholder="Min"
                            value={filters.min_budget}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div className="filter-group">
                        <label>Max Budget ($)</label>
                        <input
                            type="number"
                            name="max_budget"
                            placeholder="Max"
                            value={filters.max_budget}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <button className="clear-filters" onClick={clearFilters}>
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="projects-grid">
                {filteredProjects.length === 0 ? (
                    <div className="no-projects">
                        <h3>No projects match your filters</h3>
                        <p>Try changing your filter criteria or check back later</p>
                    </div>
                ) : (
                    filteredProjects.map(project => (
                        <div key={project.id} className="project-card">
                            <div className="project-header">
                                <h3>{project.title}</h3>
                                <span className={`project-badge ${project.difficulty}`}>
                                    {project.difficulty}
                                </span>
                            </div>
                            
                            <p className="project-description">{project.short_description}</p>
                            
                            <div className="project-details">
                                <div className="detail-item">
                                    <span className="detail-label">Budget</span>
                                    <span className="detail-value">
                                        ${project.budget_min} - ${project.budget_max}
                                    </span>
                                </div>
                                
                                <div className="detail-item">
                                    <span className="detail-label">Timeline</span>
                                    <span className="detail-value">{project.timeline_weeks} weeks</span>
                                </div>
                                
                                <div className="detail-item">
                                    <span className="detail-label">Type</span>
                                    <span className="detail-value">{project.project_type}</span>
                                </div>
                                
                                <div className="detail-item">
                                    <span className="detail-label">Applications</span>
                                    <span className="detail-value">{project.applications_count}</span>
                                </div>
                            </div>
                            
                            <div className="project-skills">
                                <strong>Skills:</strong>
                                {project.skills_required.map(skill => (
                                    <span key={skill} className="skill-tag">{skill}</span>
                                ))}
                            </div>
                            
                            <div className="project-actions">
                                <button 
                                    className="view-project-btn"
                                    onClick={() => navigate(`/project/${project.id}`)}
                                >
                                    View Details
                                </button>
                                
                                <button 
                                    className="apply-btn"
                                    onClick={() => navigate(`/project/${project.id}/apply`)}
                                >
                                    Apply Now
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Stats */}
            <div className="projects-stats">
                <div className="stat-card">
                    <h3>{projects.length}</h3>
                    <p>Total Projects</p>
                </div>
                <div className="stat-card">
                    <h3>{filteredProjects.length}</h3>
                    <p>Filtered Projects</p>
                </div>
                <div className="stat-card">
                    <h3>
                        {Math.round(projects.reduce((acc, p) => acc + p.budget_min, 0) / projects.length) || 0}
                    </h3>
                    <p>Avg. Budget</p>
                </div>
            </div>
        </div>
    );
}

export default Projects;