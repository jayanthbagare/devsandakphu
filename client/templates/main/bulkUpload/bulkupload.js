Template.bulk_upload.rendered = function(){
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

Template.bulk_upload.events({
  "click #formatHelp": function(event, template){
    event.preventDefault();
    $('#formatModal').modal("show");
  }
});
