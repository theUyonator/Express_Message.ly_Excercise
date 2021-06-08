const express = require("express");
const jwt = require("jsonwebtoken");
const ExpressError = require("../expressError");
const router = express.Router();
const User = require("../models/user")
const { SECRET_KEY } = require("../config")

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async function (req, res, next){
    try{
        const { username, password } = req.body;
        if(User.authenticate(username, password)){
            let token = jwt.sign( {username}, SECRET_KEY);
            User.updateLoginTimestamp(username);

            return res.json({token})
        }else{
            throw new ExpressError(`Invalid username/password`, 400);
        }

    }catch(e){
        return next(e);
    }
})

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

 router.post("/register", async function (req, res, next){
     try{
         let { username } = await User.register(req.body);
         let token = jwt.sign({ username}, SECRET_KEY);
         User.updateLoginTimeStamp(username);

         return res.json({token})

     }catch(e){
         return next(e);
     }

 })


 module.exports = router;
