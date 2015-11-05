
Template.list_bp.helpers({
  allBP: function(){
    return BusinessPartners.find();
  }
});
