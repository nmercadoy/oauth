const dotenv = require('dotenv');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.PG_URI
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value;
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

  let user;
  if (result.rows.length === 0) {
    user = { username: profile.displayName, email };
    await pool.query('INSERT INTO users (username, email) VALUES ($1, $2)', [user.username, user.email]);
  } else {
    user = result.rows[0];
  }

  return done(null, user);
}));

app.post('/register', async (req, res) => {
  const { username, email, password, password2 } = req.body;

  if (password !== password2) {
    return res.status(400).json({ error: 'Las contraseñas no coinciden' });
  }

  const result = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
  if (result.rows.length > 0) return res.status(409).json({ error: 'El usuario ya existe' });

  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, hashedPassword]);

  const token = jwt.sign({ username, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.status(201).json({ mensaje: 'Usuario registrado correctamente', token });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  if (result.rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

  const user = result.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign({ username: user.username, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign({ username: user.username, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.redirect(`http://localhost:5173/dashboard?token=${token}`);
  }
);

function protegerRuta(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(403);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  });
}

app.get('/perfil', protegerRuta, (req, res) => {
  res.json({ mensaje: 'Acceso válido', usuario: req.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend iniciado en http://localhost:${PORT}`);
});
