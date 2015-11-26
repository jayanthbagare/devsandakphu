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
    Router.go('/admin/customers');
  },
  onError: function(operation, result, template) {
    console.log(result);
    FlashMessages.sendError('Could not save Relations' + result);
  }
});

Template.list_customers.helpers({
  getMyCustomers: function() {
    // //Get the current user and its BP Id
    Meteor.subscribe("getUser", Meteor.userId());
    currentUser = Meteor.users.find({
      _id: Meteor.userId()
    }).fetch();

    currentUserBPId = currentUser[0].profile.BusinessPartnerId;
    //Get all the BP's which the logged in BP sells to

    Meteor.subscribe("getCustomerRelations", currentUserBPId);
    customer_cursor = BusinessPartnerRelations.find({
      "bp_subject": currentUserBPId,
      "relation": "sells_to"
    }).fetch();

    bp_predicates = customer_cursor.map(function(c) {
      return c.bp_predicate[0]
    });
    Meteor.subscribe("getCustomers", bp_predicates);
    customers = BusinessPartners.find({
      _id: {
        $in: bp_predicates
      }
    }).fetch();

    return customers;
  }
});

Template.list_customers.events({
  'click add_event': function(event) {
    customerId = new ReactiveVar('');
    customerId.set(this._id);
  }
});

Template.edit_customer.helpers({
  selectedCustomer: function() {
    return BusinessPartners.findOne({
      "_id": this._id
    });
  }
});
