import { StoreState } from '../types/store';
import { selectCurrentHour, selectRoomData, selectTimeCount } from '../store/selectors/rooms';
import { selectIsLoggedIn } from '../store/selectors/user';
import { connect } from 'react-redux';
import * as React from 'react';
import { Room, RoomFreeTable } from '../types/room';
import { getDaysFromToday, getPrettyDay, sanitiseTime } from '../lib/dateFuncs';
import { Avatar, Button, Card, CardActions, CardContent, CardMedia, Grid, Typography } from '@material-ui/core';
import { PhoneRounded, TvRounded } from '@material-ui/icons';
import { GridItemWidths } from '../types/enums/grid';
import postReq from '../client/postReq';
import SnackBar, { SnackBarVariant } from '../components/SnackBar';
import { BookingResponseObject } from '../types/book';
import { RouteComponentProps } from 'react-router';

async function fetchData(roomID) {
  if (roomID) {
    const response = await postReq('book-v2', { roomID });
    console.log('response was: ', response);
    return response;
  }
}

interface MatchParams {
  roomName: string;
}

interface Props extends RouteComponentProps<MatchParams> {
  currentHour: number;
  isLoggedIn: boolean;
  roomData: Array<Room>;
  day: string;
}

interface State {
  alert: {
    message: string;
    variant?: SnackBarVariant;
  };
  day: number;
  roomName: string;
  roomData: Array<Room>;
  currentHour: number;
  response: Array<any>;
  selectedTimes: Array<number>;
}

class Book extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    console.log(this.props);

    this.state = {
      alert: null,
      day: this.props.day && getDaysFromToday(new Date(this.props.day)) || 0,
      currentHour: sanitiseTime(this.props.currentHour || new Date().getHours(), true),
      response: [],
      selectedTimes: [],
      roomData: this.getRoomData() || this.props.roomData,
      roomName: this.props.match && this.props.match.params && this.props.match.params.roomName.toUpperCase().replace(/-/g, ' ') || null,
    };
  }

  getRoomData(roomArr?: Array<Room>) {
    const { roomData: propRoomData, match } = this.props;

    const roomData = roomArr || propRoomData;

    if (!roomData || !roomData.length || !match || !match.params || !match.params.roomName) {
      return null;
    }

    const roomName = match.params.roomName.toUpperCase().replace(/-/g, ' ');

    return roomData.filter((room) => room.room === roomName) || null;
  }

  async buildRoomData() {
    const { roomData, roomName } = this.state;

    if (!roomData || !roomData.length || roomData.length !== 1) {
      console.log('fetchign ', roomName, this.props.match, this.props.match.params, this.props.match.params.roomName, this.props.match && this.props.match.params && this.props.match.params.roomName);
      const roomData = await fetchData(roomName);
      console.log('got ', roomData);
      const room = this.getRoomData(roomData as Array<Room>);

      this.setState({
        roomData: room
      });
    }
  }

  bookRoom = async () => {
    const { selectedTimes, roomData, roomName, day } = this.state;

    if (selectedTimes.length) {
      console.log('selectedTimes: ', selectedTimes.toString());

      const roomName = roomData && roomData[0].room || roomName;
      const serverResponse = await postReq('/bookroom', {
        times: selectedTimes,
        roomName,
        day
      }) as BookingResponseObject;
      console.log('serverResponse: ', serverResponse);

      if (serverResponse.BookStatus) {
        this.setState({
          response: this.state.response.concat(serverResponse),
          alert: { message: serverResponse.HeaderMsg, variant: SnackBarVariant.Success }
        });
      } else {
        this.setState({
          alert: { message: serverResponse.HeaderMsg }
        });
      }
    }
  };

  setSelectedTimes = (hour: number, free: boolean) => {
    console.log(hour);
    if (hour && free) {
      const { selectedTimes } = this.state;
      const hourIndex = selectedTimes.indexOf(hour);
      if (hourIndex < 0)
        selectedTimes.push(hour);
      else
        selectedTimes.splice(hourIndex, 1);

      console.log(selectedTimes);
      this.setState({
        selectedTimes: selectedTimes
      });
    } else if (!free) {
      this.setState({
        alert: { message: 'Sorry, someone has already booked this time', variant: SnackBarVariant.Warning }
      });
    }
  };

  async componentDidMount() {
    const { roomData } = this.state;

    console.log('logged in?: ', this.props.isLoggedIn);
    console.log(this.props, this.state);

    await this.buildRoomData();
  }

  resetAlertState() {
    this.setState({
      alert: null
    })
  }

  renderAlert() {
    const { alert } = this.state;

    if (!alert)
      return (null);

    return (
      <SnackBar type={alert.variant || SnackBarVariant.Error} className='quick__error-alert' message={alert.message}
                onDismiss={this.resetAlertState.bind(this)} />
    );
  }

  renderTimeButtons() {
    const { day } = this.props;
    const { currentHour, selectedTimes, roomData } = this.state;

    if (!this.props.roomData || !this.props.roomData.length)
      return null;

    const daysFromToday = day && getDaysFromToday(new Date(day)) || 0;
    const hourButtons = (roomData[0].Free[daysFromToday] as Array<RoomFreeTable>).length && (roomData[0].Free[daysFromToday] as Array<RoomFreeTable>).map((hour) => {
      if (hour.startTime < currentHour)
        return null;

      const buttonClass = hour.isMine ? 'mtime' : hour.free ? 'ytime' : 'ntime';
      const isSelected = selectedTimes.includes(hour.startTime);

      return (
        <Grid key={roomData[0].room + hour.time} item>
          <button className={isSelected ? 'ctime' : buttonClass}
                  onClick={this.setSelectedTimes.bind(this, hour.startTime, hour.free)}>{hour.time}</button>
        </Grid>
      );
    });

    return (
      <Grid item>
        <div className='section'>
          <Grid container spacing={16}>
            {hourButtons}
          </Grid>
        </div>
      </Grid>
    );
  }

  renderRoomInfo() {
    const { roomData } = this.state;

    if (!roomData.length)
      return null;

    const { hasPhone, hasTV, size, Description } = roomData[0];
    const sizeName = size === 0 ? 'S' : size === 1 ? 'M' : size === 2 ? 'L' : 'XL';

    return (
      <Grid item className="justify-content-center">
        <Typography>
          {Description}
        </Typography>
        <Grid container spacing={8}>
          <Grid item>
            {hasTV && <TvRounded className="book__feature-icon" />}
          </Grid>
          <Grid item>
            {hasPhone && <PhoneRounded className="book__feature-icon" />}
          </Grid>
          <Grid item>
            <Avatar>{sizeName}</Avatar>
          </Grid>
        </Grid>
      </Grid>
    );
  }

  render() {
    const { day } = this.props;
    const { selectedTimes, roomData } = this.state;

    if (!roomData.length)
      return null;

    console.log('room0', roomData[0], roomData);
    const { room: roomName, Picture } = roomData[0];

    return (
      <div className="content__wrapper">
        <Grid container className="justify-content-center">
          <Grid item {...GridItemWidths.xl}>
            <Card>
              <CardMedia
                className="qbook__main-card__img--tall"
                image={Picture}
                title={roomName}
              />
              <CardContent>
                <Typography gutterBottom align={'center'} variant="h5" component="h2">
                  Book {roomName} for {day || getPrettyDay(0, true)}
                </Typography>
                {this.renderRoomInfo()}
                <Grid container spacing={16} alignContent={'center'}>
                  {this.renderTimeButtons()}
                </Grid>
              </CardContent>
              <CardActions>
                <Button size="medium" color="primary" disabled={!selectedTimes.length}
                        onClick={this.bookRoom.bind(this)}>
                  Book Selected Hours
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
        {this.renderAlert()}
      </div>
    );
  }

}

function mapStateToProps(state: StoreState) {
  return {
    roomData: selectRoomData(state),
    currentHour: selectCurrentHour(state),
    timeCount: selectTimeCount(state),
    isLoggedIn: selectIsLoggedIn(state)
  };
}

export default connect(mapStateToProps)(Book);
