Meteor.startup(function(){
  if(Meteor.users.find().count() === 0 )
  {
    Accounts.createUser({
      username: "fazo21",
      mail: "praveen@fazo21.com",
      password: "initial12",
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
