//
// MMM-Rijks
// This was developed using the Rijksmuseum API.
//

'use strict';

const request = require('request');
var NodeHelper = require("node_helper");

module.exports = NodeHelper.create({

  start: function() {
    this.collection = [];
    this.timer = null;
  },

  initializeAfterLoading: function (config) {
    this.config = config;
    this.scanCollection();
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case 'INIT':
        this.initializeAfterLoading(payload);
        this.sendSocketNotification('INITIALIZED');
        break;
    }
  },

  scanCollection: function() {
    var account = this.config.account;
    var query = `https://www.rijksmuseum.nl/api/en/usersets/${account.userId}-${account.setId}?key=${account.apiKey}&format=json`;

    request(query, { json: true }, (err, res, data) => {
      var error=null;
      if (err) error = err;
      else if (!data) error = "statusCode="+ res.statusCode;
      else if (data.message) error = data.message;
      else if (!data.userSet) error = "'userSet' is not found. Check your account.";
      
      if (error) {
	console.log("[RIJKS] Collection error: "+error);
        this.finishScanCollection([]);
      } else {
        this.finishScanCollection(data.userSet.setItems);
      }
    })
  },

  finishScanCollection: function(items) {
    this.collection = [];
    for(var i = 0; i < items.length; i++) {
      var item = items[i];
      var c = {
        objectNumber: item.objectNumber,
        cdnUrl : item.image.cdnUrl,
        width: item.image.width,
        height: item.image.height,
        location: "",
        subTitle: "",
        scLabelLine: ""
      };
      this.collection.push(c);
      //console.log("[RIJKS] item:"+item.objectNumber);
    }
    this.startWork(0);
  },

  startWork: function(index) {
    clearTimeout(this.timer);
    this.timer = null;
    if (index < this.collection.length) {
      var item = this.collection[index];
      var ni = (this.collection.length == index+1) ? 0 : index+1;
      item.nextImage = this.collection[ni].cdnUrl;

      var account = this.config.account;
      var query = `https://www.rijksmuseum.nl/api/${this.config.descriptionLanguage}/collection/${item.objectNumber}?key=${account.apiKey}&format=json`;

      request(query, { json: true }, (err, res, data) => {
        var error=null;
        if (err) error = "error messages: " + err; 
        else if (!data) error = "statuscode: " + res.statusCode;
        else if (data.message) error = "message: " + data.message;  
        else if (!data.artObject) error  = "'artObject' is not found. There is something wrong.";
      
        if (error) {
          item.title = item.objectNumber; 
          item.description = "No description found ("+error+")";
        }else {
          item.title = data.artObject.label.title;
          item.description = data.artObject.label.description;
          item.location = data.artObject.location;
          item.subTitle = data.artObject.subTitle;
          item.scLabelLine = data.artObject.scLabelLine;
        }
        //console.log("[RIJKS] item:"+item.title);
        this.sendSocketNotification("NEW_IMAGE", item);
      })
    } else if (index>0) {
      //console.log("[RIJKS] 1 cycle finished.");
      this.scanCollection();
    }
    this.timer = setTimeout(()=>{
      this.startWork(index+1)
    }, this.config.refreshInterval);
  },
})
