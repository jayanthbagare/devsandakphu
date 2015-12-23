/*Commit from home test.*/
AutoForm.addHooks(['add_client_form','edit_client_form'],{
  onSuccess: function(operation,result,template){
    FlashMessages.sendSuccess('Client Saved Successfully');
    Router.go('/main/clients');
  },
  onError: function(operation,result,template){
    FlashMessages.sendError('Could not save ' + result);
  }
});

Template.edit_client.helpers({
  selectedClient: function(){
    return Clients.findOne({"_id":this._id});
  }
});

Template.list_clients.helpers({
	clients: function(){
		return Clients.find();
	}
});

Template.list_clients.events({
  //Delete the Event
  'click .delete_client': function(event){
    if(confirm('Are you sure to delete this'))
    {
        Clients.remove(this._id);
    }

  },
  'click #add_event': function(event){
    Session.set('clientId',this._id);
  },

  'click #attach_doc': function(event){
    var customer = this._id;
    filepicker.pickMultiple({
      mimetypes:['image/*','text/*','video/*','application/pdf'],
      //extensions:['*.jpg','*.jpeg','*.png','*.mp4','*.pdf','*.docx','*.xlsx','*.pptx'],
      services:['COMPUTER','WEBCAM','VIDEO','URL'],
      multiple:true/*,
      customCss:'app/client/stylesheets/filepicker.css'*/
    },
    function(InkBlob){
      $.each(InkBlob,function(key,value){
          console.log(InkBlob);
          if(value.url){
              ClientImages.insert({
                client:client,
                imageURL: value.url,
                mimeType:value.mimetype
                                  });
                      }});
                  });
  },
  'click #view_timeline': function(event){
    //Set the client session id to be retrieved in timeline.
    Session.set('clientId',this._id);
  },
  //Handle the SMS and messaging feature.
  'click #sms_message': function(event){
    //Call the Modal for SMS here.
    $('#smsModal').modal("show");
    Session.set('clientId',this._id);
  }
});

Template.timeline.events({
  'click .timeline-panel': function(event){
    var imageURL = this.imageURL;
    Session.set("imageModal",imageURL);
    Session.set("mimeType",this.mimeType);
    $("#imageModal").modal("show");
  }
});


//Register Helpers for getting the documents.
Template.registerHelper("getClientDocuments",function(argument){
  var client_id = Session.get('clientId');
  return ClientImages.find({
    client:client_id
});

});

//Format the time to the locale here
Template.registerHelper("formatDateTime", function(givenDate){
    return moment(givenDate).format("DD.MM.YYYY-h:mm a");
});

//Template for getting the current Image for modal
Template.registerHelper("getImageModal", function(argument){
  var url = Session.get("imageModal");
  var mimeType = Session.get("mimeType");

  //Wire the right html based on the mimetype
  //Later add regex to handle different file types
  file = url.substr(url.lastIndexOf('/') + 1 );
  displayURL = 'https://www.filepicker.io/api/file/' + file;

  if(mimeType == "application/pdf"){
    return "<div type='filepicker-preview' data-fp-url='" + displayURL + "' style='width:auto; height:500px;'> </div>";
  }else {
    return "<img src='" + url + "' class='img-responsive'>";
  }
});
