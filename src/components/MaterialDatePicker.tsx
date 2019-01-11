import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, InlineDatePicker } from 'material-ui-pickers';
import { KeyboardArrowLeftRounded, KeyboardArrowRightRounded } from '@material-ui/icons';

interface Props {
  daysToSpan?: number;
  startDate?: Date;
  onChange?: Function;
  className?: string;
}

interface State {
  selectedDate: Date;
}

class MaterialDatePicker extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: this.props.startDate || new Date()
    }
  }

  handleDateChange = date => {
    this.setState({ selectedDate: date });
    this.props.onChange(date);
  };

  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  render() {
    const { selectedDate } = this.state;
    const { className } = this.props;

    const startDate = this.props.startDate || new Date();
    const daysToSpan = this.props.daysToSpan || 7;
    const endDate = this.addDays(startDate, daysToSpan);

    return (
      <MuiPickersUtilsProvider className={className} utils={DateFnsUtils}>
        <Grid container justify="space-around" className={className}>
          <InlineDatePicker
            onlyCalendar
            disablePast
            maxDate={endDate}
            leftArrowIcon={<KeyboardArrowLeftRounded />}
            rightArrowIcon={<KeyboardArrowRightRounded />}
            // helperText="Pick a date to view current room status"
            value={selectedDate}
            onChange={this.handleDateChange}
          />
        </Grid>
      </MuiPickersUtilsProvider>
    );
  }
}

export default MaterialDatePicker;
