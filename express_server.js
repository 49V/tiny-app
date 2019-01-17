const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const helpers = require("./lib/helpers");
const app = express();
const PORT = 8082;

app.use(bodyParser.urlencoded({ extended: true}));

app.set("view engine", "ejs");

// TODO: ADD ALL ERROR HANDLING
var urlDatabase = {
  "b2xVn2" : "http://www.lighthouselabs.ca",
  "9sm5xK" : "http://www.google.com"
};

app.use(cookieParser())

app.get('/', function (request, response) {
  response.send("Hello");
})

app.post('/login', function (request, response) {
  
  const username = request.body.username;
  if (username) {
    response.cookie('username', username);
    response.redirect('/urls');
    
  } else {
    response.status(400).send("Must enter a username");
  }
  return;
});

app.get("/u/:shortURL", (request, response) => {
  // TODO: WHAT IF THE VALUE DOESN'T EXIST?
  
  let shortURL = request.url.replace('/u/', ''); 
  let longURL = urlDatabase[shortURL];
  // If exists
  response.redirect(longURL);
  // Else
});

app.get("/urls.json", (request, response) => {
  // TODO: WHAT IF THE VALUE DOESN'T EXIST?
  response.json(urlDatabase);
});
  
app.get("/urls", (request, response) => {
  // TODO: WHAT IF THE VALUE DOESN'T EXIST?


  let templateVars = { 
                      urls: urlDatabase,
                      username: request.cookies["username"]  
                      };
  response.render('urls_index', templateVars);
});

app.get("/urls/new", (request, response) => {
  let templateVars = { 
    urls: urlDatabase,
    username: request.cookies["username"]  
  };
  // TODO: WHAT IF THE VALUE DOESN'T EXIST?
  response.render("urls_new", templateVars);
});

app.post("/urls", (request, response) => {
  // TODO: WHAT IF THE VALUE DOESN'T EXIST?
  const {longURL} = request.body;
  const shortURL = helpers.generateRandomString();
  urlDatabase[shortURL] = longURL;

  response.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (request, response) => {
  // TODO: WHAT IF THE VALUE DOESN'T EXIST?
  const longURL = urlDatabase[request.params.id.toString()];
  let templateVars = { username: request.cookies["username"],
                       shortURL: request.params.id,
                       longURL: longURL};
  response.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (request, response) => {
  const shortURL = request.params.shortURL;
  const newLongURL = request.body.longURL;
  
  if (newLongURL) {
    urlDatabase[shortURL] = newLongURL;

    let templateVars = { username: request.cookies["username"],
                         shortURL,
                         longURL : newLongURL
                       };

    response.render(`urls_show`, templateVars);
    
  } else {
    response.status(400).send("Must enter a new long URL");
  }  
});

app.post("/urls/:id/delete", (request, response) => {
  const shortURL = request.params.id;
  if(shortURL) {
    delete urlDatabase[shortURL];
    response.redirect("/urls");
  } else {
    // Resource doesn't exist
    response.statusCode = "404";
  }
});

app.get("/hello", (request, response) => {
  // TODO: WHAT IF THE VALUE DOESN'T EXIST?
  response.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});