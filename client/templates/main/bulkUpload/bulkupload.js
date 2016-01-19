uploading = new ReactiveVar(false);
Template.bulk_upload.rendered = function(){
  Template.instance().uploading = uploading;

  //Hide the help modal
    $('#formatModal').modal("hide");
  //Initialize the searchable list options
  this.$('#uploadOptions').searchableOptionList({
    allowNullSelection: true,
    texts:{
        searchplaceholder: 'Click to choose what you want to upload'
    }

  });
};

Template.bulk_upload.helpers({
  uploading: function(){
    Template.instance().uploading = true;
    //return uploading;
  }
});

Template.bulk_upload.events({
  "click #formatHelp": function(event, template){
    event.preventDefault();
    $('#formatModal').modal("show");
  },
  'change #uploadCSV':function(event,template){
    event.preventDefault();
    Papa.parse(event.target.files[0],{
      header:true,
      complete:function (results,file){
        console.log('Parsed Results are ', results);
        console.log('File is ', file);
        Meteor.call('bulkUploadCustomers',Session.get("loggedInBPId"),results.data,function(error,results){
          if(error){
            console.log('Could not load customers ', error);
          }
          else{
            console.log('Loaded all customers ', results);
          }
        });
      }
    });
  }
});
