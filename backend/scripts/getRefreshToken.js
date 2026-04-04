// scripts/getRefreshToken.js
require('dotenv').config();               // <— carga el .env
const { google } = require('googleapis');
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://mail.google.com/']
});
console.log('1) Ve a esta URL y autoriza:\n', authUrl);

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
readline.question('Código de Google> ', async code => {
  const { tokens } = await oauth2Client.getToken(code);
  console.log('==> Este es tu nuevo refresh_token:\n', tokens.refresh_token);
  readline.close();
});
