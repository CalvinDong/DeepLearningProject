import React, {useState, useEffect, useRef} from "react";
import Webcam from "react-webcam";
import axios from "axios"

import { Button, Drawer, Placeholder, FlexboxGrid } from 'rsuite';
import { Grid, Row, Col } from 'rsuite';

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
  const [exampleState, useExampleState] = useState({dta: Example2})
  const [imgSrc, setImgSrc] = useState(null);
  const webcamRef = useRef(null);
  console.log(Leaves)

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    console.log(imgSrc);
    sendData()
  }, [webcamRef, setImgSrc]);

  const sendData = async () => {
    //console.log(exampleState)
    const res = await axios.post(`${BACKEND}/posty`, {dta: imgSrc})
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
    <FlexboxGrid justify="space-around">
      <FlexboxGrid.Item colspan={3} style={{ minHeight: "100vh", minWidth: "60vw", borderRadius: 25 , border: '3px solid rgba(50, 50, 25, 1)'}}>
        <Grid fluid style={{margin: "auto"}}>
          <Row>
            <Col>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                style={{minWidth: "50vw", paddingTop: "5vh", borderRadius: 25 }}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <Button style={{padding: 30}} onClick={capture}>Take Picture</Button>
            </Col>
          </Row>
          </Grid>
      </FlexboxGrid.Item>
      <FlexboxGrid.Item colspan={3} style={{ minHeight: "100vh", minWidth: "30vw", borderRadius: 25 , border: '3px solid rgba(50, 50, 25, 1)'}}>
        <InfoCard/>
      </FlexboxGrid.Item>
      <Drawer
        show={showState}
        onHide={close}
        backdrop={true}
      >
        <Drawer.Header style={{justifyContent: "center", backgroundColor: "#2d2d2d", alignContent: "right"}}>
          <div style={{width: 200, display: "grid", justifyContent: "right"}}>
            <div style={{color:"#fff", background: "#2d2d2d", padding: 12, display: "inline-block"}}>
              <header style={{color: "#f6f"}}>Mango Leaf</header>
            </div>
          </div>
        </Drawer.Header>
        <Drawer.Body>
          <Grid fluid>
          <Row gutter={16}>
              <Col xs={4}>
                <Paragraph style={{ marginTop: 30 }} graph="image" />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={4}>
                <Paragraph style={{ marginTop: 30 }}/>
              </Col>
            </Row>
          </Grid>
        </Drawer.Body>
      </Drawer>
      </FlexboxGrid>
    
  )
}