import {defineConfig} from '@playwright/test';
const localChromium=process.env.PW_CHROMIUM_EXECUTABLE_PATH;
export default defineConfig({testDir:'e2e',use:{baseURL:'http://localhost:4173/unterrichtscockpit/'},webServer:{command:'npm run preview -- --host localhost',url:'http://localhost:4173/unterrichtscockpit/'},projects:[{name:'chromium',use:{browserName:'chromium',...(localChromium?{launchOptions:{executablePath:localChromium}}:{})}},{name:'webkit',use:{browserName:'webkit'}}]});
