//
// MMM-Rijks
// This was developed using the Rijksmuseum API.
//

'use strict'

const request = require('request')

var NodeHelper = require("node_helper")

module.exports = NodeHelper.create({
  start: function() {
    this.collection = []
    this.index = 0
    this.timer = null
  },

  initializeAfterLoading: function (config) {
    this.config = config
    this.scanCollection()
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case 'INIT':
        this.initializeAfterLoading(payload)
        this.sendSocketNotification('INITIALIZED')
        break
    }
  },

  scanCollection: function() {
    var account = this.config.account
    var query = `https://www.rijksmuseum.nl/api/en/usersets/${account.userId}-${account.setId}?key=${account.apiKey}&format=json`

    request(query, { json: true }, (err, res, data) => {
      if (err) {
        console.log("[RIJKS] Error:", err)
        this.sendSocketNotification("SCAN_FAIL")
        return
      }
      if (data.message) {
        console.log("[RIJKS] Error:", data.message)
        this.sendSocketNotification("SCAN_FAIL")
        return
      }
      if (!data.userSet) {
        console.log("[RIJKS] Error: 'userSet' is not found. Check your account.")
        this.sendSocketNotification("SCAN_FAIL")
        return
      }
      this.finishScanCollection(data.userSet.setItems)
    })
  },

  finishScanCollection: function(items) {
    for(var i = 0; i < items.length; i++) {
      var item = items[i]
      var c = {
        objectNumber: item.objectNumber,
        cdnUrl : item.image.cdnUrl,
        width: item.image.width,
        height: item.image.height
      }
      this.collection.push(c)
    }
    this.index = 0
    this.startWork()
  },

  startWork: function() {
    clearTimeout(this.timer)
    this.timer = null
    var item = this.collection[this.index]
    this.index++
    var ti = (this.collection.length <= this.index) ? 0 : this.index
    var nextImage = this.collection[ti].cdnUrl
    var account = this.config.account
    var query = `https://www.rijksmuseum.nl/api/${this.config.descriptionLanguage}/collection/${item.objectNumber}?key=${account.apiKey}&format=json
`
    request(query, { json: true }, (err, res, data) => {
      if (err) {
        console.log("[RIJKS] Item Error:", err)
        this.sendSocketNotification("ITEM_FAIL")
        return
      } else if (data.message) {
        console.log("[RIJKS] Item Error:", data.message)
        this.sendSocketNotification("ITEM_FAIL")
        return
      } else if (!data.artObject) {
        console.log("[RIJKS] Item Error: 'artObject' is not found. There is something wrong.")
        this.sendSocketNotification("ITEM_FAIL")
        return
      } else {
        item.title = data.artObject.label.title
        item.description = data.artObject.label.description
        item.location = data.artObject.location
        item.subTitle = data.artObject.subTitle
        item.scLabelLine = data.artObject.scLabelLine
        item.nextImage = nextImage
        this.sendSocketNotification("NEW_IMAGE", item)
        if (this.index >= this.collection.length) {
          console.log("[RIJKS] 1 cycle finished.")
          this.scanCollection()
          return
        } else {
          this.timer = setTimeout(()=>{
            this.startWork()
          }, this.config.refreshInterval)
        }
      }
    })
  },

})
