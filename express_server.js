const express = require("express");
const app = express();
//const cookieParser = require('cookie-parser');
const cookieSession = require("cookie-session")
const bcrypt = require("bcryptjs");
const { 
    generateRandomString, 
    getUserByEmail, 
    urlsForUser
  } = require("./helpers");
  
  const { users, urlDatabase } = require("./database");
const PORT = 8080;

app.set("view engine", "ejs");

app.use(
    cookieSession({
      name: "session",
      keys: [`key1`],
  
      // Cookie Options
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    })
  );
app.use(express.urlencoded({ extended: true }));



app.get("/", (req, res) => {
    if (req.session.user_id) {
        res.redirect("/urls");
      } else {
        res.redirect("/login");
      }
});

app.get("/urls", (req, res) => {
    const userId = req.session.user_id;

    // Check if user is logged in
    if (!userId) {
      return res.status(401).send("Please log in or register");
    }
    
    // Get user object from users database
    const user = users[userId];
    
    const userURL = urlsForUser(userId, urlDatabase);
    
  const templateVars = {
    urls: userURL,
    user,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    const userId = req.session.user_id;
  
    // This is used to check if the user exists
    if (!userId) {
      return res.status(401).send("Please log in or register");
    }
  
    // If the user does exist then render the urls_new.ejs file
    const user = users[userId];
    const templateVars = {
      user
    };
  
    console.log(templateVars);
    res.render("urls_new", templateVars);
  });

app.get("/urls/:id", (req, res) => {
    const userId = req.session.user_id;

    // Check if user is logged in
    if (!userId) {
      return res.status(401).send("Please log in or register");
    }
    
    // Check if short URL is legitimate
    const url = urlDatabase[req.params.id];
    if (!url) {
      return res.status(404).send("URL not found");
    }
    if (url.userID !== userId) {
      return res.status(403).send("You do not have access to this URL");
    }
    
    // const user = users[userId];
    
    const templateVars = {
        id: req.params.id,
        longURL: url.longURL,
        user: users[userId],
      };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  // This is used to get the userId from the cookies
  const userId = req.session.user_id;

// This is used to check if the user exists
if (!userId) {
  return res.status(401).send("Please log in or register");
}

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userId,
  };
  
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
    // Check if user is logged in
if (!req.session.user_id) {
    return res.status(401).send("Please log in or register");
  }
  
  // Check if shorturl is legitimate
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(404).send("URL not found");
  }
  
  // Check if user has access to URL
  if (url.userID !== req.session.user_id) {
    return res.status(403).send("You do not have access to this URL");
  }
  
  
    
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
    // Check if user is logged in
if (!req.session.user_id) {
    return res.status(401).send("Please log in or register");
  }
  
  // Check if shorturl is legitimate
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(404).send("URL not found");
  }
  
  // Check if user has access to URL
  if (url.userID !== req.session.user_id) {
    return res.status(403).send("You do not have access to this URL");
  }
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
    // Check if the url exists
    if (!urlDatabase[req.params.id]) {
      res.status(400).send("URL not found");
    } else {
      const url = urlDatabase[req.params.id].longURL;
      // Redirect the user to the url
      res.redirect(url);
    }
  });

  app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
  
    if (!email || !password) {
      return res.status(400).send("Email and password cannot be blank");
    }
  
    const user = getUserByEmail(email, users);
  
    if (!user) {
      return res.status(400).send("Email not found. Please register.");
    }
  
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).send("Password incorrect");
    }
  
    req.session.user_id = user.id;
    res.redirect("/urls");
  });

app.post("/logout", (req, res) => {
    req.session = null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
    const user = users[req.session["user_id"]];
    const templateVars = {user}
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
});

app.post("/register", (req, res) => {
    // This is used to get the email and password from the form
    const email = req.body.email;
    const password = req.body.password;
    
    // This is used to check if the email or password is empty
    if (!email || !password) {
      res.status(400).send("Email or password is empty");
      return;
    }
    
    // This is used to check if the email is already in the database
    if (getUserByEmail(email, users)) {
      res.status(400).send("Email is already in the database. Please login");
      return;
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = generateRandomString();
  
    // This is used to create a new user object
    const newUser = {
      id,
      email,
      password: hashedPassword
    };
  
    // This is used to add the new user object to the users database
    users[id] = newUser;
  
    // This is used to set the user_id session variable
    req.session.user_id = id;
  
    // This is used to redirect the user to the urls page
    res.redirect("/urls");
  });
  
  app.get("/login", (req, res) => {
    // If the user is logged in, GET /login should redirect to GET /urls
    const user = users[req.session.user_id];
    const templateVars = { user };
  
    if (user) {
      res.redirect("/urls");
    } else {
      res.render("login", templateVars);
    }
  });
  

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });