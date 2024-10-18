const jwt = require("jsonwebtoken");
const { generateAuthToken } = require("../services/generateTokens");

const ensureAuthenticated = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const isRefreshToken = authHeader?.includes("Bearer");

  console.log("Headers:", req.headers);

  // Handle missing token
  if (!authHeader) {
    return res.status(401).send("Unauthorized: No token provided");
  }
  if (!isRefreshToken) {
    // Check if the token is a Bearer token or a refresh token
    jwt.verify(authHeader, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          // Token has expired, attempt to use the refresh token
          if (!isRefreshToken) {
            return res.status(401).send("Unauthorized: Token has expired");
          }
        } else {
          return res.status(401).send("Unauthorized: Invalid token");
        }
      } else {
        // The access token is valid, continue with the request
        req.userId = decoded.userId;
        next();
      }
    });
  } else {
    // Verify the refresh token
    jwt.verify(
      authHeader.split(" ")[1],
      process.env.JWT_SECRET,
      (err, refreshDecoded) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            // Refresh token has also expired, log user out
            return res
              .status(403)
              .send(
                "Unauthorized: Refresh token has expired, please log in again"
              );
          }
          return res.status(403).send("Unauthorized: Invalid refresh token");
        }

        // Generate a new access token and send it in the response
        const newAccessToken = generateAuthToken(refreshDecoded.userId);
        res.setHeader("authorization", newAccessToken); // Send the new token back in the headers
        req.userId = refreshDecoded.userId; // Assign the user ID to the request
        next();
      }
    );
  }
};

module.exports = ensureAuthenticated;
