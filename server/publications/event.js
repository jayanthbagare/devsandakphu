if (Meteor.isServer) {
  //Call the publish methods here.
  Meteor.publish("getEvent", function(event) {
    event = Eventss.find({
      _id: event
    });
    return event;
  });

  Meteor.publish("getMyEvents", function(forDate) {
    currentUser = Meteor.users.find({
      _id: this.userId
    }).fetch();

    var now = forDate;
    var till = moment(now).add(1, 'days').toDate();
    var events = Events.find({
      eventDate: {
        $gte: now,
        $lte: till
      },
      bp_subject: currentUser[0].profile.BusinessPartnerId
    });
    return events;
  });

}
