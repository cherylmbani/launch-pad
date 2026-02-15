import React, {useState} from "react";
import { useParams } from "react-router-dom";
import "../Styles/ProjectForm.css";


function ProjectForm(){
    const { id } = useParams();
    const [formData, setFormData] = useState({
        proposal: "",
        estimated_time: "",
        estimated_cost: ""
    });

    function handleSubmit(e) {
        e.preventDefault();
        
        
        const submitData = {
            ...formData,
            estimated_time: formData.estimated_time ? Number(formData.estimated_time) : null,
            estimated_cost: formData.estimated_cost ? Number(formData.estimated_cost) : null
        };

        fetch(`http://127.0.0.1:5555/projects/${id}/apply`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(submitData)
        })
        .then(res => res.json())
        .then(data => {
            console.log("Application submitted:", data);
        
        })
        .catch(err => console.log("Error:", err));
    }

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    return (
        <div className="apply-form-container">
            <h2>Apply for Project</h2>
            <form onSubmit={handleSubmit}>
                
                
                <div className="form-group">
                    <label htmlFor="proposal">
                        Your Proposal <span className="required">*</span>
                    </label>
                    <textarea
                        id="proposal"
                        name="proposal"
                        value={formData.proposal}
                        onChange={handleChange}
                        rows="6"
                        required
                        placeholder="Explain why you're perfect for this project. Mention your relevant experience, skills, and approach..."
                    />
                </div>

                
                <div className="form-group">
                    <label htmlFor="estimated_time">
                        Estimated Time (in weeks) <span className="optional">(optional)</span>
                    </label>
                    <input 
                        type="number" 
                        id="estimated_time"
                        name="estimated_time"
                        value={formData.estimated_time}
                        onChange={handleChange}
                        min="1"
                        max="52"
                        placeholder="e.g., 3"
                    />
                    <small className="hint">How many weeks do you think this will take?</small>
                </div>

                
                <div className="form-group">
                    <label htmlFor="estimated_cost">
                        Estimated Cost ($USD) <span className="optional">(optional)</span>
                    </label>
                    <input 
                        type="number" 
                        id="estimated_cost"
                        name="estimated_cost"
                        value={formData.estimated_cost}
                        onChange={handleChange}
                        min="0"
                        step="100"
                        placeholder="e.g., 500"
                    />
                    <small className="hint">Your proposed budget for this project</small>
                </div>

                <button type="submit" className="submit-btn">
                    Submit Application
                </button>
            </form>
        </div>
    );
}

export default ProjectForm;