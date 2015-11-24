AutoForm.addHooks(['add_customer_form'], {
  onSuccess: function(operation, result, template) {

    //Get Self Business Partner ID.
    Meteor.subscribe("getUser",Meteor.userId());
    currentUser = Meteor.users.find({
      _id: Meteor.userId()
    });
    //Insert the relation between current business and customer.
    try {
      console.log('Before insert 1');
      BusinessPartnerRelations.insert({
        bp_subject: [currentUser.profile.BusinessPartnerId],
        relation: 'sells_to',
        bp_predicate: [result]
      });
    } catch (e) {
      throw new Meteor.Error(500, 'Could not state the relation 1', e);
    }

    //Also insert the reverse
    try {
      console.log('Before insert 2');
      BusinessPartnerRelations.insert({
        bp_subject: [result],
        relation: 'buys_from',
        bp_predicate: [currentUser.profile.BusinessPartnerId]
      });
    } catch (e) {
      throw new Meteor.Error(500, 'Could not state the relation 2', e);
    }

    //See if the customer is already onboarded
    try {
      Meteor.subscribe("getOneBP", result);
      current_bp = BusinessPartners.find({
        _id: result
      }).fetch();

      var userEmail = current_bp.emails[0];
      var checkUserId = Meteor.users.find({
        username: userEmail
      }).fetch();
      //If not invite the customer to Feliz
      if (!checkUserId || checkUserId.length <= 0) {

        Meteor.call('createUserOnboardBP', current_bp, function(error, result) {
          if (error) {
            console.log('Could not create user after creating Customer');
            return false;
          }
        });
      }
    } catch (e) {
      throw new Meteor.Error(500, 'Could not find Customer', e);
    }


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
    // //Get the current user and its BP Id
    currentUser = Meteor.users.findOne({
      _id: Meteor.userId()
    });

    currentUserBPId = currentUser.profile.BusinessPartnerId;
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
