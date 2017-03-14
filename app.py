from flask import Flask, Blueprint, request, jsonify, make_response, render_template
from marshmallow_jsonapi import Schema, fields
from flask_restful import Api, Resource
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy.exc import SQLAlchemyError
from marshmallow import validate, ValidationError
import os, json

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
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
            #The below type object is a resource identifier object as per http://jsonapi.org/format/#document-resource-identifier-objects
    class Meta:
        type_ = 'routes'



# Initialize a Flask Blueprint,
api_v1 = Blueprint('api', __name__)
CORS(api_v1)
# Initialize the  API object using the Flask-RESTful API class
api = Api(api_v1)


# Initialize the UserSchema we defined in models.py
schema = RouteSchema(strict=True)


 
# Create CRUD classes using the Flask-RESTful Resource class
class CreateListRoutes(Resource):
    
    def get(self):
        routes_query = Routes.query.limit(5)
        results = schema.dump(routes_query, many=True).data
        #return results['data']
        return results

class queryRoutes(Resource):

    def get(self, custom_input):
        custom_input = custom_input.split('&')
        params = {}
        for x in custom_input:
            params[x.split('=')[0]] = x.split('=')[1]
        invalids = [x for x in params.keys() if x not in set(['dist_max','dist_min','elev_max','elev_min','route_type','route_subtype'])]
        if not invalids:    
            q = Routes.query
            if 'dist_max' in params.keys():
                q = q.filter(Routes.length_in_meters<=float(params['dist_max']))
            if 'dist_min' in params.keys():
                q = q.filter(Routes.length_in_meters>=float(params['dist_min']))
            if 'elev_max' in params.keys():
                q = q.filter(Routes.elevation_gain_in_meters<=float(params['elev_max']))
            if 'elev_min' in params.keys():
                q = q.filter(Routes.elevation_gain_in_meters>=float(params['elev_min']))
            if 'type' in params.keys():
                q = q.filter(Routes.route_type==int(params['route_type']))
            if 'sub_type' in params.keys():
                q = q.filter(Routes.sub_type==int(params['route_subtype']))
            # make a dict with vars as keys and these junks as values
            # for var in params q=q.filter(blah)
            results_query = q.limit(20)
            results = schema.dump(results_query, many=True).data
            return results
        else: 
            return 'You have specified the following invalid search parameters: {}.'.format(', '.join(invalids))



# Map classes to API enspoints
api.add_resource(CreateListRoutes, '.json')
api.add_resource(queryRoutes, '/<custom_input>.json', endpoint='api/v2/routes/query')
app.register_blueprint(api_v1, url_prefix='/api/v2/routes')



@app.route('/', methods=['GET','POST'])
def index():
    if request.method == 'GET':
        return render_template('index.html')
    else:
        #true = [x for x in request.form.keys() if request.form[x]!=None]
        api_caller = queryRoutes()
        return '&'.join(['{}={}'.format(x,request.format[x]) for x in request.form.keys() if request.form[x]!=None])

@app.route('/test')
def test():
    return render_template('index.html')


# Testing to confirm api actually works
@app.route('/show',methods=['GET','POST'])
def show_all():
    return render_template('show_all.html', routes = Routes.query.limit(100) )



if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)