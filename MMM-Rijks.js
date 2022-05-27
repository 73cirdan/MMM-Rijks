//
// MMM-Rijks
// This was developed using the Rijksmuseum API.
//

Module.register("MMM-Rijks", {
  defaults: {
    useDescription: true,
    descriptionLanguage: "en", //"en" or "nl"
    account: {
      userId: "",
      apiKey: "",
      setId: ""
    },
    refreshInterval: 1000 * 60
  },
  getStyles: function () {
    return ["MMM-Rijks.css"];
  },

  start: function () {
    this.sendSocketNotification("INIT", this.config);
  },

  getDom: function () {
    var wrapper = document.createElement("div");
    wrapper.id = "RIJKS";
    var image = document.createElement("div");
    image.id = "RIJKS_IMAGE";
    var preLoad = document.createElement("div");
    preLoad.id = "RIJKS_IMAGE_PRELOAD";
    wrapper.appendChild(image);
    wrapper.appendChild(preLoad);
    /* Don't hide copyright. this is defined in terms of usage */
    var cp = document.createElement("div");
    cp.id = "RIJKS_COPYRIGHT";
    cp.innerHTML = "@Rijksmuseum Collection";
    wrapper.appendChild(cp);
    if (this.config.useDescription) {
      wrapper.className = "useDescription";
      var description = document.createElement("div");
      description.id = "RIJKS_DESCRIPTION";
      wrapper.appendChild(description);
    }
    return wrapper;
  },

  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case "NEW_IMAGE":
        this.showImage(payload);
        break;
      //case "SCAN_FAIL":
      //document.getElementById("RIJKS").innerHTML = "Scanning Failed."
      //break
      //case "ITEM_FAIL":
      //document.getElementById("RIJKS").innerHTML = "getting items Failed."
      //break
    }
  },

  showImage: function (item) {
    var wrapper = document.getElementById("RIJKS");
    var image = document.getElementById("RIJKS_IMAGE");
    var description = document.getElementById("RIJKS_DESCRIPTION");
    if (this.config.useDescription) {
      description.innerHTML = "";
      description.style.display = "none";
      var title = document.createElement("div");
      title.className = "title";
      title.innerHTML = item.title;
      description.appendChild(title);
      var subTitle = document.createElement("div");
      subTitle.className = "subTitle";
      subTitle.innerHTML = item.subTitle;
      description.appendChild(subTitle);
      var scLabelLine = document.createElement("div");
      scLabelLine.className = "scLabelLine";
      scLabelLine.innerHTML = item.scLabelLine;
      description.appendChild(scLabelLine);
      var d = document.createElement("div");
      d.className = "description";
      d.innerHTML = item.description;
      description.appendChild(d);
      var location = document.createElement("div");
      location.className = "location";
      location.innerHTML = item.location;
      description.appendChild(location);
      var timer = setTimeout(() => {
        clearTimeout(timer);
        description.style.display = "block";
      }, 2000);
    }

    var pre = document.getElementById("RIJKS_IMAGE_PRELOAD");
    if (pre.style.backgroundImage) {
      image.style.backgroundImage = pre.style.backgroundImage;
    } else {
      image.style.backgroundImage = `url("${item.cdnUrl}")`;
    }
    pre.style.backgroundImage = `url("${item.nextImage}")`;
  }
});
