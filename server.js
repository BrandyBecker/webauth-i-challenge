const express = require('express');
const session = require('express-session');//1
const apiRouter = require('./api/api-router.js'); 
const configureMiddleware = require('./api/configure-middleware.js');

const KnexSessionStorage = require('connect-session-knex')(session); //connecting to session (returns a constructor function) <<<< stores sessions in database!
const knexConnection = require('./data/dbconfig.js');

const server = express();

const sessionConfiguration = { //===> 2. We need to configure the sessions and cookies
    name: 'booger', //default name is sid (sessions id), name to anything you want 
    secret: process.env.COOKIE_SECRET||'Is it Secret? Is it Safe?', //only i should know the secret
    cookie: {
      maxAge: 1000 * 60 * 60, // valid for 1 hour in milliseconds
      secure: process.env.NODE_ENV === 'development' ? false : true, //is it in development? if so, false. if not, true. // do we send a cookie over https only? (Production should ALWAYS be true)
      httpOnly: true, //ALWAYS true. Prevent Client JavaScript code from accessing the cookie.
    },
    resave: false, //save sessions even when they have not changed
    saveUninitialized: true, //read about it on the docs to respect GDPR
    store: new KnexSessionStorage({
      knex: knexConnection,
      clearInterval: 1000 * 60 * 10, //every 10 minutes go clean the zombie sessions 🧟‍♀️❌
      tablename: 'user_sessions',
      sidfieldname: 'id',
      createtable: true,
    })
  }

configureMiddleware(server);
server.use(express.json());
server.use(session(sessionConfiguration)) ///===> 3. Use Session middleware GLOBALLY :D

server.use('/api', apiRouter);

server.get('/', (req, res) => {
    res.json({ api: 'up', session: req.session });
  });

module.exports = server;
