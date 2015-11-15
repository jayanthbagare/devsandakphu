AutoForm.addHooks(['onboard_bp'], {
  onSubmit: function(insertDoc) {
    console.log('Coming into onboard');
    checkBPId = BusinessPartners.findOne({
      emails: insertDoc.emails[0]
    });

    if (!checkBPId) {
      console.log('No problems');
      this.done();
      return true;
    } else {
      console.log('Problems');
      this.done(new Error('Another business found with the same email id, cannot onboard the business'));
      return false;
    }

  },
  onSuccess: function(operation, result, template) {
    //Get the latest insert by id
    current_bp = BusinessPartners.findOne({
      "_id": result
    });
    console.log('Current BP is');
    console.log(current_bp);
    //Check if the user exists with the same email id
    checkUserId = Meteor.users.find(current_bp.emails[0]);
    if (!checkUserId) {
      Meteor.call('createUserOnboardBP', current_bp, function(error, result) {
        if (error) {
          console.log('Could not create user after creating BP');
          return false;
        }
      });
    }

    FlashMessages.sendSuccess('Business Onboarded Successfully');
    Router.go('/admin/');
  },
  onError: function(operation, result, template) {
    FlashMessages.sendError('Could not save ' + result);
  }
});


Template.list_bp.helpers({
  allBP: function() {
    return BusinessPartners.find();
  }
});

Template.edit_bp.helpers({
  selectedBP: function() {
    return BusinessPartners.findOne({
      "_id": this._id
    });
  }
});

Template.edit_bp.helpers({
  selfProfile: function() {
    return BusinessPartners.findOne({
      //"_id":this._id,
      "isSelf": true,
      "updatedBy": Meteor.userId()
    });
  }
});


Template.list_bp.events({
  'click #add_event': function(event) {
    Session.set('bpId', this._id);
  },
  'click #attach_doc': function(event) {
    var bp = this._id;
    filepicker.pickMultiple({
        mimetypes: ['image/*', 'text/*', 'video/*', 'application/pdf'],
        //extensions:['*.jpg','*.jpeg','*.png','*.mp4','*.pdf','*.docx','*.xlsx','*.pptx'],
        services: ['COMPUTER', 'WEBCAM', 'VIDEO', 'URL'],
        multiple: true
          /*,
                customCss:'app/client/stylesheets/filepicker.css'*/
      },
      function(InkBlob) {
        $.each(InkBlob, function(key, value) {
          console.log(InkBlob);
          if (value.url) {
            BPDocs.insert({
              client: client,
              imageURL: value.url,
              mimeType: value.mimetype
            });
          }
        });
      });
  },
  'click #view_timeline': function(event) {
    //Set the client session id to be retrieved in timeline.
    Session.set('bpId', this._id);
  }
});
