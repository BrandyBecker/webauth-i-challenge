const router = require('express').Router();
const bcrypt = require('bcryptjs');
const Users = require('../users/users-model.js');

router.post('/register', (req, res) => {
  let userInfo = req.body;

  const hash = bcrypt.hashSync(userInfo.password, 14)
  userInfo.password=hash;

  Users.add(userInfo)
    .then(saved => {
      req.session.username = saved.username; //saved username from sessions 
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

router.post('/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      //check that the Password is valid
      if (user && bcrypt.compareSync(password, user.password )) {
        req.session.username = user.username; // adding a required session username = users username //good: add properties to existing session object
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

module.exports = router;
