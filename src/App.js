import React, { Component, useState } from 'react';
import socketIOClient from 'socket.io-client';
import { Switch, Icon, Slider } from 'antd';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import 'antd/dist/antd.css';
import './App.css';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    height: 200,
    width: '100%',
 
  },
  control: {
    padding: theme.spacing(2),
  },
}));

function LightBulb({isOn, turnOnOff}) {
  //console.log("data: ", isOn);
  //let [light, setLight] = useState(0);

  //const setOff = () => setLight(0);
  //const setOn = () => setLight(1);

  const classes = useStyles();

  const setOff = () => turnOnOff(0);
  const setOn = () => turnOnOff(1);

  function onChange(checked) {
    const value = checked ? 1 : 0;
    turnOnOff(value);
  }

  //let fillColor = light === 1 ? "#ffbb73" : "#000000";
  let fillColor = isOn === 1 ? "#ffbb73" : "#000000";

  return (
    <Grid container 
      justify="center" 
      direction="column"
      alignItems="center"
      spacing={1}
    >
      <Grid item>
        <LightbulbSvg fillColor={fillColor} />
      </Grid>
      <Grid item>
        <Switch
          onChange={onChange}
          checkedChildren={<Icon type="check" />}
          unCheckedChildren={<Icon type="close" />}
          checked = {isOn}
        />
      </Grid>
    </Grid>
  );
}



function LightbulbSvg(props) {
  return (
    /*
      Below is the markup for an SVG that is the shape
      of a lightbulb.
      The important part is the `fill`, where we set the
      color dynamically based on props
    */
    <svg width="90px" height="150px" viewBox="0 0 56 90" version="1.1">
      <defs />
      <g
        id="Page-1"
        stroke="none"
        stroke-width="1"
        fill="none"
        fill-rule="evenodd"
      >
        <g id="noun_bulb_1912567" fill="#000000" fill-rule="nonzero">
          <path
            d="M38.985,68.873 L17.015,68.873 C15.615,68.873 14.48,70.009 14.48,71.409 C14.48,72.809 15.615,73.944 17.015,73.944 L38.986,73.944 C40.386,73.944 41.521,72.809 41.521,71.409 C41.521,70.009 40.386,68.873 38.985,68.873 Z"
            id="Shape"
          />
          <path
            d="M41.521,78.592 C41.521,77.192 40.386,76.057 38.986,76.057 L17.015,76.057 C15.615,76.057 14.48,77.192 14.48,78.592 C14.48,79.993 15.615,81.128 17.015,81.128 L38.986,81.128 C40.386,81.127 41.521,79.993 41.521,78.592 Z"
            id="Shape"
          />
          <path
            d="M18.282,83.24 C17.114,83.24 16.793,83.952 17.559,84.83 L21.806,89.682 C21.961,89.858 22.273,90 22.508,90 L33.492,90 C33.726,90 34.039,89.858 34.193,89.682 L38.44,84.83 C39.207,83.952 38.885,83.24 37.717,83.24 L18.282,83.24 Z"
            id="Shape"
          />
          <path
            d="M16.857,66.322 L39.142,66.322 C40.541,66.322 41.784,65.19 42.04,63.814 C44.63,49.959 55.886,41.575 55.886,27.887 C55.887,12.485 43.401,0 28,0 C12.599,0 0.113,12.485 0.113,27.887 C0.113,41.575 11.369,49.958 13.959,63.814 C14.216,65.19 15.458,66.322 16.857,66.322 Z"
            id="Shape"
            fill={props.fillColor}
          />
        </g>
      </g>
    </svg>
  );
}

const endpoint = "http://192.168.0.10:3001";
const socket = socketIOClient(endpoint);

let rgb = {
  red: 0,
  green: 0,
  blue: 0
}

class App extends Component {
  
  state = {
    response: false,
    responseRGB: rgb,
    hex: '#000000',
  };

  componentDidMount() {
    // const { endpoint } = this.state;
    // const socket = socketIOClient(endpoint);
    socket.on("light", data => {
      this.setState({ response: data });
      socket.emit("light", data);
    });

    socket.on("notyStatus", data => {
      console.log("notyStatus", data);
      this.setState({ response: data });
      //socket.emit("light", data);
    });

    socket.on("lightRGB", (data, hex) => {
      console.log("lightRGB", data + ", " + hex);
      this.setState({ responseRGB: data, hex });
      //socket.emit("light", data);
    });
  }
  
  turnOnOff = (value) => {
    console.log("turnOnOff: ", value);
    this.setState({ response: value });
    socket.emit("light", value);
  }

  onInput = (e) => {
    console.log("input: ", e.target.value);

    const R = this.hexToR(e.target.value);
    const G = this.hexToG(e.target.value);
    const B = this.hexToB(e.target.value);

    rgb = {
      red: R,
      green: G,
      blue: B
    }

    console.log("colors: ", R + ", " + G + ", " + B);
    socket.emit("rgbLed", rgb, e.target.value);
  }

  onChangeRed = (value) => {
    //console.log(value);
    rgb.red = value;
    socket.emit("rgbLed", rgb, this.rgbToHex(rgb.red, rgb.green, rgb.blue));
  }

  onChangeGreen = (value) => {
    //console.log(value);
    rgb.green = value;
    socket.emit("rgbLed", rgb, this.rgbToHex(rgb.red, rgb.green, rgb.blue));
    //calculate hex from rgb and emit
  }

  onChangeBlue = (value) => {
    //console.log(value);
    rgb.blue = value;
    socket.emit("rgbLed", rgb, this.rgbToHex(rgb.red, rgb.green, rgb.blue));
    //calculate hex from rgb and emit
  }

  componentToHex = (c) => {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
  
  rgbToHex = (r, g, b) => {
    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  }

  hexToR = (h) => {return parseInt((this.cutHex(h)).substring(0,2),16)}
  hexToG = (h) => {return parseInt((this.cutHex(h)).substring(2,4),16)}
  hexToB = (h) => {return parseInt((this.cutHex(h)).substring(4,6),16)}
  cutHex = (h) => {return (h.charAt(0)==="#") ? h.substring(1,7):h}

  render(){
    const { response, responseRGB, hex } = this.state;
    console.log("render: ", response);

    return (
      <Grid container justify="center" spacing={3} style={{paddingLeft: 15, paddingRight: 5, paddingTop: 10}}>
      <Grid item xs={12}>
        <Paper style={{
            height: 200,
            width: '100%',
        }}>
             <LightBulb isOn = {response} turnOnOff = {this.turnOnOff}/>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper style={{
            height: 200,
            width: '100%',
            padding: 10,
        }} >
          <input type="color" id="pickColor" onInput={this.onInput} value={hex}/>
          <div>R
            <Slider
              min={0}
              max={255}
              onChange={this.onChangeRed}
              style={{backgroundColor: 'red'}}
              value={responseRGB.red}
            />
          </div>
          <div>G
            <Slider
              min={0}
              max={255}
              onChange={this.onChangeGreen}
              style={{backgroundColor: 'green'}}
              value={responseRGB.green}
            />
          </div>
          <div>B
            <Slider
              min={0}
              max={255}
              onChange={this.onChangeBlue}
              style={{backgroundColor: 'blue'}}
              value={responseRGB.blue}
            />
          </div>
        </Paper>
      </Grid>
      </Grid>
    );
  }
}

export default App;
