if (Meteor.isServer) {
  // ROOT_URL='http://54.179.147.163:3000';
  ROOT_URL = 'http://localhost:9999';


  Meteor.methods({
    sendSMS: function(toNumber, body) {
      //Run Twilio here
      // twilio = Twilio('AC15886b52bdb53ae37c3f2237955bb0d3', '78f868c47e97c113e05c4fe5ede64b4f');
      // twilio.sendSms({
      //   to: toNumber, // Any number Twilio can deliver to
      //   from: '+14696052859', // A number you bought from Twilio and can use for outbound communication
      //   body: body // body of the SMS message
      // }, function(err, responseData) { //this function is executed when a response is received from Twilio
      //   if (!err) {
      //     return true;
      //   } else {
      //     {
      //       console.log(err);
      //       return false;
      //     }
      //   }
      // });
      //Plivo Setup here.
      var plivo = Meteor.npmRequire('plivo');
      //var plivo = new plivonpm({version:"0.3.3"});

      var p = plivo.RestAPI({
        authId: 'MAMDA4YWQ3MTU5ZWFLMW',
        authToken: 'ZmM5ODE3ZjUzMzMxMjdkYmRjOTgxOTVmNzYyZDNm'
      });

      var params = {
        'src': '919739902121',
        'dst': toNumber,
        'text': body
      };

      p.send_message(params, function(status, response) {
        console.log('Status is ', status);
        console.log('API response: \n', response);
        console.log('Message UUID:\n', response['message_uuid']);
        console.log('API Id:\n', response['api_id']);
      });
    },
    // mgetClient: function(client_id) {
    //   var client = Clients.findOne({
    //     "_id": client_id
    //   });
    //   return client;
    // },

    createUserOnboardBP: function(bp, operationType) {
      current_bp = BusinessPartners.find({
        _id: bp
      }).fetch();

      calling_user_bp = Meteor.users.find({
        _id: this.userId
      }).fetch();

      calling_bp = BusinessPartners.find({
        _id: calling_user_bp[0].profile.BusinessPartnerId
      }).fetch();


      var current_emails = current_bp[0].emails;
      current_emails.map(function(current_email)
      {
          checkUserId = Meteor.users.find({
            username: current_email
          }).fetch();

          console.log('BP is ', bp, current_email);

          if (!checkUserId || checkUserId == '') {
            currentUserId = Accounts.createUser({
              username: current_email,
              email: current_email,
              password: "initial12",
              profile: {
                BusinessPartnerId: bp
              }
            });

            //Setup the account email template
            var calling_bp_name = calling_bp[0].name;
            var calling_bp_username = calling_user_bp[0].username;
            var current_bp_name = current_bp[0].name;

            Accounts.emailTemplates.siteName = "Feliz";
            var emailFrom = calling_bp[0].name + ' <' + calling_user_bp[0].username + '>';
            Accounts.emailTemplates.from = emailFrom;

            var subject = "Welcome to " + calling_bp_name + ', ' + current_bp_name;
            Accounts.emailTemplates.enrollAccount.subject = function(current_bp) {
              return subject;
            };

            //Set the operation here so that we can word the email accrodingly.
            var operation = '';
            if (operationType == 'Customer') {
              operation = 'Customer';
            } else if (operationType == 'Vendor') {
              operation = 'Supplier';
            } else {
              operation = 'New Business';
            }

            var body = calling_bp_name + " has invited you as a " + operation + ", to view your Documents, Appointments and other Business Transactions." + " Activate your account by Simply clicking the link below.\n\n"
            Accounts.emailTemplates.enrollAccount.text = function(calling_bp_name, url) {
              return body + url;
            };

            try {
              Accounts.urls.enrollAccount = function(token) {
                var url = ROOT_URL + '#/enroll-account/' + token;
                console.log(url);
                return url;
              };


              Accounts.sendEnrollmentEmail(currentUserId, current_email);
            } catch (e) {
              console.log('Could not send enrollment Email ', e);
            }
          } else {
            console.log('Could not create user after creating BP');
            return false;
          }
          return true;
        });
      }
  });

  Meteor.publish("getUser", function(userId) {
    return Meteor.users.find({
      _id: userId
    });
  });

}
