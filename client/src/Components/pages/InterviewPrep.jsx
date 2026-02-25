import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/InterviewPrep.css";

function InterviewPrep() {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState("general");

    // Sample interview questions by category
    const questionCategories = {
        general: [
            "Tell me about yourself",
            "What are your greatest strengths?",
            "What are your weaknesses?",
            "Why do you want to work here?",
            "Where do you see yourself in 5 years?"
        ],
        behavioral: [
            "Tell me about a time you faced a challenge at work",
            "Describe a situation where you worked in a team",
            "Give an example of a goal you achieved",
            "Tell me about a time you failed",
            "Describe a conflict and how you resolved it"
        ],
        technical: [
            "Explain a project you're proud of",
            "How do you stay updated with new technologies?",
            "Describe your development process",
            "How do you debug complex issues?",
            "What's your favorite programming language and why?"
        ]
    };

    const handleStartPractice = (question) => {
        // Save the question to practice
        navigate("/interview-prep/practice", { 
            state: { question } 
        });
    };

    return (
        <div className="interview-prep-container">
            <div className="interview-prep-header">
                <h1>Interview Preparation Suite</h1>
                <p>Practice with real interview questions, record your answers, and get AI feedback</p>
            </div>

            {/* Category Selection */}
            <div className="category-tabs">
                <button 
                    className={selectedCategory === "general" ? "active" : ""}
                    onClick={() => setSelectedCategory("general")}
                >
                    General Questions
                </button>
                <button 
                    className={selectedCategory === "behavioral" ? "active" : ""}
                    onClick={() => setSelectedCategory("behavioral")}
                >
                    Behavioral Questions
                </button>
                <button 
                    className={selectedCategory === "technical" ? "active" : ""}
                    onClick={() => setSelectedCategory("technical")}
                >
                    Technical Questions
                </button>
            </div>

            {/* Questions List */}
            <div className="questions-grid">
                {questionCategories[selectedCategory].map((question, index) => (
                    <div key={index} className="question-card">
                        <div className="question-number">Question {index + 1}</div>
                        <div className="question-text">{question}</div>
                        <button 
                            className="practice-btn"
                            onClick={() => handleStartPractice(question)}
                        >
                            Practice This Question →
                        </button>
                    </div>
                ))}
            </div>

            {/* Tips Section */}
            <div className="interview-tips">
                <h3>💡 Tips for Great Interviews</h3>
                <div className="tips-grid">
                    <div className="tip-card">
                        <span className="tip-icon"></span>
                        <h4>STAR Method</h4>
                        <p>Situation, Task, Action, Result - structure your answers</p>
                    </div>
                    <div className="tip-card">
                        <span className="tip-icon">⏱️</span>
                        <h4>30-90 Seconds</h4>
                        <p>Keep answers concise and impactful</p>
                    </div>
                    <div className="tip-card">
                        <span className="tip-icon">🎥</span>
                        <h4>Eye Contact</h4>
                        <p>Look at the camera, not yourself</p>
                    </div>
                    <div className="tip-card">
                        <span className="tip-icon">🤫</span>
                        <h4>Avoid Fillers</h4>
                        <p>Minimize "um", "uh", "like"</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InterviewPrep;