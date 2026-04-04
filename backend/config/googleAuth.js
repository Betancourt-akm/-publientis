const { google } = require('googleapis');
require('dotenv').config();

// Este archivo centraliza la configuración del cliente OAuth2 de Google.
// Se inicializa una sola vez y se exporta para ser utilizado en toda la aplicación.

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

module.exports = oAuth2Client;
