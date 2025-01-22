const db = require('../db/dbInstance');

 function register(req, res){
  const { username, email, embedding, m1,m2,m3,m4,m5,w1,w2,w3 } = req.body;
  db.run(
    `INSERT INTO users (username, email, embedding) VALUES (?, ?, ?)`, 
    [username, email, JSON.stringify(embedding)], 
    (err) => {
      if (err) {
        if (err.errno === 19) { // UNIQUE constraint violation
          console.log('Username already exists:', username);
          res.status(400).send('Username already exists.');
        } else {
          console.error('Error saving user:', err);
          res.status(500).send('Error saving user.');
        }
      } else {
        console.log('User registered:', username);
        res.status(200).send('User registered successfully.');
      }
    }
  );
}

module.exports =  register