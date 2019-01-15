import * as React from 'react';
import { Typography, Card, CardContent, CardMedia, CardHeader, CardActions, Button } from '@material-ui/core';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom'
import { StoreState } from '../types/store';
import { selectCurrentHour, selectRoomData, selectTimeCount } from '../store/selectors/rooms';
import { connect } from 'react-redux';
import { getPrettyHour } from '../lib/dateFuncs';

interface State {

}

// @ts-ignore
interface Props extends RouteComponentProps<Props> {
  currentHour: number;
}

class Quick extends React.Component<Props, State> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  renderInfo() {
    const { currentHour } = this.props;

    return (
      <div className="quick row justify-content-center">
        <Card className="quick__main-card">
          <CardMedia
            className="quick__main-card__img"
            image="/img/ilc-small.jpg"
            title="ILC"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              Quick Book
            </Typography>
            <Typography component="p">
              QuickBook™ Automagically™ books the first available room for the coming hour.  Already got a QuickBook™ room for this hour? Click again to Automagically™ get a booking for the next free hour!
            </Typography>
            <Typography component="p">
              Ready to get started? Click below!
            </Typography>
            <CardActions>
              <Button size="medium"  color="primary">
                Book Now
              </Button>
              <Button size="medium" color="secondary">
                Book for {getPrettyHour(currentHour + 1)} - {getPrettyHour(currentHour + 2)}
              </Button>
            </CardActions>
          </CardContent>
        </Card>

      </div>
    );
  }

  render() {
    return (
      <div className="content__wrapper">
        {this.renderInfo()}
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

export default connect(mapStateToProps)(Quick);
