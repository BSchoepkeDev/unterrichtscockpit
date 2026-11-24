import {emptyItem,newPlan} from './lessonRepository';
import type {LessonItem,LessonPlan} from '../models';

export type ImportWarning={id:string;message:string;page?:number;source:string};
export type ExtractedPage={page:number;text:string;ocr:boolean;layout?:'columns'|'rows'};
export type ImportResult={plan:LessonPlan;warnings:ImportWarning[];pages:ExtractedPage[];unassigned:string[]};
export type PositionedText={text:string;x:number;y:number;width:number};
export function orderPdfTextItems(items:PositionedText[],pageWidth:number):{text:string;layout:'columns'|'rows'}{
 const sorted=items.filter(i=>i.text.trim()).slice().sort((a,b)=>a.x-b.x);let splitAt:number|undefined;let widest=32;
 for(let i=0;i<sorted.length-1;i++){const left=sorted[i],right=sorted[i+1],gap=right.x-(left.x+left.width),center=(right.x+left.x+left.width)/2;if(gap>widest&&center>pageWidth*.28&&center<pageWidth*.72){widest=gap;splitAt=right.x;}}
 if(splitAt!==undefined){const boundary=splitAt;if(sorted.filter(i=>i.x<boundary).length<2||sorted.filter(i=>i.x>=boundary).length<2)splitAt=undefined;}
 const makeLines=(group:PositionedText[])=>{const rows:Array<{y:number;items:PositionedText[]}>=[];for(const item of group.sort((a,b)=>b.y-a.y||a.x-b.x)){let row=rows.find(r=>Math.abs(r.y-item.y)<=3);if(!row){row={y:item.y,items:[]};rows.push(row);}row.items.push(item);}return rows.sort((a,b)=>b.y-a.y).map(row=>{const line=row.items.sort((a,b)=>a.x-b.x);return line.reduce((text,item,index)=>{if(index===0)return item.text;const previous=line[index-1],separator=item.x-(previous.x+previous.width)>18?'\t':' ';return text+separator+item.text;},'');});};
 if(splitAt!==undefined){const boundary=splitAt;const left=makeLines(sorted.filter(i=>i.x<boundary)),right=makeLines(sorted.filter(i=>i.x>=boundary));return{text:[left.join('\n'),right.join('\n')].filter(Boolean).join('\n'),layout:'columns'};}
 return{text:makeLines(sorted).join('\n'),layout:'rows'};
}

const timeRange=/\b([01]?\d|2[0-3]):([0-5]\d)\s*(?:-|–|—|bis)\s*([01]?\d|2[0-3]):([0-5]\d)\b/i;
const minuteRange=/\b(\d{1,3})\s*(?:-|–|—|bis)\s*(\d{1,3})\s*(?:min(?:uten)?\.?|')/i;
const duration=/\b(?:ca\.?\s*)?(\d{1,3})\s*(?:min(?:uten)?\.?|')\b/i;
type ParsedTextField='assignment'|'materials'|'teacherActivity'|'studentActivity'|'teacherNotes'|'socialForm'|'method'|'summary'|'description'|'phase'|'notes';
const labelMap:Record<string,ParsedTextField>={
  'arbeitsauftrag':'assignment','auftrag':'assignment','material':'materials','materialien':'materials','lehreraktivität':'teacherActivity','lehrkraft':'teacherActivity','schüleraktivität':'studentActivity','lernende':'studentActivity','lehrerhinweise':'teacherNotes','hinweise':'teacherNotes','sozialform':'socialForm','methode':'method','ziel':'summary','ziele':'summary','inhalt':'description','beschreibung':'description','phase':'phase','unterrichtsphase':'phase','notizen':'notes'
};
const tableField:Record<string,ParsedTextField|'title'|'duration'|'start'|'end'>={
 'titel':'title','unterrichtspunkt':'title','punkt':'title','thema':'title','schritt':'title','zeit':'duration','uhrzeit':'duration','dauer':'duration','geplante dauer':'duration','beginn':'start','geplanter beginn':'start','start':'start','startzeit':'start','von':'start','ende':'end','geplantes ende':'end','endzeit':'end','bis':'end','phase':'phase','unterrichtsphase':'phase','arbeitsauftrag':'assignment','auftrag':'assignment','material':'materials','materialien':'materials','lehreraktivität':'teacherActivity','schüleraktivität':'studentActivity','lehrerhinweise':'teacherNotes','hinweise':'teacherNotes','sozialform':'socialForm','methode':'method','inhalt':'description','beschreibung':'description','ziel':'summary','ziele':'summary','notizen':'notes'
};
type TableColumn=ParsedTextField|'title'|'duration'|'start'|'end';
type PlanTextField='subject'|'topic'|'group'|'grade'|'date'|'goals'|'competencies';
const planField:Record<string,PlanTextField>={'fach':'subject','thema':'topic','lerngruppe':'group','gruppe':'group','klasse':'group','klassenstufe':'grade','datum':'date','unterrichtsdatum':'date','unterrichtsziele':'goals','lernziele':'goals','ziele':'goals','kompetenzen':'competencies'};
const normalizeLabel=(value:string)=>value.toLocaleLowerCase('de').replace(/[:*\s]+$/,'').trim();
export function parseGermanDuration(raw:string):{seconds?:number;warning?:string;start?:string;end?:string}{
 const range=raw.match(timeRange);if(range){const start=`${range[1].padStart(2,'0')}:${range[2]}`,end=`${range[3].padStart(2,'0')}:${range[4]}`;const a=Number(range[1])*60+Number(range[2]),b=Number(range[3])*60+Number(range[4]);const d=b-a;if(d<0)return{start,end,warning:'Uhrzeitfenster über Mitternacht ist mehrdeutig.'};return{start,end,seconds:d*60};}
 const minutes=raw.match(minuteRange);if(minutes){const d=Number(minutes[2])-Number(minutes[1]);if(d<0)return{warning:'Zeitspanne endet vor ihrem Beginn.'};return{seconds:d*60};}
 const normalized=raw.replace(/^\s*\d+[.)]\s*/,'').replace(/phase\s*[\divx]+/ig,'');if((normalized.match(/\d{1,3}/g)?.length??0)>1&&/(?:min|\d{1,2}:\d{2})/i.test(normalized))return{warning:'Mehrere Zahlen in der Zeitangabe sind nicht eindeutig zuzuordnen.'};
 const simple=raw.match(duration);if(simple){const seconds=Number(simple[1])*60;return /\bca\.?\s*/i.test(raw)?{seconds,warning:'Die Zeitangabe ist als ungefähr markiert. Bitte Dauer prüfen.'}:{seconds};}
 if(/\d/.test(raw)&&/(?:min|\d{1,2}:\d{2})/i.test(raw))return{warning:'Zeitangabe konnte nicht eindeutig gelesen werden.'};return{};
}
function freshItem(planId:string,order:number,title:string):LessonItem{return{...emptyItem(planId,order),title,sourceText:''};}
function lineIsHeading(s:string){return /^(?:#{1,4}\s+|(?:phase|schritt|abschnitt|unterrichtsphase)\s*[\divx.:-]*\s*[:–-]?\s*\S|\d+[.)]\s+\S|[•▪●]\s*\S)/i.test(s);}
function cleanTitle(s:string){let title=s.replace(/^#{1,4}\s*/,'').replace(/^(?:[•▪●]|\d+[.)])\s*/,'').trim();const phase=title.match(/^phase\s*[\divx.:-]*\s*[:–-]\s*(.+)$/i);if(phase)title=phase[1].trim();return title.replace(/\s*[·,–-]?\s*(?:ca\.?\s*)?\d{1,3}\s*(?:min(?:uten)?\.?|')\s*$/i,'').trim();}
export function parseLessonText(input:string,fileName='Unterrichtsplan'):ImportResult{
 const plan=newPlan();plan.title=fileName.replace(/\.(pdf|txt|md|csv)$/i,'').trim()||'Importierter Unterrichtsplan';
 const warnings:ImportWarning[]=[],unassigned:string[]=[];const lines=input.replace(/\r/g,'').split('\n');let current:LessonItem|undefined;let recognizedDuration:number|undefined;let columns:Array<TableColumn|undefined>|undefined;
 const startItem=(title:string)=>{current=freshItem(plan.id,plan.items.length,title);plan.items.push(current);};
 for(const raw of lines){const line=raw.trim();if(!line)continue;
  if(/^#\s+/.test(line)&&!plan.items.length){plan.title=line.replace(/^#\s+/,'').trim()||plan.title;continue;}
  const cells=(/\.csv$/i.test(fileName)?line.split(','):line.split(/\s*\|\s*|\t+|\s{3,}/)).map(c=>c.trim().replace(/^"|"$/g,'')).filter(Boolean);
  if(cells.length>1){const mapped=cells.map(c=>tableField[normalizeLabel(c)]);if(mapped.filter(Boolean).length>=2&&mapped.some(x=>x==='title'||x==='phase')&&mapped.some(x=>x==='duration'||x==='assignment'||x==='description'||x==='materials')){columns=mapped;continue;}}
  if(columns&&cells.length>1){
    const get=(type:TableColumn)=>cells[columns!.findIndex(x=>x===type)]?.trim()??'';const title=get('title')||get('phase')||cells[0];startItem(title);current!.sourceText=line;
    for(let i=0;i<cells.length;i++){const value=cells[i],fieldName=columns[i];if(!value||!fieldName)continue;if(fieldName==='title')continue;if(fieldName==='duration'){const parsed=parseGermanDuration(value);if(parsed.seconds!==undefined){current!.durationSeconds=parsed.seconds;recognizedDuration=(recognizedDuration??0)+parsed.seconds;if(parsed.start)current!.plannedStart=parsed.start;if(parsed.end)current!.plannedEnd=parsed.end;}if(parsed.warning)warnings.push({id:crypto.randomUUID(),message:parsed.warning,source:value});continue;}if(fieldName==='start'||fieldName==='end'){if(/^([01]?\d|2[0-3]):[0-5]\d$/.test(value))current![fieldName==='start'?'plannedStart':'plannedEnd']=value;else warnings.push({id:crypto.randomUUID(),message:'Uhrzeit bitte als HH:MM prüfen.',source:value});continue;}if(fieldName==='phase'&&title===value)continue;current![fieldName]=value;}
    if(!current!.durationSeconds&&current!.plannedStart&&current!.plannedEnd){const parsed=parseGermanDuration(`${current!.plannedStart}–${current!.plannedEnd}`);if(parsed.seconds!==undefined){current!.durationSeconds=parsed.seconds;recognizedDuration=(recognizedDuration??0)+parsed.seconds;}}
    continue;
  }
  if(cells.length>1&&/^(?:zeit|dauer|phase|inhalt|thema|arbeitsauftrag|material)/i.test(cells[0]))continue;
  if(lineIsHeading(line)){const title=cleanTitle(line);startItem(title);const phase=line.match(/^phase\s*[\divx.:-]*\s*[:–-]\s*(.+)$/i);if(phase)current!.phase=cleanTitle(phase[1]);current!.sourceText=line;const parsed=parseGermanDuration(line);if(parsed.seconds!==undefined){current!.durationSeconds=parsed.seconds;recognizedDuration=(recognizedDuration??0)+parsed.seconds;}if(parsed.start)current!.plannedStart=parsed.start;if(parsed.end)current!.plannedEnd=parsed.end;if(parsed.warning)warnings.push({id:crypto.randomUUID(),message:parsed.warning,source:line});continue;}
  if(cells.length>1&&current){
    const parsed=parseGermanDuration(cells[0]);if(parsed.seconds!==undefined){current.durationSeconds=parsed.seconds;recognizedDuration=(recognizedDuration??0)+parsed.seconds;if(parsed.start)current.plannedStart=parsed.start;if(parsed.end)current.plannedEnd=parsed.end;}
    if(parsed.warning)warnings.push({id:crypto.randomUUID(),message:parsed.warning,source:cells[0]});
    const content=cells.slice(1).join(' · ');current.description=[current.description,content].filter(Boolean).join('\n');current.sourceText=[current.sourceText,line].filter(Boolean).join('\n');continue;
  }
  const field=line.match(/^([^:：]{2,32})\s*[:：]\s*(.*)$/);
  if(field){const label=normalizeLabel(field[1]),value=field[2].trim(),planKey=planField[label],key=labelMap[label];if(label==='titel'||label==='unterrichtstitel'){if(value)plan.title=value;continue;}if(planKey){plan[planKey]=[String(plan[planKey]??''),value].filter(Boolean).join('\n');continue;}if(key&&current){current[key]=[String(current[key]??''),value].filter(Boolean).join('\n');current.sourceText=[current.sourceText,line].filter(Boolean).join('\n');continue;}}
  const parsed=parseGermanDuration(line);if(parsed.seconds!==undefined&&current&&!current.durationSeconds){current.durationSeconds=parsed.seconds;recognizedDuration=(recognizedDuration??0)+parsed.seconds;if(parsed.start)current.plannedStart=parsed.start;if(parsed.end)current.plannedEnd=parsed.end;if(parsed.warning)warnings.push({id:crypto.randomUUID(),message:parsed.warning,source:line});current.sourceText=[current.sourceText,line].filter(Boolean).join('\n');continue;}
  if(parsed.warning)warnings.push({id:crypto.randomUUID(),message:parsed.warning,source:line});
  if(current){current.description=[current.description,line].filter(Boolean).join('\n');current.sourceText=[current.sourceText,line].filter(Boolean).join('\n');}else unassigned.push(line);
 }
 plan.items=plan.items.map((item,index)=>({...item,order:index,description:item.description||item.summary||item.title}));
 if(!plan.items.length&&input.trim()){startItem('');current!.description=input.trim();current!.sourceText=input.trim();warnings.push({id:crypto.randomUUID(),message:'Keine sichere Punktstruktur erkannt. Der Text wurde vollständig als ein bearbeitbarer Punkt übernommen; ergänze vor dem Speichern einen Titel.',source:input.slice(0,180)});}
 const title=lines.find(l=>/^\s*#\s+/.test(l));if(title)plan.title=title.replace(/^\s*#\s+/,'').trim()||plan.title;
 if(recognizedDuration!==undefined)plan.durationSeconds=recognizedDuration;
 if(plan.items.some(i=>!i.title.trim()))warnings.push({id:crypto.randomUUID(),message:'Mindestens ein Punkt hat keinen eindeutigen Titel.',source:''});
 if(unassigned.length)plan.notes=`Nicht zugeordnete Quellinhalte (bitte prüfen):\n${unassigned.join('\n')}`;
 return{plan,warnings,pages:[{page:1,text:input,ocr:false}],unassigned};
}
export function applyPageText(pages:ExtractedPage[],fileName:string):ImportResult{
 const result=parseLessonText(pages.map(p=>`\n${p.text}`).join('\n'),fileName);result.pages=pages;
 result.plan.items=result.plan.items.map(item=>{const fragments=(item.sourceText??'').split('\n').map(x=>x.trim()).filter(x=>x.length>2);const sourcePages=pages.filter(page=>fragments.some(fragment=>page.text.includes(fragment))).map(page=>page.page);return sourcePages.length?{...item,sourcePages}:item;});
 for(const page of pages.filter(p=>p.ocr))result.warnings.unshift({id:crypto.randomUUID(),message:`OCR wurde auf Seite ${page.page} lokal ausgeführt. Prüfe das Ergebnis besonders sorgfältig.`,page:page.page,source:`Seite ${page.page}`});
 for(const page of pages.filter(p=>p.layout==='columns'))result.warnings.unshift({id:crypto.randomUUID(),message:`Mehrspaltiger Text auf Seite ${page.page} wurde spaltenweise geordnet. Prüfe Reihenfolge und Feldzuordnung.`,page:page.page,source:`Seite ${page.page}`});
 return result;
}
