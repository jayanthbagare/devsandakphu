handlePagination = '';

//List Order Begin
Template.list_orders.rendered = function() {
  Session.setTemp('searchTerm', '');
  Tracker.autorun(function() {
    Template.list_orders.__helpers[" getMyOrders"]();
  });
};


ordersUI = new Tracker.Dependency;
Template.list_orders.helpers({
  getMyOrders: function(searchTerm) {
    currentUserBPId = Session.get("loggedInBPId");
    if (!searchTerm){
      var currentPage = parseInt(Router.current().params.page) || 1;
      var skipCount = (currentPage) * 25; //
      
      handlePagination = Meteor.subscribe("getOrders", currentUserBPId, searchTerm, skipCount, 25);

      orders = [];
      Tracker.autorun(function() {
        orders = OrderHeaders.find({}, {
          sort: {
            name: 1
          }
        }).fetch();
        Session.setAuth('getMyOrders', orders);
      });

      //return customers;
      return Session.get('getMyOrders');
    }
    else //Search Term if check
    {
      Tracker.autorun(function() {
        if (Session.get("searchTerm")) {
          
          var currentPage = parseInt(Router.current().params.page) || 1;
          var skipCount = (currentPage) * 25; //

          handlePagination = Meteor.subscribe("getOrders", currentUserBPId, searchTerm, skipCount, 25);

          orders = OrderHeaders.find({
            score: {
              "$exists": true
            }
          }).fetch();
        }
        Session.setAuth('getMyOrders', orders);
      }); //Tracker closing
    } //else closing
  },
  getOrdersCount: function() {
    if(Session.get("searchTerm") == ''){
      var currentPage = parseInt(Router.current().params.page) || 1;
      var skipCount = (currentPage) * 25;
      var dbCount = Session.get('getMyOrders').length;

      if(dbCount <= 25)
      {
      	Session.setTemp('loadedCount',dbCount);
      	return dbCount;
      }
      else
      {	
      	Session.setTemp('loadedCount',skipCount);
      	return skipCount;
  	  }
    }
    else {
      var skipCount = Session.get('getMyOrders').length;
      Session.setTemp('loadedCount',skipCount)
      return skipCount;
    }
  },

  getOrdersTotalCount: function() {
    //Call the Server method to get Customer Count rather than calling subscribe
    if(Session.get("searchTerm") == ""){
      currentbpId = Session.get("loggedInBPId");
      Meteor.call("getOrdersTotalCount", currentbpId, function(error, result) {
        Session.setTemp('ordersTotalCount', result);
      });
      return Session.get('ordersTotalCount');
    }
    else{
      Session.setTemp('ordersTotalCount',Session.get('getOrders').length);
      return Session.get('ordersTotalCount');
    }
  },

  getCustomer: function(bpId){
  	Meteor.subscribe("getOneBP",bpId);
    bp = BusinessPartners.find({_id: bpId},{name:1}).fetch();
    return bp[0].name;
  },

  loadedState: function(){
    Tracker.autorun(function(){
      if(Session.get('loadedCount') == Session.get('ordersTotalCount'))
      {
        return false;
      }
      else{
        return true;
      }
    });
  }
});

//Format the time to the locale here
Template.registerHelper("formatDate", function(givenDate) {
  //return moment(givenDate).format("DD.MM.YYYY-h:mm a");
  return moment(givenDate).format("DD-MM-YYYY");
});


//List Order End

// Create Order 

AutoForm.addHooks(['add_order_form'], {
  onSuccess: function(operation, result, template) {
    FlashMessages.sendSuccess('Order Created Successfully');
    Router.go('/main/orders');
  },
  onError: function(operation, result, template) {

    FlashMessages.sendError('Could not create the order' + result);
  }
});

Template.add_order.helpers({
// For Order Type
orderType: function () {
    return [
      {label: "Sales Order", value: "sales"},
      {label: "Purchase Order", value: "purchase"}
      //{label: "Delivery Order", value: "delivery"},
      //{label: "Sales Invoice", value: "salesInvoice"},
      //{label: "Purchase Invoice", value: "purchaseInvoice"},
      
    ];
  },

// For Order status
orderStatus: function () {
    return [
      {label: "Draft", value: "draft"},
      {label: "Confirmed", value: "confirmed"},
      {label: "Cancelled", value: "cancelled"},
      {label: "Completed", value: "completed"}
    ];
  },

});

// Create Order End


// Edit Order Begin
Template.edit_order.helpers({
// For Order Type
orderType: function () {
    return [
      {label: "Sales Order", value: "sales"},
      {label: "Purchase Order", value: "purchase"}
      //{label: "Delivery Order", value: "delivery"},
      //{label: "Sales Invoice", value: "salesInvoice"},
      //{label: "Purchase Invoice", value: "purchaseInvoice"},
      
    ];
  },

// For Order status
orderStatus: function () {
    return [
      {label: "Draft", value: "draft"},
      {label: "Confirmed", value: "confirmed"},
      {label: "Cancelled", value: "cancelled"},
      {label: "Completed", value: "completed"}
    ];
  },

  selectedOrder: function() {
  	console.log(this._id);

  	Meteor.subscribe("getOneOrder",this._id);
    return OrderHeaders.find({
      _id: this._id
    });
  }  

});

//Edit Order End
