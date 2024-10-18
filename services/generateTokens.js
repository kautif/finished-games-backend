const jwt = require("jsonwebtoken");

// Function to generate a new access token
const generateAuthToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "30s" }); // Shorter expiration for access token
};

// Function to generate a new refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "2m",
  }); // Longer expiration for refresh token
};

module.exports = {
  generateAuthToken,
  generateRefreshToken,
};
