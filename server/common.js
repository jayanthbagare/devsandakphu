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

    createMailingList:function(campaignId){
      this.unblock();
      var options = {
        apiKey: "key-8beb7265d9fbc24819529a3a661b0fb0",
        domain: "sandbox000117f9cb6740c3b179ba343156c7ab.mailgun.org"
      };
      var mg = new Mailgun(options);

      campaign = Campaigns.find({
        _id:campaignId
    },{title:1,description:1}).fetch();

      var name_stripped = campaign[0].title.replace(/\s+/g, '');
      var data = {
        address: name_stripped + '@' + options.domain,
        name: campaign[0].title,
        description: campaign[0].description,
        access_level: 'readonly'
      };

      mg.api.lists().create(data,function(error,response){
        if(error){
          return false
        }else{
          return true
        }
      });
    },
    addMembersMailgun:function(bp,campaignId){
      this.unblock();
      var options = {
        apiKey: "key-8beb7265d9fbc24819529a3a661b0fb0",
        domain: "sandbox000117f9cb6740c3b179ba343156c7ab.mailgun.org"
      };
      var mg = new Mailgun(options);

      campaign = Campaigns.find({
        _id:campaignId
    },{title:1,description:1}).fetch();

      var name_stripped = campaign[0].title.replace(/\s+/g, '');

      var listAddress = name_stripped + '@sandbox000117f9cb6740c3b179ba343156c7ab.mailgun.org';
      var list = mg.api.lists(listAddress);

      var tags = Campaigns.find({
          _id:campaignId
      },{runTag:1}).fetch();

      var current_bp = bp;
      relations = BusinessPartnerRelations.find({
        bp_subject: current_bp,
        relation: 'sells_to'
      });

      customerIds = relations.map(function(c) {
        return c.bp_predicate[0]
      });

      var bps = BusinessPartners.find({
        _id: {
          $in: customerIds
        },
        tags: {$in:tags[0].runTag}
      }).fetch();

      bp = bps.map(function(b) {
        try {
          var bp_mailgun = {
            subscribed: true,
            address: b.emails[0]
          };
          list.members().create(bp_mailgun, function(error, result) {
          });
        } catch (e) {}
      });
    },
    sendMailgun: function(bp,campaignId) {
      this.unblock();
      var options = {
        apiKey: "key-8beb7265d9fbc24819529a3a661b0fb0",
        domain: "sandbox000117f9cb6740c3b179ba343156c7ab.mailgun.org"
      };
      var mg = new Mailgun(options);
      var listAddress = 'do_not_touch@sandbox000117f9cb6740c3b179ba343156c7ab.mailgun.org';
      var list = mg.api.lists(listAddress);

      mg.send({
        from:'postmaster@sandbox000117f9cb6740c3b179ba343156c7ab.mailgun.org',
        to:listAddress,
        subject:"Invitation for IPTEX and Grindex 2016. 2 Mega Events 1 Venue",
        text:"A Cordial invitation to experience world class innovation in Gears and Grinding Technologies. One Venue, Two mega events, Three days of pulsating experience.",
        html:"<html><head><meta http-equiv=Content-Type content='text/html; charset=utf-8'><meta name=viewport content='width=device-width,initial-scale=1'><title>IPTEX-GRINDEX 2016</title><style type=text/css>a,div,li,p,td{-webkit-text-size-adjust:none}#outlook a{padding:0}html{width:100%}body{width:100%!important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;margin:0;padding:0}.ExternalClass{width:100%}.ExternalClass,.ExternalClass div,.ExternalClass font,.ExternalClass p,.ExternalClass span,.ExternalClass td{line-height:100%}#backgroundTable{margin:0;padding:0;width:100%!important;line-height:100%!important}img{outline:0;text-decoration:none;border:none;-ms-interpolation-mode:bicubic}a img{border:none}.image_fix{display:block}p{margin:0 0!important}table td{border-collapse:collapse}table{border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0}a{color:#33b9ff;text-decoration:none;text-decoration:none!important}table[class=full]{width:100%;clear:both}@media only screen and (max-width:640px){a[href^=tel],a[href^=sms]{text-decoration:none;color:#33b9ff;pointer-events:none;cursor:default}.mobile_link a[href^=tel],.mobile_link a[href^=sms]{text-decoration:default;color:#33b9ff!important;pointer-events:auto;cursor:default}table[class=devicewidth]{width:440px!important;text-align:center!important}table[class=devicewidthinner]{width:420px!important;text-align:center!important}img[class=banner]{width:440px!important;height:220px!important}img[class=col2img]{width:440px!important;height:220px!important}}@media only screen and (max-width:480px){a[href^=tel],a[href^=sms]{text-decoration:none;color:#33b9ff;pointer-events:none;cursor:default}.mobile_link a[href^=tel],.mobile_link a[href^=sms]{text-decoration:default;color:#33b9ff!important;pointer-events:auto;cursor:default}table[class=devicewidth]{width:280px!important;text-align:center!important}table[class=devicewidthinner]{width:260px!important;text-align:center!important}img[class=banner]{width:280px!important;height:140px!important}img[class=col2img]{width:280px!important;height:140px!important}}</style><body><table bgcolor=#fcfcfc border=0 cellpadding=0 cellspacing=0 width=100%><tbody><tr><td><div class=innerbg></div><table class=devicewidth align=center border=0 cellpadding=0 cellspacing=0 width=600><tbody><tr><td width=100%><table class=devicewidth align=center border=0 cellpadding=0 cellspacing=0 width=600><tbody><tr><td><table class=devicewidthinner align=left border=0 cellpadding=0 cellspacing=0 width=560><tbody><tr><td style=font-family:Helvetica,arial,sans-serif;font-size:18px;color:#282828;text-align:left;line-height:24px><p style=text-align:left>Dear Patron,</p><p><br></p><tr><td style=font-family:Helvetica,arial,sans-serif;font-size:14px;color:#889098;text-align:left;line-height:24px;width:100%><p>A cordial invitation to experience world class innovation in Gears and Grinding Technologies. One Venue. Two mega events. Three days of pulsating experience.</p></table></table></table></table><table bgcolor=#fcfcfc border=0 cellpadding=0 cellspacing=0 width=100%><tbody><tr><td><div class=innerbg></div><table class=devicewidth align=center border=0 cellpadding=0 cellspacing=0 width=600><tbody><tr><td width=100%><table class=devicewidth align=center border=0 cellpadding=0 cellspacing=0 width=600><tbody><tr><td align=center><div class=imgpop><div class=uploader_wrap style=width:600px;margin-top:40px;opacity:0><div class=upload_buttons><div class=img_link></div><div class=img_upload></div><div style=visibility:visible class=img_edit></div></div></div><a href=http://www.googledrive.com/host/0ByY3Vw9pL7BlZkxkTEg2cHA3QVU target=_blank><img alt='' style=display:block;border:none;outline:0;text-decoration:none src=http://www.googledrive.com/host/0ByY3Vw9pL7BlZkxkTEg2cHA3QVU class=banner border=0 width=600></a></div></table></table></table><table bgcolor=#fcfcfc border=0 cellpadding=0 cellspacing=0 width=100%><tbody><tr><td><div class=innerbg></div><table class=devicewidth align=center border=0 cellpadding=0 cellspacing=0 width=600><tbody><tr><td width=100%><table class=devicewidth align=center border=0 cellpadding=0 cellspacing=0 width=600><tbody><tr><td height=20 width=100%></table></table></table><table bgcolor=#fcfcfc border=0 cellpadding=0 cellspacing=0 width=100%><tbody><tr><td><div class=innerbg></div><table class=devicewidth align=center border=0 cellpadding=0 cellspacing=0 width=600><tbody><tr><td width=100%><table class=devicewidth align=center border=0 cellpadding=0 cellspacing=0 width=600><tbody><tr><td><table class=devicewidthinner align=left border=0 cellpadding=0 cellspacing=0 width=560><tbody><tr><td style=font-family:Helvetica,arial,sans-serif;font-size:18px;color:#282828;text-align:left;line-height:24px><p>Highlights</p><tr><td style=font-size:1px;line-height:1px;mso-line-height-rule:exactly height=15 width=100%><tr><td style=font-family:Helvetica,arial,sans-serif;font-size:14px;color:#889098;text-align:center;line-height:24px><li style=text-align:left>A Great Platform to network with the top brands from the Gears, Power Transmission &amp; &nbsp;&nbsp;&nbsp;&nbsp;Grinding Industry.</li><li style=text-align:left>Meet Manufacturers, Solution providers, Vendors and Industry Professionals under one &nbsp;&nbsp;&nbsp;&nbsp; roof.</li><li style=text-align:left>Source new products and Technologies.</li><li style=text-align:left>Excellent scope to explore business tie-ups and collaboration.</li><li style=text-align:left>Over 100+ Exhibitors representing 10 countries.</li><br><tr><td style=font-family:Helvetica,arial,sans-serif;font-size:18px;color:#282828;text-align:left;line-height:24px><p>Attend exclusive technical seminars on</p><tr><td style=font-size:1px;line-height:1px;mso-line-height-rule:exactly height=15 width=100%><tr><td style=font-family:Helvetica,arial,sans-serif;font-size:14px;color:#889098;text-align:left;line-height:24px><p>Modern Technology Trends for Gears | Heat Treatment | Grinding</p></table></table></table></table><table bgcolor=#fcfcfc border=0 cellpadding=0 cellspacing=0 width=100%><tbody><tr><td><div class=innerbg></div><table class=devicewidth align=center border=0 cellpadding=0 cellspacing=0 width=600><tbody><tr><td width=100%><table class=devicewidth align=left border=0 cellpadding=0 cellspacing=0 width=600><tbody><tr><td style=font-size:1px;line-height:1px;mso-line-height-rule:exactly height=20><tr><td><table class=devicewidthinner align=left border=0 cellpadding=0 cellspacing=0 width=560><tbody><tr><td style=font-family:Helvetica,arial,sans-serif;font-size:18px;color:#282828;text-align:left;line-height:24px><p>For Registration</p><tr><td style=font-size:1px;line-height:1px;mso-line-height-rule:exactly height=15 width=100%><tr><td style=font-family:Helvetica,arial,sans-serif;font-size:14px;color:#889098;text-align:left;line-height:24px><p>Give a missed call to visit the Expo on <strong><a href='tel:+918431 0444044'>+91 8431 044 4044</a></strong> or</p><p>Visit us at <a href=http://www.iptexpo.com/registration.html target=_blank><strong>http://www.iptexpo.com/registration.html</strong></a></p><tr><td style=font-size:1px;line-height:1px;mso-line-height-rule:exactly height=15 width=100%></table></table></table></table><table bgcolor=#fcfcfc border=0 cellpadding=0 cellspacing=0 width=100%><tbody><tr><td><div class=innerbg></div><table class=devicewidth align=center border=0 cellpadding=0 cellspacing=0 width=600><tbody><tr><td width=100%><table class=devicewidth align=left border=0 cellpadding=0 cellspacing=0 width=600><tbody><tr><td><table class=devicewidthinner align=left border=0 cellpadding=0 cellspacing=0 width=560><tbody><tr><td style=font-family:Helvetica,arial,sans-serif;font-size:18px;color:#282828;text-align:left;line-height:24px><p>Products on Display</p><tr><td style=font-size:1px;line-height:1px;mso-line-height-rule:exactly height=15 width=100%><tr><td style=font-family:Helvetica,arial,sans-serif;font-size:14px;color:#889098;text-align:left;line-height:24px><p>Gears &amp; Gear boxes | Gears &amp; Grinding Machines | Transmission Products | Processing Exquipments | Cutting &amp; Precison Tools | Metrology Products | Surface finishing | Abrasives | Coolants | Lubricants | Filters | Stone Processing and many more.</p></table></table></table></table><table bgcolor=#fcfcfc border=0 cellpadding=0 cellspacing=0 width=100%><tbody><tr><td><div class=innerbg></div><table class=devicewidth align=center border=0 cellpadding=0 cellspacing=0 width=600><tbody><tr><td width=100%><table class=devicewidth align=center border=0 cellpadding=0 cellspacing=0 width=600><tbody><tr><td align=center><div class=imgpop><div class=uploader_wrap style=width:600px;margin-top:40px;opacity:0><div class=upload_buttons><div class=img_link></div><div class=img_upload></div><div style=visibility:visible class=img_edit></div></div></div><a href=#><img alt='' style=display:block;border:none;outline:0;text-decoration:none src=https://stamplia.com/edit/30669_3j71hfvudg84csog884gc4o0gsg4wk8cwc4k88888g08oso0ks_57247/img/bdc026483b0c4413aca0f04b0174b9e5.jpg class=banner border=0 width=600></a></div></table></table></table><table bgcolor=#fcfcfc border=0 cellpadding=0 cellspacing=0 width=100%><tbody><tr><td><div class=innerbg></div><table class=devicewidth align=center bgcolor=#eacb3c border=0 cellpadding=0 cellspacing=0 width=600><tbody><tr><td width=100%><table class=devicewidth align=center border=0 cellpadding=0 cellspacing=0 width=600><tbody><tr><td style=font-size:1px;line-height:1px;mso-line-height-rule:exactly height=10><tr><td><table class=devicewidth align=center border=0 cellpadding=0 cellspacing=0 width=150><tbody><tr><td align=center height=43 width=43><div class=imgpop><div class=uploader_wrap style=width:43px;margin-top:1.5px;opacity:0><div class=upload_buttons><div class=img_link></div><div class=img_upload></div><div style=visibility:visible class=img_edit></div></div></div><a href='https://www.facebook.com/IptexGrindex?ref=hl' target=_blank><img src=https://stamplia.com/edit/30669_3j71hfvudg84csog884gc4o0gsg4wk8cwc4k88888g08oso0ks_57247/img/facebook.png alt='' style=display:block;border:none;outline:0;text-decoration:none border=0 height=43 width=43></a></div><td style=font-size:1px;line-height:1px align=left width=20><td align=center height=43 width=43><div class=imgpop><div class=uploader_wrap style=width:43px;margin-top:1.5px;opacity:0><div class=upload_buttons><div class=img_link></div><div class=img_upload></div><div style=visibility:visible class=img_edit></div></div></div><a href=https://twitter.com/virgoevents target=_blank><img src=https://stamplia.com/edit/30669_3j71hfvudg84csog884gc4o0gsg4wk8cwc4k88888g08oso0ks_57247/img/twitter.png alt='' style=display:block;border:none;outline:0;text-decoration:none border=0 height=43 width=43></a></div><td style=font-size:1px;line-height:1px align=left width=20><td align=center height=43 width=43><div class=imgpop><div class=uploader_wrap style=width:43px;margin-top:1.5px;opacity:0><div class=upload_buttons><div class=img_link></div><div class=img_upload></div><div style=visibility:visible class=img_edit></div></div></div><a href='https://www.linkedin.com/uas/login?session_redirect=https%3A%2F%2Fwww.linkedin.com%2Fgroups%2F4273766' target=_blank><img src=https://stamplia.com/edit/30669_3j71hfvudg84csog884gc4o0gsg4wk8cwc4k88888g08oso0ks_57247/img/linkedin.png alt='' style=display:block;border:none;outline:0;text-decoration:none border=0 height=43 width=43></a></div></table><tr><td style=font-size:1px;line-height:1px;mso-line-height-rule:exactly height=10></table></table></table><table bgcolor=#fcfcfc border=0 cellpadding=0 cellspacing=0 width=100%><tbody><tr><td><div class=innerbg></div><table class=devicewidth align=center border=0 cellpadding=0 cellspacing=0 width=600><tbody><tr><td height=20 width=100%><tr><td style=font-family:Helvetica,arial,sans-serif;font-size:13px;color:#282828 align=center valign=middle width=100%><p>Can't see this Email? <span style=text-decoration:none;color:#695442>Click Display Images in your mail client</span></p><tr><td><p><br></p><tr><td style=font-family:Helvetica,arial,sans-serif;font-size:13px;color:#282828 align=center valign=middle><p>Don't want to receive email Updates? <a href='mailto:info@virgo-comm.com?Subject=Unsubscribe me'><span style=text-decoration:none;color:#eacb3c>Unsubscribe here</span></a></p><tr><td style=font-family:Helvetica,arial,sans-serif;font-size:13px;color:#282828 align=left valign=middle><p style=text-align:left><br><br><span style=text-decoration:none;color:#eacb3c><a href=http://www.iptexpo.com target=_blank><span style=color:#00f>www.iptexpo.com</span></a></span></p><td style=font-family:Helvetica,arial,sans-serif;font-size:13px;color:#282828 align=left valign=middle><p style=text-align:right><br><br><span style=text-decoration:none;color:#eacb3c><a href=http://www.grindexpo.in target=_blank><span style=color:#00f>www.grindexpo.in</span></a></span></p><tr><td height=20 width=100%></table></table>"
      },function(error,body){
        FlashMessages.sendSuccess('Campaign executed Successfully');
      });
    },

    bulkUploadCustomers : function(bp,customerList){
      for(i=0;i<customerList.length;i++){
        var data = customerList[i];
        var name = data.Name,
            phone = data.Phone,
            address = data.Address,
            email = data.Email,
            tags = data.Tags;

        var currentBPId = bp;

        //Create the Business Partner
        var new_bpId = BusinessPartners.insert({
          name:name,
          address:address,
          phones:[phone],
          emails:[email],
          tags:[tags]
        });

        //Maintain the relations
        var relations = BusinessPartnerRelations.insert({
          bp_subject:[currentBPId],
          relation:'sells_to',
          bp_predicate:[new_bpId]
        });

        var reverse_relation = BusinessPartnerRelations.insert({
          bp_subject:[new_bpId],
          relation:'buys_from',
          bp_predicate:[currentBPId]
        });

        //Create the user now.
        Meteor.call('createUserOnboardBP',new_bpId,'Customer');
      }
    },
    getCampaignAnalysis: function(bp,campaignId){
      this.unblock();
      var options = {
        apiKey: "key-8beb7265d9fbc24819529a3a661b0fb0",
        domain: "sandbox000117f9cb6740c3b179ba343156c7ab.mailgun.org"
      };
      var domain = "sandbox000117f9cb6740c3b179ba343156c7ab.mailgun.org"
      var mg = new Mailgun(options);
      var listAddress = 'do_not_touch@sandbox000117f9cb6740c3b179ba343156c7ab.mailgun.org';
      var list = mg.api.lists(listAddress);
      var resultData = {};


      //Opened Data Starts
      var resource = '/' + domain + '/' + 'events';
      var data = {
        event:['opened'],
        pretty:true
      };

      mg.api.get(resource,data,function(error,result){
        if(error)
        {
          console.log(error);
        }
        else{
            return result;
        }

      });
    },
    sendCampaignEmail: function(bp,campaignId){
      //Used to send normal email based on campaign id tags.
    },
    sendEventSMS: function(){
      console.log('send the SMS');
    },
    //To run the sync jobs
    syncJob: function(){
      SyncedCron.add({
        name:'Send SMS every once in 2 hours through the day',
        schedule: function(parser){
            return parser.text('every 2 hours');
        },
        job: function(){
          Meteor.Call('sendEventSMS');
        }
      });
    }


  });

  Meteor.publish("getUser", function(userId) {
    return Meteor.users.find({
      _id: userId
    });
  });
}
