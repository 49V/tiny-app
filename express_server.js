const express = require("express");
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const helpers = require("./lib/helpers");
const app = express();
const PORT = 8078;

app.use(bodyParser.urlencoded({ extended: true}));

app.set("view engine", "ejs");

// TODO: ADD ALL ERROR HANDLING
const urlDatabase = {
  "userRandomID" : { 
    "b2xVn2": "http://www.lighthouselabs.ca",
  },
  "user2RandomID" : {
    "9sm5xK" : "http://www.google.com",
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
  }
}


app.use(cookieParser());

// Middleware that adds a user to the locals object for easy access
app.use( (request, response, next) => {
  if (request.cookies["user_id"]) {
    response.locals.user_id = request.cookies["user_id"].id;
  }
  next();

});

app.get('/login', function (request, response) {
  
  const cookie = request.cookies["user_id"];

  if (cookie) {

    response.status(400).send("Already logged in.");

  } else {

    response.render('login');

  }
  
});

app.post('/login', function (request, response) {
  
  const { email, password } = request.body;

  let id;

  if (id = helpers.checkEmailPasswordMatch(users, email, password)) {
    
    response.cookie('user_id', users[id]);
    return response.redirect('/');

  } else {

    return response.status(403).send("Incorrect email / password combination");
  
  }
});

app.get("/register", (request, response) => {

  response.render('register');

});

app.post("/register", (request, response) => {
  
  const {email, password} = request.body;

  if(email && !password) {
    response.status(400).send("Password is required to register");
  } else if(!email && password) {
    response.status(400).send("Email is required to register");
  } else if(!email && !password) {
    response.status(400).send("Both email and password are required to register");
  } else if(helpers.objectValueExists(users, "email", email)) {
    response.status(400).send("User with that email already exists!");
  } else {
    
    const id = helpers.generateRandomString();  
    const hashedPassword = bcrypt.hashSync(password, 10);
    console.log(users);
    users[id] = {
      id,
      email,
      password: hashedPassword
      };
    console.log('After');
    console.log(users);

    response.cookie("user_id", users[id]);

    response.redirect("/urls");
  }
});

app.get("/u/:shortURL", (request, response) => {
  // TODO: WHAT IF THE VALUE DOESN'T EXIST?
  let shortURL = request.url.replace('/u/', '');
  let longURL = urlDatabase[response.locals.user_id][shortURL];  
  response.redirect(longURL);
});

/*
 * -----------------------------------------------
 * ALL CODE BELOW REQUIRES AUTHENTICATION!
 * -----------------------------------------------
 */

app.use('/urls/new', (request, response, next) => {
  
  const loggedIn = Boolean(request.cookies["user_id"]);

  if (loggedIn) {

    next();

  } else {

    return response.redirect('/login');

  }

});

app.get("/urls/new", (request, response) => {
  let templateVars = { 
    urls: urlDatabase,
    user: request.cookies["user_id"]  
  };
  // TODO: WHAT IF THE VALUE DOESN'T EXIST?
  response.render("urls_new", templateVars);
});

 app.use( (request, response, next) => {

  const loggedIn = Boolean(request.cookies["user_id"]);

  if (loggedIn) {

    next();

  } else {

    return response.status(401).send("You need to log in");

  }

});

app.get('/', function (request, response) {
  
  const cookie = request.cookies["user_id"];

  if (cookie) {
    return response.redirect('/urls');
  } else {
    return response.redirect('/login');
  }

});

app.get("/hello", (request, response) => {
  // TODO: WHAT IF THE VALUE DOESN'T EXIST?
  response.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post('/logout', (request, response) => {
  response.clearCookie('user_id');
  response.redirect('/urls');
});

app.get("/urls.json", (request, response) => {
  // TODO: WHAT IF THE VALUE DOESN'T EXIST?
  response.json(urlDatabase);
});
  
app.get("/urls", (request, response) => {
  // TODO: WHAT IF THE VALUE DOESN'T EXIST?

  let templateVars = { 
                      urls: urlDatabase[response.locals.user_id],
                      user: request.cookies["user_id"]  
                      };
  response.render('urls_index', templateVars);
});

app.post("/urls", (request, response) => {
  // TODO: WHAT IF THE VALUE DOESN'T EXIST?
  const {longURL} = request.body;
  const shortURL = helpers.generateRandomString();
  urlDatabase[response.locals.user_id][shortURL] = longURL;

  response.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (request, response) => {
  // TODO: WHAT IF THE VALUE DOESN'T EXIST?
  const longURL = urlDatabase[response.locals.user_id][request.params.id.toString()];
  let templateVars = { user: request.cookies["user_id"],
                       shortURL: request.params.id,
                       longURL: longURL};
  response.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (request, response) => {
  const shortURL = request.params.shortURL;
  const newLongURL = request.body.longURL;
  
  if (newLongURL) {
    if (urlDatabase[response.locals.user_id][shortURL]) {
      urlDatabase[response.locals.user_id][shortURL] = newLongURL;

      let templateVars = { user: request.cookies["user_id"],
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
  if(shortURL) {
    if (urlDatabase[response.locals.user_id][shortURL]) {
      delete urlDatabase[response.locals.user_id][shortURL];
      return response.redirect("/urls");
    }
    else {
      return response.status(401).send("You cannot delete a shortURL you do not own");
    }
  } else {
    // Resource doesn't exist
    response.statusCode = "404";
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});