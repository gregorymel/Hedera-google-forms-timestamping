const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = [
    'https://www.googleapis.com/auth/forms',
    'https://www.googleapis.com/auth/script.scriptapp',
    'https://www.googleapis.com/auth/script.external_request'
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, url) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client, url);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Creates a new script project, upload a file, and log the script's URL.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function callAppsScript(auth, url) {
  const script = google.script({version: 'v1', auth});

  script.scripts.run({
    scriptId: "1bqC0G79tudsPkeRAtoccMpIuisD4_DV98KDEiq7gYIq6R78hbQZWqWpE",
    auth,
    requestBody: {
        "function": "setUpForm",
        "parameters": [
          url
        ],
        // "devMode": true
    }
  }, (err, res) => {
      console.log(err, res);
  });

    // const CONTENT = fs.readFileSync("hedera.gs").toString();

    // script.projects.create({
    //     resource: {
    //     title: 'Hedera Script',
    //     },
    // }, (err, res) => {
    //     if (err) return console.log(`The API create method returned an error: ${err}`);
    //     script.projects.updateContent({
    //     scriptId: res.data.scriptId,
    //     auth,
    //     resource: {
    //         files: [{
    //         name: 'hedera',
    //         type: 'SERVER_JS',
    //         source: CONTENT,
    //         }, {
    //         name: 'appsscript',
    //         type: 'JSON',
    //         source: '{\"timeZone\":\"America/New_York\",\"exceptionLogging\":' +
    //         '\"CLOUD\"}',
    //         }],
    //     },
    //     }, {}, (err, res) => {
    //     if (err) return console.log(`The API updateContent method returned an error: ${err}`);
    //     console.log(`https://script.google.com/d/${res.data.scriptId}/edit`);
    //     });
    // });
}

module.exports = {
    authorize, 
    callAppsScript
}