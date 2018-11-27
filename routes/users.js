const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database')
const User = require('../models/user');

AuthGuard = passport.authenticate('jwt', {session: false})

//Register
router.post('/register', (req, res, next) => {
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    });

    User.addUser(newUser, (err)=> {
        if(err){
            res.json({success: false, msg:'Failed to register user'});
        } else {
            res.json({success: true, msg:'You are registered!'})
        }


    });
});

//Auth
router.post('/authenticate', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err,user) =>{
        if(err) throw err;
        if(!user) {
            console.log(user);
            return res.json({success: false, msg: "User not found"});
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if(err) throw err;
            if(isMatch){
                const token = jwt.sign(user.toJSON(), config.secret, { //USER OBJECT TURNED TO JSON
                    expiresIn: 604800 //a week
                });

                res.json({
                    success: true,
                    token: 'JWT '+token,
                    user: {
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email
                    }
                });
            } else {
                return res.json({success: false, msg: "Wrong Password"});
            }
        });
    });
});

//Profile
router.get('/profile', AuthGuard, (req, res, next) => {
    res.json({user: req.user});
});


router.get('/list', AuthGuard, (req,res) =>{
    User.find({}, (err, users) => {
        var userList = {};

        users.forEach( (user) => {
            userList[user.username] = user;
        });
        
        res.send(userList);
    })
})

module.exports = AuthGuard;
module.exports = router;