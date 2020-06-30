const axios = require('axios').default;
require('dotenv').config();
const qs = require('querystring');
const open = require('open');
const SpotifySecret = process.env.SPOTIFYSECRET;
var myArgs = process.argv.slice(2);
var tokencd;
var refreshToken;
var accessToken;
var tokenArr = [];

async function getAuthCode(){
  axios.get('https://accounts.spotify.com/authorize', {
    params: {
      client_id: '53b1db6aceab4b3d875fafbe5208ff8d',
      response_type: 'code',
      redirect_uri: 'https://example.com/callback',
    }
  }).then(res => {
    open(res.request.res.responseUrl);
  });
}
async function getAccessToken(authCode){
  const requestBody = {
    grant_type: 'authorization_code',
    code: authCode,
    redirect_uri: 'https://example.com/callback'
  }
  const config = {
    headers: {
      'Authorization' : '',
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  }
  let data = '53b1db6aceab4b3d875fafbe5208ff8d:' + SpotifySecret;
  let buff = new Buffer.from(data);
  let base64data = buff.toString('base64');
  config.headers['Authorization'] = 'Basic ' + base64data;

  let res = await axios.post('https://accounts.spotify.com/api/token', qs.stringify(requestBody), config).catch(function(error) {
    return console.log(error);
  });
  const now = Date.now();
  tokencd = now + res.data.expires_in;
  refreshToken = res.data.refresh_token;
  accessToken = res.data.access_token;
  tokenArr = [tokencd, refreshToken, accessToken];
  return tokenArr;
}
async function getSongs(tokenArr){
  let newNow = Date.now() + 10;
  if(tokenArr[0] <= newNow){
    tokenArr = await getAccessToken(tokenArr[1]);
  }
  var obj = {
    url: 'https://api.spotify.com/v1/playlists/272GBqcvfT6AtiKiakE2mG/tracks',
    method: 'GET',
    headers: {
      'Authorization': '',
      'Content-Type': 'application/json'
    },
  }
  obj.headers['Authorization'] = 'Bearer ' + tokenArr[2];
  let res = await axios(obj).catch(function(error) {
    return console.log(error);
  });
  if(res == null){
    return;
  }
  let items = res.data.items;
  while(res.data.next != null){
    obj.url = res.data.next;
    res = await axios(obj);
    items = items.concat(res.data.items);
  }
  return items;

}
if(myArgs.length == 0){
  getAuthCode();
}
else{
  var authCode = myArgs[0];
  getAccessToken(authCode).then(tokenArr => {
    getSongs(tokenArr).then(items => {
      if(items == null){
        return;
      }
      for(i=0; i<items.length; i++){
        console.log(items[i].track.name);
      }
    });
  })
}
