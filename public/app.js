var socket = io();
class ShowBoard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ct: 0,
      ctx: null,
      mousePressed: false,
      lineValue: 9,
      colorValue: 'blue',
      beginX: 0,
      beginY: 0,
      endX: 0,
      endY: 0,
    };
  }

  hasProps(prop) {
    if (!prop) {
      return false;
    }

    var propName;
    if (this.props.route && this.props.route[prop]) {
      propName = this.props.route[prop];
    }

    if (this.props[prop]) {
      console.log('no route', this.props);
      propName = this.props[prop];
    }

    if (propName) {
      return propName;
    }
    return false;
  }

  ready() {
    var el = this.refs.myCanvas;
    var ready, socket;

    this.setState({
      ctx: el.getContext('2d'),
    });

    socket = this.hasProps('socket');

    if (socket) {
      this.setState({
        socket: socket,
      });
      socket.on('showPath', data => {
        this.drawing(
          data.endX,
          data.endY,
          data.beginX,
          data.beginY,
          data.colorValue,
          data.lineValue
        );
      });
      //监听答案是否正确
      socket.on('answer', data => {
        switch (data.bingo) {
          case 1:
            alert('真棒答对了！');
            break;
          default:
            alert('愚蠢的地球人！');
        }
      });
      //清除画布
      socket.on('showBoardClearArea', () => {
        this.clearArea();
      });
    }
  }

  drawing(x, y, beginX, beginY, colorValue, lineValue) {
    var ctx = this.state.ctx;
    ctx.beginPath();
    ctx.strokeStyle = colorValue;
    ctx.lineWidth = lineValue;
    ctx.lineJoin = 'round';
    ctx.moveTo(beginX, beginY);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.stroke();
  }

  clearArea() {
    var ctx = this.state.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  componentDidMount() {
    this.ready();
  }

  render() {
    return (
      <div className="control-ops">
        <div className="item keyword">猜猜这家伙画的是啥！</div>
        <canvas
          ref="myCanvas"
          width="500"
          height="400"
          style={{ border: '1px solid #ccc' }}
        />
        <div className="keyword">
          <input
            type="text"
            value={this.state.keyword}
            onChange={e => {
              this.setState({ keyword: e.target.value });
            }}
          />
          <input
            type="button"
            value="我猜！"
            onClick={() => this.state.socket.emit('submit', this.state.keyword)}
          />
        </div>
      </div>
    );
  }
}
class DrawBoard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ct: 0,
      ctx: null,
      mousePressed: false,
      lineValue: 3,
      colorValue: 'red',
      beginX: 0,
      beginY: 0,
      endX: 0,
      endY: 0,
    };
  }

  mouseDownHandel(e) {
    this.setState({
      mousePressed: true,
    });
    this.drawing(
      e.pageX - e.target.offsetLeft,
      e.pageY - e.target.offsetTop,
      false
    );
  }

  mouseMoveHandel(e) {
    if (this.state.mousePressed) {
      this.drawing(
        e.pageX - e.target.offsetLeft,
        e.pageY - e.target.offsetTop,
        true
      );
    }
  }

  setMousePressed() {
    this.setState({
      mousePressed: false,
    });
  }

  mouseUpHandel() {
    this.setMousePressed();
    this.hasProps('drawEnd')();
  }

  hasProps(prop) {
    if (!prop) {
      return false;
    }

    var propName;
    if (this.props.route && this.props.route[prop]) {
      propName = this.props.route[prop];
    }

    if (this.props[prop]) {
      propName = this.props[prop];
    }

    if (propName) {
      return propName;
    }

    return false;
  }

  ready() {
    let socket = this.hasProps('socket'),
      el = this.refs.myCanvas;
    if (socket) {
      this.setState({
        socket: socket,
      });
      socket.send('getKeyWord');
      socket.on('keyword', keyword => {
        console.log('---------');
        console.log(keyword);
        this.setState({ keyword });
      });
    }
    el = this.refs.myCanvas;
    this.setState({
      ctx: el.getContext('2d'),
    });
  }

  drawChange(path) {
    let change = this.hasProps('change');
    if (change) {
      change({
        ...this.state,
      });
    }

    this.state.socket.emit('drawPath', {
      beginX: this.state.beginX,
      beginY: this.state.beginY,
      endX: path.x,
      endY: path.y,
      lineValue: this.state.lineValue,
      colorValue: this.state.colorValue,
    });
  }

  drawing(x, y, isDown) {
    var ctx, timer;
    if (isDown) {
      ctx = this.state.ctx;
      ctx.beginPath();
      ctx.strokeStyle = this.state.colorValue;
      ctx.lineWidth = this.state.lineValue;
      ctx.lineJoin = 'round';
      ctx.moveTo(this.state.beginX, this.state.beginY);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.stroke();
      this.drawChange({ x, y });
    }
    this.setState({
      beginX: x,
      beginY: y,
    });
  }

  clearArea() {
    var ctx = this.state.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.state.socket.send('clear');
  }

  componentDidMount() {
    this.ready();
  }

  render() {
    return (
      <div className="control-ops">
        <div className="item keyword">
          你要画:{' '}
          <strong style={{ color: '#c00' }}>{this.state.keyword}</strong>
        </div>
        <canvas
          ref="myCanvas"
          onMouseDown={this.mouseDownHandel.bind(this)}
          onMouseMove={this.mouseMoveHandel.bind(this)}
          onMouseUp={this.mouseUpHandel.bind(this)}
          onMouseLeave={this.setMousePressed.bind(this)}
          width="500"
          height="400"
          style={{ border: '1px solid #ccc' }}
        />
        <div className="control-bar flex-box">
          <div className="item">
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.clearArea.bind(this)}
            >
              画错了，重来！
            </button>
          </div>
          <div className="item">
            笔尖力度:
            <select
              value={this.state.lineValue}
              onChange={e => this.setState({ lineValue: e.target.value })}
            >
              <option value="1">1号笔芯</option>
              <option value="3">3号笔芯</option>
              <option value="5">5号笔芯</option>
              <option value="7">7号笔芯</option>
              <option value="9">9号笔芯</option>
              <option value="11">11号笔芯</option>
            </select>
          </div>
          <div className="item">
            彩色水笔:
            <select
              value={this.state.colorValue}
              onChange={e => this.setState({ colorValue: e.target.value })}
            >
              <option value="black">黑色</option>
              <option value="blue">蓝色</option>
              <option value="red">红色</option>
              <option value="green">绿色</option>
              <option value="yellow">黄色</option>
              <option value="gray">灰色</option>
            </select>
          </div>
        </div>
      </div>
    );
  }
}
var ROLE = { none: 0, draw: 1, cai: 2 };
class Draw extends React.Component {
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

ReactDOM.render(<Draw />, document.getElementById('root'));