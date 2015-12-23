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

  Meteor.publish("getProducts", function(products,searchTerm,limit) {
    if(!searchTerm){
      return Products.find({
        _id:{$in:products}
      },{limit:limit});
      this.ready();
    }
    else{
      products = Products.find({
        _id:{$in:products},
        $text:{$search:searchTerm}
      },
      {fields:{score:{$meta:"textScore"}},
       sort:{score:{$meta:"textScore"}}
      },
      {limit:limit});
      return products;
      this.ready();
    }
  });
}
