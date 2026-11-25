export type PdfTextChunk={items:unknown[];styles:Record<string,unknown>;lang:string|null};
type ReaderStream<T extends PdfTextChunk>={getReader:()=>{read:()=>Promise<{done:boolean;value?:T}>;releaseLock:()=>void}};

/** Consume the PDF.js stream through its reader API for Safari versions without async stream iteration. */
export async function collectPdfTextContent<T extends PdfTextChunk>(stream:ReaderStream<T>):Promise<T>{
 const reader=stream.getReader();const content={items:[],styles:{},lang:null} as unknown as T;
 try{
  while(true){const {value,done}=await reader.read();if(done)break;if(!value)continue;content.lang??=value.lang;Object.assign(content.styles,value.styles);content.items.push(...value.items);}
  return content;
 }finally{reader.releaseLock();}
}
