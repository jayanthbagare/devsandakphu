if (Meteor.isServer) {
  //Call the publish methods here.

  Meteor.publish("getOneBP",function(bp){
    console.log(bp);
    bp = BusinessPartners.find({_id:bp});
    return bp;
    this.ready();
  });


  Meteor.publish("getCustomerRelations",function(bp){
    relations = BusinessPartnerRelations.find({
      bp_subject:bp,
      relation:'sells_to'
    });
    return relations;
    this.ready();
  });

  Meteor.publish("getCustomers",function(customerIds,limit){
    return BusinessPartners.find({
      _id:{$in:customerIds}
    },{limit:limit});
    this.ready();
  });

}
