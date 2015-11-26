if (Meteor.isServer) {
  //Call the publish methods here.

  Meteor.publish("getOneBP",function(bp){
    console.log(bp);
    bp = BusinessPartners.find({_id:bp});
    return bp;
  });



  Meteor.publish("getCustomerRelations",function(bp){
    relations = BusinessPartnerRelations.find({
      bp_subject:bp,
      relation:'sells_to'
    });
    return relations;
  });

  Meteor.publish("getCustomers",function(customerIds){
    return BusinessPartners.find({
      _id:{$in:customerIds}
    });
  });

  Meteor.publish("getUser",function(userId){
    return Meteor.users.find({
      _id:userId
    });
  });

}
