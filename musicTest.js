const axios = require('axios').default;
var myArgs = process.argv.slice(2);
const Youtube = require('./youtube');
const Spotify = require('./spotify');
const fs = require('fs');
const songDir = fs.opendirSync('Songs');
if(myArgs.length == 0){
  Spotify.getAuthCode();
}
else{
  var authCode = myArgs[0];
  Spotify.getAccessToken(authCode, Env).then(tokenArr => {
    Spotify.tokenTest(tokenArr).then(tokenArr => {
      Spotify.getSongs(tokenArr, '272GBqcvfT6AtiKiakE2mG').then(returnArr => {
        let items = returnArr[1];
        if(items == null){
          return;
        }
        for(i=0; i<items.length; i++){
          console.log(items[i].track.name);
        }
      });
    });
  })
}
//youtube.lookup('benja', 'benja');
