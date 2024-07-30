const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  spotifyId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
});

const tokenSchema = new Schema({
  refreshToken: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const User = mongoose.model('User', userSchema);
const Token = mongoose.model('Token', tokenSchema);

module.exports = { User, Token };