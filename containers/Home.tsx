import { Component } from 'react';
import { Room, RoomFreeTable } from '../types/room';
import { StoreState } from '../types/store';
import { connect } from 'react-redux';
import { selectCurrentHour, selectRoomData } from '../store/selectors/rooms';
import RadioButton from '../components/RadioButton';

interface Props {
  roomData: Array<Room>;
  currentHour: number;
}

interface State {
  roomData: Array<Room>;
  filterSize: boolean | number;
  filterPhone: boolean;
  filterTv: boolean;
  filterUnavailable: boolean;
}

class Home extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      roomData: this.props.roomData,
      filterSize: null,
      filterPhone: false,
      filterTv: false,
      filterUnavailable: false
    };
  }

  componentDidMount() {
  }

  checkFilters(room, currentTime) {
    const { filterSize, filterPhone, filterTv, filterUnavailable } = this.state;

    if (filterSize !== null && room.size !== filterSize)
      return false;

    if (filterPhone && !room.hasPhone)
      return false;

    if (filterTv && !room.hasTV)
      return false;

    if (filterUnavailable && !room.isFree[currentTime].free)
      return false;

    return true;
  }

  onFilterChange(selectedValue) {
    console.log('clicked! ', selectedValue)
    const intVal = selectedValue !== '' ? parseInt(selectedValue) : null;
    this.setState({
      filterSize: intVal
    });
  }


  renderTimeButtons() {
    const { roomData } = this.state;
    const currentTime = this.props.currentHour - 7;

    const roomButtons = roomData && roomData.map((room) => {
      if (room.isFree[currentTime]) {
        let className = (room.isFree[currentTime] as RoomFreeTable).free ? 'yroom' : 'nroom';
        className = (room.isFree[currentTime] as RoomFreeTable).isMine ? 'mroom' : className;
        const shouldShow = this.checkFilters(room, currentTime);

        if (shouldShow) {
          return (
            <a key={room.roomID} className={`btn btn-lg ${className} mobileBtn`}
               href={`/book/${room.roomID}`} role="button"
               id={room.roomNum}>{room.roomNum}
            </a>
          );
        }
      }
    });

    return (
      <div className="row justify-content-center">
        <div className="col-xs-12 col-sm-10 col-md-10 col-lg-8" id="roomButtons">
          {roomButtons}
        </div>
      </div>
    );
  }

  renderFilters() {
    // @ts-ignore
    return (
      <div className="row justify-content-center">
        <div className="col-md-8 col-sm-12 col-xs-12">
          <div className="form-group text-center" id="selectionForm">
            <div className="row" style={{ justifyContent: 'center' }}>
              <div className="col-md-auto">
                <h4 style={{ marginTop: 0.25 + 'em' }}>
                  <strong>Room Size: </strong>
                </h4>
              </div>

              <div className="col-lg-8 col-md-10 col-sm-12 col-xs-12">
                <RadioButton selected={null} onChange={this.onFilterChange.bind(this)}>{[
                  { label: 'Any', value: null },
                  { label: 'Small', value: 0 },
                  { label: 'Medium', value: 1 },
                  { label: 'Large', value: 2 }]}
                </RadioButton>
              </div>
            </div>
            <br/>
            <button onClick={() => {
            }} className="btn btn-primary">Show More Filters
            </button>
            <div id="filters" style={{ display: 'none', paddingTop: 15 + 'px' }}>
              <label className="chk-container">&nbsp;
              <input type="checkbox" data-value="hasPhone">
              </input>
              <span className="checkmark">Has a Phone</span>
              </label>
              <label className="chk-container">&nbsp;
              <input type="checkbox" data-value="hasTV">
              </input>
              <span className="checkmark">Has a TV</span>
              </label>
              <br/>
              <label className="chk-container">&nbsp;
              <input type="checkbox" data-value="onlyFree">
              </input>
              <span className="checkmark">Hide Unavailable</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        <h1>Hello, this is React!</h1>
        {this.renderFilters()}
        {this.renderTimeButtons()}
      </div>
    );
  }
}

// roomData: selectRoomData(state)

function mapStateToProps(state: StoreState) {
  return {
    roomData: selectRoomData(state),
    currentHour: selectCurrentHour(state)
  };
}

export default connect(mapStateToProps)(Home);
