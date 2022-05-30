//
// MMM-Rijks
// This was developed using the Rijksmuseum API.
//

"use strict";

var NodeHelper = require("node_helper");
const axios = require("axios").default;

module.exports = NodeHelper.create({
  start: function () {
    this.collection = [];
    this.timer = null;
  },

  initializeAfterLoading: function (config) {
    this.config = config;
    this.scanCollection();
  },

  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case "INIT":
        this.initializeAfterLoading(payload);
        this.sendSocketNotification("INITIALIZED");
        break;
    }
  },

  scanCollection: function () {
    var account = this.config.account;
    var query = `https://www.rijksmuseum.nl/api/en/usersets/${account.userId}-${account.setId}?key=${account.apiKey}&format=json`;
    //console.log(query);
    const self = this;

    axios
      .get(query)
      .then(function (response) {
        // handle success console.log(response);
        self.finishScanCollection(response.data.userSet.setItems);
      })
      .catch(function (error) {
        console.log("[RIJKS] Collection : " + self.handleError(self, error));
        self.finishScanCollection([]);
      });
  },

  handleError: function (self, error) {
    // handle error console.log(error);
    var errorText = "";
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorText += "Error(1): " + error.response.status;
      errorText += "| " + error.response.statusText;
      errorText += "| " + error.code;
    } else {
      // Something happened in setting up the request that triggered an Error
      // The request was made but no response was received
      errorText += "Error(2): No connection";
    }
    return errorText;
  },

  finishScanCollection: function (items) {
    this.collection = [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var c = {
        objectNumber: item.objectNumber,
        cdnUrl: item.image.cdnUrl,
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

  startWork: function (index) {
    clearTimeout(this.timer);
    this.timer = null;
    const self = this;
    if (index < this.collection.length) {
      var item = this.collection[index];
      var ni = this.collection.length == index + 1 ? 0 : index + 1;
      item.nextImage = this.collection[ni].cdnUrl;

      var account = this.config.account;
      var query = `https://www.rijksmuseum.nl/api/${this.config.descriptionLanguage}/collection/${item.objectNumber}?key=${account.apiKey}&format=json`;

      axios
        .get(query)
        .then(function (response) {
          var data = response.data;
          // handle success console.log(response);
          item.title = data.artObject.label.title;
          item.description = data.artObject.label.description;
          item.location = data.artObject.location;
          item.subTitle = data.artObject.subTitle;
          item.scLabelLine = data.artObject.scLabelLine;
          self.sendSocketNotification("NEW_IMAGE", item);
        })
        .catch(function (error) {
          var errorText = self.handleError(self, error);
          console.log("[RIJKS] Image : " + errorText);
          item.title = item.objectNumber;
          item.description = "No description found (" + errorText + ")";
          self.sendSocketNotification("NEW_IMAGE", item);
        });
      //console.log("[RIJKS] item:"+item.title);
    } else if (index > 0) {
      //console.log("[RIJKS] 1 cycle finished.");
      this.scanCollection();
    }
    this.timer = setTimeout(() => {
      this.startWork(index + 1);
    }, this.config.refreshInterval);
  }
});
