const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const codeBlocks = [
  { id: '1', title: 'Async case', code: '/* Your code here */', mentorId: null },
  { id: '2', title: 'Conditional Statements', code: '/* Your code here */', mentorId: null },
  { id: '3', title: 'Loops (For Loop)', code: '/* Your code here */', mentorId: null },
  { id: '4', title: 'Arrays and Array Manipulation', code: '/* Your code here */', mentorId: null }
];

app.set('view engine', 'ejs'); // Set the template engine to EJS
app.set('views', path.join(__dirname, 'views')); // Set the views directory

app.get('/', (req, res) => {
  res.render('index', { codeBlocks });
});

app.get('/code_block', (req, res) => {
  const code = req.query.code;
  const selectedCodeBlock = codeBlocks.find(block => block.id === code);

  if (selectedCodeBlock) {
    res.render('code_block', { codeBlock: selectedCodeBlock });
  } else {
    res.status(404).send('Code block not found');
  }
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
