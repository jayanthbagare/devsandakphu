Router.configure({
  layoutTemplate:"layout"
});

Router.map(function(){
  this.route('home',{
    path:"/",
    template:"home"
  });
  this.route('home1',{
    path:"/m1",
    template:"main"
  });
  this.route('projects',{
    path:'/projects',
    template:'work'
  });
  this.route('contact',{
    path:'/contact',
    template:'contact'
  });
  this.route('about',{
    path:'/about',
    template:'about'
  });

  this.route('login',{
    path:'/main',
    template:'login'
  });
  //BusinessPartner Routes Begins here
  //Onboard a Business
  this.route('onboard_bp',{
    path:'/onboard/business',
    template:'onboard_bp'
  });
//Route to onboard ends here.

  //List Business Partners
  this.route('list_bp',{
    path:'/main/bp',
    template:'list_bp',
    data:function(){
      templateData={
        bp: function(){
          return BusinessPartners.find();
        }
      }
    }
  });

  //Add Business Partner
  this.route('add_bp',{
    path:'/main/bp/add',
    template:'add_bp'
  });

  //Edit Business Partner
  this.route('edit_bp',{
    path:'/main/bp/:_id/edit',
    template:'edit_bp',
    data: function(){
      return BusinessPartners.findOne(this.params._id);
    }
  });

  //Profile of self Business.
  this.route('profile_bp',{
    path:'main/bp/profile',
    template:'profile_bp'
  });

  //BusinessPartner Routes Ends here
  //List Clients
  this.route('list_clients',{
    path:'/main/clients',
    template:'list_clients',
    data:function(){
      templateData={
        clients: function(){
          return Clients.find();
        }
      }
    }
  });
  //Add a Client
  this.route('add_client',{
    path:'/main/clients/add',
    template:'add_client'
  });

  //Edit a Client
  this.route('edit_client',{
    path:'/main/clients/:_id/edit',
    template:'edit_client',
    data: function(){
      return Clients.findOne(this.params._id);
    }
  });

  //Timeline for a Client
  this.route('timeline',{
    path:'main/clients/timeline',
    template: 'timeline'
  });

  //Customers Routes beings here
  this.route('add_customer',{
    path:'/main/customers/add',
    template:'add_customer'
  });

  this.route('edit_customer',{
    path:'/main/customers/:_id/edit',
    template:'edit_customer',
    data: function(){
      return BusinessPartners.findOne(this.params._id);
    }
  });

  this.route('list_customers',{
    path:'/main/customers/:page?',
    template:'list_customers'
  });

  //Customers Routes ends here


  //Events Routes begin here.
  this.route('list_events',{
    path:'/main/events',
    template:'list_events'
  });
  this.route('addEvent',{
    path:'/main/events/add',
    template:'addEvent'
  });
  this.route('editEvent',{
    path:'/main/events/:_id/edit',
    template:'editEvent',
    data: function(){
      return Events.findOne(this.params._id);
    }
  });

  //Product Routes
  this.route('list_products',{
    path:'/main/products',
    template:'list_products'
  });

  this.route('add_product',{
    path:'main/products/add',
    template:'add_product'
  });

  this.route('edit_product',{
    path:'/main/products/:_id/edit',
    template:'edit_product',
    data: function(){
      return Products.findOne(this.params._id);
    }
  });

  //Campaigns Routes Start here
  this.route('new_campaign',{
    path:'main/campaigns/add',
    template:'new_campaign'
  });

  this.route('edit_campaign',{
    path:'/main/campaigns/:_id/edit',
    template:'edit_campaign',
    data: function(){
      return Campaigns.findOne(this.params._id);
    }
  });

  this.route('list_campaigns',{
    path:'/main/campaigns/:pages?',
    template:'list_campaigns'
  });

  //Campaigns Routes Ends here

  // Orders Route Begin
  //List Orders 
  this.route('list_orders',{
    path:'/main/orders',
    template:'list_orders'
  });

  //Create Order
  this.route('add_order',{
    path:'main/orders/add',
    template:'add_order'
  });

  //Edit Order
  this.route('edit_order',{
    path:'main/orders/:_id/edit',
    template:'edit_order',
    data: function(){
      return OrderHeaders.findOne(this.params._id);
    }
  });

  // Orders Route End


});//Router Map ends here
