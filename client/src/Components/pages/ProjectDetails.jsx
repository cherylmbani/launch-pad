import React, {useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import "../Styles/ProjectDetails.css";  

function ProjectDetails(){
    const [details, setDetails] = useState(null)
    const {id} = useParams();
    
    useEffect(()=>{
        fetch(`http://127.0.0.1:5555/projects/${id}`)
        .then(res=>res.json())
        .then(data=>{
            setDetails(data)
        })
    }, [id])
    
    return (
        <div className="project-details-container">
            {details ? (
                <div className="project-details-card">
                    <h1 className="project-title">{details.title}</h1>
                    
                    <div className="project-section">
                        <h3 className="section-title">Description</h3>
                        <p className="project-description">{details.description}</p>
                    </div>
                    
                    <div className="project-details-grid">
                        <div className="detail-item">
                            <span className="detail-label">Minimum Budget</span>
                            <span className="detail-value">${details.budget_min}</span>
                        </div>
                        
                        <div className="detail-item">
                            <span className="detail-label">Maximum Budget</span>
                            <span className="detail-value">${details.budget_max}</span>
                        </div>
                        
                        <div className="detail-item">
                            <span className="detail-label">Timeline</span>
                            <span className="detail-value">{details.timeline_weeks} weeks</span>
                        </div>
                        
                        <div className="detail-item">
                            <span className="detail-label">Difficulty</span>
                            <span className={`difficulty-badge ${details.difficulty}`}>
                                {details.difficulty}
                            </span>
                        </div>
                    </div>
                    
                    <div className="skills-section">
                        <h3 className="section-title">Skills Required</h3>
                        <div className="skills-list">
                            {details.skills_required?.map(skill => (
                                <span key={skill} className="skill-tag">{skill}</span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="action-buttons">
                        <button className="back-btn" onClick={() => window.history.back()}>
                            ← Back to Projects
                        </button>
                    </div>
                </div>
            ):(
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Loading project details...</p>
                </div>
            )}
        </div>
    )
}
export default ProjectDetails;