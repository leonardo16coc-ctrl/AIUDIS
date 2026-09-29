const fetch = globalThis.fetch;

async function test() {
  const urlString = "https://www.udio.com/songs/jnQ4atMCAqnD745CGMx1MD";
  try {
    const res = await fetch(urlString, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    if (res.ok) {
      const html = await res.text();
      
      const titleRegex = /\\"title\\"\s*:\s*\\"([^\\"]+)\\"/gi;
      let match;
      console.log("All title matches:");
      while ((match = titleRegex.exec(html)) !== null) {
        console.log("Found:", match[1]);
      }
      
      const artistRegex = /\\"artist\\"\s*:\s*\\"([^\\"]+)\\"/gi;
      console.log("\nAll artist matches:");
      while ((match = artistRegex.exec(html)) !== null) {
        console.log("Found:", match[1]);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

test();
