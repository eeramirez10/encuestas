const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host:"securemail25.carrierzone.com",
    port:"587",
    secure:false,
    auth:{
        user: process.env.USER_MAIL,
        pass:process.env.PASSWORD_MAIL
    }
})

module.exports = { transporter }