from flask import Flask, jsonify, request, make_response, session
from models import Repository, User, db, migrate, bcrypt
from flask_cors import CORS
from flask_restful import Api, Resource
import requests


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///lauchpad.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["SECRET_KEY"] = "super_secret"
app.json.compact = False

CORS(app)

db.init_app(app)
migrate.init_app(app, db)
bcrypt.init_app(app)
api = Api(app)

class Start(Resource):
    def get(self):
        response={"message": "Hello Launchpad"}
        return response, 200
    
class Signup(Resource):
    def post(self):

        data=request.get_json()
        existing_user=User.query.filter_by(email=data['email']).first()
        if existing_user:
            return {"error": " Email already exists!"}, 400
        new_user=User(
            first_name=data['first_name'],
            last_name=data['last_name'],
            github_username=data['github_username'],
            email=data['email'],
            password=data['password']

        )
        
        db.session.add(new_user)
        db.session.commit()
        new_user_dict=new_user.to_dict()
        response_body=make_response(new_user_dict, 201)
        return response_body

class Login(Resource):
    def post(self):
        data=request.get_json()
        if not data:
            return {'error': 'Please fill in all the fields'}
        email=data['email']
        password=data['password']
        if not email or not password:
            return {'error': 'Both email and password required'}, 404
        user=User.query.filter_by(email=email).first()
        if user and user.authenticate(password):
            session['user_id']=user.id
            user_dict=user.to_dict()
            response=make_response(user_dict, 200)
            return response
        else:
            response_body={"error":"Invalid email or password"}
            return response_body, 400

class Logout(Resource):
    def post(self):
        session.pop('user_id', None)
        response_body={'message': "Logged out successfully!"}
        response=make_response(response_body, 200)
        return response

class GithubAnalysis(Resource):
    def post(self):
        try:
            data = request.get_json()
            github_username = data.get('github_username')
            
            if not github_username:
                return {'error': "GitHub username is required"}, 400
            
            # Get current user (for now, use a test user)
            test_user = User.query.first()  # Get first user in database
            if not test_user:
                return {'error': "No user found. Sign up first."}, 400
            
            url = f"https://api.github.com/users/{github_username}/repos"
            response = requests.get(url)
            
            if response.status_code != 200:
                return {'error': f"GitHub API error: {response.status_code}"}, response.status_code
            
            repos = response.json()
            
            # Save repos to database and format for response
            saved_count = 0
            formatted_repos = []  # This will be sent to frontend
            
            for repo in repos: 
                # Skip if repo already exists
                existing = Repository.query.filter_by(
                    name=repo.get('name'), 
                    user_id=test_user.id
                ).first()
                
                if not existing:
                    new_repo = Repository(
                        name=repo.get('name', 'No Name'),
                        description=repo.get('description', ''),
                        primary_language=repo.get('language', 'Unknown'),
                        stars=repo.get('stargazers_count', 0),
                        project_type='personal',  # Simple for now
                        user_id=test_user.id
                    )
                    db.session.add(new_repo)
                    saved_count += 1
                
                # Format repo data for frontend response
                formatted_repos.append({
                    'name': repo.get('name', 'No Name'),
                    'description': repo.get('description', ''),
                    'language': repo.get('language'),
                    'has_pages': repo.get('has_pages', False),
                    'homepage': repo.get('homepage'),
                    'updated_at': repo.get('updated_at'),
                    'stargazers_count': repo.get('stargazers_count', 0),
                    'fork': repo.get('fork', False)
                })
            
            db.session.commit()
            
            # Calculate language statistics
            language_stats = {}
            for repo in repos:
                lang = repo.get('language')
                if lang:
                    language_stats[lang] = language_stats.get(lang, 0) + 1
                else:
                    language_stats['No language'] = language_stats.get('No language', 0) + 1

            # Find most used language
            if language_stats:
                most_used = max(language_stats.items(), key=lambda x: x[1])
            else:
                most_used = ("None", 0)
            
            return {
                "username": github_username,
                "total_repos_fetched": len(repos),
                "repos_saved": saved_count,
                "language_stats": language_stats,
                "most_used_language": most_used[0],
                "repos": formatted_repos,  # ← THIS IS THE CRITICAL LINE
                "message": f"Successfully saved {saved_count} repositories to database"
            }, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
        
class UserRepositories(Resource):
    def get(self):
        # For now, get all repos (later we'll filter by user)
        repos = Repository.query.all()
        
        repos_data = []
        for repo in repos:
            repos_data.append({
                'id': repo.id,
                'name': repo.name,
                'description': repo.description,
                'language': repo.primary_language,
                'stars': repo.stars,
                'type': repo.project_type,
                'updated_at': repo.updated_at.isoformat() if repo.updated_at else None
            })
        
        return {
            'total_repositories': len(repos_data),
            'repositories': repos_data
        }, 200
    

api.add_resource(Start, '/welcome')
api.add_resource(Signup, '/signup')
api.add_resource(Login, '/login')
api.add_resource(Logout, '/logout')
api.add_resource(GithubAnalysis, '/githubanalysis')
api.add_resource(UserRepositories, '/user/repositories')

if __name__ == '__main__':
    app.run(port=5555, debug=True)