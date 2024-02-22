const nodemailer = require('nodemailer')

const sendEmail = async(subject,message,send_to,sent_from,reply_to)=> {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    })

    // options for sending email
    const options = {
        from: sent_from,
        to: send_to,
        replyTo: reply_to,
        subject,
        html: message,
    }

    console.log("The options",options)
    // send email
    transporter.sendMail(options, function(err,info) {
        if(err) {
            console.log("Error on sending email",err)
        }
        console.log("The info",info)
    })
}

module.exports = sendEmail