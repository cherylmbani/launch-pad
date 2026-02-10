from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from sqlalchemy import MetaData
from sqlalchemy.orm import validates, relationship
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from datetime import datetime
import re


db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()

convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}
metadata = MetaData(naming_convention=convention)

class Repository(db.Model, SerializerMixin):
    __tablename__="repositories"
    serialize_rules=('-user.repositories',)
    id=db.Column(db.Integer, primary_key=True)
    name=db.Column(db.String, nullable=False)
    description=db.Column(db.Text)
    primary_language=db.Column(db.String, nullable=True)
    stars=db.Column(db.Integer, default=0)
    project_type=db.Column(db.String, nullable=False)
    updated_at=db.Column(db.DateTime, default=datetime.utcnow)
    user_id=db.Column(db.Integer, db.ForeignKey("users.id"))
    user=db.relationship("User", back_populates="repositories")



    @validates('project_type')
    def validate_project_type(self, key, value):
         values=["personal", "forked", "contributed"]
         if value not in values:
              raise ValueError(f"Project type must be one of the {','.join(values)}")
         return value

    def __repr__(self):
         return f"<Repository {self.id} {self.name}>"
    
class User(db.Model, SerializerMixin):
     __tablename__="users"
     serialize_rules=('-repositories.user', '-password_hash', '-posted_projects.client',
        '-project_applications.developer',
        '-team_memberships.developer')
     id=db.Column(db.Integer, primary_key=True)
     first_name=db.Column(db.String, nullable=False)
     last_name=db.Column(db.String, nullable=False)
     github_username=db.Column(db.String)
     email=db.Column(db.String, unique=True, nullable=False)
     password_hash=db.Column(db.Text, nullable=False)
     created_at=db.Column(db.DateTime, default=datetime.utcnow)
     updated_at=db.Column(db.DateTime, default=datetime.utcnow)
     repositories=db.relationship("Repository", back_populates="user")

     posted_projects = db.relationship("Project", back_populates="client", cascade="all, delete-orphan")
     project_applications = db.relationship("ProjectApplication", back_populates="developer", cascade="all, delete-orphan")
     team_memberships = db.relationship("ProjectTeam", back_populates="developer", cascade="all, delete-orphan")

     @property
     def password(self):
          raise AttributeError("Password is write only")
     
     @password.setter
     def password(self, password):
          hashed_password=bcrypt.generate_password_hash(password.encode("utf-8"))
          self.password_hash=hashed_password.decode("utf-8")

     def authenticate(self, password):
          return bcrypt.check_password_hash(self.password_hash, password.encode("utf-8"))
     

     @validates("email")
     def validate_email(self, key, value):
          if not re.match(r"[^@]+@[^@]+\.[^@]+", value):
               raise ValueError("Incorrect email format!")
          return value

     def __repr__(self):
          return f"<User {self.id} {self.first_name} {self.last_name}>"


# phase 2 models

class Project(db.Model, SerializerMixin):
    __tablename__ = "projects"
    
    serialize_rules = ('-client.projects', '-applications.project', '-team_members.project')
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    
    # Budget (in USD)
    budget_min = db.Column(db.Integer, nullable=False) 
    budget_max = db.Column(db.Integer, nullable=False) 
    
    # Timeline (in weeks)
    timeline_weeks = db.Column(db.Integer, nullable=False)
    
    # Project type & difficulty
    project_type = db.Column(db.String(50), nullable=False)  # "individual" or "team"
    difficulty = db.Column(db.String(50), nullable=False)    # "beginner", "intermediate", "advanced"
    
    # Team requirements (if team project)
    team_size_min = db.Column(db.Integer, default=1)
    team_size_max = db.Column(db.Integer, default=1)
    
    # Skills required (comma-separated or JSON)
    skills_required = db.Column(db.String(500), default="")  # "React,Python,JavaScript"
    
    # Status
    status = db.Column(db.String(50), default="open")  # "open", "in_progress", "completed", "cancelled"
    
    # Client who posted the project
    client_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
    # Dates
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    client = db.relationship("User", back_populates="posted_projects")
    applications = db.relationship("ProjectApplication", back_populates="project", cascade="all, delete-orphan")
    team_members = db.relationship("ProjectTeam", back_populates="project", cascade="all, delete-orphan")
    
    @validates('project_type')
    def validate_project_type(self, key, value):
        valid_types = ["individual", "team"]
        if value not in valid_types:
            raise ValueError(f"Project type must be one of: {', '.join(valid_types)}")
        return value
    
    @validates('difficulty')
    def validate_difficulty(self, key, value):
        valid_levels = ["beginner", "intermediate", "advanced"]
        if value not in valid_levels:
            raise ValueError(f"Difficulty must be one of: {', '.join(valid_levels)}")
        return value
    
    @validates('status')
    def validate_status(self, key, value):
        valid_statuses = ["open", "in_progress", "completed", "cancelled"]
        if value not in valid_statuses:
            raise ValueError(f"Status must be one of: {', '.join(valid_statuses)}")
        return value
    
    @validates('budget_min', 'budget_max')
    def validate_budget(self, key, value):
        if value < 0:
            raise ValueError("Budget cannot be negative")
        if key == 'budget_max' and hasattr(self, 'budget_min'):
            if value < self.budget_min:
                raise ValueError("Maximum budget cannot be less than minimum budget")
        return value
    
    def __repr__(self):
        return f"<Project {self.id}: {self.title}>"


class ProjectApplication(db.Model, SerializerMixin):
    __tablename__ = "project_applications"
    
    serialize_rules = ('-project.applications', '-developer.applications')
    
    id = db.Column(db.Integer, primary_key=True)
    proposal = db.Column(db.Text, nullable=False)
    estimated_time = db.Column(db.Integer)  # in weeks
    estimated_cost = db.Column(db.Integer)  # in USD
    status = db.Column(db.String(50), default="pending")  # "pending", "accepted", "rejected"
    
    # Foreign keys
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    developer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
    # Dates
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = db.relationship("Project", back_populates="applications")
    developer = db.relationship("User", back_populates="project_applications")
    
    @validates('status')
    def validate_status(self, key, value):
        valid_statuses = ["pending", "accepted", "rejected"]
        if value not in valid_statuses:
            raise ValueError(f"Status must be one of: {', '.join(valid_statuses)}")
        return value
    
    def __repr__(self):
        return f"<ProjectApplication {self.id} for Project {self.project_id}>"


class ProjectTeam(db.Model, SerializerMixin):
    __tablename__ = "project_teams"
    
    serialize_rules = ('-project.team_members', '-developer.team_memberships')
    
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(100), nullable=False)  # "developer", "designer", "lead", etc.
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign keys
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    developer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
    # Relationships
    project = db.relationship("Project", back_populates="team_members")
    developer = db.relationship("User", back_populates="team_memberships")
    
    def __repr__(self):
        return f"<ProjectTeam {self.id}: {self.developer_id} on {self.project_id}>"