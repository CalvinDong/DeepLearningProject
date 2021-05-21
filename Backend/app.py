from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
import tensorflow
import json

from model import predictImage

# configuration
DEBUG = True

# instantiate the app
app = Flask(__name__)
app.config.from_object(__name__)
new_model = tensorflow.keras.models.load_model('saved_model2/my_model2')

# enable CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# sanity check route
@app.route('/ping', methods=['GET'])
def ping_pong():
    thing = predictImage(new_model, "image")
    return jsonify(thing)

@app.route('/posty', methods=['POST'])
@cross_origin()
def postThis():
    dictData = json.loads(request.data)
    thing = predictImage(new_model, dictData["dta"][23:])
    return jsonify(thing)

if __name__ == '__main__':
    app.run()