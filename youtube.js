const axios = require('axios');
require('dotenv').config();
const YTKey = process.env.YTKEY;
module.exports = {
  lookup: function(name, artist){
    // axios.get('https://www.googleapis.com/youtube/v3/search', {
    //   params: {
    //     key: YTKey,
    //     part: 'snippet',
    //     maxResults: 1,
    //     q: name + ' by ' + artist,
    //     type: 'video',
    //     videoCatagoryId: '10'
    //   }
    // }).then(res => {
    //   console.log(res);
    //   let items = res.data.items;
    //   console.log(items[0].snippet.title);
    //   return items[0];
    // });
    let items = {
      kind: 'youtube#searchResult',
      etag: 'etag',
      id: {
        kind: 'video',
        videoId: 'dQw4w9WgXcQ',
        channelId: 'channelId',
        playlistId: 'playlistId'
      },
      snippet: {
        publishedAt: 'time',
        channelId: 'channelId',
        title: 'title',
        description: 'description',
        thumbnails: {
          key: {
            someshit: 'damn'
          }
        },
        channelTitle: 'string',
        liveBroadcastContent: false
      }
    }
    return items;
  },
}
