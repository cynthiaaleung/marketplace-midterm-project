// load .env data into process.env
require("dotenv").config();

// Web server config
const PORT = process.env.PORT || 8080;

const sassMiddleware = require("./lib/sass-middleware");
const express = require("express");
const app = express();
const morgan = require("morgan");

// PG database client/connection setup
const { Pool } = require("pg");
const dbParams = require("./lib/db.js");
const db = new Pool(dbParams);
db.connect(error => {
  if (error) throw error;
  console.log("Server also connected");
});

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan("dev"));

app.set('view engine', "ejs");
app.set('views');
app.use(express.urlencoded({ extended: true }));

app.use(
  "/styles",
  sassMiddleware({
    source: __dirname + "/styles",
    destination: __dirname + "/public/styles",
    isSass: false, // false => scss, true => sass
  })
);

app.use(express.static("public"));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const indexRoutes = require("./routes/index");
const listingsRoute = require("./routes/listings");
const watchingRoute = require("./routes/watching");
const usersRoutes = require("./routes/users");
const widgetsRoutes = require("./routes/widgets");
const messagesRoutes = require("./routes/messages")

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/", indexRoutes(db));
app.use("/listings", listingsRoute(db));
app.use("/watching", watchingRoute(db));
app.use("/users", usersRoutes(db));
app.use("/messages", messagesRoutes(db))
app.use("/api/widgets", widgetsRoutes(db));
// Note: mount other resources here, using the same pattern above

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).

// app.get('/messages', (req, res) => {
//   res.render('pages/messages');
// });

app.get('/new-listing', (req, res) => {
  res.render('pages/new-listing');
})

app.get('/messages/show', (req, res) => {
  // replaced :id with "show" for now -- will replace with :id later
  // when replaced, remember to change messages.ejs action route
  const messageID = req.params.id;
  const templateVars = { messageID }
  res.render('pages/message-show', templateVars);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
