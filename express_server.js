const express = require("express");
const app = express();
// used to parse the cookie header and populate req.cookies with an object keyed by the cookie name
const cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(cookieParser());
// Middleware that is used to parse the body of the request sent to the server
app.use(express.urlencoded({ extended: true }));
//This function is used to generate a random string for the shortURL
const generateRandomString = () => {
    return Math.random().toString(36).substr(2, 6);
};
const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com",
};
app.get("/", (req, res) => {
    res.send("Hello!");
});
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});
app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
    
const templateVars = {
        urls: urlDatabase,
        username: req.cookies["username"]
      };
    res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
    
    const templateVars = { username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});
app.get("/urls/:id", (req, res) => {
    
    const templateVars = { 
        id: req.params.id, 
        longURL: urlDatabase[req.params.id],
        username: req.cookies["username"]};
    res.render("urls_show", templateVars);
});
app.post("/urls", (req, res) => {
    //Used to create a random string for the shortURL
    const shortURL = generateRandomString();
    //Used to add the shortURL and longURL to the urlDatabase as a key value pair where shortURL is the key and req.body.longURL is the value
    urlDatabase[shortURL] = req.body.longURL
    // console.log(req.body); // Log the POST request body to the console
    //Redirect the user to the new page that shows them the new short URL they created
    res.redirect(`/urls/${shortURL}`)
});
// POST route used for deleting URLs on the server side
app.post("/urls/:id/delete", (req, res) => {
    const id = req.params.id;
    delete urlDatabase[id];
    res.redirect("/urls");
});
// POST route used for updating URLs on the server side
app.post("/urls/:id", (req, res) => {
    const shortURL = req.params.id;
    const newLongURL = req.body.longURL;
    urlDatabase[shortURL] = newLongURL; // Update the value of the shortURL key to the new longURL value
    res.redirect("/urls");
});


// Used to redirect the user to the longURL when they click on the shortURL
app.get("/u/:id", (req, res) => {
    const longURL = urlDatabase[req.params.id];
    res.redirect(longURL);
});

app.post("/login", (req, res) => {
    //This is used to get the username from the form
    const username = req.body.username;
    //This is used to set the username as a cookie
    res.cookie("username", username);

    res.redirect("/urls");
});

// This is used to clear the cookie when the user clicks on the logout button
app.post("/logout", (req, res) => {
    res.clearCookie("username");
    res.redirect("/urls");
  });