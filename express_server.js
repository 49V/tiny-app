"use strict"
const express = require("express");
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const helpers = require("./lib/helpers");
const app = express();
const PORT = 8078;

app.use(bodyParser.urlencoded({ extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "userRandomID" : { 
    "b2xVn2": "http://www.lighthouselabs.ca",
  },
  "user2RandomID" : {
    "9sm5xK" : "http://www.google.com",
  },
  "user3RandomID" : {
    "s8df0x" : "https://nextcanada.com",
  }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: '$2b$10$sS5PodpJtN565U5yq16d0uzyJq.KZ8dHZTGOFOd.eTux/Y4SyPbNe'
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: '$2b$10$KiPYx7Cn.KdPVptIoFeocefn/Lcqb0QYkOcD3pd4M0fZQ3rQNX4pS'
  },
  "user3RandomID": {
    id: "user3RandomID", 
    email: "test@test.com", 
    password: '$2b$10$u0yQRZigbr2rekGTnvTRm.zB6syHlUTctC/7iON.A7eGNZaWgcPya'
  }
}

app.use(cookieSession({
  name: 'session',
  keys: ['bork'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
 
/*
 * Middleware that adds a user to the local object for easy access
 */
app.use( (request, response, next) => {
  if (request.session.user_id) {
    response.locals.user_id = request.session.user_id.id;
  }
  next();
});

app.get('/login', function (request, response) {
  // Check if user is logged in
  const cookie = request.session.user_id;
  const templateVars = { user: null };

  if (cookie) {
    return response.redirect("/urls");
  } else {
    return response.render('login', templateVars);
  }
});

app.post('/login', function (request, response) {
  const { email, password } = request.body;
  let id;

  if (email && !password) {
    return response.status(400).send("Password is required to login");
  } else if (!email && password) {
    return response.status(400).send("Email is required to login");
  } else if (!email && !password) {
    return response.status(400).send("Both email and password are required to login");
  } else if (id = helpers.checkEmailPasswordMatch(users, email, password, bcrypt)) {
    request.session.user_id = users[id];
    return response.redirect('/');
  } else {
    return response.status(403).send("Incorrect email / password combination");
  }
});

app.get("/register", (request, response) => {
  const templateVars = { user: null };

  if (response.locals.user_id) {
    return response.redirect('/urls');
  } else {
    return response.render('register', templateVars);
  }
});

app.post("/register", (request, response) => {
  const {email, password} = request.body;

  if (email && !password) {
    return response.status(400).send("Password is required to register");
  } else if (!email && password) {
    return response.status(400).send("Email is required to register");
  } else if (!email && !password) {
    return response.status(400).send("Both email and password are required to register");
  } else if (helpers.objectValueExists(users, "email", email)) {
    return response.status(400).send("User with that email already exists!");
  } else {
    const id = helpers.generateRandomString();  
    const hashedPassword = bcrypt.hashSync(password, 10);

    users[id] = {
      id,
      email,
      password: hashedPassword
      };
    request.session.user_id = users[id];
    urlDatabase[id] = {};

    return response.redirect("/urls");
  }
});

app.get("/u/:id", (request, response) => {
  let shortURL = request.params.id;
  let longURL;
  
  if (longURL = urlDatabase[response.locals.user_id][shortURL]) {
    return response.redirect(longURL);
  } else {
    return response.status(404).send("Page not found");
  }
});

/*
 * This middleware provides specific responses for /urls/new based upon login status
 */

app.use('/urls/new', (request, response, next) => {
  const loggedIn = request.session.user_id;

  if (loggedIn) {
    next();
  } else {
    return response.redirect('/login');
  }
});

app.get("/urls/new", (request, response) => {
  let templateVars = { 
    urls: urlDatabase,
    user: request.session.user_id  
  };

  return response.render("urls_new", templateVars);
});

/*
 * ------------------------------------------------------------------------------------------------------------------------------------
 * This middleware is used to check if a user is logged in such that ALL code below the middleware requires for a user to be logged in.
 * ------------------------------------------------------------------------------------------------------------------------------------
 */
app.use((request, response, next) => {
  const loggedIn = request.session.user_id;

  if (loggedIn) {
    next();
  } else {
    return response.redirect('/login');    
  }
});

app.get('/', function (request, response) {
  // Check if user is logged in
  const cookie = request.session.user_id;

  if (cookie) {
    return response.redirect('/urls');
  } else {
    return response.redirect('/login');
  }
});

app.post('/logout', (request, response) => {
  request.session = null;
  return response.redirect('/urls');
});

app.get("/urls.json", (request, response) => {
  return response.json(urlDatabase);
});
  
app.get("/urls", (request, response) => {
  let templateVars = { 
                      urls: urlDatabase[response.locals.user_id],
                      user: request.session.user_id  
                      };

  return response.render('urls_index', templateVars);
});

app.post("/urls", (request, response) => {
  const {longURL} = request.body;
  let shortURL;

  if (longURL) {
    shortURL = helpers.generateRandomString();
    urlDatabase[response.locals.user_id][shortURL] = longURL;
  } else {
    return response.status(400).send("You must enter a long URL");
  }

  return response.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (request, response) => {
  let longURL;

  if (longURL = urlDatabase[response.locals.user_id][request.params.id.toString()]) {
    let templateVars = { user: request.session.user_id,
                        shortURL: request.params.id,
                        longURL: longURL};
    return response.render("urls_show", templateVars);
  } else if (longURL === undefined) {
    return response.status(403).send("You do not own that URL");
  }
});

app.post("/urls/:id", (request, response) => {
  const shortURL = request.params.id;
  const newLongURL = request.body.longURL;
  
  if (newLongURL) { 
    if (urlDatabase[response.locals.user_id][shortURL]) {
      urlDatabase[response.locals.user_id][shortURL] = newLongURL;

      let templateVars = { user: request.session.user_id,
                          shortURL,
                          longURL : newLongURL
                        };

      return response.render(`urls_show`, templateVars);
    } else {
      return response.status(401).send("You cannot edit a shortURL you don't own");
    }
  } else {
    return response.status(400).send("Must enter a new long URL");
  }  
});

app.post("/urls/:id/delete", (request, response) => {
  const shortURL = request.params.id;

  if (shortURL) {
    if (urlDatabase[response.locals.user_id][shortURL]) {
      delete urlDatabase[response.locals.user_id][shortURL];

      return response.redirect("/urls");
    } else {
      return response.status(401).send("You cannot delete a short URL you do not own");
    }
  } else {
    return response.statusCode(400).send("You must enter a URL");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});