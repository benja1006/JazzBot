const open = require('open');
const axios = require('axios').default;
axios.get('https://accounts.spotify.com/authorize', {
  params: {
    client_id: '53b1db6aceab4b3d875fafbe5208ff8d',
    response_type: 'code',
    redirect_uri: 'https://example.com/callback',
  }
}).then(res => {
  open(res.request.res.responseUrl);
});
