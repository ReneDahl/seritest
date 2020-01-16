module.exports = (users, secret, passport, APP_URL) => {
    let express = require('express');
    let router = express.Router();

    router.post('/', (req, res) => {
        // TODO: Implement user account creation
        res.status(501).json({msg: "POST new user not implemented"});
    });

    router.put('/', (req, res) => {
        // TODO: Implement user update (change password, etc).
        res.status(501).json({msg: "PUT update user not implemented"});
    });

    // This route takes a username and a password and create an auth token
    router.post('/authenticate',
        passport.authenticate('local', { session: false }),
        (req, res) => {
            res.json({ token: req.user.token, username: req.user.username });
        });

    // This route redirects to the facebook auth page
    router.get('/authenticate/facebook',
        passport.authenticate('facebook', { scope : ['email'], session: false }));

    // Callback from facebook auth that redirects to React frontpage and sets info in session cookie
    router.get('/authenticate/facebook/callback',
        passport.authenticate('facebook', { session: false }),
        (req, res) => {
            const value = {
                token: req.user.token,
                email: req.user.email,
                loginType: "Facebook",
                username: req.user.username
            };
            res.cookie('value', JSON.stringify(value)).redirect(APP_URL);
        });

    router.get('/authenticate/google',
        passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

    router.get('/authenticate/google/callback',
        passport.authenticate('google', { session: false }),
        function(req, res) {
            const value = {
                token: req.user.token,
                email: req.user.email,
                loginType: "Google",
                username: req.user.username
            };
            res.cookie('value', JSON.stringify(value)).redirect(APP_URL);
        });

    router.get("/authenticate/twitch", passport.authenticate("twitch.js", { scope: ['user:read:email'], session: false }));
    router.get("/authenticate/twitch/callback", passport.authenticate("twitch.js", { session: false }), function(req, res) {
        const value = {
            token: req.user.token,
            email: req.user.email,
            loginType: "Twitch",
            username: req.user.username
        };
        res.cookie('value', JSON.stringify(value)).redirect(APP_URL)
    });


    return router;
};