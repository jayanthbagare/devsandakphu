//AddressSchema Definition
AddressSchema = new SimpleSchema({
  line1:{
    type:String,
    max:100
  },
  line2:{
    type:String,
    max:100
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
  billingAddress:{
    type:AddressSchema
  },
  shippingAddress:{
    type:[AddressSchema]
  },
  type:{
    type:String,
    max:20,
    allowedValues:['Vendor','Customer','Self','Employee'],
    optional:false
  },
  phones:{
    type:[String]
  },
  emails:{
    type:[String],
    regEx:SimpleSchema.RegEx.Email
  },
  website:{
    type:String,
    regEx:SimpleSchema.RegEx.Url
  },
  isCustomer:{
    type:Boolean,
    optional:false
  },
  isVendor:{
    type:Boolean,
    optional:false
  },
  isSearchable:{
    type:Boolean,
    optional:false
  },
  associatedUsers:{
    type:[String] //Store the userid's which are allowed here.
  },
  isBusiness:{
    type:Boolean,
    optional:false
  },
  vatid:{
    type:String
  },
  taxid:{
    type:String
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
