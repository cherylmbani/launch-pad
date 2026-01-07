from flask import Flask, jsonify, request, make_response, session
from models import Repository, User, db, migrate, bcrypt
from flask_cors import CORS
from flask_restful import Api, Resource


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///transactions.db'
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



api.add_resource(Start, '/welcome')
api.add_resource(Signup, '/signup')
api.add_resource(Login, '/login')
api.add_resource(Logout, '/logout')

if __name__ == '__main__':
    app.run(port=5555, debug=True)
