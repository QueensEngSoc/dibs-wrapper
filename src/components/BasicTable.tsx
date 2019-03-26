import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { TableFooter, TableRow, TableHead, TableCell, TableBody, Table, TablePagination, Paper } from '@material-ui/core';
import { Room, RoomFreeTable } from '../types/room';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
});


export function convertRoomDataToTable(roomData: Array<Room>, hour) {
  return roomData && roomData.map((room) => {
    const freeTable: RoomFreeTable = (room.Free as Array<RoomFreeTable>)[hour - 7];

    return {
      id: room.id,
      name: room.room,
      cells: [
        room.size, room.hasTV.toString(), room.hasPhone.toString(), freeTable.free.toString(),
        freeTable.owner === 0 ? '' : freeTable.owner
      ]
    };
  });
}

interface Props {
  headings: Array<string>;
  classes: any;
  data: Array<any>;
}

interface State {
  page: number;
  rowsPerPage: number;
}

class BasicTable extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      rowsPerPage: 5
    }
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  render() {
    const { classes, data, headings } = this.props;
    const { rowsPerPage, page } = this.state;

    return (
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              {headings.map((heading) => {
                return (<TableCell key={heading}>{heading}</TableCell>)
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => (
              <TableRow key={row.id}>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                {
                  row.cells.map((cell, i) => (<TableCell key={`${i}-${row.id}`} align="left">{cell}</TableCell>))
                }
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
          </TableFooter>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          rowsPerPage={this.state.rowsPerPage}
          count={data.length}
          page={page}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Paper>
    );
  }
}

// @ts-ignore
export default withStyles(styles)(BasicTable);
