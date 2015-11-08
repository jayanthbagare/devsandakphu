//AddressSchema Definition
AddressSchema = new SimpleSchema({
  type:{
    type:String,
    allowedValues:['Billing','Shipping'],
    label:"Address Type"
  },
  line1:{
    type:String,
    max:100,
    label:'Address Line 1'
  },
  line2:{
    type:String,
    max:100,
    label:'Address Line 2'
  },
  city:{
    type:String,
    max:50
  },
  state:{
    type:String,
    max:50
  },
  pincode:{
    type:String,
    max:6
  }
});
//BusinessPartner Definition
BusinessPartners = new Mongo.Collection('business_partners');
BusinessPartners.attachSchema(new SimpleSchema({
  name:{
    type:String,
    max:100,
    optional:false
  },
  isSearchable:{
    type:Boolean,
    label: 'Do you want to be searched?',
    optional:true
  },
  address:{
    type:[AddressSchema],
    optional:true
  },
  phones:{
    type:[String],
    optional:true
  },
  emails:{
    type:[String],
    regEx:SimpleSchema.RegEx.Email,
    optional:true
  },
  website:{
    type:String,
    regEx:SimpleSchema.RegEx.Url,
    optional:true
  },
  isSelf:{
    type:Boolean,
    optional:true
  },
  vatid:{
    type:String,
    optional:true
  },
  taxid:{
    type:String,
    optional:true
  },
  //Associated Child are those Business Partners who are children to the given Business Partner
  //eg.. Employee, child-parent relation etc..
  associatedChildren:{
    type:[String],
    optional:true
  },
  //Associated Peers are those Business Partners with whom one BP can interact with
  //say a vendor, customer, reseller, friend etc..
  associatedPeers:{
    type:[String],
    optional:true
  },
  updatedBy: {
    type: String,
    autoValue: function(){ return Meteor.userId() }
  },
  updatedAt: {
    type: Date,
    autoValue: function(){ return new Date() }
  }
},{transform:true}));

//Client Definition
Clients = new Mongo.Collection('clients');
Clients.attachSchema(new SimpleSchema({

  name: {
    type: String,
    max: 100,
    optional:false,
    index:1
  },
  email:{
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional:true,
    unique: true
  },
  phone: {
    type:String,
    max: 100,
    optional:false,
    unique:true,
    index:1
  },
  userId: {
    type: String,
    autoValue: function(){ return Meteor.userId() }
  },
  updatedAt: {
    type: Date,
    autoValue: function(){ return new Date() }
  }

},{transform:true}));

//Events Collection
Events = new Mongo.Collection('events');
Events.attachSchema(new SimpleSchema({
  name: {
    type: String,
    max: 100
  },
  eventDate: {
    type:Date,
    max: 500
  },
  description: {
    type: String,
    max: 500,
    optional : true
  },
  client : {
    type: String,
    max: 100
  },
  type: {
    type: String,
    max : 100,
    optional: true
  },
  userId: {
    type: String,
    autoValue: function(){ return Meteor.userId() }
  },
  updatedAt: {
    type: Date,
    autoValue: function(){ return new Date() }
  }
}));

//Image Attachment for Clients.
ClientImages = new Mongo.Collection('cimages');
ClientImages.attachSchema(new SimpleSchema({
  client:{
    type:String
  },
  imageURL:{
    type:String
  },
  mimeType:{
    type:String
  },
  userId: {
    type: String,
    autoValue: function(){ return Meteor.userId() }
  },
  updatedAt: {
    type: Date,
    autoValue: function(){ return new Date() }
  }
}));
