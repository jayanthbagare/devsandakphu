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


  //Events Routes begin here.
  this.route('list_events',{
    path:'/admin/events',
    template:'list_events'
  });
  this.route('add_event',{
    path:'/admin/events/add',
    template:'add_event'
  });
  this.route('edit_event',{
    path:'/admin/events/:_id/edit',
    template:'edit_event',
    data: function(){
      return Events.findOne(this.params._id);
    }
  });
});
