'use strict';
const nodemailer = require('nodemailer');

var user = "";
var pass = "";
var env = process.env.NODE_ENV || 'dev';

if (env == 'dev'){
    var emailInfo = require('../config/emailConfig');
    user = emailInfo.emailUsername;
    pass = emailInfo.emailPassword;
    // user = process.env.emailUsername;
    // pass = process.env.emailPassword;
}
else
{
    user = process.env.emailUsername;
    pass = process.env.emailPassword;
}
// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
let transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // true for 465, false for other ports    // use TLS in this case
    auth: {
        user: user, // generated ethereal user
        pass: pass // generated ethereal password
    }
});

export function setupMailSender() {
// verify connection configuration
    transporter.verify(function (error, success) {
        if (error) {
            console.log("");
            console.log(error);
        } else {
            console.log('Email account connected! -> Server is ready to send our messages!');
        }
    });

}

export function sendMail(body, message, header, email, from) {

    var message = {
        from: from,
        to: email,
        subject: header,
        text: message,
        html: body
    };

    transporter.sendMail(message, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });

}

export function sendVerificationMail(email, from, confirmationCode, req) {

    var host = req.headers.host;

    var htmlCode = '<head>\n' +
        '  <title></title>\n' +
        '  <!--[if !mso]><!-- -->\n' +
        '  <meta http-equiv="X-UA-Compatible" content="IE=edge">\n' +
        '  <!--<![endif]-->\n' +
        '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\n' +
        '<style type="text/css">\n' +
        '  #outlook a { padding: 0; }\n' +
        '  .ReadMsgBody { width: 100%; }\n' +
        '  .ExternalClass { width: 100%; }\n' +
        '  .ExternalClass * { line-height:100%; }\n' +
        '  body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }\n' +
        '  table, td { border-collapse:collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }\n' +
        '  img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }\n' +
        '  p { display: block; margin: 13px 0; }\n' +
        '</style>\n' +
        '<!--[if !mso]><!-->\n' +
        '<style type="text/css">\n' +
        '  @media only screen and (max-width:480px) {\n' +
        '    @-ms-viewport { width:320px; }\n' +
        '    @viewport { width:320px; }\n' +
        '  }\n' +
        '</style>\n' +
        '<!--<![endif]-->\n' +
        '<!--[if mso]>\n' +
        '<xml>\n' +
        '  <o:OfficeDocumentSettings>\n' +
        '    <o:AllowPNG/>\n' +
        '    <o:PixelsPerInch>96</o:PixelsPerInch>\n' +
        '  </o:OfficeDocumentSettings>\n' +
        '</xml>\n' +
        '<![endif]-->\n' +
        '<!--[if lte mso 11]>\n' +
        '<style type="text/css">\n' +
        '  .outlook-group-fix {\n' +
        '    width:100% !important;\n' +
        '  }\n' +
        '</style>\n' +
        '<![endif]-->\n' +
        '\n' +
        '<!--[if !mso]><!-->\n' +
        '    <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">\n' +
        '    <style type="text/css">\n' +
        '\n' +
        '        @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);\n' +
        '\n' +
        '    </style>\n' +
        '  <!--<![endif]--><style type="text/css">\n' +
        '  @media only screen and (min-width:480px) {\n' +
        '    .mj-column-per-100, * [aria-labelledby="mj-column-per-100"] { width:100%!important; }\n' +
        '  }\n' +
        '</style>\n' +
        '</head>\n' +
        '<body style="background: #F9F9F9;">\n' +
        '  <div style="background-color:#F9F9F9;"><!--[if mso | IE]>\n' +
        '      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="640" align="center" style="width:640px;">\n' +
        '        <tr>\n' +
        '          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">\n' +
        '      <![endif]-->\n' +
        '  <style type="text/css">\n' +
        '    html, body, * {\n' +
        '      -webkit-text-size-adjust: none;\n' +
        '      text-size-adjust: none;\n' +
        '    }\n' +
        '    a {\n' +
        '      color:#1EB0F4;\n' +
        '      text-decoration:none;\n' +
        '    }\n' +
        '    a:hover {\n' +
        '      text-decoration:underline;\n' +
        '    }\n' +
        '  </style>\n' +
        '<div style="margin:0px auto;max-width:640px;background:transparent;"><table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:transparent;" align="center" border="0"><tbody><tr><td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:40px 0px;"><!--[if mso | IE]>\n' +
        '      <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:top;width:640px;">\n' +
        '      </td></tr></table>\n' +
        '      <![endif]--></td></tr></tbody></table></div><!--[if mso | IE]>\n' +
        '      </td></tr></table>\n' +
        '      <![endif]-->\n' +
        '      <!--[if mso | IE]>\n' +
        '      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="640" align="center" style="width:640px;">\n' +
        '        <tr>\n' +
        '          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">\n' +
        '      <![endif]--><div style="max-width:640px;margin:0 auto;box-shadow:0px 1px 5px rgba(0,0,0,0.1);border-radius:4px;overflow:hidden"><div style="margin:0px auto;max-width:640px;background:#7289DA url(https://cdn.discordapp.com/email_assets/f0a4cc6d7aaa7bdf2a3c15a193c6d224.png) top center / cover no-repeat;"><!--[if mso | IE]>\n' +
        '      <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:640px;">\n' +
        '        <v:fill origin="0.5, 0" position="0.5,0" type="tile" src="https://cdn.discordapp.com/email_assets/f0a4cc6d7aaa7bdf2a3c15a193c6d224.png" />\n' +
        '        <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">\n' +
        '      <![endif]--><table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#7289DA url(https://cdn.discordapp.com/email_assets/f0a4cc6d7aaa7bdf2a3c15a193c6d224.png) top center / cover no-repeat;" align="center" border="0" background="https://cdn.discordapp.com/email_assets/f0a4cc6d7aaa7bdf2a3c15a193c6d224.png"><tbody><tr><td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:57px;"><!--[if mso | IE]>\n' +
        '      <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:undefined;width:640px;">\n' +
        '      <![endif]--><div style="cursor:auto;color:white;font-family:Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-size:36px;font-weight:600;line-height:36px;text-align:center;">Welcome to QBook!</div><!--[if mso | IE]>\n' +
        '      </td></tr></table>\n' +
        '      <![endif]--></td></tr></tbody></table><!--[if mso | IE]>\n' +
        '        </v:textbox>\n' +
        '      </v:rect>\n' +
        '      <![endif]--></div><!--[if mso | IE]>\n' +
        '      </td></tr></table>\n' +
        '      <![endif]-->\n' +
        '      <!--[if mso | IE]>\n' +
        '      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="640" align="center" style="width:640px;">\n' +
        '        <tr>\n' +
        '          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">\n' +
        '      <![endif]--><div style="margin:0px auto;max-width:640px;background:#ffffff;"><table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#ffffff;" align="center" border="0"><tbody><tr><td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:40px 70px;"><!--[if mso | IE]>\n' +
        '      <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:top;width:640px;">\n' +
        '      <![endif]--><div aria-labelledby="mj-column-per-100" class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0"><tbody><tr><td style="word-break:break-word;font-size:0px;padding:0px 0px 20px;" align="left"><div style="cursor:auto;color:#737F8D;font-family:Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-size:16px;line-height:24px;text-align:left;">\n' +
        '            <p><img src="https://cdn.discordapp.com/email_assets/127c95bbea39cd4bc1ad87d1500ae27d.png" alt="Party Wumpus" title="None" width="500" style="height: auto;"></p>\n' +
        '\n' +
        '  <h2 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 20px;color: #4F545C;letter-spacing: 0.27px;">Hey ' + email + ',</h2>\n' +
        '<p>Welcome to QBook, the new ILC room booking system!</p>\n' +
        '<p>Before you get started, we\'ll need to verify your email.</p>\n' +
        '\n' +
        '          </div></td></tr><tr><td style="word-break:break-word;font-size:0px;padding:10px 25px;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate;" align="center" border="0"><tbody><tr><td style="border:none;border-radius:3px;color:white;cursor:auto;padding:15px 19px;" align="center" valign="middle" bgcolor="#7289DA"><a href="' + host + '/accounts/verify?verificationCode=' + confirmationCode +'" style="text-decoration:none;line-height:100%;background:#7289DA;color:white;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:15px;font-weight:normal;text-transform:none;margin:0px;" target="' + host + '/accounts/verify?' + confirmationCode + '">\n' +
        '            Verify Email\n' +
        '          </a></td></tr></tbody></table></td></tr></tbody></table></div><!--[if mso | IE]>\n' +
        '      </td></tr></table>\n' +
        '      <![endif]--></td></tr></tbody></table><table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0"><tr><td style="word-break:break-word; padding:0px 70px 10px;" align="center"><div style="cursor:auto;color:#737F8D;font-family:Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-size:16px;line-height:24px;text-align:left;"><p>Or copy and paste this link: </p><p>' + host + '/accounts/verify?verificationCode=' + confirmationCode + '</p><p> into your browser</p></div></td></tr></table></div><!--[if mso | IE]>\n' +
        '      </td></tr></table>\n' +
        '      <![endif]-->\n' +
        '      <!--[if mso | IE]>\n' +
        '      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="640" align="center" style="width:640px;">\n' +
        '        <tr>\n' +
        '          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">\n' +
        '      <![endif]--></div><div style="margin:0px auto;max-width:640px;background:transparent;"><table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:transparent;" align="center" border="0"><tbody><tr><td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:0px;"><!--[if mso | IE]>\n' +
        '      <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:top;width:640px;">\n' +
        '      <![endif]--><div aria-labelledby="mj-column-per-100" class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0"><tbody><tr><td style="word-break:break-word;font-size:0px;"><div style="font-size:1px;line-height:12px;">&nbsp;</div></td></tr></tbody></table></div><!--[if mso | IE]>\n' +
        '      </td></tr></table>\n' +
        '      <![endif]--></td></tr></tbody></table></div><!--[if mso | IE]>\n' +
        '      </td></tr></table>\n' +
        '      <![endif]-->\n' +
        '      <!--[if mso | IE]>\n' +
        '      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="640" align="center" style="width:640px;">\n' +
        '        <tr>\n' +
        '          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">\n' +
        '      <![endif]--><div style="margin:0 auto;max-width:640px;background:#ffffff;box-shadow:0px 1px 5px rgba(0,0,0,0.1);border-radius:4px;overflow:hidden;"><table cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#ffffff;" align="center" border="0"><tbody><tr><td style="text-align:center;vertical-align:top;font-size:0px;padding:0px;"><!--[if mso | IE]>\n' +
        '      <table border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:top;width:640px;">\n' +
        '      <![endif]--><div aria-labelledby="mj-column-per-100" class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0"><tbody><tr><td style="word-break:break-word;font-size:0px;padding:30px 70px 0px 70px;" align="center"><div style="cursor:auto;color:#43B581;font-family:Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-size:18px;font-weight:bold;line-height:16px;text-align:center;">FUN FACT #16</div></td></tr><tr><td style="word-break:break-word;font-size:0px;padding:14px 70px 30px 70px;" align="center"><div style="cursor:auto;color:#737F8D;font-family:Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-size:16px;line-height:22px;text-align:center;">\n' +
        '      In Hearthstone, using the Hunter card Animal Companion against Kel\'Thuzad will summon his cat Mr. Bigglesworth rather than the usual beasts.\n' +
        '    </div></td></tr></tbody></table></div><!--[if mso | IE]>\n' +
        '      </td></tr></table>\n' +
        '      <![endif]--></td></tr></tbody></table></div><!--[if mso | IE]>\n' +
        '      </td></tr></table>\n' +
        '      <![endif]-->\n' +
        '      <!--[if mso | IE]>\n' +
        '      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="640" align="center" style="width:640px;">\n' +
        '        <tr>\n' +
        '          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">\n' +
        '      <![endif]--><div style="margin:0px auto;max-width:640px;background:transparent;"><table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:transparent;" align="center" border="0"><tbody><tr><td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:20px 0px;"><!--[if mso | IE]>\n' +
        '      <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:top;width:640px;">\n' +
        '      <![endif]-->\n' +
        '</body>';

    var message = {
        from: from,
        to: email,
        subject: "Please verify your email address",
        text: "Please verify your email address.  Go to " + host + '/accounts/verify?' + confirmationCode + " to verify your email address",
        html: htmlCode
    };

    transporter.sendMail(message, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });

}
