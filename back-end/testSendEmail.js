const { sendEmail} = require("./sendEmail");

sendEmail({
    to: 'pirasmattia2299+test1@gmail.com',
    from: 'pirasmattia2299@gmail.com',
    subject: 'Test email from SendGrid',
    text: 'This is a test email sent from SendGrid',
}).then(() => {
    console.log('Email sent');
}).catch((error) => {
    console.error(error);
});