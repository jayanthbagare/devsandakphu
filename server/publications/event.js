if (Meteor.isServer) {
  //Call the publish methods here.
  Meteor.publish("getEvent", function(event) {
    event = Events.find({
      _id: event
    });
    return event;
  });

  Meteor.publish("getMyEvents", function(bp,fromDate,tillDate,limit) {
    return Events.find({
      eventDate: {
        $gte: fromDate,
        $lte: tillDate
      },
      bp_subject: bp
    },{limit:limit});
    this.ready();
  });

}
