const jwt = require("jsonwebtoken");
const { generateAuthToken } = require("../services/generateTokens");

const ensureAuthenticated = (req, res, next) => {
  const token = req.headers["auth_token"];
  const refreshToken = req.headers["refresh_token"]; // Assuming the refresh token is sent in headers
  console.log("token", token);
  console.log("refreshToken", refreshToken);
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("err", err);
      if (!token) {
        return res.status(401).send("Unauthorized: No token provided");
      }

      if (err.name === "TokenExpiredError") {
        // Token has expired, attempt to use the refresh token
        if (!refreshToken) {
          return res
            .status(401)
            .send("Unauthorized: Token expired and no refresh token provided");
        }

        // Verify the refresh token
        jwt.verify(
          refreshToken,
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
              return res
                .status(403)
                .send("Unauthorized: Invalid refresh token");
            }

            // Generate a new access token and send it in the response
            const newAccessToken = generateAuthToken(refreshDecoded.userId);
            res.setHeader("auth_token", newAccessToken); // Send the new token back in the headers
            res.header("Access-Control-Expose-Headers", "auth_token");
            req.userId = refreshDecoded.userId; // Assign the user ID to the request
            next();
          }
        );
      } else {
        return res.status(401).send("Unauthorized: Invalid token");
      }
    } else {
      // The access token is valid, continue with the request
      req.userId = decoded.userId;
      next();
    }
  });
};

module.exports = ensureAuthenticated;
