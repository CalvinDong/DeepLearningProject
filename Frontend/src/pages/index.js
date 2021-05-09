import React, {useState} from "react";

import { Button } from 'rsuite';
import { Drawer } from 'rsuite';
import { Grid, Row, Col } from 'rsuite';
import { Placeholder } from 'rsuite';

const { Paragraph } = Placeholder;


export default function HomePage() {
  const [showState, setShowState] = useState(true);

  const close = () => {
    setShowState(false);
  }

  const open = () =>{
    setShowState(true);
  }

  return(
    <Grid fluid>
      <Row gutter={16}>
        <Col xs={4}>
          <Button onClick={open}>Hello World</Button>
        </Col>
        <Col xs={4}>
          
        </Col>
      </Row>
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
    </Grid>
    
  )
}