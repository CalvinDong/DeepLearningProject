import React, {useState, useEffect, createRef} from "react";
import axios from "axios"
import { Button, Placeholder } from 'rsuite';
import { Grid, Card } from '@material-ui/core'
import Paper from '@material-ui/core/Paper';
import InfoCard from "../components/InfoCard.js"
import Leaves from "../leaves.json"

import * as tf from '@tensorflow/tfjs';
import {loadGraphModel} from '@tensorflow/tfjs-converter';


const BACKEND = "http://127.0.0.1:5000";
const { Paragraph } = Placeholder;
const threshold = 0.3;

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
  console.log(Leaves)

  const renderPredictions = predictions => {
    const ctx = this.canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Font options.
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";

    //Getting predictions
    const boxes = predictions[4].arraySync();
    const scores = predictions[5].arraySync();
    const classes = predictions[6].dataSync();
    const detections = this.buildDetectedObjects(scores, threshold,
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
		tf.engine().startScope();
		model.executeAsync(process_input(video)).then(predictions => {
		renderPredictions(predictions, video);
    console.log("detect frame")
		requestAnimationFrame(() => {
		  detectFrame(video, model);
		});
		tf.engine().endScope();
	  });
	};

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log("getting stream")
      const webCamPromise = navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: true
        })
        .then(stream => {
          if (videoRef.current != null) {
            window.stream = stream;
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
        <Paper elevation={3} style={{maxWidth: "45vw", minHeight: "90vh"}}>
          <video
            autoPlay
            muted
            ref={videoRef}
            width="1280px"
            height="720px"
            style={{maxWidth: "45vw", minHeight: "90vh"}}
          />
          <Grid item>
            <Button style={{padding: 20}} onClick={handleButtonPress} onKeyPress={handleKeypress}>Take Picture</Button>
          </Grid>
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