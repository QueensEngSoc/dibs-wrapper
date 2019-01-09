import * as React from 'react';
import { Typography } from '@material-ui/core';
import { AccountCircle, Menu as MenuIcon } from '@material-ui/icons';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom'

interface State {

}

// @ts-ignore
interface Props extends RouteComponentProps<Props> {

}

class FooterContainer extends React.Component<Props, State> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    return (
      <div className="footer">
        <Typography variant="h6" color="inherit" className={'nav__app-name'}>
          QBook
        </Typography>
      </div>
    );
  }
}

export default withRouter(FooterContainer);
