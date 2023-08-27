const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs"); // Set EJS as view engine

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars); // Render urls_index.ejs
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id: id, longURL: longURL };
  res.render("urls_show", templateVars); // Render urls_show.ejs
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
