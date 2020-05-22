const axios = require('axios').default;
var obj = {
  url: 'https://api.spotify.com/v1/playlists/272GBqcvfT6AtiKiakE2mG/tracks',
  method: 'GET',
  headers: {
    'Authorization': '',
    'Content-Type': 'application/json'
  },
}
obj.headers['Authorization'] = 'Bearer ' + 'BQASPPyv0mfFw6Npgp8Ub0enphaiCAuOG56CCJa-pXJQaiv1EP4k0C3op2KNV0PPTo16Pw13Aipy7tEzlMjPNXRYbKq-0hDHn8UDsdHSPwyaxHkz5EspnqMSdhSleqEEwxFipNpxm9dUXeyW';
async function getSongs(obj){
  let res = await axios(obj);
  let items = res.data.items;
  while(res.data.next != null){
    obj.url = res.data.next;
    res = await axios(obj);
    items = items.concat(res.data.items);
  }
  return items;

}
return getSongs(obj).then(items => {
  for(i=0; i<items.length; i++){
    console.log(items[i].track.name);
  }
});
