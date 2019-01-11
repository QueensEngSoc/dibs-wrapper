import { Route, Link } from 'react-router-dom';
import * as React from "react";

function renderFunction({ staticContext }) {
  if (staticContext) {
    staticContext.statusCode = 404;
  }

  return (
    <div className="content__wrapper">
      <div className="row justify-content-center">
        <img src="/img/trail.jpg" alt="You seem to be lost - 404" />
      </div>
      <div className="row justify-content-center">
        <p>You seem to have wandered off the beaten path!</p>
      </div>
      <div className="row justify-content-center">
        <p><Link to={'/'}>Go back to the homepage</Link> or <Link to={'/quicky'}>QuickBook a room</Link>!</p>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <Route render={renderFunction} />
  );
}
