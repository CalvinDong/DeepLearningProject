import React, { useState, useEffect } from 'react';
import { Button, Drawer, Placeholder, FlexboxGrid } from 'rsuite';
import { Grid, Row, Col } from 'rsuite';

const { Paragraph } = Placeholder;

export default function InfoCard(props){
  const placeholder = 0;

  return(
    <>
    <h1 style={{color: "#4CAF50"}}> Leaf Name :) </h1>
        <div style={{justifyContent: "center"}}>
          <Paragraph style={{}}rows={0} style={{ padding: 30 }} graph="image" />
          <Paragraph rows={5} style={{ padding: 30, paddingTop: 30 }}/>
          <Paragraph rows={5} style={{ padding: 30, paddingTop: 30 }}/>
          <Paragraph rows={5} style={{ padding: 30, paddingTop: 30 }}/>
          <Paragraph rows={5} style={{ padding: 30, paddingTop: 30 }}/>
          <Paragraph rows={5} style={{ padding: 30, paddingTop: 30 }}/>
          <Paragraph style={{ padding: 30, paddingTop: 30 }}/>
        </div>
    </>
  )
}