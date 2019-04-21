// @ts-ignore
import React, { Component, ReactNode } from 'react';
import classNames from 'classnames';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning';
import { withStyles } from '@material-ui/core/styles';

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

const SnackBarStyles = theme => ({
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  info: {
    backgroundColor: theme.palette.primary.dark,
  },
  warning: {
    backgroundColor: amber[700],
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing.unit,
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
});

export enum SnackBarVariant {
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
  Info = 'info'
}

interface Props {
  classes: Classes,
  className: string,
  message: ReactNode,
  onClose: Function | any,
  variant: SnackBarVariant
};

function StyledSnackBar(props: Props) {
  const { classes, className, message, onClose, variant, ...other } = props;
  const Icon = variantIcon[variant];

  return (
    <SnackbarContent
      className={classNames(classes[variant], className)}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={classes.message}>
          <Icon className={classNames(classes.icon, classes.iconVariant)} />
          {message}
        </span>
      }
      action={[
        <IconButton
          key="close"
          aria-label="Close"
          color="inherit"
          className={classes.close}
          onClick={onClose}
        >
          <CloseIcon className={classes.icon} />
        </IconButton>,
      ]}
      {...other}
    />
  );
}

const SnackbarWrapper = withStyles(SnackBarStyles)(StyledSnackBar);

//----------------------------- Below is the public SnackBar class, above is the styled component private to this class -----------------------------

interface Classes {
  [key: string]: string;
}

interface SnackbarProps {
  className: string;
  type: SnackBarVariant;
  message: string | ReactNode;
  timeout?: number;
  verticalPos?: 'bottom' | 'top';
  horizontalPos?: 'center' | 'left' | 'right';
  onDismiss?: Function;
};

interface SnackBarState {
  open: boolean;
}

class CustomSnackBar extends Component<SnackbarProps, SnackBarState> {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
    };
  }

  handleClose = (event, reason) => {
    const { onDismiss, timeout } = this.props;

    if (reason === 'clickaway') {
      return;
    }

    this.setState({ open: false });

    if (onDismiss) {
      setTimeout(() => onDismiss(), timeout); // put this as lowest priority, so that it goes after the animation
    }
  };

  render() {
    const { className, type, message, timeout, horizontalPos, verticalPos } = this.props;

    return (
      <div className='snack-bar'>
        <Snackbar
          anchorOrigin={{
            vertical: verticalPos || 'top',
            horizontal: horizontalPos || 'center',
          }}
          open={this.state.open}
          autoHideDuration={timeout || 6000}
          onClose={this.handleClose}
        >
          <SnackbarWrapper
            className={className}
            onClose={this.handleClose}
            variant={type}
            message={message}
          />
        </Snackbar>
      </div>
    );
  }
}

export default CustomSnackBar;
