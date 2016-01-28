Schema = {};
//AddressSchema Definition
Schema.AddressSchema = new SimpleSchema({
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
  line2: {
    type: String,
    max: 500,
    label: 'Address',
    optional: true
  },
  city: {
    type: String,
    max: 50,
    optional: true
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
  name: {
    type: String,
    max: 100,
    optional: false
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
  address: {
    //type:[AddressSchema],
    type: Schema.AddressSchema,
    optional: true
  },
  phones: {
    type: [Number],
    optional: true
  },
  emails: {
    type: [String],
    regEx: SimpleSchema.RegEx.Email,
    optional: true
  },
  tags:{
    type:[String],
    optional:true,
    label:'Associated Tags'
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
    autoValue: function() {
      return this.userId;
    }
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      return new Date()
    }
  }
}, {
  transform: true
}));


//Document Definition
Documents = new Mongo.Collection('documents');
Documents.attachSchema(new SimpleSchema({
  docOwner: {
    type: String,
    optional: false,
    index: 1
  },
  docUploader: {
    type: String,
    optional: false,
    index: 1
  },
  docURL: {
    type: String
  },
  docMimeType: {
    type: String
  },
  updatedBy: {
    type: String,
    autoValue: function() {
      return this.userId;
    }
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      return new Date()
    }
  }
}));

//Document Relationships
DocumentsRelations = new Mongo.Collection('docrelations');
DocumentsRelations.attachSchema(new SimpleSchema({
  docId: {
    type: [Documents],
    optional: false,
    index: 1
  },
  relation: { //values can be 'is_owner','can_edit','can_view','can_delete','can_share'
    type: String,
    optional: false,
    allowedValues: ['is_owner', 'can_edit', 'can_view', 'can_delete', 'can_share']
  },
  businesspartner: {
    type: [BusinessPartners],
    optional: false,
    index: 1
  },
  updatedBy: {
    type: String,
    autoValue: function() {
      return this.userId
    }
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      return new Date()
    }
  }
}));

//Business Partner Relationships
BusinessPartnerRelations = new Mongo.Collection("bprelations");
BusinessPartnerRelations.attachSchema(new SimpleSchema({
  bp_subject: {
    type: [BusinessPartners],
    optional: false,
    index: 1
  },
  relation: {
    type: String,
    optional: false,
    allowedValues: ['sells_to', 'buys_from', 'parent_of', 'child_of', 'employee_of', 'employer_of']
  },
  bp_predicate: {
    type: [BusinessPartners],
    optional: false,
    index: 1
  },
  updatedBy: {
    type: String,
    autoValue: function() {
      return this.userId
    }
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      return new Date()
    }
  }
}));

//Discount Definition
DiscountSchema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ['Percent', 'Flat'],
    label: "Discount Type"
  },
  value: {
    type: Number,
    min: 0,
    label: 'Discount Value'
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
  unitPrice: {
    type: Number,
    decimal: true,
    label: 'Unit Price',
    optional: false
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
  warehouse: {
    type: String,
    optional: false,
    label: 'Warehouse Code'
  },
  location: {
    type: String,
    optional: true,
    label: 'Location in the Warehouse'
  },
  currentQuantity: {
    type: Number,
    min: 0,
    label: 'Current Quantity',
    optional: false
  }
});

//Product Definition
Products = new Mongo.Collection('products');
Products.attachSchema(new SimpleSchema({
  name: {
    type: String,
    optional: false,
    label: 'Product Name'
  },
  description: {
    type: String,
    optional: true,
    label: 'Product Description'
  },
  // minOrderQuantity:{
  //   type:Number,
  //   min:1,
  //   optional:false,
  //   label:'Minimum Order Quantity'
  // },
  isStockable: {
    type: Boolean,
    optional: true,
    label: 'Is this Product Stockable?'
  },
  isService: {
    type: Boolean,
    optional: true,
    label: 'Is this product a service offering?'
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
  sellPrice: {
    type: PriceSchema,
    optional: false,
    label: 'Sell Price of the Product'
  },
  // warehousingDetails:{
  //   type:[WarehouseSchema],
  //   optional:true,
  //   label:'Warehousing Information'
  // },
  updatedBy: {
    type: String,
    autoValue: function() {
      return this.userId
    }
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      return new Date()
    }
  }
}));

//Business Partner Product Relationships
BusinessPartnerProductRelation = new Mongo.Collection('bp_product_relations');
BusinessPartnerProductRelation.attachSchema(new SimpleSchema({
  bp_subject: {
    type: [BusinessPartners],
    optional: false,
    index: 1
  },
  relation: {
    type: String,
    optional: false,
    allowedValues: ['sells', 'buys', 'stocks', 'services']
  },
  product: {
    type: [Products],
    optional: false,
    index: 1
  },
  updatedBy: {
    type: String,
    autoValue: function() {
      return this.userId
    }
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      return new Date()
    }
  }
}));
//Campaign Collection
Campaigns = new Mongo.Collection('campaigns');
Campaigns.attachSchema(new SimpleSchema({
      title: {
        type: String,
        max: 100,
        label: 'Campaign Title'
      },
      description: {
        type: String,
        max: 255,
        optional: true,
        label: 'Description'
      },
      runDate: {
        type: Date,
        label: 'Run Date and Time',
        autoform: {
          type: 'bootstrap-datetimepicker',
          isReactiveValue: true,
          dateTimePickerOptions: {
            format: 'DD/MM/YYYY hh:mm a',
            icons: {
              time: "fa fa-clock-o",
              date: "fa fa-calendar",
              up: "fa fa-arrow-up",
              down: "fa fa-arrow-down"
            }
          }
        }
      },
      runTag: {
        type: [String],
        label: 'Choose a Group to run your Campaign'
      },
      updatedBy: {
        type: String,
        autoValue: function() {
          return this.userId
        }
      },
      updatedAt: {
        type: Date,
        autoValue: function() {
          return new Date()
        }
      }
    }));

    //Campaign Relationships
    BusinessPartnerCampaignRelations = new Mongo.Collection("bp_campaign_relations");
    BusinessPartnerCampaignRelations.attachSchema(new SimpleSchema({
      bp_subject: {
        type: [BusinessPartners],
        optional: false,
        index: 1
      },
      relation: {
        type: String,
        optional: false,
        allowedValues: ['owns', 'participates', 'can_share']
      },
      campaign: {
        type: [Campaigns],
        optional: false,
        index: 1
      },
      updatedBy: {
        type: String,
        autoValue: function() {
          return this.userId
        }
      },
      updatedAt: {
        type: Date,
        autoValue: function() {
          return new Date()
        }
      }
    }));

    //Events Collection
    Events = new Mongo.Collection('events');
    Events.attachSchema(new SimpleSchema({
      name: {
        type: String,
        max: 100,
        label: 'Event Name'
      },
      eventDate: {
        type: Date,
        max: 500,
        label: 'Event Date',
        autoform: {
          type: 'bootstrap-datetimepicker',
          isReactiveValue: true,
          dateTimePickerOptions: {
            format: 'DD/MM/YYYY hh:mm a',
            icons: {
              time: "fa fa-clock-o",
              date: "fa fa-calendar",
              up: "fa fa-arrow-up",
              down: "fa fa-arrow-down"
            }
          },
          template: "plain"
        }
      },
      description: {
        type: String,
        max: 500,
        optional: true,
        label: 'Add some Description'
      },
      bp_predicate: {
        //type: [BusinessPartners], Do this in the future to add multiple parties to an event
        type: String,
        max: 100,
        label: 'Choose a Customer'
      },
      type: {
        type: String,
        label: 'Associated Product'
      },
      userId: {
        type: String,
        autoValue: function() {
          return this.userId
        }
      },
      updatedAt: {
        type: Date,
        autoValue: function() {
          return new Date()
        }
      },
      bp_subject: {
        type: String,
        autoValue: function() {
          currUser = Meteor.users.find({
            _id: this.userId
          }).fetch();
          return currUser[0].profile.BusinessPartnerId;
        }
      }
    }));



/* Order Collection */
// Order Line

//AddressSchema Definition
Schema.OrderLines = new SimpleSchema({
  lineNumber: {
    type: String,
    optional: false,
    label: 'Line Number',
    autoValue: function() {
        return Math.floor((Math.random() * 1000000) + 1).toString();
    }
  },
  product: {
    //type: [Products],
    type:String,
    optional: false,
    label: 'Item',
    autoform: {
      options: function () {

        var options = [];

        Meteor.subscribe("getUser", Meteor.userId());
        currentUser = Meteor.users.find({
          _id: Meteor.userId()
        }).fetch();

        currentUserBPId = currentUser[0].profile.BusinessPartnerId;
        //Get all the BP's which the logged in BP sells to
        console.log('BP: ' + currentUserBPId);

        Meteor.subscribe("getProductRelations", currentUserBPId);
        product_cursor = BusinessPartnerProductRelation.find({
          "bp_subject": currentUserBPId,
          "relation": "sells"
        }).fetch();

        console.log('PC: ' + product_cursor);

        products = product_cursor.map(function(c) {
          return c.product[0]
        });

        console.log('pr1: ' + products);

        Meteor.subscribe("getMyProductsForOrder", products);
        products1 = Products.find({
          _id: {
            $in: products
          }
        }).fetch();

        console.log('P: ' + products1);

        products1.map(function(element) {
          options.push({
            label: element.name,
            value: element._id
          });
        });

        console.log('o: ' + options);

        return options;
    }
  }
},
  type:{
    type:String,
    max:100,
    optional:false,
    allowedValues:['product','service'],
    label: 'Item Type',
    autoValue: function() {
          return 'product'
        }
  },
  description:{
    type:String,
    max:5000,
    optional:true,
    label: 'Description'
  },
  quantity:{
    type:Number,
    decimal: true,
    optional:false,
    min:0,
    label: 'Quantity'
  },
  unitPrice:{
    type:Number,
    decimal: true,
    optional:false,
    min:0,
    label: 'Unit Price'
  },
  tax:{
    type:Number,
    decimal: true,
    optional:false,
    min:0,
    label: 'Tax'
  },
  discount:{
    type:Number,
    decimal: true,
    optional:true,
    min:0,
    label: 'Discount'

  },
  netPrice:{
    type:Number,
    decimal: true,
    optional:false,
    min:0,
    label: 'Net Price'
  },
  status:{
    type: String,
    max:100,
    optional:true,
    allowedValues:['open','cancelled','completed'],
    label: 'Status',
    autoValue: function() {
          return 'open'
    }
  },
  deliveryStatus:{
    type: String,
    max:100,
    optional:true,
    allowedValues:['open','cancelled','partial','completed'],
    label: 'Delivery Status',
    autoValue: function() {
          return 'open'
    }
  },
  invoiceStatus:{
    type: String,
    max:100,
    optional:true,
    allowedValues:['open','cancelled','partial','completed'],
    label: 'Invoice Status',
    autoValue: function() {
          return 'open'
    }
  },
  scheduledDeliveryDate:{
    type: Date,
    optional:true,
    label: 'Scheduled Delivery Date'
  },
  destinationLocation:{
    type: String,
    max: 100,
    optional:true,
    label: 'Delivery Location'
  },
  availabilityStatus:{
    type: String,
    max:100,
    optional:true,
    allowedValues:['instock','outofstock'],
    label: 'Availability'
  }
});


// Order Header
OrderHeaders = new Mongo.Collection('orderHeader');
OrderHeaders.attachSchema(new SimpleSchema({
  documentNumber:{
    type:String,
    max:100,
    optional:false,
    label: 'Order Number'
  },
  type:{
    type:String,
    max:100,
    optional:false,
    allowedValues:['sales','purchase','delivery','salesInvoice','purchaseInvoice'],
    label: 'Order Type',
  },
  businessPartnerId:{
    //type: [BusinessPartners], -- To be done later
    type:String,
    optional:false,
    label: 'Buyer/Seller'
  },
  docmentDate:{
    type:Date,
    optional:false,
    label: 'Order Date'
  },
  externalRefNo:{
    type: String,
    max:100,
    optional:true,
    label: 'External Ref Number'
  },
  deliverTo:{
    type: String,
    max:100,
    optional:true,
    label: 'Delivered To'
  },
  status:{
    type: String,
    max:100,
    optional:false,
    allowedValues:['draft','in process','confirmed','cancelled','completed'],
    label: 'Order Status'
  },
  termsandConditions:{
    type: String,
    max:1000,
    optional:true,
    label: 'Terms & Conditions'
  },
  currencyCode:{
    type: String,
    max:3,
    optional:true,
    label: 'Currency'
  },
  paymentTerm:{
    type: String, // To be changed to payment terms table later
    max:10,
    optional:true,
    label: 'Payment Term'
  },
  incoterm:{
    type: String,
    max:10,
    optional:true,
    label: 'Incoterm' //To be changed to Incoterm Table Later
  },
  shippingPolicy:{
    type: String,
    max:1000,
    optional:true,
    label: 'Shipping Policy'
  },
  companyID:{
    type: String,
    optional:false,
    label: 'Buyer/Seller Company'
  },
  respPartnerID:{
    type: String,
    max:100,
    optional:true,
    label: 'Sales/Purchase Agent'
  },
  tag:{
    type: [String],
    optional:true,
    label: 'Tag'
  },
  sourceDocument:{
    type: String,
    max:100,
    optional:true,
    label: 'Source Document'
  },
  invoiceStatus:{
    type: String,
    max:100,
    optional:true,
    label: 'Invoice Status'
  },
  deliveryStatus:{
    type: String,
    max:100,
    optional:true,
    label: 'Delivery Status'
  },
  scheduledDeliveryDate:{
    type: Date,
    optional:true,
    label: 'Scheduled Delivery Date'
  },
  pickingType:{
    type: String,
    max:100,
    optional:true,
    label: 'picking Type'
  },
  priority:{
    type: String,
    max:100,
    optional:true,
    label: 'Priority'
  },
  deliveryMethod:{
    type: String,
    max:100,
    optional:true,
    label: 'Delivery Method'
  },

  lines: {
    //type:[AddressSchema],
    type: [Schema.OrderLines],
    optional: true,
    label: 'Order Lines'
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

/* End of Order Collection */
/* Start of Settings Collection */
BusinessPartnerSettings = new Mongo.Collection('business_partners_settings');
BusinessPartnerSettings.attachSchema(new SimpleSchema({
  bp_subject: {
    type: [BusinessPartners],
    max: 100,
    optional: false
  },
  key:{
    type:String,
    max:100,
    allowedValues:['mailgun_domain','mailgun_api'],
    optional:false
  },
  value:{
    type:String,
    optional:false
  }
}));
/* End of Settings Collection*
    /*Security Callbacks for Collections Starts here*/
    BusinessPartners.allow({
      insert: function(userId, doc) {
        return true;
      },
      update: function(userId, doc) {
        return !!userId;
      },
      remove: function(userId, doc) {
        return true;
      }
    });

    BusinessPartnerRelations.allow({
      insert: function(userId, doc) {
        return !!userId;
      },
      update: function(userId, doc) {
        return true;
      },
      remove: function(userId, doc) {
        return true;
      }
    });

    Events.allow({
      insert: function(userId, doc) {
        return !!userId;
      },
      update: function(userId, doc) {
        return !!userId;
      },
      remove: function(userId, doc) {
        return !!userId;
      }
    });

    Products.allow({
      insert: function(userId, doc) {
        return !!userId;
      },
      update: function(userId, doc) {
        return !!userId;
      },
      remove: function(userId, doc) {
        return !!userId;
      }
    });

    BusinessPartnerProductRelation.allow({
      insert: function(userId, doc) {
        return !!userId;
      },
      update: function(userId, doc) {
        return !!userId;
      },
      remove: function(userId, doc) {
        return !!userId;
      }
    })

    Documents.allow({
      insert: function(userId, doc) {
        return !!userId;
      },
      update: function(userId, doc) {
        return !!userId;
      },
      remove: function(userId, doc) {
        return !!userId;
      }
    });

    DocumentsRelations.allow({
      insert: function(userId, doc) {
        return !!userId;
      },
      update: function(userId, doc) {
        return !!userId;
      },
      remove: function(userId, doc) {
        return !!userId;
      }
    });

    Campaigns.allow({
      insert: function(userId, doc) {
        return !!userId;
      },
      update: function(userId, doc) {
        return !!userId;
      },
      remove: function(userId, doc) {
        return !!userId;
      }
    });

    BusinessPartnerCampaignRelations.allow({
      insert: function(userId, doc) {
        return !!userId;
      },
      update: function(userId, doc) {
        return !!userId;
      },
      remove: function(userId, doc) {
        return !!userId;
      }
    });

    OrderHeaders.allow({
      insert:function(userId,doc){
        return !!userId;
      },
      update:function(userId,doc){
        return !!userId;
      },
      remove:function(userId,doc){
        return !!userId;
      }
    });

    BusinessPartnerSettings.allow({
      insert:function(userId,doc){
        return !!userId;
      },
      update:function(userId,doc){
        return !!userId;
      },
      remove:function(userId,doc){
        return !!userId;
      }
    });
    /*Security Callbacks for Collections Ends here*/

    /*Easy Indexes*/
