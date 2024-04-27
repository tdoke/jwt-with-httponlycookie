const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000;
app.use(cookieParser());
app.use(express.json());
let refreshTokens = {};
const jwtSettings = getJWTSettings();

const authorization = (req, res, next) => {
    const token = req.cookies[jwtSettings.accessTokenCookieName];
    if (!token) {
        return res.sendStatus(403);
    }
    try {
        const data = jwt.verify(token, jwtSettings.acccessTokenSecretKey);
        const { id, username, role, email } = data;
        req.user = { id, username, role, email };
        return next();
    } catch {
        return res.sendStatus(403);
    }
};

app.post("/login", (req, resp) => {
    const { username, password } = req.body;
    if (username === 'trushant' && password === 'doke') {
        const userDetails = getUser(username);
        const token = jwt.sign(userDetails, jwtSettings.acccessTokenSecretKey, { expiresIn: jwtSettings.accessTokenExpiry });
        const refreshToken = jwt.sign(userDetails, jwtSettings.refreshTokenSecretKey, { expiresIn: jwtSettings.refreshTokenExpiry });
        saveRefreshToken(userDetails.id, refreshToken);
        const cookieOptions = getCookieOptions();
        resp.cookie(jwtSettings.accessTokenCookieName, token, cookieOptions);
        return resp.status(200).json({ login: 'SUCCESS' });
    }
    return resp.status(401).json({ login: 'FAILURE' });
});

app.get("/logout", authorization, (req, res) => {
    return res
        .clearCookie(jwtSettings.accessTokenCookieName)
        .status(200)
        .json({ logout: "SUCCESS" });
});

app.get("/protected/details/user", authorization, (req, res) => {
    return res.json({ user: req.user });
});

app.get("/protected/token/access/refresh", authorization, (req, res) => {
    const token = getRefreshToken(req.user.id);
    if (!token) {
        return res.sendStatus(403);
    }
    try {
        const data = jwt.verify(token, jwtSettings.refreshTokenSecretKey);
        const { id, username, role, email } = data;
        const newAccessToken = jwt.sign({ id, username, role, email }, jwtSettings.acccessTokenSecretKey, { expiresIn: jwtSettings.accessTokenExpiry });
        const cookieOptions = getCookieOptions();
        res.cookie(jwtSettings.accessTokenCookieName, newAccessToken, cookieOptions);
        return res.status(200).json({ refreshAccessToken: 'SUCCESS' });

    } catch (e) {
        console.log("error>>", e);
        return res.sendStatus(403);
    }


});

app.listen(PORT, (error) => {
    if (!error)
        console.log("Server is Successfully Running, and App is listening on port " + PORT);
    else
        console.log("Error occurred, server can't start", error);
}
);

/***************************************/
function getUser(username, password) {
    return {
        id: "321323",
        username: "trushant",
        role: "admin",
        email: "trushant.doke@gmail.com"
    }
}
function saveRefreshToken(userId, token) {
    refreshTokens[userId] = token;
}
function getRefreshToken(userId) {
    return refreshTokens[userId];
}
function getJWTSettings() {
    return {
        acccessTokenSecretKey: 'secret',
        refreshTokenSecretKey: 'secret',
        accessTokenExpiry: '15m',
        refreshTokenExpiry: '1d',
        accessTokenCookieName: 'access_token'
    }
}
function getCookieOptions() {
    return {
        maxAge: 1000 * 60 * 15, // expire after 15 minutes
        httpOnly: true, // Cookie will not be exposed to client side code
        sameSite: "none", // If client and server origins are different
        secure: true // use with HTTPS only
    };
}
