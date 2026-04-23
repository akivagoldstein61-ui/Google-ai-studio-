import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:3000/api/ai/daily-picks-intro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userProfile: {} })
  });
  console.log('Status', res.status);
  console.log('Content-Type', res.headers.get('content-type'));
  
  const text = await res.text();
  console.log('Body', text.substring(0, 100));
}
test();
