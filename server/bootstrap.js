Meteor.startup(function(){
  if(Meteor.users.find().count() === 0 )
  {
    Accounts.createUser({
      username: "rashmi",
      mail: "admin@admin.com",
      password: "initial1",
      profile:{
        BusinessPartnerId:''
      }
    });
  }

  //Setup the environment variable for Email.
  process.env.MAIL_URL="smtp://info@fazo21.com:happyinf@secure.emailsrvr.com:465";
  //Seed the indexes into MongoDB
  //Events.createIndex({name:'text',type:'text'});
});
