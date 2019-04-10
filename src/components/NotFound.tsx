import { Route, Link } from 'react-router-dom';
import * as React from 'react';
import { Button, Card, CardActions, CardContent, CardMedia, Grid, Typography } from '@material-ui/core';
import { GridProps } from '@material-ui/core/Grid';

function renderFunction({ staticContext }) {
  let message = null;

  if (staticContext) {
    staticContext.statusCode = 404;
    message = staticContext.statusMessage
  }

  const gridWidth: GridProps = { xs: 12, sm: 9, md: 7, lg: 5, xl: 3 };

  return (
    <div className="content__wrapper justify-content-center">
      <Grid container spacing={16} className="justify-content-center">
        <Grid item {...gridWidth}>
          <div className="error">
            <Card className="error__main-card">
              <CardMedia
                className="error__main-card__img"
                image={'/img/trail.jpg'}
                aria-label='You seem to be lost - 404'
                title="Error: 404"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  { message ? message : 'You seem to have wandered off the beaten path' }
                </Typography>
                <p><Link to={'/'}>Go back to the homepage</Link> or <Link to={'/quicky'}>QuickBook a room</Link>!</p>
                <CardActions>
                </CardActions>
              </CardContent>
            </Card>
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

export default function NotFound() {
  return (
    <Route render={renderFunction} />
  );
}
