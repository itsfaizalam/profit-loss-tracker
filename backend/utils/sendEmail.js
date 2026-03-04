const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Determine use of real credentials or ethereal testing
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `Profit Loss Tracker <${process.env.EMAIL_USER || 'noreply@profitlosstracker.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // Since we don't have credentials yet, we log the link to console so the user can verify in dev mode
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('==================================================');
        console.log('   DEVELOPMENT MODE - EMAIL VERIFICATION SIMULATOR ');
        console.log('==================================================');
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message:\n${options.message}`);
        console.log('==================================================');
        return;
    }

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = sendEmail;
