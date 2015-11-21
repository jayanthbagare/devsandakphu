if (Meteor.isServer) {
  //Call the publish methods here.

  Meteor.publish("getOneBP",function(bp){
    return BusinessPartners.findOne({_id:bp});
  });

  Meteor.publish("getCustomerRelations",function(bp){
    return BusinessPartnerRelations.find({
      bp_subject:bp,
      relation:'sells_to'
    });
  });

  Meteor.publish("getBusinessPartners",function(customerIds){
    return BusinessPartners.find({
      _id:{$in:customerIds}
    })
  });

}
