AutoForm.addHooks(['onboard_bp'], {
  onSuccess: function(operation, result, template) {
    console.log(result);
    checkUser = Meteor.call('createUserOnboardBP',result);
    if(checkUser)
    {
      FlashMessages.sendSuccess('Business Onboarded Successfully');
      Router.go('/admin/');
    }
    else {
      FlashMessages.sendError('Could not create a user for the onboarded Business Partner');
      Router.go('/admin/');
    }
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
