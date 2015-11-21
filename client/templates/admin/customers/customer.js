AutoForm.addHooks(['add_customer_form'], {
  onSuccess: function(operation, result, template) {
    //See if the customer is already onboarded
    Meteor.subscribe("getCustomerRelations");
    Meteor.subscribe("getOneBP");
    Meteor.subscribe("getBusinessPartners");
    try{
      console.log(result);
      var current_bp = BusinessPartners.findOne({
        _id:result
      });
      console.log('Getting current BP ', current_bp);

      var userEmail = current_bp.emails[0];
      console.log('User Email is ', userEmail);

      var checkUserId = Meteor.users.find({username:userEmail}).fetch();
      //If not invite the customer to Feliz
      if (!checkUserId || checkUserId.length <= 0) {
        console.log('Make the user here');
        Meteor.call('createUserOnboardBP', current_bp, function(error, result) {
          if (error) {
            console.log('Could not create user after creating Customer');
            return false;
          }
        });
      }
    }
    catch(e){
      throw new Meteor.Error(500,'Could not find Customer',e);
    }

    //Get Self Business Partner ID.
    currentUser = Meteor.users.findOne({
      _id: Meteor.userId()
    });
    //Insert the relation between current business and customer.
    BusinessPartnerRelations.insert({
      bp_subject: [currentUser.profile.BusinessPartnerId],
      relation: 'sells_to',
      bp_predicate: [result]
    });

    //Also insert the reverse
    BusinessPartnerRelations.insert({
      bp_subject: [result],
      relation: 'buys_from',
      bp_predicate: [currentUser.profile.BusinessPartnerId]
    });
    //If all is well Flash a Success message.
    FlashMessages.sendSuccess('Customer Onboarded Successfully');
    Router.go('/admin/customers');
  },
  onError: function(operation, result, template) {
    FlashMessages.sendError('Could not save ' + result);
  }
});

Template.list_customers.helpers({
  getMyCustomers: function() {
    Meteor.subscribe("getCustomerRelations");
    Meteor.subscribe("getOneBP");
    Meteor.subscribe("getBusinessPartners");

    // //Get the current user and its BP Id
    currentUser = Meteor.users.findOne({
      _id: Meteor.userId()
    });
    currentUserBPId = currentUser.profile.BusinessPartnerId;

    console.log(currentUserBPId);
    //Get all the BP's which the logged in BP sells to

    customer_cursor = BusinessPartnerRelations.find({
      "bp_subject": currentUserBPId,
      "relation": "sells_to"
    }).fetch();


    customers = [];

    //Loop thru each BP and get BP details
    customer_cursor.forEach(function(doc) {
      //For each BP ID get the details of each BP
      var bp_predicate = doc.bp_predicate.toString();
      each_customer = BusinessPartners.find({
        _id: bp_predicate
      }).fetch();
      customers.push(each_customer);
    });
    console.log(customers);
    return customers;
  }
});

Template.list_customers.events({
  'click add_event': function(event){
    customerId = new ReactiveVar('');
    customerId.set(this._id);
  }
});

Template.edit_customer.helpers({
  selectedCustomer: function(){
    return BusinessPartners.findOne({"_id":this._id});
  }
});
