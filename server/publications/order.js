if (Meteor.isServer) {
  //Call the publish methods here.
Meteor.publish("getOrders", function(currentUserBPId, searchTerm, skipCount, limit) {
    
    if (!searchTerm) {
      var current_bp = currentUserBPId;
       orders = OrderHeaders.find({companyID:current_bp}, {
          limit: limit
        });

     return orders;
      this.ready();
    } else {
      var current_bp = currentUserBPId;
    
      orders = OrderHeaders.find({
        companyID:current_bp,
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
      return orders;
      this.ready();
    }
  });

 // Return Single Order
 Meteor.publish("getOneOrder", function(order) {
    order = OrderHeaders.find({
      _id: order
    });
    return order;
    this.ready();
  });

}
