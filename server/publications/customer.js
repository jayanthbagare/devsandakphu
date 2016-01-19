if (Meteor.isServer) {
  //Call the publish methods here.

  Meteor.publish("getOneBP", function(bp) {
    bp = BusinessPartners.find({
      _id: bp
    });
    return bp;
    this.ready();
  });


  Meteor.publish("getCustomerRelations", function(bp) {
    relations = BusinessPartnerRelations.find({
      bp_subject: bp,
      relation: 'sells_to'
    });
    return relations;
    this.ready();
  });

  Meteor.publish("getCustomers", function(currentUserBPId, searchTerm, skipCount, limit) {
    if (!searchTerm) {

      var current_bp = currentUserBPId;
      //Get the count to determine to use limit and skip
      var relationCount = BusinessPartnerRelations.find({bp_subject: current_bp,relation: 'sells_to'}).count();
      if(relationCount < skipCount)
      {
        relations = BusinessPartnerRelations.find({
          bp_subject: current_bp,
          relation: 'sells_to'
        }
      );
      }
      else {
        relations = BusinessPartnerRelations.find({
          bp_subject: current_bp,
          relation: 'sells_to'
        }
        ,{
          limit: limit,
          skip: skipCount
        });
      }
      
      customerIds = relations.map(function(c) {
        return c.bp_predicate[0]
      });

      return BusinessPartners.find({
        _id: {
          $in: customerIds
        }
      }, {
        limit: limit
      });
      this.ready();
    } else {
      var current_bp = currentUserBPId;
      relations = BusinessPartnerRelations.find({
        bp_subject: current_bp,
        relation: 'sells_to'
      });

      customerIds = relations.map(function(c) {
        return c.bp_predicate[0]
      });

      customers = BusinessPartners.find({
        _id: {
          $in: customerIds
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
      return customers;
      this.ready();
    }
  });
}
