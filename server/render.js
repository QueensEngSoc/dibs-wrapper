const React = require('react');
const ReactDomServer = require('react-dom/server');

module.exports = function render(Component, props) {
  return ReactDomServer.renderToString(
    React.createElement(Component, props)
  );
};
