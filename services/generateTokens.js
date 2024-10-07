const jwt = require("jsonwebtoken");

// Function to generate a new access token
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" }); // Shorter expiration for access token
};

// Function to generate a new refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  }); // Longer expiration for refresh token
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
