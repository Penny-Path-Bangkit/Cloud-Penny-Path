const express = require('express');
const { admin, firebase } = require('./firebase');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} = require('firebase/auth');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const auth = getAuth();

// User Registration Route
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(422).json({
      error: true,
      message: 'Name, email, and password are required',
    });
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update the user's display name
    await admin.auth().updateUser(user.uid, {
      displayName: name,
    });

    res.status(201).json({
      error: false,
      message: 'User created successfully.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: error.message || 'An error occurred while registering the user',
    });
  }
});

// User Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({
      error: true,
      message: 'Email and password are required',
    });
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    res.cookie('access_token', idToken, { httpOnly: true });

    res.status(200).json({
      error: false,
      message: 'Login successful',
      loginResult: {
        userId: userCredential.user.uid,
        name: userCredential.user.displayName,
        token: idToken,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: error.message || 'An error occurred while logging in',
    });
  }
});

// User Logout Route
app.post('/api/logout', async (req, res) => {
  try {
    await signOut(auth);
    res.clearCookie('access_token');
    res.status(200).json({
      error: false,
      message: 'User logged out successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: 'Internal Server Error',
    });
  }
});

// Token Verification Middleware
const verifyToken = async (req, res, next) => {
  const idToken = req.cookies.access_token;
  if (!idToken) {
    return res.status(403).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(403).json({ error: 'Unauthorized' });
  }
};

// Protected Route Example
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: 'You are authenticated!', user: req.user });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});