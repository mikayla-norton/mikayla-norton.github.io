// spotify_monthly/update-top-track.js
if (!process.env.GITHUB_ACTIONS) {
  require('dotenv').config();
}
if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.REFRESH_TOKEN) {
  console.error('❌ Missing one of CLIENT_ID, CLIENT_SECRET or REFRESH_TOKEN!');
  process.exit(1);
}

const fs            = require('fs');
const path          = require('path');
const SpotifyWebApi = require('spotify-web-api-node');

const spotify = new SpotifyWebApi({
  clientId:     process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri:  process.env.REDIRECT_URI
});
spotify.setRefreshToken(process.env.REFRESH_TOKEN);

(async () => {
  // 1) refresh the token
  const { body } = await spotify.refreshAccessToken();
  spotify.setAccessToken(body.access_token);

  // 2) fetch your top track
  const top = await spotify.getMyTopTracks({
    time_range: 'short_term',
    limit:      1
  });
  const t = top.body.items[0];

  // 3) write top-track.json into the repo root
  const out = {
    id:      t.id,
    name:    t.name,
    artists: t.artists.map(a => a.name).join(', ')
  };
  const dest = path.join(__dirname, '..', 'top-track.json');
  fs.writeFileSync(dest, JSON.stringify(out, null, 2));
  console.log(`Wrote ${dest}`);
})();
