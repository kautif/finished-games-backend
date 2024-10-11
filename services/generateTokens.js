const jwt = require("jsonwebtoken");

// Function to generate a new access token
const generateAuthToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "30m" }); // Shorter expiration for access token
};

// Function to generate a new refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  }); // Longer expiration for refresh token
};

module.exports = {
  generateAuthToken,
  generateRefreshToken,
};
