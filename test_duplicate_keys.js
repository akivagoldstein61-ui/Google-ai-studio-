import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('two children')) {
      console.log('BROWSER LOG:', msg.text());
      const locs = msg.location();
      console.log('LOC:', locs);
      
      // print stack trace from the console message if available
      const stack = msg.stackTrace();
      if (stack && stack.length > 0) {
        console.log("STACK:");
        stack.forEach(f => {
          console.log(`  at ${f.url}:${f.lineNumber}:${f.columnNumber}`);
        });
      }
    }
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
