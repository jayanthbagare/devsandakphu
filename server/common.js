if (Meteor.isServer) {
  Meteor.methods({
    sendSMS: function(toNumber, body) {
      //Run Twilio here
      twilio = Twilio('AC15886b52bdb53ae37c3f2237955bb0d3', '78f868c47e97c113e05c4fe5ede64b4f');
      twilio.sendSms({
        to: toNumber, // Any number Twilio can deliver to
        from: '+14696052859', // A number you bought from Twilio and can use for outbound communication
        body: body // body of the SMS message
      }, function(err, responseData) { //this function is executed when a response is received from Twilio
        if (!err) {
          return true;
        } else {
          {
            console.log(err);
            return false;
          }
        }
      });
    },
    mgetClient: function(client_id) {
      var client = Clients.findOne({
        "_id": client_id
      });
      return client;
    },
    createUserOnboardBP: function(bp) {
      //Create the account
      currentUserId = Accounts.createUser({
        username: bp.emails[0],
        email: bp.emails[0],
        password: "initial12",
        profile: {
          BusinessPartnerId: bp._id
        }
      });

      //Setup the email template.
      // Accounts.emailTemplates.siteName="Feliz";
      // Accounts.emailTemplates.from="info@fazo21.com";
      // subject = bp.name + " has added you as a Business Partner";
      // Accounts.emailTemplates.enrollAccount.subject = function(user){
      //   return "Hello " + user.username;
      // };

      //Send a email to change the password
      Accounts.sendEnrollmentEmail(currentUserId,bp.emails[0]);

    }

  });

}
