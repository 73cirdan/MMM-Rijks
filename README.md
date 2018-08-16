# MMM-Rijks
MagicMirror module for Rijks gallery. This was developed using the Rijksmuseum API.

## Screenshots
![screenshot](https://github.com/eouia/MMM-Rijks/blob/master/scr1.png?raw=true)

![screenshot](https://github.com/eouia/MMM-Rijks/blob/master/scr2.png?raw=true)


## Installation
```shell
cd ~/MagicMirror/modules
git clone https://github.com/eouia/MMM-Rijks.git
```

## Get API info & collection user set.
1. Sign in to Rijks Museum. (https://www.rijksmuseum.nl/)
2. After login, go to your profile settings (https://www.rijksmuseum.nl/en/rijksstudio/my/profile)
3. find and click `Advanced settings` on end of page.
4. Enable Rijksmuseum API key. you can get `apiKey` immediately. It looks like `Tj2AtQf6`
5. Now, you should make your collection set to be displayed on your magicmirror.
6. You can create and name your set. And you can add pictures by clicking `Red Heart` symbol on any other pictures.
7. After creating set, go to your set page. (By clicking your profile icon on upper-right corner of any pages)
8. Dive into your set page. URL looks like "https://www.rijksmuseum.nl/en/rijksstudio/2233403--your-name/collections/my-first-gallery".
9. on above URL, `2233403` will be your `userId`, `my-first-gallery` will be your `setId`.
10. Let's configure.

## Configuration
```javascript
{
  module: "MMM-Rijks",
  position: "fullscreen_below", //fullscreen_below is the best position.
  config: {
    descriptionLanguage: "en", //"en" or "nl"
    useDescription: true,
    account: {
      userId: "2233403",
      apiKey: "Tj2AtQf6",
      setId: "my-first-gallery",
    },
    refreshInterval: 1000*60,
  }
},
```
