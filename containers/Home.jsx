import { Component } from 'react';

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      roomData: this.props.data
    };
  }

  componentDidMount() {
  }

  renderTimeButtons() {
    console.log(this.state)
    const { roomData } = this.state;
    const currentTime = this.props.time - 7;

    const roomButtons = roomData.map((room) => {
      if (room.isFree[currentTime]) {
        let className = room.isFree[currentTime].free ? 'yroom' : 'nroom';
        className = room.isFree[currentTime].isMine ? 'mroom' : className;

        return (
          <a key={room.roomID} className={`btn btn-lg ${className} mobileBtn`} href={`/book/${room.roomID}`} role="button"
             id={room.roomNum}>{room.roomNum}
            {/*<input type=hidden id="roomSize" name="roomSize" value={room.size}/>*/}
            {/*<input type=hidden id="hasTV" name="hasTV" value={room.hasTV}/>*/}
            {/*<input type=hidden id="hasPhone" name="hasPhone" value={room.hasPhone}/>*/}
          </a>
        );
      }
    });

    return (
      <div className="row justify-content-center">
        <div className="col-xs-12 col-sm-10 col-md-10 col-lg-8" id="roomButtons" align="center">
          {roomButtons}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        <h1>Hello, this is React!</h1>

        {this.renderTimeButtons()}
      </div>
    );
  }
}
