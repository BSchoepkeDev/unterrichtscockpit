import * as pdfjs from 'pdfjs-dist';
import {createWorker,OEM,PSM} from 'tesseract.js';
import {orderPdfTextItems,type ExtractedPage} from './importParser';

type Request={id:string;buffer:ArrayBuffer;name:string;base:string;ocr:boolean};
type Reply={id:string;type:'progress';progress:number;message:string}|{id:string;type:'done';pages:ExtractedPage[]}|{id:string;type:'error';message:string};
const scope=self as unknown as {postMessage:(message:Reply)=>void;onmessage:((event:MessageEvent<Request>)=>void)|null};
pdfjs.GlobalWorkerOptions.workerSrc=new URL('pdfjs-dist/build/pdf.worker.min.mjs',import.meta.url).toString();
function report(id:string,progress:number,message:string){scope.postMessage({id,type:'progress',progress,message} satisfies Reply);}
scope.onmessage=async(event:MessageEvent<Request>)=>{
 const {id,buffer,name,base,ocr}=event.data;let ocrWorker:Awaited<ReturnType<typeof createWorker>>|undefined;let loadingTask:pdfjs.PDFDocumentLoadingTask|undefined;
 try{
  if(!name.toLowerCase().endsWith('.pdf')){const text=new TextDecoder().decode(buffer);scope.postMessage({id,type:'done',pages:[{page:1,text,ocr:false}]} satisfies Reply);return;}
  loadingTask=pdfjs.getDocument({data:new Uint8Array(buffer),useSystemFonts:true});const pdf=await loadingTask.promise;if(pdf.numPages>120)throw new Error('Dieses PDF hat mehr als 120 Seiten. Teile es in kleinere Dateien, damit das iPad nicht überlastet wird.');const pages:ExtractedPage[]=[];
  for(let n=1;n<=pdf.numPages;n++){
   report(id,(n-1)/pdf.numPages,`PDF-Seite ${n} von ${pdf.numPages} wird gelesen`);
   const page=await pdf.getPage(n);const content=await page.getTextContent({includeMarkedContent:true});
   const entries=content.items.filter((x):x is typeof x & {str:string;transform:number[];width:number}=>'str' in x&&typeof x.str==='string').map(item=>({text:item.str,x:item.transform[4],y:item.transform[5],width:item.width}));
   const extracted=orderPdfTextItems(entries,page.getViewport({scale:1}).width);let text=extracted.text.trim();let layout=extracted.layout;let usedOcr=false;
   if(ocr&&text.replace(/\s/g,'').length<80){
    if(!ocrWorker){report(id,(n-.35)/pdf.numPages,'Deutsche OCR wird lokal gestartet');ocrWorker=await createWorker('deu',OEM.LSTM_ONLY,{workerPath:`${base}ocr/tesseract.worker.min.js`,corePath:`${base}ocr/tesseract-core-lstm.wasm.js`,langPath:`${base}tessdata`,gzip:true,logger:m=>report(id,(n-1+Math.min(1,m.progress||0)*.8)/pdf.numPages,'OCR: '+(m.status||'Verarbeitung'))});}
    const viewport=page.getViewport({scale:1.6});const canvas=new OffscreenCanvas(Math.ceil(viewport.width),Math.ceil(viewport.height));const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw new Error('Canvas für OCR konnte nicht angelegt werden.');
    await page.render({canvasContext:ctx as never,viewport,canvas:canvas as never}).promise;const result=await ocrWorker.recognize(canvas,{}) as {data:{text:string}};text=result.data.text.trim();usedOcr=true;
    canvas.width=1;canvas.height=1;
   }
   pages.push({page:n,text,ocr:usedOcr,layout:usedOcr?'rows':layout});page.cleanup();
   if(!text)report(id,n/pdf.numPages,`Seite ${n} enthält keine lesbare Textebene`);
  }
  if(ocrWorker)await ocrWorker.terminate();scope.postMessage({id,type:'done',pages} satisfies Reply);
 }catch(error){if(ocrWorker)await ocrWorker.terminate().catch(()=>undefined);const detail=error instanceof Error?error.message:'';let message='Das Dokument konnte lokal nicht vollständig verarbeitet werden. Prüfe Datei und verfügbaren Gerätespeicher.';if(/password|encrypted/i.test(detail))message='Das PDF ist passwortgeschützt und kann nicht importiert werden.';else if(/invalid pdf|pdf structure|header|format|xref|corrupt/i.test(detail))message='Das PDF ist beschädigt oder hat kein gültiges PDF-Format.';else if(/memory|allocate/i.test(detail))message='Für dieses Dokument ist nicht genügend Gerätespeicher verfügbar. Teile es in kleinere Dateien.';scope.postMessage({id,type:'error',message} satisfies Reply);}
 finally{if(loadingTask)await loadingTask.destroy().catch(()=>undefined);}
};
