async function getQRCode() {
  const response = await fetch(
    "https://gg-platform.github.io/?text=Hello%20World"
  );
  const html = await response.text();

  // Method 1: Extract from script tag (cleanest)
  const scriptMatch = html.match(
    /<script type="application\/json" id="api-response">(.*?)<\/script>/
  );
  const result = JSON.parse(scriptMatch[1]);
  const out = scriptMatch[1];
  console.log("QR Code Data URL (from script tag):", scriptMatch[1]);
}

getQRCode();
