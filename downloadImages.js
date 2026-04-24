const fs = require('fs');
const path = require('path');
const https = require('https');

const publicDir = path.join(__dirname, 'frontend', 'public', 'images');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const unsplashIds = [
  '1519225421980-715cb0215aed', '1511285560929-80b456fea0bc', '1546198632-9ef6368bef12', '1469334031218-e382a71b716b', '1511795409834-ef04bbd61622',
  '1465495976277-4387d4b0a4c6', '1460364157752-9265554dea71', '1478146896925-0bf676010faa', '1520854221256-17456bf95006', '1505944270255-07bbf8664ecb',
  '1472653431158-6364773b2a56', '1459259191495-62ebbce014ef', '1482574041796-7c25cba48398', '1439779331575-cfeb23eb1b02', '1464366400600-71af99181330',
  '1508674516315-08e1dce1b5eb', '1522673607200-164d1f6ce486', '1490263636611-667087fc7270', '1504153093952-b8971f114c6e', '1515934751635-c81c6bc9a2d8'
];

let completed = 0;
unsplashIds.forEach((id, index) => {
  const hallIndex = Math.floor(index / 5) + 1;
  const imgIndex = (index % 5) + 1;
  const filename = `hall${hallIndex}_${imgIndex}.jpg`;
  const filepath = path.join(publicDir, filename);

  const url = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;
  
  https.get(url, (res) => {
    if (res.statusCode === 302 || res.statusCode === 301) {
      https.get(res.headers.location, (res2) => {
        const file = fs.createWriteStream(filepath);
        res2.pipe(file);
        res2.on('end', () => {
          completed++;
          if (completed === 20) console.log('All images downloaded successfully.');
        });
      });
    } else {
      const file = fs.createWriteStream(filepath);
      res.pipe(file);
      res.on('end', () => {
        completed++;
        if (completed === 20) console.log('All images downloaded successfully.');
      });
    }
  }).on('error', (err) => console.error('Error downloading', url, err));
});
