import { StoreState } from '../types/store';
import { selectCurrentHour, selectRoomData, selectTimeCount } from '../store/selectors/rooms';
import { selectIsLoggedIn } from '../store/selectors/user';
import { connect } from 'react-redux';
import * as React from 'react';
import { Room, RoomFreeTable } from '../types/room';
import { getDaysFromToday } from '../lib/dateFuncs';
import { Grid } from '@material-ui/core';
import { GridItemWidths } from '../types/enums/grid';

interface Props {
  currentHour: number;
  isLoggedIn: boolean;
  roomData: Array<Room>;
  day: string;
}

interface State {

}

class Book extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    // const sanitisedHour = sanitiseTime(this.props.currentHour);

    this.state = {
      alert: null,
      // currentHour: sanitisedHour,
      response: []
    };
  }

  componentDidMount() {
    console.log('logged in?: ', this.props.isLoggedIn);
  }

  renderTimeButtons() {
    const { roomData, day } = this.props;

    if (!this.props.roomData || !this.props.roomData.length)
      return;

    const daysFromToday = day && getDaysFromToday(new Date(day)) || 0;
    const hourButtons = (roomData[0].Free[daysFromToday] as Array<RoomFreeTable>).map((hour) => {
      const buttonClass = hour.isMine ? 'mtime' : hour.free ? 'ytime' : 'ntime';
      return (
        <Grid item {...GridItemWidths.small} key={day + hour.time}>
          <li>
            <button className={buttonClass}>{hour.time}</button>
          </li>
        </Grid>
      );
    });

    return (
      <div>
        <Grid container spacing={16}>
          {hourButtons}
        </Grid>
      </div>
    );
  }

  render() {

    return (
      <div className="content__wrapper">
        {this.renderTimeButtons()}
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
