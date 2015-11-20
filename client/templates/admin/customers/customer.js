AutoForm.addHooks(['add_customer_form'], {
  onSuccess: function(operation, result, template) {
    //See if the customer is already onboarded
    current_bp = BusinessPartners.findOne({
      "_id": result
    });
    checkUserId = Meteor.users.find({username:current_bp.emails[0]}).fetch();
    console.log('User is ',checkUserId);
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
    //Get the current user and its BP Id
    currentUser = Meteor.users.findOne({
      _id: Meteor.userId()
    });
    currentUserBPId = currentUser.profile.BusinessPartnerId;

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

    return customers;
  }
});


Template.edit_customer.helpers({
  selectedCustomer: function(){
    return BusinessPartners.findOne({"_id":this._id});
  }
});
