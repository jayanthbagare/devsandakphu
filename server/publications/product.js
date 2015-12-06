if (Meteor.isServer) {
  //Call the publish methods here.
  Meteor.publish("getOneProduct", function(product) {
    product = Products.find({
      _id: product
    });
    return product;
  });

  Meteor.publish("getProductRelations", function(bp) {
    relations = BusinessPartnerProductRelation.find({
      bp_subject: bp,
      relation: 'sells'
    });
    return relations;
  });

  Meteor.publish("getProducts", function(products,limit) {
    return Products.find({
      _id: {$in: products}
    },{limit:limit});
  });

}
