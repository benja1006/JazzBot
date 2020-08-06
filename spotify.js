const axios = require('axios').default;
require('dotenv').config();
const qs = require('querystring');
module.exports = {
  // getAuthCode: async function(){
  //   axios.get('https://accounts.spotify.com/authorize', {
  //     params: {
  //       client_id: '53b1db6aceab4b3d875fafbe5208ff8d',
  //       response_type: 'code',
  //       redirect_uri: 'https://example.com/callback',
  //     }
  //   }).then(res => {
  //     open(res.request.res.responseUrl);
  //   });
  // },
  getAccessToken: async function(authCode, env){
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
    let data = env.SpotifyID + ':' + env.SpotifySecret;
    console.log(data);
    let buff = new Buffer.from(data);
    let base64data = buff.toString('base64');
    config.headers['Authorization'] = 'Basic ' + base64data;

    let res = await axios.post('https://accounts.spotify.com/api/token', qs.stringify(requestBody), config).catch(function(error) {
      return console.log('An Error has occured in getting a spotify token');
    }).catch(err => {
      return false
    });
    const now = Date.now();
    let tokencd = now + res.data.expires_in;
    let refreshToken = res.data.refresh_token;
    let accessToken = res.data.access_token;
    let tokenArr = [tokencd, refreshToken, accessToken];
    return tokenArr;
  },
  getRefreshToken: async function(refreshToken, env){
    const requestBody = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }
    const config = {
      headers: {
        'Authorization' : '',
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    }
    let data = env.SpotifyID + ':' + env.SpotifySecret;
    //console.log(data);
    let buff = new Buffer.from(data);
    let base64data = buff.toString('base64');
    config.headers['Authorization'] = 'Basic ' + base64data;

    let res = await axios.post('https://accounts.spotify.com/api/token', qs.stringify(requestBody), config).catch(function(error) {
      console.log(error);
      return console.log('An Error has occured in getting a refresh token');
    });
    const now = Date.now();
    let tokencd = now + res.data.expires_in;
    let newRefreshToken = res.data.refresh_token;
    let accessToken = res.data.access_token;
    let tokenArr = [tokencd, newRefreshToken, accessToken];
    return tokenArr;
  },
  //Returns an array [tokenArr, items]
  getSongs: async function(tokenArr, playlistID){
    var obj = {
      url: '',
      method: 'GET',
      headers: {
        'Authorization': '',
        'Content-Type': 'application/json'
      },
    }
    obj.url = 'https://api.spotify.com/v1/playlists/' + playlistID + '/tracks';
    obj.headers['Authorization'] = 'Bearer ' + tokenArr[2];
    let res = await axios(obj).catch(function(error) {
      return console.log(error);
    });
    if(res == null){
      return [tokenArr, null];
    }
    let items = res.data.items;
    while(res.data.next != null){
      obj.url = res.data.next;
      res = await axios(obj);
      items = items.concat(res.data.items);
    }
    let returnArr = [tokenArr, items];
    return returnArr;
  },
  tokenTest: async function(tokenArr){
    let newNow = Date.now() + 10;
    if(tokenArr[0] <= newNow){
      tokenArr = await getAccessToken(tokenArr[1]);
    }
    return tokenArr;
  }
}
