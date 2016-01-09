if(Meteor.isServer) {

  //Get one Campaign
  Meteor.publish('getOneCampaign', function(campaignId) {
    campaign = Campaigns.find({
      _id: campaignId
    });
    return campaign;
    this.ready();
  });

  //Get My Campaigns
  Meteor.publish('getMyCampaigns', function(currentUserBPId, searchTerm, skipCount, limit) {
    if (!searchTerm) {
      var current_bp = currentUserBPId;
      relations = BusinessPartnerCampaignRelations.find({
        bp_subject: current_bp,
        relation: 'owns'
      }, {
        limit: limit,
        skip: skipCount
      });

      campaignIds = relations.map(function(c) {
        return c.campaign[0]
      });

      return Campaigns.find({
        _id: {
          $in: campaignIds
        }
      }, {
        limit: limit
      });
      this.ready();
    } else {
      var current_bp = currentUserBPId;
      relations = BusinessPartnerCampaignRelations.find({
        bp_subject: current_bp,
        relation: 'owns'
      });

      campaignIds = relations.map(function(c) {
        return c.campaign[0]
      });

      campaigns = Campaigns.find({
        _id: {
          $in: campaignIds
        },
        $text: {
          $search: searchTerm
        }
      }, {
        fields: {
          score: {
            $meta: "textScore"
          }
        },
        sort: {
          score: {
            $meta: "textScore"
          }
        }
      }, {
        limit: limit,
        skip: skipCount
      });
      return campaigns;
      this.ready();
    }
  });

}
