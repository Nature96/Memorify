const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  spotifyId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
});

const tokenSchema = new Schema({
  userId: { type: String, required: true },
  refreshToken: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const authLogSchema = new Schema({
  userId: { type: String, required: true },
  time: { type: String, required: true },
})

const backupLogSchema = new Schema({
  userId: { type: String, required: true },
  playlist: { type: String, required: true },
  backupMsg: { type: String, required: false },
  time: { type: String, required: true },
})

const debugLogSchema = new Schema({
  userId: { type: String, required: true },
  debugMsg: { type: String, required: true },
  time: { type: String, required: true },
})

const errorLogSchema = new Schema({
  userId: { type: String, required: false },
  severity: { type: String, required: true },
  errorMsg: { type: String, required: true },
  error:    { type: String, required: false },
  time: { type: String, required: true },
})

const eventLogSchema = new Schema({
  userId: { type: String, required: false },
  severity: { type: String, required: false },
  event: { type: String, required: true },
  time: { type: String, required: true },
})


const User      = mongoose.model('User', userSchema);
const Token     = mongoose.model('Token', tokenSchema);
const AuthLog   = mongoose.model("AuthLog", authLogSchema);
const BackupLog = mongoose.model("BackupLog", backupLogSchema);
const ErrorLog  = mongoose.model("ErrorLog", errorLogSchema);
const DebugLog  = mongoose.model("DebugLog", debugLogSchema);
const EventLog  = mongoose.model("EventLog", eventLogSchema);

module.exports = { User, Token, AuthLog, BackupLog, ErrorLog, DebugLog, EventLog };