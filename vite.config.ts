import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';
export default defineConfig({base:'/unterrichtscockpit/',define:{__APP_VERSION__:JSON.stringify(process.env.npm_package_version??'0.7.0'),__BUILD_ID__:JSON.stringify(process.env.GITHUB_SHA?.slice(0,7)??'lokal')},plugins:[react(),VitePWA({registerType:'prompt',manifest:{name:'Unterrichtscockpit',short_name:'Cockpit',lang:'de',start_url:'./',scope:'./',display:'standalone',theme_color:'#233d60',background_color:'#f4f6fa',icons:[{src:'icons/cockpit.svg',sizes:'any',type:'image/svg+xml',purpose:'any'}]},workbox:{navigateFallback:'index.html',maximumFileSizeToCacheInBytes:12*1024*1024,globPatterns:['**/*.{js,css,html,svg,png,webmanifest,mjs,wasm,gz}']}})]});
