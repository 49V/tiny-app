const express = require("express");
const helpers = require("./lib/helpers");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8082;

app.use(bodyParser.urlencoded({ extended: true}));

app.set("view engine", "ejs");

// TODO: ADD ALL ERROR HANDLING
var urlDatabase = {
  "b2xVn2" : "http://www.lighthouselabs.ca",
  "9sm5xK" : "http://www.google.com"
};

app.get("/", (request, response) => {
  response.send("Hello!");
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
  let templateVars = { urls: urlDatabase };
  response.render('urls_index', templateVars);
});

app.get("/urls/new", (request, response) => {
  // TODO: WHAT IF THE VALUE DOESN'T EXIST?
  response.render("urls_new");
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
  var longURL = urlDatabase[request.params.id.toString()];
  let templateVars = { shortURL: request.params.id,
                       longURL: longURL};
  response.render("urls_show", templateVars);
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