# Views and Server-side Webpage Generation

QBook uses Handlebars as a webpage templater. This allows us to create the webpage server-side and then send it to the client.
The official page of Handlebars can be found here: https://handlebarsjs.com/.

## Layouts
This folder contains the main handlebars page which is the general template that each page works off of. It is the standard setup of how our pages will look.

## Partials
A partial is something on the page that remains persitant throughout most actions like scrolling and generally appear overtop of everything.
Examples on our pages include the header and the navigation bar.

## Other Files
The other files here correspond to a certain route. Each handlebars file will be passed data by it's route and will then generate itself and be sent to the client.
Go to the routes folder to see this.
