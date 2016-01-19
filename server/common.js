if (Meteor.isServer) {
  // ROOT_URL='http://54.179.147.163:3000';
  ROOT_URL = 'http://localhost:9999';

  Meteor.methods({
    sendSMS: function(toNumber, body) {
      //Plivo Setup here.
      var plivo = Meteor.npmRequire('plivo');
      //var plivo = new plivonpm({version:"0.3.3"});

      var p = plivo.RestAPI({
        authId: 'MAMDA4YWQ3MTU5ZWFLMW',
        authToken: 'ZmM5ODE3ZjUzMzMxMjdkYmRjOTgxOTVmNzYyZDNm'
      });

      //Get the Business Partners Phone number here to send as src.
      currentUser = Meteor.users.find({
        _id: Meteor.userId()
      }).fetch();


      currentUserBPId = currentUser[0].profile.BusinessPartnerId;

      current_bp = BusinessPartners.find({
        _id: currentUserBPId
      }).fetch();

      var params = {
        'src': current_bp[0].phones[0],
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
      current_emails.map(function(current_email) {
        checkUserId = Meteor.users.find({
          username: current_email
        }).fetch();


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

            /*Do not send email as this is for virgo publications*/
            //Accounts.sendEnrollmentEmail(currentUserId, current_email);
          } catch (e) {
            console.log('Could not send enrollment Email ', e);
          }
        } else {
          console.log('Could not create user after creating BP');
          return false;
        }
        return true;
      });
    },

    getCustomerTotalCount: function(bp) {
      var totalCount = BusinessPartnerRelations.find({
        bp_subject: bp,
        relation: 'sells_to'
      }).count();
      return totalCount;
    },
    getCampaignTotalCount: function(bp) {
      var totalCount = BusinessPartnerCampaignRelations.find({
        bp_subject: bp,
        relation: 'owns'
      }).count();
      return totalCount;
    },
    getProducTotalCount: function(bp) {
      return BusinessPartnerProductRelation.find({
        bp_subject: bp,
        relation: "sells"
      }).count();
    },

    getOrdersTotalCount: function(bp) {
      return OrderHeaders.find({
        companyID: bp
      }).count();
    },

    addMembersMailgun:function(bp,campaignId){
      this.unblock();
      var options = {
        apiKey: "key-397f965b04aec79a8cc8c9b687d00f4a",
        domain: "sandbox952804fadf53453286bcc30b1cffc16b.mailgun.org"
      };
      var mg = new Mailgun(options);
      var listAddress = 'info@sandbox952804fadf53453286bcc30b1cffc16b.mailgun.org';
      var list = mg.api.lists(listAddress);

      var tags = Campaigns.find({
          _id:campaignId
      },{runTag:1}).fetch();

      console.log('Tags ',tags[0].runTag);


      var current_bp = bp;
      relations = BusinessPartnerRelations.find({
        bp_subject: current_bp,
        relation: 'sells_to'
      });

      customerIds = relations.map(function(c) {
        return c.bp_predicate[0]
      });

      console.log(customerIds);
      var bps = BusinessPartners.find({
        _id: {
          $in: customerIds
        },
        tags: {$in:tags[0].runTag}
      }).fetch();

      console.log(bps);

      bp = bps.map(function(b) {
        try {
          var bp_mailgun = {
            subscribed: true,
            address: b.emails[0]
          };
          list.members().create(bp_mailgun, function(error, result) {
            console.log(result);
          });
        } catch (e) {}
      });
    },
    sendMailgun: function(bp,campaignId) {
      this.unblock();
      var options = {
        apiKey: "key-2b9223afb45b851fca181e48cda080f6",
        domain: "sandbox12d313bd337643f2b03328f85003a535.mailgun.org"
      };
      var mg = new Mailgun(options);
      var listAddress = 'communications@sandbox12d313bd337643f2b03328f85003a535.mailgun.org';
      var list = mg.api.lists(listAddress);

      mg.send({
        from:'postmaster@sandbox12d313bd337643f2b03328f85003a535.mailgun.org',
        to:listAddress,
        subject:"A Pulsating 2 Events IPTEX and Grindex 2016",
        text:"A Cordial invitation to experience world class innovation in Gears and Grinding Technologies. One Venue, Two mega events, Three days of pulsating experience.",
        html:"<html><head><meta name='viewport' content='width=device-width' /><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /><style type='text/css'>body {-webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em;}@media only screen and (max-width: 480px){.emailImage{height:auto !important;max-width:600px !important;width: 100% !important;}}</style><title>IPTEX GRINDEX EXPO 2016</title></head><body itemscope itemtype='http://schema.org/EmailMessage'><img style='display:block' src ='https://2777bef025b7fc1ddf008df44ef3f140a7215d13-www.googledrive.com/host/0B7HdYZc_RjyleEVpSllaMGVpbjQ' class='emailImage'/><form><input type='text' label='Your Name'/></form></body></html>"
      },function(error,body){
        FlashMessages.sendSuccess('Campaign executed Successfully');
        console.log(body);
      });
    },
    sendCampaignEmail: function(bp,campaignId){
      //Used to send normal email based on campaign id tags.

    }

  });

  Meteor.publish("getUser", function(userId) {
    return Meteor.users.find({
      _id: userId
    });
  });
}
