const { hm1, hm2, hm3, hm4, hm5, hm6, hm7, hm8 } = require('./constants');
const db = require('../db/dbInstance');

 function register(req, res){
  const { username, email, embedding, hash } = req.body;
  const m1 = hash['m1'];
  const m2 = hash['m2'];
  const m3 = hash['m3'];
  const m4 = hash['m4'];
  const m5 = hash['m5'];
  const w1 = hash['w1'];
  const w2 = hash['w2'];
  const w3 = hash['w3'];

  console.log('REGISTER: ', { username, email });
  // console.log('EMBEDDING: ', embedding);
  console.log('HASH GOT: ', hash);
  console.log('EXPECTED HASH: ', { m1: hm1, m2: hm2, m3: hm3, m4: hm4, m5: hm5, w1: hm6, w2: hm7, w3: hm8 });

  if (m1 !== hm1 || m2 !== hm2 || m3 !== hm3 || m4 !== hm4 || m5 !== hm5 || w1 !== hm6 || w2 !== hm7 || w3 !== hm8) {
    console.log('Hash mismatch');
    return res.status(402).send('Hash mismatch');
  } else {
    console.log('Hashes matched');
  }

  db.run(
    `INSERT INTO users (username, email, embedding) VALUES (?, ?, ?)`, 
    [username, email, JSON.stringify(embedding)], 
    (err) => {
      if (err) {
        if (err.errno === 19) { // UNIQUE constraint violation
          console.log('Username already exists:', username);
          res.status(401).send('username already exists');
        } else {
          console.error('Error saving user:', err);
          res.status(500).send('Error saving user.');
        }
      } else {
        console.log('REGISTRATION SUCCESS:', username);
        res.status(200).send('User registered successfully.');
      }
    }
  );
}

module.exports =  register