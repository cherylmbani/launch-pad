# seed_projects.py
from app import app, db
from models import User, Project
from datetime import datetime

def seed_projects():
    with app.app_context():
        # Get or create a test client
        client = User.query.filter_by(email="client@example.com").first()
        if not client:
            client = User(
                first_name="Test",
                last_name="Client",
                email="client@example.com",
                github_username="testclient",
                password="password123"
            )
            db.session.add(client)
            db.session.commit()
        
        # Sample projects
        sample_projects = [
            {
                "title": "Build a Portfolio Website",
                "description": "Need a simple portfolio website to showcase my projects. Should include About, Projects, and Contact sections.",
                "budget_min": 300,
                "budget_max": 600,
                "timeline_weeks": 2,
                "project_type": "individual",
                "difficulty": "beginner",
                "skills_required": "HTML,CSS,JavaScript",
                "client_id": client.id
            },
            {
                "title": "E-commerce Dashboard",
                "description": "Create an admin dashboard for an e-commerce store. Should display sales analytics, product management, and user management.",
                "budget_min": 800,
                "budget_max": 1500,
                "timeline_weeks": 4,
                "project_type": "individual",
                "difficulty": "intermediate",
                "skills_required": "React,Node.js,MongoDB",
                "client_id": client.id
            },
            {
                "title": "Weather App API",
                "description": "Build a REST API for a weather application that fetches data from OpenWeatherMap and provides endpoints for current weather and forecasts.",
                "budget_min": 500,
                "budget_max": 1000,
                "timeline_weeks": 3,
                "project_type": "individual",
                "difficulty": "beginner",
                "skills_required": "Python,Flask,API",
                "client_id": client.id
            },
            {
                "title": "Task Management System",
                "description": "Full-stack task management application with user authentication, task categorization, and real-time updates.",
                "budget_min": 1500,
                "budget_max": 3000,
                "timeline_weeks": 6,
                "project_type": "team",
                "team_size_min": 2,
                "team_size_max": 3,
                "difficulty": "advanced",
                "skills_required": "React,Express,PostgreSQL,Socket.io",
                "client_id": client.id
            }
        ]
        
        for project_data in sample_projects:
            project = Project(**project_data)
            db.session.add(project)
        
        db.session.commit()
        print(f"✅ Seeded {len(sample_projects)} sample projects")

if __name__ == "__main__":
    seed_projects()