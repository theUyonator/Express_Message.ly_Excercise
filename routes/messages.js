const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const Message = require("../models/message")
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth")
/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn,async function (req, res, next){
    try{
        let message = await Message.get(req.params.id);
        if(req.user.username !== message.to_user.username || 
            req.user.username !== message.from_user.username){
                throw new ExpressError("Cannot read this message", 401);
            }
        return res.json({message})

    }catch(err){
        return next(err);
    }
})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async function (req, res, next){
    try{
        let { to_username, body } = req.body;
        let from_username = req.user.username;
       let message = await Message.create({from_username, to_username, body});

       return res.json({message});

    }catch(err){
        return next(err);
    }
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post(":/id/read", ensureLoggedIn, async function (req, res, next){
    try{
        let message = await Message.markRead(req.params.id);
        let fullMessage = await Message.get(req.params.id);
        if(req.user.usersame !== fullMessage.to_user.username){
            throw new ExpressError(`Can't mark this message as read`, 401);
        }
        return res.json({message});

    }catch(err){
        return next(err);
    }
})

