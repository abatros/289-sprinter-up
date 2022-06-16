<script>
import RouterLink from './router-link.svelte';
//import {} from './router-link.svelte';
import {curRoute, projects, projectName} from './router.js';
import MainMenu from './top-navbar.svelte';

$: {
  console.log(`reactive@6:`,$projects)
}


/*
https://stackoverflow.com/questions/58110067/passing-onclick-event-into-dynamically-created-sveltecomponent
*/

const instances =[];

function click(e,j) {
  console.log(`select project[${j}]:${$projects[j]}`)
//  redirectTo('upload');
  const next_path = '/jobs'
  curRoute.set(next_path);
  window.history.pushState({path: next_path}, '', window.location.origin + next_path);
  projectName.set($projects[j])
}

function redirectTo(pathname){
  // change current router path
  curRoute.set(pathname);
//  console.log(`curRoute@42:`,curRoute)
  // push the path into web browser history API


  console.log(`redirectTo@33`,{page});
  window.history.pushState({path: page.path}, '', window.location.origin + page.path);
}


</script>


<style>
h1 {color: purple;}
hbox {
  margin:10px;
  padding:10px;
  border: 3px solid rgba(165, 42, 42, 0.5);
  cursor: pointer;
}
</style>

<MainMenu/>

<h1>Select your project</h1>

<vbox>

{#each $projects as project, j}
<hbox
  bind:this={instances[j]}
  on:click={e => click(e,j)}
>
{project}
</hbox>
{:else}
  Connecting...
{/each}

</vbox>
