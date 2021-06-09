import React, { useState, useEffect } from 'react';
import { Button, Drawer, Placeholder, FlexboxGrid } from 'rsuite';
import { Typography } from '@material-ui/core'
import { Grid, Row, Col } from 'rsuite';

const { Paragraph } = Placeholder;

export default function InfoCard(props){
  const description = props.description

  function PlaceholderPara(){
    return (
      <>
      <h1 style={{color: "#4CAF50"}}> Leaf Name :) </h1>
      <div style={{justifyContent: "center"}}/>
      <Paragraph style={{}}rows={0} style={{ padding: 30 }} graph="image" />
      <Paragraph rows={5} style={{ padding: 30 }}/>
      <Paragraph rows={5} style={{ padding: 30 }}/>
      </>
    )
  }

  function LeafDesc(){
    return (
      <>
        <h1 style={{color: "#4CAF50"}}> {description.name} </h1>
        <img src={description.image} style={{maxWidth: "20vw", maxHeight: "20vh"}}></img>
        <div style={{justifyContent: "center"}}/>
        <Typography>{description.description}</Typography>
        <Typography>{description.medicinal_properties}</Typography>
      </>
    )
  }

  return(
    <>
      {description
        ? <LeafDesc/>
        : <PlaceholderPara/>
      }
    </>
  )
}