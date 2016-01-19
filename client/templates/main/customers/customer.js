//Generic variable definition for Pagination handler
handlePagination = '';
AutoForm.addHooks(['add_customer_form'], {
  onSuccess: function(operation, result, template) {
    //See if the customer is already onboarded

    var vresult = new ReactiveVar();
    vresult = result;
    //Call to onboard the customer and send an email to be invited.
    try {
      Meteor.call('createUserOnboardBP', vresult, 'Customer');
    } catch (e) {
      FlashMessages.sendError('Could not create a user for the onboarded Business Partner ', e);
    }

    //Get Self Business Partner ID.
    Meteor.subscribe("getUser", Meteor.userId());
    currentUser = Meteor.users.find({
      _id: Meteor.userId()
    }).fetch();

    //Insert the relation between current business and customer.
    try {
      BusinessPartnerRelations.insert({
        bp_subject: [currentUser[0].profile.BusinessPartnerId],
        relation: 'sells_to',
        bp_predicate: [vresult]
      });
    } catch (e) {
      console.log(e);
      throw new Meteor.Error(500, 'Could not state the relation 1', e);
    }

    //Also insert the reverse
    try {
      BusinessPartnerRelations.insert({
        bp_subject: [vresult],
        relation: 'buys_from',
        bp_predicate: [currentUser[0].profile.BusinessPartnerId]
      });
    } catch (e) {
      throw new Meteor.Error(500, 'Could not state the relation 2', e);
    }

    //If all is well Flash a Success message.
    FlashMessages.sendSuccess('Customer Onboarded Successfully');
    Router.go('/main/customers');
  },
  onError: function(operation, result, template) {

    FlashMessages.sendError('Could not save Relations' + result);
  }
});

AutoForm.addHooks(['edit_customer_form'], {
  onSuccess: function(operation, result, template){
    console.log(operation,result,template,event);
    FlashMessages.sendSuccess('Customer details changed successfully');
    Router.go('/main/customers');
  },
  onError:function(operation, result, template){
    FlashMessages.sendError('Could not save customer, please check the error ', result);
  }
});

Template.list_customers.rendered = function() {
  Session.setTemp('searchTerm', '');
  Tracker.autorun(function() {
    Template.list_customers.__helpers[" getMyCustomers"]();
  });
};



customersUI = new Tracker.Dependency;
Template.list_customers.helpers({
  getMyCustomers: function(searchTerm) {
    //Get all the BP's which the logged in BP sells to
    currentUserBPId = Session.get("loggedInBPId");
    if (!searchTerm){
      var currentPage = parseInt(Router.current().params.page) || 1;
      var skipCount = (currentPage) * 25; //

      handlePagination = Meteor.subscribe("getCustomers", currentUserBPId, searchTerm, skipCount, 25);

      customers = [];
      Tracker.autorun(function() {
        customers = BusinessPartners.find({}, {
          sort: {
            name: 1
          }
        }).fetch();
        Session.setAuth('getMyCustomers', customers);
      });

      //return customers;
      return Session.get('getMyCustomers');
    }
    else //Search Term if check
    {
      Tracker.autorun(function() {
        if (Session.get("searchTerm")) {
          var currentPage = parseInt(Router.current().params.page) || 1;
          var skipCount = (currentPage) * 25; //

          handlePagination = Meteor.subscribe("getCustomers", currentUserBPId, searchTerm, skipCount, 25);

          customers = BusinessPartners.find({
            score: {
              "$exists": true
            }
          }).fetch();
        }
        Session.setAuth('getMyCustomers', customers);
      }); //Tracker closing
    } //else closing
  },
  getCustomerCount: function() {
    var pageCount = BusinessPartners.find().count();
    var currentPage = parseInt(Router.current().params.page) || 1;
    if(currentPage > 1)
    {
        var skipCount = (currentPage - 1) * 25
        var loadedCount = skipCount + pageCount
    }else {
        var loadedCount = pageCount;
    }
    return loadedCount;
  },

  getCustomerTotalCount: function() {
    //Call the Server method to get Customer Count rather than calling subscribe
    if(Session.get("searchTerm") == ""){
      currentbpId = Session.get("loggedInBPId");
      Meteor.call("getCustomerTotalCount", currentbpId, function(error, result) {
        Session.setTemp('customerTotalCount', result);
      });
      return Session.get('customerTotalCount');
    }
    else{
      Session.setTemp('customerTotalCount',Session.get('getMyCustomers').length);
      return Session.get('customerTotalCount');
    }
  },
  loadedState: function(){
    Tracker.autorun(function(){
      if(Session.get('loadedCount') == Session.get('customerTotalCount'))
      {
        return false;
      }
      else{
        return true;
      }
    });
  }
});

Template.list_customers.events({
  // 'click #add_customer': function(event){
  //   event.preventDefault();
  //   Router.go('add_customer');
  // },
  'click add_event': function(event) {
    customerId = new ReactiveVar('');
    customerId.set(this._id);
  },
  'click #attach_doc': function(event) {
    var current_customer = this._id;

    Meteor.subscribe("getOneBP", Session.get("loggedInBPId"));
    owner_bp = BusinessPartners.find({
      _id: Session.get("loggedInBPId")
    }).fetch();

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

          if (value.url) {
            try {
              resultDocId = Documents.insert({
                docOwner: owner_bp,
                docUploader: owner_bp,
                docURL: value.url,
                docMimeType: value.mimetype
              });
            } catch (e) {
              FlashMessages.sendError('Could not upload the document ', e);
            }

            try {
              //Insert the is_owner relationship
              DocumentsRelations.insert({
                docId: [resultDocId],
                relation: 'is_owner',
                businesspartner: [owner_bp]
              });

              //Insert the can_share relationship to the customer
              DocumentsRelations.insert({
                docId: [resultDocId],
                relation: 'can_share',
                businesspartner: [current_customer]
              });

              //Insert the can_edit relationship to the customer
              DocumentsRelations.insert({
                docId: [resultDocId],
                relation: 'can_edit',
                businesspartner: [current_customer]
              });

              //Insert the can_view relationship to the customer
              DocumentsRelations.insert({
                docId: [resultDocId],
                relation: 'can_view',
                businesspartner: [current_customer]
              });

            } catch (e) {
              FlashMessages.sendError('Relations are missing ', e);
            }

          }
        });
      });
  },
  'click #view_timeline': function(event) {
    //Set the client session id to be retrieved in timeline.
    Session.setAuth('customerId', this._id);
  },
  //Handle the SMS and messaging feature.
  'click #sms_message': function(event) {
    //Call the Modal for SMS here.
    $('#smsModal').modal("show");
    Session.setAuth('customerId', this._id);
  },
  'click #btnNext': function(event) {
    event.preventDefault();
    var currentPage = parseInt(Router.current().params.page) || 1;
    currentPage = currentPage + 1;
    Router.go('/main/customers/' + currentPage);
  },
  'click #btnPrevious': function(event) {
    event.preventDefault();
    var currentPage = parseInt(Router.current().params.page) || 1;
    currentPage = currentPage - 1;
    Router.go('/main/customers/' + currentPage);
  },
  'click #btnSearch': function(event) {
    event.preventDefault();
    searchTerm = $('#customerSearch').val();
    Session.setTemp('searchTerm', searchTerm);
    Tracker.autorun(function() {
      Template.list_customers.__helpers[" getMyCustomers"](searchTerm);
    });
  }
});

Template.timeline.events({
  'click .timeline-panel': function(event) {
    var imageURL = this.imageURL;
    Session.setAuth("imageModal", imageURL);
    Session.setAuth("mimeType", this.mimeType);
    $("#imageModal").modal("show");
  }
});

Template.smsModal.onRendered(function() {
  var charMax = 160;
  $('#chars_left').html(charMax + ' characters remaining.');
});

Template.smsModal.events({
  'keyup #smsText': function(event) {

    var text_length = $('#smsText').val().length;
    var text_remaining = 160 - text_length;

    $('#chars_left').html(text_remaining + ' characters remaining.');
  },

  'click #sendMessage': function(event) {
    //Get the number of the customer
    Meteor.subscribe("getOneBP", Session.get('customerId'));
    customer = BusinessPartners.findOne({
      _id: Session.get('customerId')
    });
    smstext = $('#smsText').val();

    try {
      if (!customer.phones[0]) {

        FlashMessages.sendError('Please maintain a Phone number to send SMS');
      }
    } catch (error) {
      FlashMessages.sendError('Please maintain a Phone number to send SMS');
    }
    Meteor.call('sendSMS', customer.phones[0], smstext, function(result, error) {
      if (error) {
        throw new Meteor.Error('Could not send SMS, please try in some time again');
      }
    });
    $('#smsModal').modal("hide");

  }
});


//Customer Edit screen helpers
Template.edit_customer.helpers({
  selectedCustomer: function() {
    Meteor.subscribe("getOneBP", this._id);
    return BusinessPartners.findOne({
      "_id": this._id
    });
  }
});
