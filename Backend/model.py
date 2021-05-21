import cv2
import numpy as np
import json
import base64

def getClass(prediction):
  if (prediction[0][0]):
    return 'cloudy'
  if (prediction[0][1]):
    return 'rain'
  if (prediction[0][2]):
    return 'shine'
  if (prediction[0][3]):
    return 'sunrise'

def getJSON(label):
  with open('example.json') as json_file:
    data = json.load(json_file)
    for p in data["weather"]:
      if (label == p["name"]):
        return p

def predictImage(new_model, image):
    message_bytes = base64.b64decode(bytes(image, 'utf-8') + b'===')
    nparr = np.fromstring(message_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img,(224,224)) 
    img_pred = img.reshape(1,224,224,3)

    prediction = new_model.predict(img_pred)
    label = f"{getClass(prediction)}"
    color = (125, 255, 70)
    img = cv2.resize(img, (128, 128), interpolation=cv2.INTER_LINEAR)
    cv2.putText(img, label, (5, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.50, color, 2)

    filename = 'savedImage.jpg'
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    cv2.imwrite(filename, img)

    

    return getJSON(label)