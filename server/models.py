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
     serialize_rules=('-repositories.user', '-password_hash')
     id=db.Column(db.Integer, primary_key=True)
     first_name=db.Column(db.String, nullable=False)
     last_name=db.Column(db.String, nullable=False)
     github_username=db.Column(db.String)
     email=db.Column(db.String, unique=True, nullable=False)
     password_hash=db.Column(db.Text, nullable=False)
     created_at=db.Column(db.DateTime, default=datetime.utcnow)
     updated_at=db.Column(db.DateTime, default=datetime.utcnow)
     repositories=db.relationship("Repository", back_populates="user")

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

