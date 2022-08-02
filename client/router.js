import Welcome from './welcome.svelte';
import About from './about.svelte';
import Projects from './projects.svelte';
import Jobs from './jobs.svelte';
import Sprinter_data from './sprinter-data.svelte'
import Admin from './admin.svelte';
import Register from './register.svelte';
import Loops from './loops.svelte';

import { writable } from 'svelte/store';

const router = {
  '/': Welcome,
  '/welcome': Welcome,
  '/about': About,
  '/projects': Projects,
  '/jobs': Jobs,
  '/sprinter-data': Sprinter_data,
  '/admin': Admin,
  '/register': Register,
  '/loops': Loops,
}

export default router;
export const curRoute = writable('/welcome');
export let page = {path: '/welcome',name: 'Welcome'}


/**
        This could be in a separate file,
        but since router is called almost everywhere
        why not use it for projects-list
**/

export const projectName = writable('');
export const projects = writable([]);
export const sprinter_data = writable({xlsx2_raw:null, fileName:null, data:[]})
export const sprinter_ ={};

export const loops_data = writable([]); // all loops.
export const sdata_timeStamp = writable(null); // signal to rebuild sdata from loops_data

export const editRow_data = writable(null); // receive the row to edit


/*
export function redirectTo_(event){
  // change current router path
  curRoute.set(event.target.pathname);
  // push the path into web browser history API
  window.history.pushState({path: page.path}, '', window.location.origin + page.path);
}

export function redirectTo(pathname){
  // change current router path
  curRoute.set(pathname);
  console.log(`curRoute@42:`,curRoute)
  // push the path into web browser history API
  window.history.pushState({path: page.path}, '', window.location.origin + page.path);
}

export const goTo = function(pathname){
  // change current router path
  curRoute.set(pathname);
  // push the path into web browser history API
  window.history.pushState({path: page.path}, '', window.location.origin + page.path);
}
*/
