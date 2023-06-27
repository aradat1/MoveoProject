const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://moveoproject-01.firebaseio.com"
});

const db = admin.firestore();
const codeBlocksCollection = db.collection('codeBlocks');

app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  codeBlocksCollection.get()
    .then(snapshot => {
      const codeBlocks = [];
      snapshot.forEach(doc => {
        const codeBlock = doc.data();
        codeBlocks.push(codeBlock);
      });
      res.render('index', { codeBlocks });
    })
    .catch(error => {
      console.error('Error getting code blocks:', error);
      res.status(500).send('Internal Server Error');
    });
});

app.get('/code_block', (req, res) => {
  const codeId = req.query.code;
  console.log('Code ID:', codeId);
  const isMentor = req.query.mentor === 'true';
  console.log('Is Mentor:', isMentor);

  codeBlocksCollection.where('id', '==', codeId).get()
    .then((snapshot) => {
      if (!snapshot.empty) {
        // Document found, retrieve the data
        const codeBlock = snapshot.docs[0].data();
        // Render the code_block.ejs template and pass the codeBlock data
        res.render('code_block', { codeBlock });
      } else {
        // Document not found
        console.log('Code Block not found');
        res.sendStatus(404);
      }
    })
    .catch((error) => {
      // Error occurred while fetching the document
      console.error('Error fetching Code Block:', error);
      res.sendStatus(500);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });

  socket.on('joinAsMentor', ({ mentorId }) => {
    socket.join(mentorId);
    socket.emit('mentorId', mentorId);
  });

  socket.on('joinAsStudent', () => {
    socket.join('students');
  });

  socket.on('codeChange', (data) => {
    socket.to('students').emit('codeUpdated', data);
  });
});
