import { Route } from 'react-router-dom';

function renderFunction({ staticContext }) {
  if (staticContext) {
    staticContext.statusCode = 404;
  }

  return null;
}

export default function NotFound() {
  return (
    <Route render={renderFunction} />
  );
}
