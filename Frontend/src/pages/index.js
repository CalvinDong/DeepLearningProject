import React, {useState, useEffect, useRef} from "react";
import Webcam from "react-webcam";

import { Button } from 'rsuite';
import { Drawer } from 'rsuite';
import { Grid, Row, Col } from 'rsuite';
import { Placeholder } from 'rsuite';
import { FlexboxGrid } from 'rsuite';

const { Paragraph } = Placeholder;


export default function HomePage() {
  const [showState, setShowState] = useState(true);
  const [imgSrc, setImgSrc] = useState(null);
  const webcamRef = useRef(null);

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef, setImgSrc]);

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
              <Button style={{padding: 30}} onClick={open}>Take Picture</Button>
            </Col>
          </Row>
          </Grid>
      </FlexboxGrid.Item>
      <FlexboxGrid.Item colspan={3} style={{ minHeight: "100vh", minWidth: "30vw", borderRadius: 25 , border: '3px solid rgba(50, 50, 25, 1)'}}>
        <h1 style={{color: "#4CAF50"}}> Leaf Name </h1>
        <div style={{justifyContent: "center"}}>
          <Paragraph style={{}}rows={0} style={{ padding: 30 }} graph="image" />
          <Paragraph rows={5} style={{ padding: 30, paddingTop: 30 }}/>
          <Paragraph rows={5} style={{ padding: 30, paddingTop: 30 }}/>
          <Paragraph rows={5} style={{ padding: 30, paddingTop: 30 }}/>
          <Paragraph rows={5} style={{ padding: 30, paddingTop: 30 }}/>
          <Paragraph rows={5} style={{ padding: 30, paddingTop: 30 }}/>
          <Paragraph style={{ padding: 30, paddingTop: 30 }}/>
        </div>
        
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