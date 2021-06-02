import React, {useState, useEffect, createRef} from "react";
import axios from "axios"
import { Button, Placeholder } from 'rsuite';
import { Grid, Card } from '@material-ui/core'
import Paper from '@material-ui/core/Paper';
import InfoCard from "../components/InfoCard.js"
import Leaves from "../leaves.json"
import Medicinal from "../document.json"

import * as tf from '@tensorflow/tfjs';
import {loadGraphModel} from '@tensorflow/tfjs-converter';


const BACKEND = "http://127.0.0.1:5000";
const { Paragraph } = Placeholder;
const threshold = 0.2;

let classesDir = {
  1: {
      name: 'Alpinia-Galanga',
      id: 1,
  },
  2: {
      name: 'Amaranthus-Viridis',
      id: 2,
  },
  3: {
    name: 'Areca-Palm',
    id: 3,
  },
  4: {
    name: 'Artocarpus-Heterophyllus',
    id: 4,
  },
  5: {
    name: 'Azadirachta-Indica',
    id: 5,
  },
  6: {
    name: 'Basella-Alba',
    id: 6,
  },
  7: {
    name: 'Bonsai',
    id: 7,
  },
  8: {
    name: 'Brassica-Juncea',
    id: 8,
  },
  9: {
    name: 'Carissa-Carandas',
    id: 9,
  },
  10: {
    name: 'Citrus-Limon',
    id: 10,
  },
  11: {
    name: 'Eucalyptus',
    id: 11,
  },
  12: {
    name: 'Ficus-Auriculata',
    id: 12,
  },
  13: {
    name: 'Ficus-Religiosa',
    id: 13,
  },
  14: {
    name: 'Hibiscus-Rosa-sinensis',
    id: 14,
  },
  15: {
    name: 'Jasminum',
    id: 15,
  },
  16: {
    name: 'Mangifera-Indica',
    id: 16,
  },
  17: {
    name: 'Mentha',
    id: 17,
  },
  18: {
    name: 'Moringa-Oleifera',
    id: 18,
  },
  19: {
    name: 'Muntingia-Calabura',
    id: 19,
  },
  20: {
    name: 'Murraya-Koenigii',
    id: 20,
  },
  21: {
    name: 'Nerium-Oleander',
    id: 21,
  },
  22: {
    name: 'Nyctanthes-Arbor-tristis',
    id: 22,
  },
  23: {
    name: 'Ocimum-Tenuiflorum',
    id: 23,
  },
  24: {
    name: 'Piper-Betle',
    id: 24,
  },
  25: {
    name: 'Plectranthus-Amboinicus',
    id: 25,
  },
  26: {
    name: 'Pongamia-Pinnata',
    id: 26,
  },
  27: {
    name: 'Psidium-Guajava',
    id: 27,
  },
  28: {
    name: 'Punica-Granatum',
    id: 28,
  },
  29: {
    name: 'Santalum-Album',
    id: 29,
  },
  30: {
    name: 'Syzygium-Cumini',
    id: 30,
  },
  31: {
    name: 'Syzygium-Jambos',
    id: 31,
  },
  32: {
    name: 'Tabernaemontana-Divaricata',
    id: 32,
  },
  33: {
    name: 'Trigonella-Foenum-graecum',
    id: 33,
  },
}

const dummyData = Leaves;

async function load_model() {
  // It's possible to load the model locally or from a repo
  // You can choose whatever IP and PORT you want in the "http://127.0.0.1:8080/model.json" just set it before in your https server
  //const model = await loadGraphModel("http://127.0.0.1:8080/model.json");
  const model = await loadGraphModel("http://127.0.0.1:8080/ssd_js/model.json");
  return model;
}

export default function HomePage() {
  const [showState, setShowState] = useState(true);
  const [leafState, useLeafState] = useState(null);
  const [description, setDescriptionState] = useState(null)
  const [imgSrc, setImgSrc] = useState(null);
  //const webcamRef = useRef(null);
  let videoRef = createRef()
  let canvasRef = createRef();

  function buildDetectedObjects(scores, threshold, boxes, classes, classesDir) {
    let allow = true;
    const detectionObjects = []
    var video_frame = document.getElementById('frame');

    scores[0].forEach((score, i) => {
      if (score > threshold) {
        const bbox = [];
        const minY = boxes[0][i][0] * video_frame.offsetHeight;
        const minX = boxes[0][i][1] * video_frame.offsetWidth;
        const maxY = boxes[0][i][2] * video_frame.offsetHeight;
        const maxX = boxes[0][i][3] * video_frame.offsetWidth;
        bbox[0] = minX;
        bbox[1] = minY;
        bbox[2] = maxX - minX;
        bbox[3] = maxY - minY;

        if (allow){
          let leafName = classesDir[classes[i]].name
          detectionObjects.push({
            class: classes[i],
            label: leafName,
            score: score.toFixed(4),
            bbox: bbox
          })
          allow = false
          Medicinal.Medicinal.forEach(obj => {
            if (obj.name === leafName){
              setDescriptionState(obj)
            }
          })
          //setDescriptionState()
        }
        
      }
    })
    return detectionObjects
  }

  const renderPredictions = predictions => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Font options.
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";

    //Getting predictions
    const boxes = predictions[0].arraySync();
    const scores = predictions[3].arraySync();
    const classes = predictions[1].dataSync();
    const detections = buildDetectedObjects(scores, threshold,
                                    boxes, classes, classesDir);

    detections.forEach(item => {
      const x = item['bbox'][0];
      const y = item['bbox'][1];
      const width = item['bbox'][2];
      const height = item['bbox'][3];
      
      // Draw the bounding box.
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);

      // Draw the label background.
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(item["label"] + " " + (100 * item["score"]).toFixed(2) + "%").width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
    });

    detections.forEach(item => {
      const x = item['bbox'][0];
      const y = item['bbox'][1];

      // Draw the text last to ensure it's on top.
      ctx.fillStyle = "#000000";
      ctx.fillText(item["label"] + " " + (100*item["score"]).toFixed(2) + "%", x, y);
    });
  };

  function process_input (video_frame){
    const tfimg = tf.browser.fromPixels(video_frame).toInt();
    const expandedimg = tfimg.transpose([0,1,2]).expandDims();
    return expandedimg;
  };

  let detectFrame = (video, model) => {
    if (canvasRef.current){
      tf.engine().startScope();
      model.executeAsync(process_input(video)).then(predictions => {
      renderPredictions(predictions, video);
      requestAnimationFrame(() => {
        detectFrame(video, model);
      });
      tf.engine().endScope();
      });
    }
	};

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const webCamPromise = navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: true
        })
        .then(stream => {
          if (videoRef.current != null) {
            //window.stream = stream;
            videoRef.current.srcObject = stream;
            return new Promise((resolve, reject) => {
              videoRef.current.onloadedmetadata = () => {
                resolve();
              };
            });
          }
          
        });

      const modelPromise = load_model();

      Promise.all([modelPromise, webCamPromise])
        .then(values => {
          detectFrame(videoRef.current, values[0]);
        })
        .catch(error => {
          console.error(error);
        });
    }
  })

  

  /*const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    console.log(imageSrc)
    console.log(imgSrc)
    sendData(imageSrc)
  }, [webcamRef, setImgSrc]);*/

  const sendData = async (imageSrc) => {
    const res = await axios.post(`${BACKEND}/posty`, {dta: imageSrc})
    setDescriptionState(res.data)
    console.log(res)
    // Send data here, then set leafState to data
  }


  const handleButtonPress = () => {
    console.log("shit")
  }
  
  const handleKeypress = (e) => {
    if (e.keyCode === 13) {
      handleButtonPress();
    }
  }

  const close = () => {
    setShowState(false);
  }

  const open = () =>{
    setShowState(true);
  }

  return(
    <Grid container alignItems="center">
      <Grid item xs container direction="row" justify="space-around">
        <Paper elevation={3} style={{minWidth: "45vw", minHeight: "90vh"}}>
          <video
            autoPlay
            muted
            ref={videoRef}
            position = "absolute"
            width= "600"
            height = "600"
            id="frame"
            style={{width:"600px", height: "600px", top: 0, left: 0}}
          />
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            style={{position: "absolute", top: 0, left: 340, backgroundColor: "rgba(255,0,0,0.5)"}}
          />
        </Paper>
      </Grid>
      <Grid item xs>
        <Paper elevation ={3} style={{maxWidth: "45vw",  minHeight: "90vh", paddingTop: 30 }}>
          <InfoCard description={description} />
        </Paper>
      </Grid>
    </Grid>
  )
}