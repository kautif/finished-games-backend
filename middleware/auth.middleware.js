const jwt = require('jsonwebtoken');

const ensureAuthenticated = (req, res, next) => {
    // Extract the token from the auth_token cookie
    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).send('Unauthorized');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send('Unauthorized');
        }

        // The decoded payload should contain the user's ID
        req.userId = decoded.userId;

        next();
    });
}

module.exports = ensureAuthenticated;