import React, {useState, useEffect, useRef} from "react";
import Webcam from "react-webcam";
import axios from "axios"

import { Button, Drawer, Placeholder, FlexboxGrid } from 'rsuite';
//import { Grid, Row, Col } from 'rsuite';
import { Grid, Card } from '@material-ui/core'
import Paper from '@material-ui/core/Paper';

import InfoCard from "../components/InfoCard.js"
import Leaves from "../leaves.json"

import Example from "../images/shine123.jpg"
import Example2 from "../images/rain1.jpg"

const BACKEND = "http://127.0.0.1:5000";
const { Paragraph } = Placeholder;

const dummyData = Leaves;

export default function HomePage() {
  const [showState, setShowState] = useState(true);
  const [leafState, useLeafState] = useState(null);
  const [description, setDescriptionState] = useState(null)
  const [imgSrc, setImgSrc] = useState(null);
  const webcamRef = useRef(null);
  console.log(Leaves)

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    console.log(imageSrc)
    console.log(imgSrc)
    sendData(imageSrc)
  }, [webcamRef, setImgSrc]);

  const sendData = async (imageSrc) => {
    //console.log(exampleState)
    const res = await axios.post(`${BACKEND}/posty`, {dta: imageSrc})
    setDescriptionState(res.data)
    console.log(res)
    // Send data here, then set leafState to data
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
        <Card style={{maxWidth: "50vw", minHeight: "100vh"}}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
          />
          <Grid item>
            <Button style={{padding: 30}} onClick={capture}>Take Picture</Button>
          </Grid>
        </Card>
      </Grid>
      <Grid item xs>
        <Card style={{maxWidth: "50vw",  minHeight: "100vh", borderRadius: 25 }}>
          <InfoCard description={description} />
        </Card>
      </Grid>
    </Grid>
  )
}