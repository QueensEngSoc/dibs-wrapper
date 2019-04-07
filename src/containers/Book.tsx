import { StoreState } from '../types/store';
import { selectCurrentHour, selectRoomData, selectTimeCount } from '../store/selectors/rooms';
import { selectIsLoggedIn } from '../store/selectors/user';
import { connect } from 'react-redux';
import * as React from 'react';
import { Room, RoomFreeTable } from '../types/room';
import { getDaysFromToday, sanitiseTime } from '../lib/dateFuncs';
import { Avatar, Card, CardContent, CardMedia, Grid, Paper, Typography } from '@material-ui/core';
import { PhoneRounded, TvOffRounded, TvRounded } from '@material-ui/icons';
import { GridItemWidths } from '../types/enums/grid';
import CardComponent from '../components/CardComponent';

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
}

class Book extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      alert: null,
      currentHour: sanitiseTime(this.props.currentHour || new Date().getHours(), true),
      response: []
    };
  }

  componentDidMount() {
    console.log('logged in?: ', this.props.isLoggedIn);
  }

  renderTimeButtons() {
    const { roomData, day } = this.props;
    const { currentHour } = this.state;

    if (!this.props.roomData || !this.props.roomData.length)
      return;

    const daysFromToday = day && getDaysFromToday(new Date(day)) || 0;
    const hourButtons = (roomData[0].Free[daysFromToday] as Array<RoomFreeTable>).map((hour) => {
      if (hour.startTime < currentHour)
        return;

      const buttonClass = hour.isMine ? 'mtime' : hour.free ? 'ytime' : 'ntime';

      return (
        <Grid key={roomData[0].room + hour.time} item>
          <button className={buttonClass}>{hour.time}</button>
        </Grid>
      );
    });

    return (
      <Grid item>
        <div className='row--add-margin-top'>
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
        <Grid container>
          <Grid item>
            {hasTV && <TvRounded />}
          </Grid>
          <Grid item>
            {hasPhone && <PhoneRounded />}
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

    if (!roomData.length)
      return;

    const { room: roomName, Picture } = roomData[0];

    return (
      <div className="content__wrapper">
        <Grid container className="justify-content-center">
          <Grid item {...GridItemWidths.xl}>
            <Card>
              <CardMedia
                className="qbook__main-card__img"
                image={Picture}
                title={roomName}
              />
              <CardContent>
                <Typography gutterBottom align={'center'} variant="h5" component="h2">
                  Book {roomName} for {day || new Date().toDateString()}
                </Typography>
                {this.renderRoomInfo()}
                <Grid container spacing={16} alignContent={'center'}>
                  {this.renderTimeButtons()}
                </Grid>
              </CardContent>
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
