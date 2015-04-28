/*
INPUT:
* workspaceId
* contactId 
DESCRIPTION
An editable list of phone numbers (`workspacesContactsPhoneNumbers`) owned by contactId.  
*/
define([
  "dojo/_base/declare"

, "dijit/form/ValidationTextBox"

, "put-selector/put"

, "hotplate/hotClientDojo/dgridWidgets/commonMixins"
, "hotplate/hotClientDojo/widgets/EditingWidget"
, "hotplate/hotClientDojo/widgets/SharedValidationTextBox"
, "hotplate/hotClientDojo/widgets/widgets"
, "hotplate/hotClientDojo/dgridWidgets/EditableList"
, "hotplate/hotClientDojo/widgets/BusyButton"
, "hotplate/hotClientDojo/stores/stores"
, "hotplate/hotClientDojo/globals/globals"
, "hotplate/hotClientDojo/storeConfig/ConfigVars"

], function(
  declare
  
, ValidationTextBox

, put

, commonMixins
, EditingWidget
, SharedValidationTextBox
, widgets
, EditableList
, BusyButton
, stores
, globals
, ConfigVars

){

  var templateString = '' +
    
    '<div>\n' +
    '  <div class="inline-form">\n' +
    '    <form data-dojo-type="dijit/form/Form" data-dojo-attach-point="formWidget" method="POST">\n' +
    '      <input class="dial-code" id="${id}_dialCode" name="dialCode" data-dojo-type="hotplate/hotClientDojo/widgets/SharedValidationTextBox" maxlength="4" data-dojo-props="value: this.countryDialCodeDefault, placeHolder:this.countryDialCodeDefault, required: true, sharedValidator: \'dialCode\'" data-dojo-attach-point="dialCodeWidget" />\n' +
    '      <input class="number" id="${id}_number" name="number" data-dojo-type="hotplate/hotClientDojo/widgets/SharedValidationTextBox" maxlength="20" data-dojo-props="placeHolder:\'Type a phone number...\', required: true, sharedValidator: \'phoneNumber\'" data-dojo-attach-point="numberWidget" />\n' +
    '      <input class="form-submit" type="submit" data-dojo-attach-point="buttonWidget" data-dojo-type="hotplate/hotClientDojo/widgets/BusyButton" label="Save" />' +
    '    </form>\n'+
    '  </div>\n'+
    '</div>\n'+
    '';

  return declare( [ EditableList ], {

    closeDialogAfterSubmit: true,

    ownClass: 'workspaces-contacts-phone-numbers',

    postMixInProperties: function(){
      this.inherited(arguments);

      this.storeParameters = { workspaceId: this.workspaceId, contactId: this.contactId };
    },

    ListConstructor: declare( [ commonMixins.FullOnDemandList ], {

      renderRow: function(object, options){
        if( object.dialCode ) 
          var row = put('div.row', '+' + object.dialCode + ' ' + object.number );
        else
          var row = put('div.row', object.number );
        return row;
      },
      dndParams: { selfAccept: true },
      refresh: function(){
        this.inherited( arguments );
      },

    }),

    EditingWidgetConstructor: declare([ EditingWidget ], {
      templateString: templateString,
      alertBarDomPlacement: 'last',
      resetOnSuccess: true,

      buildRendering: function(){
        this.countryDialCodeDefault = ConfigVars.workspacesInfo.countryDialCodeDefault;
        this.inherited( arguments );
      },

      manipulateValuesBeforeSubmit: function( values ){
        //console.log(values);
        //values.orderByNameDefault = values.orderByNameDefault.indexOf( 'on' ) !== -1;
      },

    }),

    storeName: 'workspacesContactsPhoneNumbers',
    editingWidgetPlacement: 'inline',
    multipleEditingAllowed: false,
    addingWidgetPosition: 'top',
    gutters: false,
    buttonsPosition: 'after', // or "top" or "bottom"
  } );

});


/*
var countryOptions = [];

var countryDialCodes = sharedFunctions.bd.countryDialCodes();

for( var code in countryDialCodes ){
  var country = countryDialCodes[ code ];

  console.log( country, code );

  countryOptions.push( {
    label: country + ' (+' + code + ')',
    value: code
  });

  console.log( "OPTIONS: ", countryOptions );
}



var CountrySelect = declare( 'bd/DialCode', Select, {
  name: "dialCode",
  options: countryOptions
});

*/

