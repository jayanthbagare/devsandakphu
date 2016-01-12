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


Template.list_campaigns.rendered = function() {
  Session.setTemp('searchTerm', '');
  Tracker.autorun(function() {
    Template.list_campaigns.__helpers[" getMyCampaigns"]();
  });
};

Template.list_campaigns.helpers({
  getMyCampaigns: function(searchTerm) {
    //Get all the BP's which the logged in BP sells to
    currentUserBPId = Session.get("loggedInBPId");
    if (!searchTerm){
      var currentPage = parseInt(Router.current().params.page) || 1;
      var skipCount = (currentPage) * 25; //

      handlePagination = Meteor.subscribe("getMyCampaigns", currentUserBPId, searchTerm, skipCount, 25);

      campaigns = [];
      Tracker.autorun(function() {
        campaigns = Campaigns.find({}, {
          sort: {
            title: 1
          }
        }).fetch();
        Session.setAuth('getMyCampaigns', campaigns);
      });

      //return customers;
      return Session.get('getMyCampaigns');
    }
    else //Search Term if check
    {
      Tracker.autorun(function() {
        if (Session.get("searchTerm")) {

          var currentPage = parseInt(Router.current().params.page) || 1;
          var skipCount = (currentPage) * 25; //

          handlePagination = Meteor.subscribe("getMyCampaigns", currentUserBPId, searchTerm, skipCount, 25);

          campaigns = Campaigns.find({
            score: {
              "$exists": true
            }
          }).fetch();
        }
        Session.setAuth('getMyCampaigns', campaigns);
      }); //Tracker closing
    } //else closing
  },
  getCampaignCount: function() {
    if(Session.get("searchTerm") == ''){
      var currentPage = parseInt(Router.current().params.page) || 1;
      var skipCount = (currentPage) * 25;
      Session.setTemp('loadedCampaignCount',skipCount);
      return skipCount;
    }
    else {
      var skipCount = Session.get('getMyCampaigns').length
      Session.setTemp('loadedCampaignCount',skipCount)
      return skipCount;
    }
  },

  getCustomerTotalCount: function() {
    //Call the Server method to get Customer Count rather than calling subscribe
    if(Session.get("searchTerm") == ""){
      currentbpId = Session.get("loggedInBPId");
      Meteor.call("getCampaignTotalCount", currentbpId, function(error, result) {
        Session.setTemp('campaignTotalCount', result);
      });
      return Session.get('campaignTotalCount');
    }
    else{
      Session.setTemp('campaignTotalCount',Session.get('getMyCampaigns').length);
      return Session.get('campaignTotalCount');
    }
  },
  loadedCampaignState: function(){
    Tracker.autorun(function(){
      if(Session.get('loadedCampaignCount') == Session.get('campaignTotalCount'))
      {
        return false;
      }
      else{
        return true;
      }
    });
  }
});
