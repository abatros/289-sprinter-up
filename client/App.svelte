<script>

import router, { curRoute, projects } from './router.js';
import RouterLink from './router-link.svelte';
import { onMount } from 'svelte';


onMount(() => {
  curRoute.set(window.location.pathname);

  if (!history.state) {
    window.history.replaceState({path: window.location.pathname}, '',   window.location.href)
  }

  Meteor.call('get-projects-list',(err,data)=>{
		if (err) throw 'fatal@63';
		console.log(`projects listing App.svelte@17: `,data)
//		const {loops, job} = data;
//		const {name, lastModified} = job;
//		console.log(`nloops:${loops.length}`,{job})
//		sprinter_data = data;
    projects.set(data)
	})


})

// ---------------------------------------------------------------------------

function handlerBackNavigation(event){
  curRoute.set(event.state.path)}

</script>


<style media="screen">
h3, h2 {
  text-align:center;
  color: brown;
  margin: 5px;
}
h5 {
	margin-collapse:collapse;
  margin: 5px;
  text-align:center;
  color: brown;
}

:global(body) {
  background-color: rgb(200,200,200)
}

:global(h1) {
  text-align:center;
  color: brown;
  margin: 14px;
  margin-collapse:collapse;
  font-size:14pt;
}

</style>


<svelte:window on:popstate={handlerBackNavigation} />

<!--
<div class="">
  <RouterLink page={{path: '/welcome', name: 'Welcome'}} />
  <RouterLink page={{path: '/about', name: 'About'}} />
</div>
-->

<vbox id="pageContent" class="container qc">
  <svelte:component this={router[$curRoute]} />
</vbox>

<!--
<div id="pageContent">
  <svelte:component this={router[$curRoute]} />
</div>
-->
