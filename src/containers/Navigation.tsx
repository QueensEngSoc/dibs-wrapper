// import { Navigation } from
import * as React from 'react';
import {
  AppBar, Divider,
  Drawer,
  IconButton,
  List,
  ListItem, ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography
} from '@material-ui/core';
import {
  AccountCircle,
  MapRounded,
  Menu as MenuIcon,
  InfoRounded,
  SettingsRounded,
  DashboardRounded
} from '@material-ui/icons';
import { RouteComponentProps, withRouter } from 'react-router';
import { StoreState } from '../types/store';
import { connect } from 'react-redux';
import { selectIsAdmin, selectIsLoggedIn } from '../store/selectors/user';
import { Link } from 'react-router-dom'
import CustomImageButton from '../components/CustomImageButton';

const topMenuData = [
  { name: 'Map View', icon: <MapRounded />, to: '/map' }
];

const bottomMenuData = [
  { name: 'About', icon: <InfoRounded />, to: '/about' }
];

interface State {
  drawerOpen: boolean;
  isAccountMenuOpen: boolean;
  isMounted: boolean;
  ref: HTMLElement;
}

// @ts-ignore
interface Props extends RouteComponentProps<Props> {
  isAdmin: boolean;
  isLoggedIn: boolean;
  navigationProps: any;
}

class NavigationContainer extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      drawerOpen: false,
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

  handleSidebar = event => {
    this.setState({
      drawerOpen: true
    });
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

  toggleDrawer = (open) => () => {
    this.setState({
      drawerOpen: open
    });
  };

  renderSidebar() {
    const { drawerOpen } = this.state;
    const { isAdmin, isLoggedIn } = this.props;

    return (
      <Drawer open={drawerOpen} onClose={this.toggleDrawer(false)}>
        <div
          tabIndex={0}
          role="button"
          onClick={this.toggleDrawer(false)}
          onKeyDown={this.toggleDrawer(false)}
        >
          <div className="navigation__drawer">
            <List>
              {isAdmin && <ListItem button>
                <ListItemIcon><DashboardRounded /></ListItemIcon>
                <ListItemText primary="Admin Dashboard" />
              </ListItem>}
            {
              topMenuData.map((item) => {
                return (
                  <ListItem button onClick={this.handleClose.bind(this, item.to)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.name} />
                  </ListItem>
                );
              })
            }
            </List>
            <Divider />
            <List>
              {bottomMenuData.map((item) => {
                return (
                  <ListItem button onClick={this.handleClose.bind(this, item.to)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.name} />
                  </ListItem>
                );
              })
              }
            </List>
          </div>
        </div>
      </Drawer>
    );
  }

  render() {
    const { navigationProps, isLoggedIn } = this.props;
    const { ref } = this.state;
    const open = Boolean(ref);

    return (
      <nav className="navigation">
        <AppBar position="static" className={'navigation__wrapper'}>
          <Toolbar>
            <IconButton onClick={this.handleSidebar} className={'navigation__account-menu-btn'} color="inherit"
                        aria-label="Menu">
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
        {this.renderSidebar()}
      </nav>
    );
  }
}

function mapStateToProps(state: StoreState) {
  return {
    isLoggedIn: selectIsLoggedIn(state),
    isAdmin: selectIsAdmin(state)
  };
}

// withStyles(styles)

export default withRouter(connect(mapStateToProps)(NavigationContainer));
