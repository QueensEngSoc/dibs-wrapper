import { Route } from 'react-router-dom';
import * as React from "react";

function renderFunction({ staticContext }) {
  if (staticContext) {
    staticContext.statusCode = 404;
  }

  return (
    <div className="content__wrapper">
      <img src="/img/trail.jpg" alt="You seem to be lost - 404" />
    </div>
  );
}

export default function NotFound() {
  return (
    <Route render={renderFunction} />
  );
}
