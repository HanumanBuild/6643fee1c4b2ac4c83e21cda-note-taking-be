const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Note = require('./models/Note');

const app = express();
app.use(express.json()); // for parsing application/json

app.get('/', (req, res) => {
  res.send('Hello from Note-Taking App Backend!');
});

require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connection successful'))
  .catch(err => console.error('MongoDB connection error:', err));

app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).send('User created successfully');
  } catch (error) {
    res.status(500).send('Error creating user');
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    res.status(500).send('Error logging in');
  }
});

app.post('/notes', async (req, res) => {
  const { title, content, author } = req.body;
  const note = new Note({ title, content, author });
  await note.save();
  res.status(201).send('Note created successfully');
});

app.get('/notes', async (req, res) => {
  const notes = await Note.find();
  res.json(notes);
});

app.put('/notes/:id', async (req, res) => {
  const { title, content } = req.body;
  await Note.findByIdAndUpdate(req.params.id, { title, content });
  res.send('Note updated successfully');
});

app.delete('/notes/:id', async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.send('Note deleted successfully');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});