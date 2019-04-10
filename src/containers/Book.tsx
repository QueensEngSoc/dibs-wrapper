import { StoreState } from '../types/store';
import { selectCurrentHour, selectRoomData, selectTimeCount } from '../store/selectors/rooms';
import { selectIsLoggedIn } from '../store/selectors/user';
import { connect } from 'react-redux';
import * as React from 'react';
import { Room, RoomFreeTable } from '../types/room';
import { getDaysFromToday, getPrettyDay, sanitiseTime } from '../lib/dateFuncs';
import { Avatar, Button, Card, CardActions, CardContent, CardMedia, Grid, Paper, Typography } from '@material-ui/core';
import { PhoneRounded, TvOffRounded, TvRounded } from '@material-ui/icons';
import { GridItemWidths } from '../types/enums/grid';
import postReq from '../client/postReq';

interface Props {
  currentHour: number;
  isLoggedIn: boolean;
  roomData: Array<Room>;
  day: string;
}

interface State {
  alert: null,
  currentHour: number;
  response: Array<any>;
  selectedTimes: Array<number>;
}

class Book extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      alert: null,
      currentHour: sanitiseTime(this.props.currentHour || new Date().getHours(), true),
      response: [],
      selectedTimes: []
    };
  }

  bookRoom = async () => {
    const { selectedTimes } = this.state;

    if (selectedTimes.length) {
      console.log('selectedTimes: ', selectedTimes.toString());
      const serverResponse = await postReq('/quicky', { time: hour }) as ResponseObject;
      // console.log('serverResponse: ', serverResponse);

      // if (serverResponse.success) {
      //   this.setState({
      //     response: this.state.response.concat(serverResponse)
      //   });
      // } else {
      //   this.setState({
      //     alert: serverResponse
      //   });
      // }
    }
  };

  setSelectedTimes = (hour) => {
    console.log(hour);
    if (hour) {
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
    }
  };

  componentDidMount() {
    console.log('logged in?: ', this.props.isLoggedIn);
  }

  renderTimeButtons() {
    const { roomData, day } = this.props;
    const { currentHour, selectedTimes } = this.state;

    if (!this.props.roomData || !this.props.roomData.length)
      return;

    const daysFromToday = day && getDaysFromToday(new Date(day)) || 0;
    const hourButtons = (roomData[0].Free[daysFromToday] as Array<RoomFreeTable>).map((hour) => {
      if (hour.startTime < currentHour)
        return;

      const buttonClass = hour.isMine ? 'mtime' : hour.free ? 'ytime' : 'ntime';
      const isSelected = selectedTimes.includes(hour.startTime);

      return (
        <Grid key={roomData[0].room + hour.time} item>
          <button className={isSelected ? 'ctime' : buttonClass}
                  onClick={this.setSelectedTimes.bind(this, hour.startTime)}>{hour.time}</button>
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
    const { roomData } = this.props;

    if (!roomData.length)
      return;

    const { Picture, Map, hasPhone, hasTV, size, Description } = roomData[0];
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
    const { roomData, day } = this.props;
    const { selectedTimes } = this.state;

    if (!roomData.length)
      return;

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
                <Button size="medium" color="primary" disabled={!selectedTimes.length} onClick={this.bookRoom.bind(this)}>
                  Book Selected Hours
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
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
