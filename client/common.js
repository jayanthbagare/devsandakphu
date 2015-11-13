
Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});

Template.home.onRendered(function(){
  $("#owl-carousel").owlCarousel({
    autoplay:3000,
    items:1,
    itemsDesktop: [1199, 1],
    itemsDesktopSmall: [979, 1],
    loop:true
  });
});

//Set the Autoform Template.
//AutoForm.setDefaultTemplate('materialize'); 

Meteor.startup(function(){
  loadFilePicker('AnPk1pu8QKe93T4BNlqlxz');
});
