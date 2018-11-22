"use strict"
const express = require('express');
const router = express.Router();
const passport = require('passport');
const conversation = require('../models/conversation')
const message = require('../models/message')

router.get('/' ,passport.authenticate('jwt', {session:false}), (req, res, next) => {  
    // Only return one message from each conversation to display as snippet
    conversation.find({ participants: req.user._id })
      .select('_id')
      .exec(function(err, conversations) {
        if (err) {
          res.send({ error: err });
          return next(err);
        }
  
        // Set up empty array to hold conversations + most recent message
        let fullConversations = [];
        conversations.forEach(function(conversation) { //applies this function on every conversation item
          message.find({ 'conversationId': conversation._id })
            .sort('-createdAt')
            .limit(1)
            .populate({
              path: "author",
              select: "name"
            })
            .exec(function(err, message) {
              if (err) {
                res.send({ error: err });
                return next(err);
              }
              fullConversations.push(message);
              if(fullConversations.length === conversations.length) {
                return res.status(200).json({ conversations: fullConversations });
              }
            });
        });
    });
  });



//get list of messages in chat
router.get('/:conversationId', passport.authenticate('jwt', {session:false}),(req, res, next) => {
    message.find({ conversationId: req.params.conversationId })
        .select('createdAt body author')
        .sort('-createdAt')
        .populate({
            path: 'author',
            select: 'name'
        })
        .exec(function (err, messages) {
            if (err) {
                res.send({ error: err });
                return next(err);
            }

            res.status(200).json({ conversation: messages });
        });
});

// start new Chat
router.post('/new/:recipient',passport.authenticate('jwt', {session:false}), (req, res, next) => {
    if (!req.params.recipient) {
        res.status(422).send({ error: 'Please choose a valid recipient for your message.' });
        return next();
    }

    if (!req.body.composedMessage) {
        res.status(422).send({ error: 'Please enter a message.' });
        return next();
    }

    const Aconversation = new conversation({
        participants: [req.user._id, req.params.recipient]
    });

    Aconversation.save(function (err, newConversation) {
        if(err) {
            res.send({ error: err });
            return next(err);
        }

        const Amessage = new message({
            conversationId: newConversation._id,
            body: req.body.composedMessage,
            author: req.user._id
        });

        Amessage.save(function(err, newMessage) {
            if(err) {
                res.send({ error: err });
                return next(err);
            }

            res.status(200).json({ message: 'Conversation started!', conversationId: conversation._id});
            return next();
        });

      });
    });
  
    //send reply
    router.post('/:conversationId',passport.authenticate('jwt', {session:false}), (req, res, next) => {
        const reply = new message({
            conversationId: req.params.conversationId,
            body: req.body.composedMessage,
            author: req.user._id
        });

        reply.save(function(err, sentReply) {
            if(err) {
                res.send({ error: err});
                return next(err);
            }

            res.status(200).json({ message: 'Reply successfully sent! ', reply : req.body.composedMessage });
            return(next);
        });

    });

    module.exports = router;