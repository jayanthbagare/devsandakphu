AutoForm.addHooks(['add_product_form'],{
  onSuccess: function(operation, result, template) {
    var vresult = new ReactiveVar();
    vresult = result;

    console.log('Inserted Product is ', result);

    //Get Self Business Partner ID.
    Meteor.subscribe("getUser", Meteor.userId());
    currentUser = Meteor.users.find({
      _id: Meteor.userId()
    }).fetch();

    console.log('Coming into before relations');
    //Insert the relation between current business and product.
    try {
      console.log('Before Relations');
      BusinessPartnerProductRelation.insert({
        bp_subject: [currentUser[0].profile.BusinessPartnerId],
        relation: 'sells',
        product: [vresult]
      });
    } catch (e) {
      console.log(e);
      throw new Meteor.Error(500, 'Could not state the relation 1', e);
    }
    //If all is well Flash a Success message.
    FlashMessages.sendSuccess('Product Added Successfully');
    Router.go('/admin/products');
  },
  onError: function(operation, result, template) {
    console.log(result);
    FlashMessages.sendError('Could not save Relations' + result);
  }
});
