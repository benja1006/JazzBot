const axios = require('axios');
require('dotenv').config();
const YTKey = process.env.YTKEY;
module.exports = {
  lookup: function(name, artist){
    axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: YTKey,
        part: 'snippet',
        maxResults: 1,
        q: name + ' by ' + artist,
        type: 'video',
        videoCatagoryId: '10'
      }
    }).then(res => {
      let items = res.data.items;
      return items[0];
    });
  },
}
