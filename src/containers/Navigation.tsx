// import { Navigation } from
import * as React from 'react';
import { AppBar, IconButton, Menu, MenuItem, Toolbar, Typography } from '@material-ui/core';
import { AccountCircle, Menu as MenuIcon } from '@material-ui/icons';
import { RouteComponentProps, withRouter } from 'react-router';
import { StoreState } from '../types/store';
import { connect } from 'react-redux';
import { selectIsLoggedIn } from '../store/selectors/user';
import { Link } from 'react-router-dom'
import CustomImageButton from '../components/CustomImageButton';

interface State {
  isAccountMenuOpen: boolean;
  isMounted: boolean;
  ref: HTMLElement;
}

// @ts-ignore
interface Props extends RouteComponentProps<Props> {
  isLoggedIn: boolean;
  navigationProps: any;
}

class NavigationContainer extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      isAccountMenuOpen: this.props.isLoggedIn,
      isMounted: false,
      ref: null
    }
  }

  handleChange = event => {
    this.setState({ isAccountMenuOpen: event.target.checked });
  };

  handleMenu = event => {
    this.setState({ ref: event.currentTarget });
  };

  handleClose = (url) => {
    this.setState({ ref: null });

    if (url) {
      console.log('url is', url);
      try {
        if (window && url)
          window.location.href = url;
        return true;
      } catch (err) {
        console.error(err);
        return null;
      }
    }

    return null;
  };

  componentDidMount() {
  }

  render() {
    const { navigationProps, isLoggedIn } = this.props;
    const { ref } = this.state;
    const open = Boolean(ref);

    return (
      <nav className="navigation">
        <AppBar position="static" className={'navigation__wrapper'}>
          <Toolbar>
            <IconButton className={'navigation__account-menu-btn'} color="inherit" aria-label="Menu">
              <MenuIcon />
            </IconButton>
            {/*<CustomImageButton imgSrc='img/qlogo.png'/>*/}
            <Link to={'/'}>
              <img src="/img/qlogo.png" className="navigation__qbook-logo" alt="QBook Logo" height="20px"
                   width="28px" />
            </Link>

            <Link to={'/'} className={'navigation__app-name'}>
              <Typography variant="h6" color="inherit">
                QBook
              </Typography>
            </Link>

            {isLoggedIn && (
              <div>
                <IconButton
                  aria-owns={open ? 'menu-appbar' : undefined}
                  aria-haspopup="true"
                  onClick={this.handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={ref}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={open}
                  onClose={this.handleClose}
                >
                  <MenuItem onClick={this.handleClose.bind(this, '/accounts')}>Profile</MenuItem>
                  <MenuItem onClick={this.handleClose.bind(this, '/logout')}>Log Out</MenuItem>
                </Menu>
              </div>
            )}
            {!isLoggedIn && (
              <IconButton
                aria-owns={open ? 'menu-appbar' : undefined}
                aria-haspopup="true"
                color="inherit"
                className="md__icon-button"
                href="/login"
              >
                <AccountCircle />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>
      </nav>
    );
  }
}

function mapStateToProps(state: StoreState) {
  return {
    isLoggedIn: selectIsLoggedIn(state)
  };
}

// withStyles(styles)

export default withRouter(connect(mapStateToProps)(NavigationContainer));
