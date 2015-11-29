if (Meteor.isServer) {
  //Call the publish methods here.
  Meteor.publish("getEvent", function(event) {
    event = Eventss.find({
      _id: event
    });
    return event;
  });

  Meteor.publish("getMyEvents", function(bp,fromDate,tillDate) {
    var events = Events.find({
      eventDate: {
        $gte: fromDate,
        $lte: tillDate
      },
      bp_subject: bp
    });
    return events;
  });

}
