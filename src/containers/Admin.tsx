import * as React from 'react';
import { Typography, Card, CardContent, CardMedia, CardHeader, Grid } from '@material-ui/core';
import { AccountCircle, Menu as MenuIcon } from '@material-ui/icons';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom'
import { StoreState } from '../types/store';
import { selectCurrentHour, selectRoomData, selectTimeCount } from '../store/selectors/rooms';
import { connect } from 'react-redux';
import { Room, RoomState, TimeCountObject } from '../types/room';
import BasicTable, { convertRoomDataToTable } from '../components/BasicTable';

const tableGridWidth = { xs: 12, sm: 10, md: 10, lg: 8, xl: 5 };

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
            <BasicTable headings={headings} data={convertRoomDataToTable(this.props.roomData, this.props.currentHour)} />
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

  render() {
    return (
      <div className="content__wrapper">
        {this.renderStatusCards()}
        {this.renderRoomsTable()}
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
