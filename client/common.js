Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});

//Set the Autoform Template.
//AutoForm.setDefaultTemplate('materialize');

Meteor.startup(function(){
  loadFilePicker('AnPk1pu8QKe93T4BNlqlxz');

  Meteor.subscribe("getUser", Meteor.userId());
  currentUser = Meteor.users.find({
    _id: Meteor.userId()
  }).fetch();

  if(currentUser[0].username != 'fazo21')
  {
      Router.go('/admin');
  }

});
