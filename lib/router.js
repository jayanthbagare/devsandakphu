Router.configure({
  layoutTemplate:"layout"
});

Router.map(function(){
  this.route('home',{
    path:"/",
    template:"home"
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
    path:'/admin',
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
    path:'/admin/bp',
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
    path:'/admin/bp/add',
    template:'add_bp'
  });

  //Edit Business Partner
  this.route('edit_bp',{
    path:'/admin/bp/:_id/edit',
    template:'edit_bp',
    data: function(){
      return BusinessPartners.findOne(this.params._id);
    }
  });

  //Profile of self Business.
  this.route('profile_bp',{
    path:'admin/bp/profile',
    template:'profile_bp'
  });

  //BusinessPartner Routes Ends here
  //List Clients
  this.route('list_clients',{
    path:'/admin/clients',
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
    path:'/admin/clients/add',
    template:'add_client'
  });

  //Edit a Client
  this.route('edit_client',{
    path:'/admin/clients/:_id/edit',
    template:'edit_client',
    data: function(){
      return Clients.findOne(this.params._id);
    }
  });

  //Timeline for a Client
  this.route('timeline',{
    path:'admin/clients/timeline',
    template: 'timeline'
  });

  //Customers Routes beings here
  this.route('list_customers',{
    path:'/admin/customers',
    template:'list_customers'
  });

  this.route('add_customer',{
    path:'/admin/customers/add',
    template:'add_customer'
  });

  this.route('edit_customer',{
    path:'/admin/customers/:_id/edit',
    template:'edit_customer',
    data: function(){
      return BusinessPartners.findOne(this.params._id);
    }
  });

  //Customers Routes ends here


  //Events Routes begin here.
  this.route('list_events',{
    path:'/admin/events',
    template:'list_events'
  });
  this.route('addEvent',{
    path:'/admin/events/add',
    template:'addEvent'
  });
  this.route('editEvent',{
    path:'/admin/events/:_id/edit',
    template:'editEvent',
    data: function(){
      return Events.findOne(this.params._id);
    }
  });

  //Product Routes
  this.route('list_products',{
    path:'/admin/products',
    template:'list_products'
  });

  this.route('add_product',{
    path:'admin/products/add',
    template:'add_product'
  });

  this.route('edit_product',{
    path:'/admin/products/:_id/edit',
    template:'edit_product',
    data: function(){
      return Products.findOne(this.params._id);
    }
  });
});//Router Map ends here
