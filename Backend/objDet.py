#import tensorflow_hub as hub
import numpy as np
import cv2
from PIL import Image
import matplotlib.pyplot as plt
import warnings
import base64

def loadAsNumpy(image):
  message_bytes = base64.b64decode(bytes(image, 'utf-8') + b'===')
  nparr = np.fromstring(message_bytes, np.uint8)
  img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
  img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
  return img

def run_inference_for_single_image(image, graph, tf):
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

def detectObject(detect_fn, image, tf, vis_util, category_index, detection_graph):
  """img = loadAsNumpy(image)
  # The input needs to be a tensor, convert it using `tf.convert_to_tensor`.
  
  input_tensor = tf.convert_to_tensor(img)
  # The model expects a batch of images, so add an axis with `tf.newaxis`.
  input_tensor = input_tensor[tf.newaxis, ...]

  # input_tensor = np.expand_dims(image_np, 0)
  detections = detect_fn(input_tensor)

  # All outputs are batches tensors.
  # Convert to numpy arrays, and take index [0] to remove the batch dimension.
  # We're only interested in the first num_detections.
  num_detections = int(detections.pop('num_detections'))
  detections = {key: value[0, :num_detections].numpy()
                  for key, value in detections.items()}
  detections['num_detections'] = num_detections
  # detection_classes should be ints.
  detections['detection_classes'] = detections['detection_classes'].astype(np.int64)

  image_np_with_detections = img.copy()"""

  image_np = loadAsNumpy(image)
  image_np_expanded = np.expand_dims(image_np, axis=0)
  output_dict = run_inference_for_single_image(image_np, detection_graph, tf)
  output_dict['detection_boxes'] = output_dict['detection_boxes'][:][0]
  output_dict['detection_classes'] = output_dict['detection_boxes'][:][0]
  output_dict['detection_scores'] = output_dict['detection_boxes'][:][0]
  print(output_dict['detection_boxes'])

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

  filename = 'savedImage(Obj).jpg'
  img = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
  cv2.imwrite(filename, img)

  return(output_dict)

