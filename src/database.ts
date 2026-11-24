import Dexie,{type Table} from 'dexie';
import {type LessonPlan,type LessonSession,type LessonNote,type Attachment,type AudioRecording,type Settings,planSchema,defaults} from './models';
export class Database extends Dexie {plans!:Table<LessonPlan,string>;sessions!:Table<LessonSession,string>;notes!:Table<LessonNote,string>;attachments!:Table<Attachment,string>;audio!:Table<AudioRecording,string>;settings!:Table<Settings,string>;locks!:Table<{id:string;sessionId:string},string>;constructor(name='unterrichtscockpit-v1'){super(name);this.version(1).stores({plans:'id,title,updatedAt',sessions:'id,planId,status',notes:'id,ownerId',attachments:'id',audio:'id,sessionId',settings:'id',locks:'id'});}}
export const db=new Database();
export async function savePlan(plan:LessonPlan,database=db){await database.plans.put(planSchema.parse(plan));}
export async function initialize(database=db){await database.transaction('rw',database.settings,async()=>{if(!await database.settings.get('settings'))await database.settings.add(defaults);});}
