const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host:"securemail25.carrierzone.com",
    port:"1025",
    secure:false,
    auth:{
        user:"eeramirez@tuvansa.com.mx",
        pass:"Ag7348pp**"
    }
})

module.exports = { transporter }