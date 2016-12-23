from flask import Flask, Blueprint, request, jsonify, make_response, render_template
from marshmallow_jsonapi import Schema, fields
from flask_restful import Api, Resource
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
from marshmallow import validate, ValidationError
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
#app.config.from_object(os.environ['APP_SETTINGS'])
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Routes(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    length_in_meters = db.Column(db.Float, nullable=False)
    elevation_gain_in_meters = db.Column(db.Float, nullable=False)
    start_lat = db.Column(db.Float, nullable=False)
    start_lon = db.Column(db.Float, nullable=False)
    end_lat = db.Column(db.Float, nullable=False)
    end_lon = db.Column(db.Float, nullable=False)
    route_type = db.Column(db.Integer, nullable=False)
    sub_type = db.Column(db.Integer, nullable=False)
    popularity = db.Column(db.Float, nullable=False)

 
class RouteSchema(Schema):
 
    not_blank = validate.Length(min=1, error='Field cannot be blank')
    # add validate=not_blank in required fields
    id = fields.Integer(required=True)
    name = fields.String(required=True)
    length_in_meters = fields.Float(required=True)
    elevation_gain_in_meters = fields.Float(required=True)
    start_lat = fields.Float(required=True)
    start_lon = fields.Float(required=True)
    end_lat = fields.Float(required=True)
    end_lon = fields.Float(required=True)
    route_type = fields.Integer(required=True)
    sub_type = fields.Integer(required=True)
    popularity = fields.Float(required=True)

    # self links
    def get_top_level_links(self, data, many):
        if many:
            self_link = "/routes/"
        else:
            self_link = "/routes/{}".format(data['id'])
        return {'self': self_link}
            #The below type object is a resource identifier object as per               http://jsonapi.org/format/#document-resource-identifier-objects
    class Meta:
        type_ = 'routes'

#Initialize a Flask Blueprint,
routes = Blueprint('routes', __name__)
app.register_blueprint(routes, url_prefix='/api/v1/routes')
 
#Initialize the UserSchema we defined in models.py
schema = RouteSchema(strict=True)
 
#Initialize the  API  object using the Flask-RESTful API class
api = Api(routes)
 
# Create CRUD classes using the Flask-RESTful Resource class
class CreateListRoutes(Resource):
    
    def get(self):
        routes_query = Routes.query.all()
        results = schema.dump(routes_query, many=True).data
        return results


#Map classes to API enpoints
api.add_resource(CreateListRoutes, '.json')



@app.route('/')
def index():
    return render_template('index.html')

@app.route('/test',methods=['GET','POST'])
def fun():
    return json.dumps([1,2,3])



'''
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80))
    email = db.Column(db.String(120), unique=True)

    def __init__(self, name, email):
        self.name = name
        self.email = email

    def __repr__(self):
        return '<Name %r>' % self.name


@app.route('/robots.txt')
def robots():
    res = app.make_response('User-agent: *\nAllow: /')
    res.mimetype = 'text/plain'
    return res
'''

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)