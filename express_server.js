const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8081;

app.use(bodyParser.urlencoded({ extended: true}));

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2" : "http://www.lighthouselabs.ca",
  "9sm5xK" : "http://www.google.com"
};

app.get("/", (request, response) => {
  response.send("Hello!");
}); 

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});
  
app.get("/urls", (request, response) => {
  let templateVars = { urls: urlDatabase };
  response.render('urls_index', templateVars);
});

app.get("/urls/new", (request, response) => {
  response.render("urls_new");
});

app.post("/urls", (request, response) => {
  console.log(request.body);
  response.send("Received");
});

app.get("/urls/:id", (request, response) => {
  var longURL = urlDatabase[request.params.id.toString()];
  let templateVars = { shortURL: request.params.id,
                       longURL: longURL};
  response.render("urls_show", templateVars);
});

app.get("/hello", (request, response) => {
  response.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});