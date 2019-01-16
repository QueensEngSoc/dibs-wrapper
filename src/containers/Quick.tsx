import * as React from 'react';
import { Typography, Card, CardContent, CardMedia, CardHeader, CardActions, Button } from '@material-ui/core';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom'
import { StoreState } from '../types/store';
import { selectCurrentHour, selectRoomData, selectTimeCount } from '../store/selectors/rooms';
import { connect } from 'react-redux';
import { getPrettyHour, sanitiseTime } from '../lib/dateFuncs';
import postReq from '../client/postReq';
import SnackBar, { SnackBarVariant } from '../components/SnackBar';

interface ResponseObject {
  header: string
  bookMsg: string
  success: boolean,
  day: number,
  room: string,
  roomNum: string,
  free: any,
  pic: string,
  roomid: number,
  prettyDay: string,
  description: string,
  times: Array<number>
}

interface State {
  currentHour: number;
  response: ResponseObject;
  alert: any;
}

// @ts-ignore
interface Props extends RouteComponentProps<Props> {
  currentHour: number;
}

class Quick extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const sanitisedHour = sanitiseTime(this.props.currentHour);

    this.state = {
      alert: null,
      currentHour: sanitisedHour,
      response: null
    };
  }

  componentDidMount() {
  }

  sendPostReq = async (hour) => {
    if (hour) {
      console.log('hour: ', hour);
      const response: ResponseObject = await postReq('/quicky', { time: hour }) as ResponseObject;
      console.log('response: ', response);

      if (response.success) {
        this.setState({
          response
        });
      } else {
        this.setState({
          alert: response
        });
      }
    }
  };

  renderAlert() {
    const { alert } = this.state;
    console.log('At renderAlert.  State: ', this.state);

    if (!alert)
      return (null);

    console.log('rendering alert!');
    return (
      <SnackBar type={SnackBarVariant.Error} className='quick__error-alert' message={alert.bookMsg} />
    );
  }

  renderInfo() {
    const { currentHour, response } = this.state;
    const isSuccess = response && response.success;

    const cardHeaderText = isSuccess ? `Booked ${response.room} for ${response.times.map((time) => {
      return `${getPrettyHour(time)} - ${getPrettyHour(time + 1, true)}`;
    }).join(', ')}` : 'Quick Book';
    const cardImg = isSuccess ? response.pic : '/img/ilc-small.jpg';
    const cardDescription = isSuccess ? <Typography component="p">{response.description}</Typography> :
      <>
        <Typography component="p">
          QuickBook™ Automagically™ books the first available room for the coming hour. Already got a QuickBook™ room
          for this hour? Click again to Automagically™ get a booking for the next free hour!
        </Typography>
        <Typography component="p">
          Ready to get started? Click below!
        </Typography>
      </>;

    const bookNowTime = isSuccess ? currentHour + 1 : currentHour;

    return (
      <div className="quick row justify-content-center">
        <Card className="quick__main-card">
          <CardMedia
            className="quick__main-card__img"
            image={cardImg}
            title={isSuccess ? response.room : 'ILC'}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {cardHeaderText}
            </Typography>
            {cardDescription}
            <CardActions>
              <Button size="medium" color="primary" onClick={this.sendPostReq.bind(this, bookNowTime)}>
                Book Now
              </Button>
              <Button size="medium" color="secondary" onClick={this.sendPostReq.bind(this, bookNowTime + 1)}>
                Book for {getPrettyHour(bookNowTime + 1)} - {getPrettyHour(bookNowTime + 2, true)}
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
        {this.renderAlert()}
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
