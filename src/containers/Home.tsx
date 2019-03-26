// @ts-ignore
import React, { Component } from 'react';
import { Room, RoomFreeTable, RoomPostData, TimeCountObject } from '../types/room';
import { StoreState } from '../types/store';
import { connect } from 'react-redux';
import { selectCurrentHour, selectRoomData, selectTimeCount } from '../store/selectors/rooms';
import RadioButton from '../components/RadioButton';
import {
  Button,
  ExpansionPanel,
  ExpansionPanelSummary,
  MenuItem,
  Typography,
  ExpansionPanelDetails,
  Select, Grid,
} from '@material-ui/core/';
import { ExpandMore } from '@material-ui/icons';
import MaterialDatePicker from '../components/MaterialDatePicker';
import postReq from '../client/postReq';
import { sanitiseTime } from '../lib/dateFuncs';

async function fetchData(date, time) {
  const dateToSend = date || new Date();
  console.log('post data: ', dateToSend, date, time)
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
  currentHour: number;
  filterSize: boolean | number;
  filterPhone: boolean;
  filterTv: boolean;
  filterUnavailable: boolean;
  intDay: number;
  prettyDate: string;
  roomData: Array<Room>;
  showExtraFilters: boolean;
  selectedTime: number;
  selectedDate: Date;
  timeCount: Array<TimeCountObject>;
}

class Home extends Component<Props, State> {
  constructor(props) {
    super(props);
    const now = sanitiseTime(new Date().getHours(), true);
    this.state = {
      currentHour: this.props.currentHour || now,
      roomData: this.props.roomData || null,
      filterSize: null,
      filterPhone: false,
      filterTv: false,
      filterUnavailable: false,
      intDay: 0,
      prettyDate: null,
      showExtraFilters: false,
      selectedTime: (this.props.currentHour && this.props.currentHour >= 7 && this.props.currentHour <= 23 && this.props.currentHour)
        || this.props.timeCount && this.props.timeCount[0].twenty4Hour || now, // take either the current hour (if it is valid), or the first valid booking slot from the server response, or the current time slot
      selectedDate: new Date(),
      timeCount: this.props.timeCount || null
    };
  }

  async componentDidMount() {
    if (!this.state.roomData) {
      const selectedDate = new Date();
      const currentHour = sanitiseTime(selectedDate.getHours(), true);

      const res: RoomPostData = await fetchData(selectedDate, currentHour) as RoomPostData;
      this.setState({
        currentHour: res.currentHour,
        prettyDate: null,
        roomData: (res as RoomPostData).list || this.state.roomData,
        selectedTime: currentHour,
        timeCount: (res as RoomPostData).timeCount || this.state.timeCount
      });
    }
  }

  checkFilters(room, currentTime) {
    const { filterSize, filterPhone, filterTv, filterUnavailable } = this.state;

    if (filterSize !== null && (room.size < filterSize && filterSize >= 2 || room.size !== filterSize && filterSize < 2))
      return false;

    if (filterPhone && !room.hasPhone)
      return false;

    if (filterTv && !room.hasTV)
      return false;

    if (filterUnavailable && !room.Free[currentTime].free)
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
    const { roomData, selectedTime, prettyDate } = this.state;

    const dbTime = selectedTime - 7;

    const roomButtons = roomData && roomData.map((room) => {
      let className = 'nroom';
      const shouldShow = this.checkFilters(room, dbTime);
      if (room.Free[dbTime]) {
        className = (room.Free[dbTime] as RoomFreeTable).free ? 'yroom' : 'nroom';
        className = (room.Free[dbTime] as RoomFreeTable).isMine ? 'mroom' : className;
      }
      // {/*<Typography className="room-btn__text" variant={'body2'}>{room.roomNum}</Typography>*/}
      if (shouldShow) {
        return (
          <a key={room.roomID} className={`btn btn-lg ${className} mobileBtn`}
             href={`/book/${room.roomID}${prettyDate ? ('/' + prettyDate) : ''}`} role="button"
             id={room.roomNum}>{room.roomNum}
          </a>
        );
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
                <Typography variant={'h5'}>Room Size: </Typography>
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
            <br />
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                <Typography className={''}>Show More Filters</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Grid container spacing={16} className='row'>
                  <Grid item xs={10} sm={6} md={4} lg={4} xl={3}>
                    <Typography>
                      Toggle additional filters on and off here
                    </Typography>
                  </Grid>
                  <Grid item xs={10} sm={6} md={8} lg={8} xl={6} className="moreFiltersContainer">
                    <Button className="filterButton" variant="contained"
                            color={this.state.filterPhone ? 'primary' : 'default'}
                            onClick={() => this.toggleAdditionalFilters('phone')}>
                      Has a Phone
                    </Button>
                    <Button className="filterButton" variant="contained"
                            color={this.state.filterTv ? 'primary' : 'default'}
                            onClick={() => this.toggleAdditionalFilters('tv')}>
                      Has a TV
                    </Button>
                    <Button className="filterButton" variant="contained"
                            color={this.state.filterUnavailable ? 'primary' : 'default'}
                            onClick={() => this.toggleAdditionalFilters('unavailable')}>
                      Hide Unavailable
                    </Button>
                  </Grid>
                </Grid>
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

    const res: RoomPostData = await fetchData(selectedDate, intVal) as RoomPostData;

    this.setState({
      currentHour: res.currentHour,
      prettyDate: null,
      roomData: (res as RoomPostData).list || this.state.roomData,
      selectedTime: intVal,
      timeCount: (res as RoomPostData).timeCount || this.state.timeCount
    });
  }

  handleDateChange = async date => {
    const { selectedTime } = this.state;
    const res = await fetchData(date, selectedTime) as RoomPostData;

    this.setState({
      currentHour: res.currentHour,
      intDay: res.intDay,
      prettyDate: res.prettyDate,
      roomData: res.list || this.state.roomData,
      selectedDate: date,
      timeCount: res.timeCount || this.state.timeCount
    });
  };

  renderTimeSwitcher() {
    const { timeCount, intDay, selectedTime, currentHour } = this.state;
    const minTime = (intDay === 0 && currentHour >= 7 && currentHour <= 23) ? currentHour : 7;

    return (
      <Grid container spacing={16} className="row--add-margin row--side-margin justify-content-center">
        <Grid item xs={6} sm={5} md={3} lg={2} xl={1}>
          <div className="form-group text-center">
            <Typography align='right' variant={'h5'}>Pick a day: </Typography>
          </div>
        </Grid>
        <Grid item xs={6} sm={5} md={3} lg={2} xl={1}>
          <div className="material-date-picker-wrapper">
            <MaterialDatePicker className="material-date-picker-wrapper__inner" daysToSpan={13}
                                onChange={this.handleDateChange.bind(this)} />
          </div>
        </Grid>
        <Grid item xs={6} sm={5} md={3} lg={2} xl={1}>
          <div className="form-group text-center">
            <Typography align='right' variant={'h5'}>Pick a time: </Typography>
          </div>
        </Grid>
        <Grid item xs={6} sm={5} md={3} lg={2} xl={1}>
          <Select value={selectedTime > minTime ? selectedTime : minTime} onChange={this.onTimeChange.bind(this)}
                  className="selectpicker material-date-picker-wrapper__inner" id="timepicker" data-live-search="true"
                  data-size="10" displayEmpty>
            {timeCount && timeCount.map((time) => {
              if (time.twenty4Hour < minTime)
                return null;

              return (<MenuItem key={time.twenty4Hour} data-tokens={`${time.hour} ${time.twenty4Hour}`}
                                value={time.twenty4Hour}
                                data-content={`<span><span class='badge badge-pill ${time.pillClass}>${time.totalFree}</span> ${time.timeString}</span>`}>
                  <span><span
                    className={`badge badge-pill ${time.pillClass} home__time-picker__item__badge`}>{time.totalFree}</span>{time.timeString}</span>
              </MenuItem>);
            })}
          </Select>
        </Grid>
      </Grid>
    );
  }

  render() {
    return (
      <div className="content__wrapper">
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
