const { google } = require('googleapis');
const {db, saveDb} = require('./db');
const axios = require('axios');

const oauthClient = new google.auth.OAuth2(
  //console.log('Google', process.env.GOOGLE_CLIENT_ID),
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://automatic-space-memory-96gv4ggqw7pcxx4x-3000.app.github.dev/auth/google/callback',
);
// These 2 values have been selected during Oauth client credential
const getGoogleOauthUrl = () => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  return oauthClient.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });
}

// Our backend is making requests to google to get user info
const getGoogleUser = async (code) => {
    const {tokens} = await oauthClient.getToken(code);
    const response = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,
        {
            headers: {
                Authorization: `Bearer ${tokens.id_token}`,
            }
        },
    )
    return response.data;
}

const updateOrCreateUserFromOauth = async (oauthUserInfo) => {
  const {
    id: googleId,
    verified_email: isVerified,
    email,
  } = oauthUserInfo;

  const existingUser = db.users.find(user => user.email === email);

  if (existingUser) {
    existingUser.googleId = googleId;
    existingUser.isVerified = isVerified || existingUser.isVerified;
    saveDb();
    return existingUser;
  } else {
    const newUser = {
      email,
      googleId,
      isVerified,
      info: {},
    };

    db.users.push(newUser);
    saveDb();
    return newUser;
  }
}

module.exports = { getGoogleOauthUrl, getGoogleUser, updateOrCreateUserFromOauth };