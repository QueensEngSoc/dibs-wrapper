// @ts-ignore
import React, { Component } from 'react';
import { Room, RoomFreeTable, RoomPostData, TimeCountObject } from '../types/room';
import { StoreState } from '../types/store';
import { connect } from 'react-redux';
import { selectCurrentHour, selectRoomData, selectTimeCount } from '../store/selectors/rooms';
import RadioButton from '../components/RadioButton';
import { Button, ExpansionPanel, ExpansionPanelSummary, MenuItem, Typography, ExpansionPanelDetails, Input, Select } from '@material-ui/core/';
import { ExpandMore } from '@material-ui/icons';
import MaterialDatePicker from '../components/MaterialDatePicker';
import postReq from '../client/postReq';

async function fetchData(date, time) {
  const dateToSend = date || new Date();
  if (time) {
    dateToSend.setHours(time);
  }

  const response = await postReq('index', { day: date });
  console.log('response was: ', response);
  return response;
}

interface Props {
  roomData: Array<Room>;
  currentHour: number;
  timeCount: Array<TimeCountObject>;
}

interface State {
  roomData: Array<Room>;
  filterSize: boolean | number;
  filterPhone: boolean;
  filterTv: boolean;
  filterUnavailable: boolean;
  showExtraFilters: boolean;
  selectedTime: number;
  selectedDate: Date;
  timeCount: Array<TimeCountObject>;
}

class Home extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      roomData: this.props.roomData,
      filterSize: null,
      filterPhone: false,
      filterTv: false,
      filterUnavailable: false,
      showExtraFilters: false,
      selectedTime: this.props.timeCount[0].twenty4Hour,
      selectedDate: new Date(),
      timeCount: this.props.timeCount
    };
  }

  componentDidMount() {

  }

  checkFilters(room, currentTime) {
    const { filterSize, filterPhone, filterTv, filterUnavailable } = this.state;

    if (filterSize !== null && (room.size < filterSize && filterSize >= 2 || room.size !== filterSize && filterSize < 2))
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
        <div className="col-xs-12 col-sm-10 col-md-10 col-lg-8 indexRoomButtonContainer" id="roomButtons">
          {roomButtons}
        </div>
      </div>
    );
  }

  toggleAdditionalFilters(filter) {
    this.setState({
      filterPhone: filter === 'phone' ? !this.state.filterPhone : this.state.filterPhone,
      filterTv: filter === 'tv' ? !this.state.filterTv : this.state.filterTv,
      filterUnavailable: filter === 'unavailable' ? !this.state.filterUnavailable : this.state.filterUnavailable
    })
  }

  renderFilters() {
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
                <RadioButton selected={''} onChange={this.onFilterChange.bind(this)}>{[
                  { label: 'Any', value: '' },
                  { label: 'Small', value: 0 },
                  { label: 'Medium', value: 1 },
                  { label: 'Large', value: 2 }]}
                </RadioButton>
              </div>
            </div>
            <br/>
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMore/>}>
                <Typography className={''}>Show More Filters</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <div className='row'>
                  <div className="col-md-auto">
                    <Typography>
                      Toggle additional filters on and off here
                    </Typography>
                  </div>
                  <div className="col-md-auto moreFiltersContainer">
                    <Button className="filterButton" variant="contained" color={this.state.filterPhone ? 'primary' : 'default'} onClick={() => this.toggleAdditionalFilters('phone')}>
                      Has a Phone
                    </Button>
                    <Button className="filterButton" variant="contained" color={this.state.filterTv ? 'primary' : 'default'} onClick={() => this.toggleAdditionalFilters('tv')}>
                      Has a TV
                    </Button>
                    <Button className="filterButton" variant="contained" color={this.state.filterUnavailable ? 'primary' : 'default'} onClick={() => this.toggleAdditionalFilters('unavailable')}>
                      Hide Unavailable
                    </Button>
                  </div>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </div>
        </div>
      </div>
    );
  }

  async onTimeChange(event) {
    const selectedValue = event.target.value;
    const intVal = selectedValue !== '' ? parseInt(selectedValue) : null;
    const { selectedDate } = this.state;

    const res = fetchData(selectedDate, intVal);

    this.setState({
      selectedTime: intVal,
      roomData: (res as RoomPostData).list || this.state.roomData,
      timeCount: (res as RoomPostData).timeCount || this.state.timeCount
    });

    console.log(selectedValue, intVal, res);
  }

  handleDateChange = async date => {
    console.log('date is now: ', date);
    const { selectedTime } = this.state;
    const res = await fetchData(date, selectedTime);

    this.setState({
      selectedDate: date,
      roomData: res.list || this.state.roomData,
      timeCount: res.timeCount || this.state.timeCount
    });
  };

  renderTimeSwitcher() {
    const { timeCount } = this.props;

    return (
      <div className="row justify-content-center">
        <div className="col-md-auto">
          <div className="form-group text-center">
            <h3>
              <strong>Pick a day: </strong>
              <MaterialDatePicker daysToSpan={14} onChange={this.handleDateChange.bind(this)} />
            </h3>
          </div>
        </div>
        <div className="col-md-auto">
          <div className="form-group text-center">
            <h3>
              <strong>Pick a time: </strong>
              <Select value={this.state.selectedTime} onChange={this.onTimeChange.bind(this)} className="selectpicker" id="timepicker" data-live-search="true" data-size="10" displayEmpty>
                {timeCount.map((time) => {
                  return (<MenuItem key={time.twenty4Hour} data-tokens={`${time.hour} ${time.twenty4Hour}`} value={time.twenty4Hour}
                          data-content={`<span><span class='badge badge-pill ${time.pillClass}>${time.totalFree}</span> ${time.timeString}</span>`}>
                    {time.timeString}
                  </MenuItem>);
                })}
              </Select>

            </h3>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        <h1>Hello, this is React!</h1>
        {this.renderTimeSwitcher()}
        {this.renderFilters()}
        {this.renderTimeButtons()}
      </div>
    );
  }
}

function mapStateToProps(state: StoreState) {
  return {
    roomData: selectRoomData(state),
    currentHour: selectCurrentHour(state),
    timeCount: selectTimeCount(state)
  };
}

export default connect(mapStateToProps)(Home);
