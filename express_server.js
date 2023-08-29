const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");
const PORT = 8080;

app.set("view engine", "ejs");

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Function to generate a random string for short URLs
const generateRandomString = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

// Function to get user by email from the users object
const getUserByEmail = (email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
};

const urlsForUser = (id) => {
    const filteredUrls = {};
    for (const shortUrl in urlDatabase) {
      if (urlDatabase[shortUrl].userID === id) {
        filteredUrls[shortUrl] = urlDatabase[shortUrl];
      }
    }
    return filteredUrls;
  };
  

// Users database
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// URL database
const urlDatabase = {
    b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW",
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW",
      },
      
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// JSON endpoint for the URL database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
    const userId = req.cookies["user_id"];

    // Check if user is logged in
    if (!userId) {
      return res.status(401).send("Please log in or register");
    }
    
    // Get user object from users database
    const user = users[userId];
    
    const userURL = urlsForUser(userId);
    
  const templateVars = {
    urls: userURL,
    user
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    const userId = req.cookies['user_id'];

    // This is used to check if the user exists
    if (!userId) {
      return res.status(401).send("Please log in or register");
      // If the user does exist then render the urls_new.ejs file
    } else {
      const user = users[userId];
    
      const templateVars = {
        user
      };
    }
    
    res.render("urls_new", templateVars);
  }
);

app.get("/urls/:id", (req, res) => {
    const userId = req.cookies["user_id"];

    // Check if user is logged in
    if (!userId) {
      return res.status(401).send("Please log in or register");
    }
    
    // Check if user has access to URL
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
    user: users[userID]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  // This is used to get the userId from the cookies
const userId = req.cookies['user_id'];

// This is used to check if the user exists
if (!userId) {
  return res.status(401).send("Please log in or register");
}

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userId
  };
  
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  const url = urlDatabase[req.params.id];
  if (!url) {
    res.status(400).send("URL not found");
  } else {
    res.redirect(url);
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);
  if (user && bcrypt.compareSync(password, user.password)) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status(400).send("User not found");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("register");
  }
});

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send("Email or password is empty");
    return;
  }
  if (getUserByEmail(email)) {
    res.status(400).send("Email is already in the database");
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

// This is used to create a new user object
  const newUser = {
    id,
    email,
    password: hashedPassword // This is used to hash the password and store it rather than the plain text password
  };
  users[id] = newUser;
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("login");
  }
});
