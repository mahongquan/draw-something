import React, { Component, PropTypes } from 'react';
import DrawBoard from './DrawBoard';
import ShowBoard from './ShowBoard';
// import '../components/draw/draw.less';
import io from 'socket.io-client';
const HOST = 'http://localhost:8000';
// var socket = io.connect(HOST);
var ROLE = { none: 0, draw: 1, cai: 2 };
export default class Draw extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasDraw: false,
      player: ROLE.none,
      ct: 0,
    };
  }
  componentDidMount() {
    this.socket = io.connect(HOST);
    console.log(this.socket);
    console.log('send getct');
    this.socket.on('ct', data => {
      console.log('receive ct');
      console.log(data);
      this.setState({ ct: data.ct, hasDraw: data.hasDraw });
      if (data.hasDraw) {
        this.setState({ player: ROLE.cai });
      }
    });
    this.socket.send('getct');
    this.socket.on('drawleave', () => {
      this.setState({ player: ROLE.none, hasDraw: false });
    });
  }
  drawClick = () => {
    console.log('drawClick');
    console.log(this.state.player);
    this.setState({ player: ROLE.draw, hasDraw: true });
    this.socket.send('hasDraw');
  };
  caiClick = () => {
    console.log('caiClick');
    console.log(this.state.player);
    this.setState({ player: ROLE.cai });
  };
  render() {
    console.log('render');
    console.log(this.state.player);
    let renderNode, drawbutton;
    if (!this.state.hasDraw) {
      drawbutton = <button onClick={this.drawClick}>我来画</button>;
    }
    switch (this.state.player) {
      case 1:
        renderNode = (
          <DrawBoard
            socket={this.socket}
            drawEnd={() => {
              console.log('stop');
            }}
          />
        );
        break;
      case 2:
        renderNode = <ShowBoard socket={this.socket} />;
        break;
      default:
        renderNode = (
          <div>
            {drawbutton}
            <button onClick={this.caiClick}>我来猜</button>
          </div>
        );
    }

    return (
      <div>
        <div>player:{this.state.player}</div>
        <div>ct:{this.state.ct}</div>
        {renderNode}
      </div>
    );
  }
}
