AutoForm.addHooks(['add_campaign_form'], {
  onSuccess: function(operation, result, template) {
    //See if the customer is already onboarded

    var vresult = new ReactiveVar();
    vresult = result;

    //Get Self Business Partner ID.
    Meteor.subscribe("getUser", Meteor.userId());
    currentUser = Meteor.users.find({
      _id: Meteor.userId()
    }).fetch();

    //Insert the relation between current business and customer.
    try {
      BusinessPartnerCampaignRelations.insert({
        bp_subject: [currentUser[0].profile.BusinessPartnerId],
        relation: 'owns',
        campaign: [vresult]
      });
    } catch (e) {
      console.log(e);
      throw new Meteor.Error(500, 'Could not state the relation 1', e);
    }

    //If all is well Flash a Success message.
    FlashMessages.sendSuccess('Campaign created successfully');
    Router.go('/main/campaigns');
  },
  onError: function(operation, result, template) {

    FlashMessages.sendError('Could not create your campaign' + result);
  }
});
