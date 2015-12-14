eventPagination = '';

AutoForm.addHooks(['add_event_form'], {
  onSuccess: function(operation, result, template) {
    /*Get the customer to message */
    FlashMessages.sendSuccess('Appointment Added');
    Router.go('/admin/events');
  },
  onError: function(operation, result, template) {
    FlashMessages.sendError('Appointment could not be added ', result);
  }
});

Template.list_events.helpers({
  eventsIndex: () => EventsIndex
});

//When the Date changes call the datepicker function to set the hidden text field
$('#chooseDate').datepicker().on('changeDate',function(e){
  this.$('#chosenDate').text = $('#chooseDate').data('date');
  this.$('#chooseDate').datepicker('hide');
});


Template.list_events.onRendered(function(event) {
  //Initialize the Datepicker
  this.$('#chooseDate').datepicker({
    autoclose:true,
    format:"dd/mm/yyyy",
    orientation:"top right",
    todayBtn:"linked",
    todayHighlight:true,
    zIndexOffset:1000
  });

  //Set the chosen date to today, if there is no chosen date.
  var chosenDate = $('#chosenDate').text();
  if ($('#chosenDate').text() === '') {
    this.$('#chosenDate').text(moment().format('DD.MM.YYYY'));
    Template.list_events.__helpers[" getEvents"]();
    eventsUI.changed();
  }

  /*Set the search to beautiful
    Set the text field to hidden else it will look ugly.
  */
  this.$('#txtChosenDate').attr('type', 'hidden');

  this.$('#chooseDate').on("changeDate", function(e) {
    /* On change of the date
       make the spinner change the date on the div area and
       fire the eventUI changed event.
    */
    //when the date changes, change the span text as this is read before getEvents
    //console.log('Date is changed ', moment(e.date).format("DD.MM.YYYY"));
    $('#chosenDate').text(moment(e.date).format("DD.MM.YYYY"));

    Template.list_events.__helpers[" getEvents"]();
    eventsUI.changed();
  });
  //End of Date Change in Datepicker.
});

Template.add_event.events({
  'submit .add_event_form': function(event) {

    var name = event.target.name.value;
    var description = event.target.description.value;
    var client = event.target.client.value;
    var type = event.target.type.value;
    var eventDate = event.target.eventDate.value;
    //Insert Event
    Events.insert({
      name: name,
      description: description,
      type: type,
      client: client,
      eventDate: eventDate
    });
    //Send an SMS for confirmation
    var event = this;
    Meteor.call('mgetClient', client, function(error, result) {
      if (!error) {
        body = 'Your appointment has been fixed on ' + moment(eventDate).format("DD.MM.YYYY h:mm a") + ' by Rashmi DentaCare';

        Meteor.call('sendSMS',result.phone,body,function(error,result){
          if(error){
            throw new Meteor.Error('Could not send SMS, please try in some time again');
          }
        });
      }
    });
    FlashMessages.sendSuccess('Appointment Added');
    Router.go('/admin/events');

    return false;
  },


});

//Edit Handling for Events
Template.edit_event.events({
  'submit .edit_event_form': function(event) {

    var name = event.target.name.value;
    var description = event.target.description.value;
    var client = event.target.client.value;
    var type = event.target.type.value;
    var eventDate = event.target.eventDate.value;

    oldEventData = Events.findOne({
      '_id': this._id
    }, {
      eventDate: 1
    });

    //Upsert Event
    Events.update(this._id, {
      $set: {
        name: name,
        description: description,
        type: type,
        //client: client,
        eventDate: eventDate
      }
    }, true);

    //Send an SMS if the old and new appointment dates are different.
    if (oldEventData.eventDate != eventDate) {
      var event = this;
      Meteor.call('mgetClient', oldEventData.client, function(error, result) {
        if (!error) {
          body = 'Your appointment from ' + moment(oldEventData.eventDate).format('DD.MM.YYYY h:mm a') + ' has been changed to ' + moment(eventDate).format('DD.MM.YYYY h:mm a') + ' by Rashmi DentaCare';

          Meteor.call('sendSMS',result.phone,body,function(error,result){
              if(error){
                throw new Meteor.Error('Could not send SMS, please try in some time again');
              }
            });
        }
      });
    }
    FlashMessages.sendSuccess('Appointment Edited');
    Router.go('/admin/events');

    return false;
  }
});

eventsUI = new Tracker.Dependency;

Template.list_events.helpers({
  getEvents: function() {
    eventsUI.depend();
    currentUser = Meteor.users.find({
      _id: Meteor.userId()
    }).fetch();

    var now = moment($('#chosenDate').text(), 'DD.MM.YYYY').toDate();
    var till = moment(now).add(1, 'days').toDate();

    Deps.autorun(function() {
      console.log('Current user is ', currentUser);
      eventPagination = Meteor.subscribeWithPagination('getMyEvents', currentUser[0].profile.BusinessPartnerId, now, till, 10);
    });

    events = Events.find({
      eventDate: {
        $gte: now,
        $lte: till
      },
      bp_subject: currentUser[0].profile.BusinessPartnerId
    });
    return events;
  },
  allEventsLoaded: function() {

    if (Events.find().count() == eventPagination.loaded()) {
      return false;
    } else {
      return true;
    }
  },
  getCustomer: function(bpId){
    Meteor.subscribe("getOneBP",bpId);
    bp = BusinessPartners.find({_id:bpId},{name:1}).fetch();
    return bp[0].name;
  },
  getProduct: function(productId){
    Meteor.subscribe("getOneProduct",productId);
    product = Products.find({_id:productId}).fetch();
    return product[0].name;
  }
});

//List Events Events

Template.list_events.events({
  'click #load_more': function(event) {
    event.preventDefault();
    eventPagination.loadNextPage();
  }
});

//Format the time to the locale here
Template.registerHelper("formatDateTime", function(givenDate) {
  return moment(givenDate).format("DD.MM.YYYY-h:mm a");
});

//Get the date of today
Template.registerHelper("getToday", function() {
  var today = moment();
  today = moment(today).format("DD.MM.YYYY");
  return today;
});


//New Event Model Methods, delete the earlier ones, once done
Template.registerHelper("getMyCustomers", function() {
  var options = [];

  Meteor.subscribe("getUser", Meteor.userId());
  currentUser = Meteor.users.find({
    _id: Meteor.userId()
  }).fetch();

  currentUserBPId = currentUser[0].profile.BusinessPartnerId;
  //Get all the BP's which the logged in BP sells to

  Meteor.subscribe("getCustomerRelations", currentUserBPId);
  customer_cursor = BusinessPartnerRelations.find({
    "bp_subject": currentUserBPId,
    "relation": "sells_to"
  }).fetch();

  bp_predicates = customer_cursor.map(function(c) {
    return c.bp_predicate[0]
  });

  Meteor.subscribe("getCustomers", bp_predicates);
  customers = BusinessPartners.find({
    _id: {
      $in: bp_predicates
    }
  }).fetch();

  customers.map(function(element) {
    options.push({
      label: element.name,
      value: element._id
    });
  });
  return options;
});


Template.registerHelper("getMyProducts", function() {
  var options = [];

  Meteor.subscribe("getUser", Meteor.userId());
  currentUser = Meteor.users.find({
    _id: Meteor.userId()
  }).fetch();

  currentUserBPId = currentUser[0].profile.BusinessPartnerId;
  //Get all the BP's which the logged in BP sells to

  Meteor.subscribe("getProductRelations", currentUserBPId);
  product_cursor = BusinessPartnerProductRelation.find({
    "bp_subject": currentUserBPId,
    "relation": "sells"
  }).fetch();

  products = product_cursor.map(function(c) {
    return c.product[0]
  });

  Meteor.subscribe("getProducts", products);
  products = Products.find({
    _id: {
      $in: products
    }
  }).fetch();

  products.map(function(element) {
    options.push({
      label: element.name,
      value: element._id
    });
  });

  return options;
});
