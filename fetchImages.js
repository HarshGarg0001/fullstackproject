const https = require('https');

https.get('https://unsplash.com/s/photos/wedding-venue', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = data.match(/"id":"([a-zA-Z0-9\-_]{11})"/g);
    if (matches) {
      const ids = Array.from(new Set(matches.map(m => m.slice(6, -1))));
      console.log(JSON.stringify(ids));
    } else {
      console.log('no match');
    }
  });
});
