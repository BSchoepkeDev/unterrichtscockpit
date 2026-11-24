import {mkdir,copyFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const assets=[
 ['node_modules/tesseract.js/dist/worker.min.js','public/ocr/tesseract.worker.min.js'],
 ['node_modules/tesseract.js-core/tesseract-core-lstm.wasm.js','public/ocr/tesseract-core-lstm.wasm.js'],
 ['node_modules/tesseract.js-core/tesseract-core-lstm.wasm','public/ocr/tesseract-core-lstm.wasm'],
 ['node_modules/@tesseract.js-data/deu/4.0.0/deu.traineddata.gz','public/tessdata/deu.traineddata.gz'],
];
for(const [source,target] of assets){const destination=resolve(root,target);await mkdir(dirname(destination),{recursive:true});await copyFile(resolve(root,source),destination);}
console.info('Lokale deutsche OCR-Ressourcen wurden aus den gesperrten npm-Abhängigkeiten vorbereitet.');
