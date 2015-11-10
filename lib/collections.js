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
    label: 'Make me visible to all(Public)?',
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


//Discount Definition
DiscountSchema = new SimpleSchema({
  type:{
    type:String,
    allowedValues:['Percent','Flat'],
    label:"Discount Type"
  },
  value:{
    type:Number,
    min:0,
    label:'Discount Value'
  }
});
//Price Definition
PriceSchema = new SimpleSchema({
  description:{
    type:String,
    label: 'Price Code Description',
    optional:false
  },
  effectiveStartDate:{
    type:Date,
    label: 'Effective Start Date',
    optional:true
  },
  effectiveEndDate:{
    type:Date,
    label:'Effective End Date',
    optional:true
  },
  unitPrice:{
    type:Number,
    decimal:true,
    label:'Unit Price',
    optional:false
  },
  currency:{
    type:String,
    max:3,
    label:'Currency',
    allowedValues:['INR'],
    optional:false
  },
  discount:{
    type:DiscountSchema,
    optional:true
  }
});

//Warehouse Definition
WarehouseSchema = new SimpleSchema({
  warehose:{
    type:String,
    optional:false,
    label:'Warehouse Code',
    unique:true
  },
  location:{
    type:String,
    optional:true,
    label:'Location in the Warehouse'
  },
  currentQuantity:{
    type:Number,
    min:0,
    label:'Current Quantity',
    optional:false
  }
});

//Product Definition
Products = new Mongo.Collection('products');
Products.attachSchema(new SimpleSchema({
  name:{
    type:String,
    optional:false,
    label:'Product Name',
    unique:true
  },
  description:{
    type:String,
    optional:true,
    label:'Product Description'
  },
  minOrderQuantity:{
    type:Number,
    min:1,
    optional:false,
    label:'Minimum Order Quantity'
  },
  isStockable:{
    type:Boolean,
    optional:true,
    label:'Is this Product Stockable?'
  },
  isService:{
    type:Boolean,
    optional:true,
    label:'Is this product a service offering?'
  },
  isVirtual:{
    type:Boolean,
    optional:true,
    label:'Is this product a virtual one?'
  },
  isBuyable:{
    type:Boolean,
    optional:true,
    label:'Is this Product Buyable?'
  },
  isSellable:{
    type:Boolean,
    optional:true,
    label:'Is this Product Sellable?'
  },
  applyDiscount:{
    type:Boolean,
    optional:false,
    label:'Do you want to apply a discount?'
  },
  costPrice:{
    type:PriceSchema,
    optional:false,
    label:'Cost Price of the Product'
  },
  sellPrice:{
    type:PriceSchema,
    optional:false,
    label:'Sell Price of the Product'
  },
  warehousingDetails:{
    type:[WarehouseSchema],
    optional:false,
    label:'Warehousing Information'
  },
  updatedBy: {
    type: String,
    autoValue: function(){ return Meteor.userId() }
  },
  updatedAt: {
    type: Date,
    autoValue: function(){ return new Date() }
  }
})
);
