productPagination = '';

AutoForm.addHooks(['add_product_form'], {
  onSuccess: function(operation, result, template) {
    var vresult = new ReactiveVar();
    vresult = result;

    console.log('Inserted Product is ', result);

    //Get Self Business Partner ID.
    Meteor.subscribe("getUser", Meteor.userId());
    currentUser = Meteor.users.find({
      _id: Meteor.userId()
    }).fetch();

    console.log('Coming into before relations');
    //Insert the relation between current business and product.
    try {
      console.log('Before Relations');
      BusinessPartnerProductRelation.insert({
        bp_subject: [currentUser[0].profile.BusinessPartnerId],
        relation: 'sells',
        product: [vresult]
      });
    } catch (e) {
      console.log(e);
      throw new Meteor.Error(500, 'Could not state the relation 1', e);
    }
    //If all is well Flash a Success message.
    FlashMessages.sendSuccess('Product Added Successfully');
    Router.go('/main/products');
  },
  onError: function(operation, result, template) {
    console.log(result);
    FlashMessages.sendError('Could not save Relations' + result);
  }
});

Template.list_products.rendered = function() {
  Session.set('productSearchTerm', '');
  Tracker.autorun(function() {
    Template.list_products.__helpers[" getMyProducts"]();
  });
};


productsUI = new Tracker.Dependency;
Template.list_products.helpers({
  getMyProducts: function(searchTerm) {
    customersUI.depend();
    // //Get the current user and its BP Id
    Meteor.subscribe("getUser", Meteor.userId());
    currentUser = Meteor.users.find({
      _id: Meteor.userId()
    }).fetch();

    currentUserBPId = currentUser[0].profile.BusinessPartnerId;
    //Get all the BP's which the logged in BP sells to

    Meteor.subscribe("getProductRelations", currentUserBPId);
    product_cursor = BusinessPartnerProductRelation.find({
      "bp_subject": currentUserBPId,
      "relation": "sells"
    }).fetch();

    r_products = product_cursor.map(function(p) {
      return p.product[0];
    });

    Deps.autorun(function() {
      productPagination = Meteor.subscribeWithPagination("getProducts",r_products,searchTerm,25);
    });

    if(Session.get("productSearchTerm")){
      products = Products.find({
        score:{
          "$exists":true
        }
      });
    }
    else {
      products = Products.find({
        _id: {
          $in: r_products
        }
      }, {
        sort: {
          name
        }
      });
    }

    return products;
  },

  allProductsLoaded: function() {
    if (Products.find().count() == productPagination.loaded()) {
      return false
    } else {
      return true;
    }
  },

  getStock: function(productId){
    Meteor.subscribe("getOneProduct",productId);
    product = Products.find({
                _id: productId
              }).fetch();
    if(product[0].isService)
    {
      return ' Product is a service';
    }
    else {
      if(product[0].isStockable)
      {
        return product.warehousingDetails[0].currentQuantity;
      }
      else{
        return 'No Stock';
      }
    }
  },
  getCostPrice: function(productId){
    Meteor.subscribe("getOneProduct",productId);
    product = Products.find({
      _id:productId
    }).fetch();

    if(product[0].isBuyable){
      return 'Buy Price: ' + product[0].costPrice.unitPrice + ' ' + product[0].costPrice.currency;
    }
  },
  getSellPrice: function(productId){
    Meteor.subscribe("getOneProduct",productId);
    product = Products.find({
      _id:productId
    }).fetch();

    // if(product[0].isSellable){
      return 'Sell Price: ' + product[0].sellPrice.unitPrice + ' ' + 'INR';
    // }
  }
});

Template.list_products.events({
  'click #btnSearch': function(event){
    event.preventDefault();
    searchTerm = $('#productSearch').val();
    Tracker.autorun(function() {
      Session.set('productSearchTerm', searchTerm);
      Template.list_products.__helpers[" getMyProducts"](searchTerm);
    });
  }
});

Template.edit_product.helpers({
  selectedProduct: function() {
    Meteor.subscribe("getOneProduct",this._id);
    return Products.findOne({
      "_id": this._id
    });
  }
});
