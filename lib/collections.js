//AddressSchema Definition
AddressSchema = new SimpleSchema({
  // type:{
  //   type:String,
  //   allowedValues:['Billing','Shipping'],
  //   label:"Address Type",
  //   optional:true
  // },
  // line1:{
  //   type:String,
  //   max:100,
  //   label:'Address Line 1',
  //   optional:true
  // },
  line2:{
    type:String,
    max:500,
    label:'Address',
    optional:true
  },
  city:{
    type:String,
    max:50,
    optional:true
  }
  // state:{
  //   type:String,
  //   max:50,
  //   optional:true
  // },
  // pincode:{
  //   type:String,
  //   max:6,
  //   optional:true
  // }
});
//BusinessPartner Definition
BusinessPartners = new Mongo.Collection('business_partners');
BusinessPartners.attachSchema(new SimpleSchema({
  name:{
    type:String,
    max:100,
    optional:false
  },
  // keyPersonName:{
  //   type:String,
  //   max:100,
  //   optional:false,
  //   label:'Key Contact Person Name'
  // },
  // isSearchable:{
  //   type:Boolean,
  //   label: 'Make me visible to all(Public)?',
  //   optional:true
  // },
  address:{
    type:[AddressSchema],
    optional:true
  },
  phones:{
    type:[Number],
    optional:true
  },
  emails:{
    type:[String],
    regEx:SimpleSchema.RegEx.Email,
    optional:true
  },
  // website:{
  //   type:String,
  //   regEx:SimpleSchema.RegEx.Url,
  //   optional:true
  // },
  // vatid:{
  //   type:String,
  //   optional:true
  // },
  // taxid:{
  //   type:String,
  //   optional:true
  // },
  updatedBy: {
    type: String,
    autoValue: function(){ return this.userId; }
  },
  updatedAt: {
    type: Date,
    autoValue: function(){ return new Date() }
  }
},{transform:true}));


//Document Definition
Documents = new Mongo.Collection('documents');
Documents.attachSchema(new SimpleSchema({
  docOwner:{
    type:String,
    optional:false,
    index:1
  },
  docUploader:{
    type:String,
    optional:false,
    index:1
  },
  docURL:{
    type:String
  },
  docMimeType:{
    type:String
  },
  updatedBy: {
    type: String,
    autoValue: function(){ return this.userId; }
  },
  updatedAt: {
    type: Date,
    autoValue: function(){ return new Date() }
  }
}));

//Document Relationships
DocumentsRelations = new Mongo.Collection('docrelations');
DocumentsRelations.attachSchema(new SimpleSchema({
  docId:{
    type:[Documents],
    optional:false,
    index:1
  },
  relation:{ //values can be 'is_owner','can_edit','can_view','can_delete','can_share'
    type:String,
    optional:false,
    allowedValues:['is_owner','can_edit','can_view','can_delete','can_share']
  },
  businesspartner:{
    type:[BusinessPartners],
    optional:false,
    index:1
  },
  updatedBy: {
    type: String,
    autoValue: function(){ return this.userId }
  },
  updatedAt: {
    type: Date,
    autoValue: function(){ return new Date() }
  }
}));

//Business Partner Relationships
BusinessPartnerRelations = new Mongo.Collection("bprelations");
BusinessPartnerRelations.attachSchema(new SimpleSchema({
  bp_subject:{
    type:[BusinessPartners],
    optional:false,
    index:1
  },
  relation:{
    type:String,
    optional:false,
    allowedValues:['sells_to','buys_from','parent_of','child_of','employee_of','employer_of']
  },
  bp_predicate:{
    type:[BusinessPartners],
    optional:false,
    index:1
  },
  updatedBy: {
    type: String,
    autoValue: function(){ return this.userId }
  },
  updatedAt: {
    type: Date,
    autoValue: function(){ return new Date() }
  }
}));

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
    autoValue: function(){ return this.userId }
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
  // description:{
  //   type:String,
  //   label: 'Price Code Description',
  //   optional:false
  // },
  // effectiveStartDate:{
  //   type:Date,
  //   label: 'Effective Start Date',
  //   optional:true
  // },
  // effectiveEndDate:{
  //   type:Date,
  //   label:'Effective End Date',
  //   optional:true
  // },
  unitPrice:{
    type:Number,
    decimal:true,
    label:'Unit Price',
    optional:false
  }
  // currency:{
  //   type:String,
  //   max:3,
  //   label:'Currency',
  //   allowedValues:['INR'],
  //   optional:false
  // },
  // discount:{
  //   type:DiscountSchema,
  //   optional:true
  // }
});

//Warehouse Definition
WarehouseSchema = new SimpleSchema({
  warehouse:{
    type:String,
    optional:false,
    label:'Warehouse Code'
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
    label:'Product Name'
  },
  description:{
    type:String,
    optional:true,
    label:'Product Description'
  },
  // minOrderQuantity:{
  //   type:Number,
  //   min:1,
  //   optional:false,
  //   label:'Minimum Order Quantity'
  // },
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
  // isVirtual:{
  //   type:Boolean,
  //   optional:true,
  //   label:'Is this product a virtual one?'
  // },
  // isBuyable:{
  //   type:Boolean,
  //   optional:true,
  //   label:'Is this Product Buyable?'
  // },
  // isSellable:{
  //   type:Boolean,
  //   optional:true,
  //   label:'Is this Product Sellable?'
  // },
  // applyDiscount:{
  //   type:Boolean,
  //   optional:false,
  //   label:'Do you want to apply a discount?'
  // },
  // costPrice:{
  //   type:PriceSchema,
  //   optional:false,
  //   label:'Cost Price of the Product'
  // },
  sellPrice:{
    type:PriceSchema,
    optional:false,
    label:'Sell Price of the Product'
  },
  // warehousingDetails:{
  //   type:[WarehouseSchema],
  //   optional:true,
  //   label:'Warehousing Information'
  // },
  updatedBy: {
    type: String,
    autoValue: function(){ return this.userId }
  },
  updatedAt: {
    type: Date,
    autoValue: function(){ return new Date() }
  }
})
);

//Business Partner Product Relationships
BusinessPartnerProductRelation = new Mongo.Collection('bp_product_relations');
BusinessPartnerProductRelation.attachSchema(new SimpleSchema({
  bp_subject:{
    type:[BusinessPartners],
    optional:false,
    index:1
  },
  relation:{
    type:String,
    optional:false,
    allowedValues:['sells','buys','stocks','services']
  },
  product:{
    type:[Products],
    optional:false,
    index:1
  },
  updatedBy: {
    type: String,
    autoValue: function(){ return this.userId }
  },
  updatedAt: {
    type: Date,
    autoValue: function(){ return new Date() }
  }
}));

//Events Collection
Events = new Mongo.Collection('events');
Events.attachSchema(new SimpleSchema({
  name: {
    type: String,
    max: 100,
    label:'Event Name'
  },
  eventDate: {
    type:Date,
    max: 500,
    label:'Event Date',
    autoform:{
      type:'bootstrap-datetimepicker',
      isReactiveValue:true,
      dateTimePickerOptions:{
        format:'DD/MM/YYYY hh:mm a',
        icons: {
                    time: "fa fa-clock-o",
                    date: "fa fa-calendar",
                    up: "fa fa-arrow-up",
                    down: "fa fa-arrow-down"
                }
      },
      template:"plain"
    }
  },
  description: {
    type: String,
    max: 500,
    optional : true,
    label: 'Add some Description'
  },
  bp_predicate : {
    //type: [BusinessPartners], Do this in the future to add multiple parties to an event
    type:String,
    max: 100,
    label: 'Choose a Customer'
  },
  type: {
    type: String,
    label: 'Associated Product'
  },
  userId: {
    type: String,
    autoValue: function(){ return this.userId }
  },
  updatedAt: {
    type: Date,
    autoValue: function(){ return new Date() }
  },
  bp_subject:{
    type:String,
    autoValue: function(){
      currUser = Meteor.users.find({_id:this.userId}).fetch();
      return currUser[0].profile.BusinessPartnerId;
    }
  }
}));

/*Security Callbacks for Collections Starts here*/
BusinessPartners.allow({
  insert:function(userId,doc){
    return true;
  },
  update:function(userId,doc){
    return !! userId;
  },
  remove:function(userId,doc){
    return true;
  }
});

BusinessPartnerRelations.allow({
  insert:function(userId,doc){
    return !! userId;
  },
  update:function(userId,doc){
    return true;
  },
  remove:function(userId,doc){
    return true;
  }
});

Events.allow({
  insert: function(userId,doc){
    return !! userId;
  },
  update: function(userId,doc){
    return !! userId;
  },
  remove: function(userId,doc){
    return !! userId;
  }
});

Products.allow({
  insert: function(userId,doc){
    return !! userId;
  },
  update: function(userId,doc){
    return !! userId;
  },
  remove: function(userId,doc){
    return !! userId;
  }
});

BusinessPartnerProductRelation.allow({
  insert: function(userId,doc){
    return !! userId;
  },
  update: function(userId,doc){
    return !! userId;
  },
  remove: function(userId,doc){
    return !! userId;
  }
})

Documents.allow({
  insert: function(userId,doc){
    return !! userId;
  },
  update: function(userId,doc){
    return !! userId;
  },
  remove: function(userId,doc){
    return !! userId;
  }
});

DocumentsRelations.allow({
  insert: function(userId,doc){
    return !! userId;
  },
  update: function(userId,doc){
    return !! userId;
  },
  remove: function(userId,doc){
    return !! userId;
  }
});
/*Security Callbacks for Collections Ends here*/
