const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD
    }
});

const sendEmail = async (to, subject, text) => {
    const mailOptions = {
          from: process.env.EMAIL_USER,
          to,
          subject,
          text
    };

    try {
          await transporter.sendMail(mailOptions);
          console.log('Email sent successfully');
    } catch (error) {
          console.error('Error sending email:', error);
          throw error;
    }
};

module.exports = { sendEmail };
