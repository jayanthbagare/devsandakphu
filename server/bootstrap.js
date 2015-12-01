Meteor.startup(function(){
  if(Meteor.users.find().count() === 0 )
  {
    // result = BusinessPartners.insert({
    //   name:'Fazo21',
    //   keyPersonName:'Praveen',
    //   email:['praveen@fazo21.com'],
    //   updatedBy: function(){ return this.userId},
    //   updatedAt: function(){ return new Date()}
    // });

    Accounts.createUser({
      username: "fazo21",
      mail: "praveen@fazo21.com",
      password: "initial12",
      profile:{
        BusinessPartnerId:'fcFHQHXSwQkaRyg9J'
      }
    });



  }

  //Setup the environment variable for Email.
  process.env.MAIL_URL="smtp://info@fazo21.com:happyinf@secure.emailsrvr.com:465";
  //Seed the indexes into MongoDB
  //Events.createIndex({name:'text',type:'text'});
});
