from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
import tensorflow as tf
print(tf.__version__)
import json
import os
import base64
import cv2
import numpy as np

os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

from model import predictImage
from objDet import detectObject

from object_detection.utils import ops as utils_ops
from object_detection.utils import label_map_util
from object_detection.utils import visualization_utils as vis_util

def getJSON(label):
  with open('example.json') as json_file:
    data = json.load(json_file)
    return "p"

def loadAsNumpy(image):
  message_bytes = base64.b64decode(bytes(image, 'utf-8') + b'===')
  nparr = np.fromstring(message_bytes, np.uint8)
  img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
  img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
  return img

def run_inference_for_single_image(image, graph):
  with graph.as_default():
    with tf.compat.v1.Session() as sess:
      # Get handles to input and output tensors
      ops = tf.compat.v1.get_default_graph().get_operations()
      all_tensor_names = {
          output.name for op in ops for output in op.outputs}
      tensor_dict = {}
      for key in ['num_detections', 'detection_boxes', 'detection_scores','detection_classes', 'detection_masks']:
        tensor_name = key + ':0'
        if tensor_name in all_tensor_names:
          tensor_dict[key] = tf.compat.v1.get_default_graph().get_tensor_by_name(tensor_name)

      if 'detection_masks' in tensor_dict:
          # The following processing is only for single image
          detection_boxes = tf.compat.v1.squeeze(
            tensor_dict['detection_boxes'], [0])
          detection_masks = tf.compat.v1.squeeze(
            tensor_dict['detection_masks'], [0])
          # Reframe is required to translate mask from box coordinates to image coordinates and fit the image size.
          real_num_detection = tf.compat.v1.cast(
            tensor_dict['num_detections'][0], tf.compat.v1.int32)
          detection_boxes = tf.compat.v1.slice(detection_boxes, [0, 0], [real_num_detection, -1])
          detection_masks = tf.compat.v1.slice(detection_masks, [0, 0, 0], [real_num_detection, -1, -1])
          detection_masks_reframed = utils_ops.reframe_box_masks_to_image_masks(
            detection_masks, detection_boxes, image.shape[0], image.shape[1])
          detection_masks_reframed = tf.compat.v1.cast(
            tf.compat.v1.greater(detection_masks_reframed, 0.5), tf.compat.v1.uint8)
          tensor_dict['detection_masks'] = tf.compat.v1.expand_dims(
            detection_masks_reframed, 0)
      image_tensor = tf.compat.v1.get_default_graph().get_tensor_by_name('image_tensor:0')

      # Run inference
      output_dict = sess.run(tensor_dict,feed_dict={image_tensor: np.expand_dims(image, 0)})

      # all outputs are float32 numpy arrays, so convert types as appropriate
      output_dict['num_detections'] = int(
        output_dict['num_detections'][0])
      output_dict['detection_classes'] = output_dict[
        'detection_classes'][0].astype(np.uint8)
      output_dict['detection_boxes'] = output_dict['detection_boxes'][0]
      output_dict['detection_scores'] = output_dict['detection_scores'][0]
      if 'detection_masks' in output_dict:
          output_dict['detection_masks'] = output_dict['detection_masks'][0]
    return output_dict

def get_num_classes(pbtxt_fname):
    label_map = label_map_util.load_labelmap(pbtxt_fname)
    categories = label_map_util.convert_label_map_to_categories(
        label_map, max_num_classes=90, use_display_name=True)
    category_index = label_map_util.create_category_index(categories)
    return len(category_index.keys())

def lookup(label):
  for p in data["weather"]:
      if (label == p["name"]):
        return p




pb_fname = os.path.abspath("C:/Users/CalvinDong/source/repos/Deep Learning Project/Backend/custom/frozen_inference_graph.pb")
assert os.path.isfile(pb_fname), '`{}` not exist'.format(pb_fname)

with open('example.json') as json_file:
    data = json.load(json_file)

PATH_TO_MODEL = 'custom/saved_model'
PATH_TO_LABELS = 'label_map.pbtxt'
PATH_TO_CKPT = pb_fname

#num_classes = get_num_classes("label_map.pbxt")
num_classes = 63

detection_graph = tf.compat.v1.Graph()
with detection_graph.as_default():
    od_graph_def = tf.compat.v1.GraphDef()
    with tf.compat.v1.gfile.GFile(PATH_TO_CKPT, 'rb') as fid:
        serialized_graph = fid.read()
        od_graph_def.ParseFromString(serialized_graph)
        tf.compat.v1.import_graph_def(od_graph_def, name='')

model = tf.compat.v1.saved_model.load_v2(PATH_TO_MODEL)
label_map = label_map_util.load_labelmap(PATH_TO_LABELS)
categories = label_map_util.convert_label_map_to_categories(label_map, max_num_classes=num_classes, use_display_name=True)
category_index = label_map_util.create_category_index(categories)

# configuration
DEBUG = True

# instantiate the app
app = Flask(__name__)
app.config.from_object(__name__)
#new_model = tf.keras.models.load_model('saved_model2/my_model2')
#model = tf.saved_model.load(PATH_TO_MODEL)
print("going to load")

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
    #thing = predictImage(new_model, dictData["dta"][23:])
    image_np = loadAsNumpy(dictData["dta"][23:])
    output_dict = run_inference_for_single_image(image_np, detection_graph)
    output_dict['detection_boxes'] = output_dict['detection_boxes'][:][[0]]
    output_dict['detection_classes'] = output_dict['detection_classes'][:][[0]]
    output_dict['detection_scores'] = output_dict['detection_scores'][:][[0]]

    vis_util.visualize_boxes_and_labels_on_image_array(
        image_np,
        output_dict['detection_boxes'],
        output_dict['detection_classes'],
        output_dict['detection_scores'],
        category_index,
        use_normalized_coordinates=True,
        max_boxes_to_draw=200,
        min_score_thresh=.01,
        agnostic_mode=False)

    prediction = category_index[output_dict['detection_classes'][0]]
    print(prediction["name"])
    look = lookup(prediction["name"])
    print(look)
    filename = 'savedImage(Obj).jpg'
    img = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
    cv2.imwrite(filename, img)
    return jsonify(look)

if __name__ == '__main__':
    app.run()