const express = require('express');
const { db, saveDb } = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {v4: uuidv4} = require('uuid');
const app = express();
app.use(express.json());
const {sendEmail} = require('./sendEmail');


// Endpoints go here
// Crating our endpoints routes


/** SIGN_UP ROUTE */
app.post('/api/sign-up', async (req, res) => {
    const {email,password} = req.body;
    // Is there already a user in the db with this email?
    // We have to search trough our user array (see db.js file)
    matching_user = db.users.find(user => user.email === email);
    if (matching_user) {
        // there is already a user with this email
        return res.sendStatus(409);
    } 
    // We don't want to save the password as plain text
    // The second parameter is the salt rounds, the higher the more secure but the longer it takes
    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    // EMAIL VERIFICATION
    const verificationString = uuidv4();
    const startingInfo = {
            hairColor:'',
            favoriteFood:'',
            bio:'',
    }
    // ADD the verification string to the user in the database
    db.users.push({
        id,
        email,
        passwordHash,
        info: startingInfo,
        isVerified: false,
        verificationString,
    })
    saveDb();
    // LEt's send the verification email to the user who can click on the link
    
    try{
        await sendEmail({
            to: email,
            from: 'pirasmattia2299@gmail.com',
            subject: 'Please verify your email',
            text: `Thank you for signing up! To verify your email please click on this link: https://l64wmtt7-5173.euw.devtunnels.ms/verify-email/${verificationString}`,
        })
    } catch(err) {
        console.log('Error sending email', err);
        return res.sendStatus(500);
    }
    // Before responsing to the user we'going to create a token and
    // we put the user data inside this.
    // process.env.JWT_SECRET is a secret key that we use to sign the token
    jwt.sign({
        id,
        email,
        info: startingInfo,
        isVerified: false,
    }, process.env.JWT_SECRET, {expiresIn:'2d'}, (err,token) => {
        console.log('key', process.env.JWT_SECRET);
        if (err) {
           return res.status(500).send(err); 
        }
        // If we don't have any error we send the token
        // The Id is not included because it is already inside the token
        res.json({token});
    })
    // We want to send back something to the user
    //res.json({id});

});


/** LOGIN-IN */
app.post('/api/log-in', async (req, res) => {
    const {email,password} = req.body;
    // Is there already a user in the db with this email?
    // We have to search trough our user array (see db.js file)
    const user = db.users.find(user => user.email === email);
    if (!user) {
        // there is not already a user with this email
        return res.sendStatus(401);
    } 
    // Otherwise check if the passowrd is correct
    const passwordIsCorrect = await bcrypt.compare(password, user.passwordHash);
    if (passwordIsCorrect) {
        // load user info and send back the user token
        const {id, email, info, isVerified} = user;
        // Before responsing to the user we'going to create a token and
        // we put the user data inside this.
        // process.env.JWT_SECRET is a secret key that we use to sign the token
        jwt.sign({
            id,
            email,
            info,
            isVerified: false,
        }, process.env.JWT_SECRET, {expiresIn:'2d'}, (err,token) => {
            if (err) {
            return res.status(500).send(err); 
            }
            // If we don't have any error we send the token
            // The Id is not included because it is already inside the token
            res.json({token});
        })
    } else {
        res.sendStatus(401);
    }
});

/** USER UPDATE*/
app.put('/api/users/:userId', (req, res) => {
    const {authorization} = req.headers;
    const {userId} = req.params;
    
    if (!authorization) {
        return res.status(401).json({message: 'No authorization header'});
    }
    // Checking if the user exists
    const user = db.users.find(user => user.id === userId); 
    if (!user) {
        return res.sendStatus(404);
    }
    // NOTE that the token are like "Bearer asdjkcbsdjha.abhdsicbasdu.abhsdicbasi"
    const token = authorization.split(' ')[1];
    // We have to verify the token first and that's where the last 
    // part of the token gets handy
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({message: 'Token not valid'});
        }
        const {id} = decoded;
        if (id !== userId) {
            return res.status(403).json({message: 'You can only update your own account'});
        }
        // Now the user can update his info
        const {favoriteFood,hairColor,bio} = req.body;
        // We don't want the user to update fields that are not allowed
        // So we create an object with only the fields that are allowed to be updated
        // INnstead of writing "const updates = req.body" directly
        const updates = {favoriteFood,hairColor,bio};
        
        // If a parameter was not definied we don't want to update it
        // So we only update the fields that were actually sent in the request

        user.info.favoriteFood = updates.favoriteFood || user.info.favoriteFood;
        user.info.hairColor = updates.hairColor || user.info.hairColor;
        user.info.bio = updates.bio || user.info.bio;
        saveDb();

        // Now we're going to generate a new token with the updated info
        // and send it back to the client
        jwt.sign({
            ...user
        }, process.env.JWT_SECRET, {expiresIn:'2d'}, (err,token) => {
            if (err) {
            return res.status(500).send(err); 
            }
            // If we don't have any error we send the token
            // The Id is not included because it is already inside the token
            res.json({token});
        })
    });
})


// ROUTE FOR EMAIL VERIFICATION
app.put('/api/verify-email', async (req, res) => {
    const {verificationString} = req.body;
    // Find the user with this verification string
    const user = db.users.find(user => user.verificationString === verificationString);
    if (!user) {
        return res.status(401).json({message: 'the email verification code is incorrect'});
    }
    // If we found the user we set isVerified to true and remove the verification string
    user.isVerified = true;
    const {id,email,info, isVerified} = user;
    jwt.sign({id,email,isVerified,info}, process.env.JWT_SECRET, {expiresIn:'2d'}, (err,token) => {
    if (err) { 
              return res.status(500).send(err);
    }
    res.json({token});
    })
})

// FORGOT PASSWORD 
app.put('/api/forgot-password/:email', async (req, res) => {
    const {email} = req.params;
    const user = db.users.find(user => user.email === email);
    // Generate a password reset code using uuidv4 package
    const passwordResetCode = uuidv4();
    user.passwordResetCode = passwordResetCode;
    // Save the database because we want the user to have this code saved
    saveDb();
    try {
       await sendEmail({
            to: email,
            from: 'pirasmattia2299@gmail.com',
            subject: 'Password Reset',
            text: `To reset your password, please click on this link: https://l64wmtt7-5173.euw.devtunnels.ms/reset-password/${passwordResetCode}`,
        })
        // If OKAY
        res.sendStatus(200);
    } catch(err) {
        console.log('Error sending email', err);
        return res.sendStatus(500);
    }

})

// RESET PASSWORD
app.put('/api/users/:passwordResetCode/reset-password', async (req, res) => {
    const {passwordResetCode} = req.params;
    const {newPassword} = req.body;
    // Find the user with this password reset code
    const user = db.users.find(user => user.passwordResetCode === passwordResetCode);
    if (!user) {
        return res.status(401).json({message: 'the password reset code is incorrect'});
    }
    // If we found the user we hash the new password and update the passwordHash
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newPasswordHash;
    // We also remove the password reset code from the user
    delete user.passwordResetCode;
    saveDb();
    res.sendStatus(200);
});

app.listen(3000, () => console.log('Server running on port 3000'));