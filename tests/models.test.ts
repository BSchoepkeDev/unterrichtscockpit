import 'fake-indexeddb/auto';
import {test,expect} from 'vitest';
import {examples,exampleSessions} from '../src/fixtures';
import {planSchema} from '../src/models';
import {Database,initialize,savePlan} from '../src/database';
test('sieben gültige Beispielpläne',()=>{const plans=examples();expect(plans).toHaveLength(7);for(const p of plans)expect(planSchema.safeParse(p).success).toBe(true);});
test('inkonsistente Referenz wird abgelehnt',()=>{const p=examples()[0];p.items[0].planId=crypto.randomUUID();expect(planSchema.safeParse(p).success).toBe(false);});
test('Persistenz über Datenbank-Neuöffnung',async()=>{const name=crypto.randomUUID();const d=new Database(name);try{await initialize(d);const p=examples()[0];await savePlan(p,d);d.close();const reopened=new Database(name);expect(await reopened.plans.get(p.id)).toEqual(p);expect((await reopened.settings.get('settings'))?.redSeconds).toBe(180);reopened.close();}finally{await d.delete();}});
test('Beispieldurchführungen besitzen unabhängige Snapshots',()=>{const plans=examples();const sessions=exampleSessions(plans);expect(sessions).toHaveLength(2);expect(sessions[0].planId).toBe(plans[0].id);plans[0].items[0].title='Geändert';expect(sessions[0].snapshot.items[0].title).not.toBe('Geändert');expect(sessions[0].executions[0].sessionId).toBe(sessions[0].id);});
