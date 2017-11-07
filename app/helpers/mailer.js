const sendgrid = require('sendgrid')(process.env.SENDGRID_API_KEY);

class MailerHelper {
  sendActivationEmail(user, done) {
    try {
      let link = process.env.BASE_URL + "/activate/" + user.activation_token;

      let email = new sendgrid.Email({
        to:       user.email,
        from:     'no-reply@meanskel.com',
        fromname: 'MEAN skel',
        subject:  'Please activate your account!',
        html:     `
          <p>Welcome! ${user.email}</p>
          <p>Please follow this link to activate your account</p>
          <p>
            <a href="${link}">${link}</a>
          </p>`
      });

      sendgrid.send(email, (err, json) => {
        if (err)
          done(err);
        else
          done(null);
      });
    }
    catch(err) {
      done(err);
    }
  }
}

module.exports = new MailerHelper();
