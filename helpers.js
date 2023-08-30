const getUserByEmail = function(email, users) {
    for (const userId in users) {
      const user = users[userId];
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  };
  
 // Generates a random string consisting of letters and numbers
const generateRandomString = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };
  
  // Filters and returns URLs that belong to a specific user
  const urlsForUser = (id, urlDatabase) => {
    const filteredUrls = {};
    for (const shortUrl in urlDatabase) {
      if (urlDatabase[shortUrl].userID === id) {
        filteredUrls[shortUrl] = urlDatabase[shortUrl];
      }
    }
    return filteredUrls;
  };
  
  module.exports = {
    generateRandomString,
    urlsForUser,
    getUserByEmail,
  };