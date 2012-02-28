enyo.kind({
  name: "WebOSM.Dialog",
  kind: "enyo.ModalDialog",
  published: {content: ""},
  components: [
          {name: "test", style: "padding-left: 10px"},
          {layoutKind: "VFlexLayout", pack: "center", components: [
              {kind: "Button", caption: "Retry", className: "enyo-button-affirmative", onclick: "confirmClick"},
              {kind: "Button", caption: "Close", onclick: "cancelClick"}
          ]}
  ],
  showDialog: function() {
      this.openAtCenter();
  },
  confirmClick: function() {
      // process confirmation
      this.doConfirm();
      // then close dialog
      this.close();
  },
  cancelClick: function() {
      this.close();
  },
  doConfirm: function() {
      // confirm things
  },
  
  contentChanged: function(){
  	this.$.test.setContent(this.content);
  }
});

