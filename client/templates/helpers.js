Template.login.events({
  'submit .login-user':function(event){
    var username = event.target.username.value;
    var password = event.target.password.value;


    Meteor.loginWithPassword(username,password,function(err){
      if(err){
        event.target.username.value = username;
        event.target.password.value = password;
        FlashMessages.sendError(err.reason);
      }else{
        FlashMessages.sendSuccess('You are now logged in');
        //Set the session for currentUser Id
        Meteor.subscribe("getUser", Meteor.userId());
        currentUser = Meteor.users.find({
          _id: Meteor.userId()
        }).fetch();

        Session.set("loggedInUser",currentUser[0]._id);
        //Set the Session for current user BP Id
        Session.set("loggedInBPId",currentUser[0].profile.BusinessPartnerId);
        
        Router.go('/main');
      }
    });

    event.target.username.value = '';
    event.target.password.value = '';

    return false;
  }
});

Template.layout.events({
  'click .logout':function(event){
  Meteor.logout(function(err){
    if(err){
      FlashMessages.sendError(err.reason);
    }
    else {
      FlashMessages.sendSuccess('You are now logged out');
      Router.go('/main');
    }
  });
}
});
