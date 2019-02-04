import * as React from 'react';
import { Typography, Card, CardContent, CardMedia, CardHeader, Grid } from '@material-ui/core';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom'
import { StoreState } from '../types/store';
import { selectCurrentHour, selectRoomData, selectTimeCount } from '../store/selectors/rooms';
import { connect } from 'react-redux';
import { Room, RoomState, TimeCountObject } from '../types/room';
import BasicTable, { convertRoomDataToTable } from '../components/BasicTable';
import { GridProps } from '@material-ui/core/Grid';
import { per_room_limit, dibsVersion, room_booking_limit, room_hour_limit } from '../../config/config';

const tableGridWidth: GridProps = { xs: 12, sm: 10, md: 10, lg: 8, xl: 5 };
const smallCardWidth: GridProps = { xs: 6, sm: 5, md: 3, lg: 3, xl: 2 };

interface State {
  timeCount: Array<TimeCountObject>
}

// @ts-ignore
interface Props extends RouteComponentProps<Props> {
  timeCount: Array<TimeCountObject>;
  currentHour: number;
  roomData: Array<Room>;
}

class Admin extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      timeCount: this.props.timeCount || []
    }
  }

  componentDidMount() {
  }

  renderRoomsTable() {
    const headings = [
      'Room', 'Size', 'Has a TV', 'Has a Phone', 'Currently Free', 'Booking Owner'
    ];

    return (
      <Grid container spacing={16} className="justify-content-center">
        <Grid item {...tableGridWidth}>
          <div>
            <BasicTable headings={headings}
                        data={convertRoomDataToTable(this.props.roomData, this.props.currentHour)} />
          </div>
        </Grid>
      </Grid>
    )
  }

  renderStatusCards() {
    const { timeCount } = this.state;

    return (
      <div className="row justify-content-center">
        <Card>
          <CardMedia
            className="admin__status-card__img"
            image="/img/ilc-small.jpg"
            title="ILC"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {timeCount[0].totalCount - timeCount[0].totalFree}/{timeCount[0].totalCount} Rooms Booked
            </Typography>
            <Typography component="p">
              This is the number of currently booked rooms in the ILC
            </Typography>
          </CardContent>
        </Card>

      </div>
    );
  }

  renderConstCards() {
    const cards = [{ val: per_room_limit, name: 'Per Room Booking Limit' },
      { val: dibsVersion, name: 'QBook Version' }, {
        val: room_booking_limit,
        name: 'Room Booking Limit'
      }, { val: room_hour_limit, name: 'Booking Hour Limit' }].map((constVal) => {
      return (
        <Grid key={constVal.name.trim()} item {...smallCardWidth}>
          <div>
            <Card>
              <CardMedia
                className="admin__status-card__img"
                image="/img/ilc-small.jpg"
                title="ILC"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  {constVal.val.toString()}
                </Typography>
                <Typography component="p">
                  {constVal.name}
                </Typography>
              </CardContent>
            </Card>
          </div>
        </Grid>
      );
    });

    return (
      <div className="admin__const-card__container">
        <Grid container spacing={16} className="justify-content-center">
          {cards}
        </Grid>
      </div>
    );
  }

  render() {
    return (
      <div className="content__wrapper">
        {this.renderStatusCards()}
        {this.renderRoomsTable()}
        {this.renderConstCards()}
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

export default connect(mapStateToProps)(Admin);
