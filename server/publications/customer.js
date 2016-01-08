if (Meteor.isServer) {
  //Call the publish methods here.

  Meteor.publish("getOneBP",function(bp){
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

  Meteor.publish("getCustomers",function(currentUserBPId,searchTerm,skipCount,limit){
    var current_bp = currentUserBPId;
    relations = BusinessPartnerRelations.find({
      bp_subject:current_bp,
      relation:'sells_to'
    },{limit:limit,skip:skipCount});

    customerIds = relations.map(function(c) {
      return c.bp_predicate[0]
    });


    if(!searchTerm){
      return BusinessPartners.find({
        _id:{$in:customerIds}
      },{limit:limit});
      this.ready();
    }
    else{
      customers = BusinessPartners.find({
        _id:{$in:customerIds},
        $text:{$search:searchTerm}
      },
      {fields:{score:{$meta:"textScore"}},
       sort:{score:{$meta:"textScore"}}
      },
      {limit:limit});
      return customers;
      this.ready();
    }
  });
}
