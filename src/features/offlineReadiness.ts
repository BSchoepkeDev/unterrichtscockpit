const baseUrl = import.meta.env.BASE_URL;

const requiredOfflineFiles = [
  'index.html',
  'manifest.webmanifest',
  'icons/cockpit.svg',
  'tessdata/deu.traineddata.gz',
  'ocr/tesseract.worker.min.js',
  'ocr/tesseract-core-lstm.wasm',
  'ocr/tesseract-core-lstm.wasm.js',
  'ocr/tesseract-core-simd-lstm.wasm',
  'ocr/tesseract-core-simd-lstm.wasm.js',
];

/** Confirms that Workbox has installed this app's shell, current entry assets and local OCR files. */
export async function verifyOfflineReadiness(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('caches' in window)) return false;

  try {
    const cacheNames = (await caches.keys()).filter(name => name.startsWith('workbox-precache'));
    if (cacheNames.length === 0) return false;

    const files = [
      ...requiredOfflineFiles,
      ...Array.from(document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>('script[src], link[rel="stylesheet"][href]'))
        .map(element => element instanceof HTMLScriptElement ? element.src : element.href)
        .filter(url => url.startsWith(location.origin + baseUrl))
        .map(url => new URL(url).pathname.slice(new URL(baseUrl, location.origin).pathname.length)),
    ];
    const uniqueFiles = [...new Set(files)];

    return await Promise.all(uniqueFiles.map(async file => {
      const request = new URL(file, new URL(baseUrl, location.origin)).href;
      for (const name of cacheNames) {
        const cache = await caches.open(name);
        if (await cache.match(request, {ignoreSearch: true})) return true;
      }
      return false;
    })).then(results => results.every(Boolean));
  } catch {
    return false;
  }
}
