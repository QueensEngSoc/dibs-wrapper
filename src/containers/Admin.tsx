import * as React from 'react';
import { Typography, Card, CardContent, CardMedia, CardHeader } from '@material-ui/core';
import { AccountCircle, Menu as MenuIcon } from '@material-ui/icons';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom'
import { StoreState } from '../types/store';
import { selectCurrentHour, selectRoomData, selectTimeCount } from '../store/selectors/rooms';
import { connect } from 'react-redux';

interface State {

}

// @ts-ignore
interface Props extends RouteComponentProps<Props> {

}

class Admin extends React.Component<Props, State> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  renderStatusCards() {
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
              15/32 Rooms Booked
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
