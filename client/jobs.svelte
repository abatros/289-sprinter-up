<script>
import { onMount } from 'svelte';
import {writable} from 'svelte/store'
import assert from 'assert';

import RouterLink from './router-link.svelte';
import {projects, projectName, curRoute, sprinter_data, sprinter_} from './router.js';
import XLSX_file_input from './xlsx-file-input.svelte'

import MainMenu from './top-navbar.svelte';


export let sprinter ={};

$: {
  if(sprinter.job) {
    console.log(`autorun@9 job:${sprinter.job.name}`)
    sprinter_.jobName = sprinter.job.name
    sprinter_.data = sprinter.data
    console.log(`sprinter.data:`, sprinter.data)
  }
}

const jobs = new writable({dir:[], status:'no-data'})

onMount(function(){
  if (!$projectName) {
    curRoute.set('/projects');
    window.history.pushState({path: '/projects'}, '', window.location.origin + '/projects');
  }

  jobs.set({dir:[], status:'please wait....'})

  /*
          get-jobs : listing index of jobs.
          also check for locks :
              4334-${projectName}/${projectCode}-lock-lekky2.0
              => means "project in use", give RO access.
          4334-${projectName}/${projectCode}-main.yaml
              => project metadata, index (loop, fix points)
  */

  Meteor.call('get-jobs',$projectName, (err,data)=>{
    if (err) {
      jobs.set({dir:[], status:'System Error@32'})
      throw (err);
    }

    /*
            HERE: we could have partial result, ex: 1 sprinter file or meta-data.
            retv should indicate what is next, ex: next Key
            then get data from that Key,
            until no more Keys.
            That means we need to keep a list of spriinter files in cache or session.


            Another method would be to get metadata not-found, print message
            and reapply with option 'resync',
            metadata being resync and then we have the list
    */


    console.log(`list-jobs(${$projectName})`,{data}) //list of jobName.
    assert(Array.isArray(data))
    data.forEach(job =>{
      const {Key, LastModified, Size} = job;
      job.shortName = Key.split('/')[2];
      const regex1 = /^.*\-([0-9]+)\.json/
      // then extract %d.json
      const match = job.shortName.match(regex1)
//      console.log(`match1:`,match[1])
      job.ptNo = +match[1]
      // if NOT a number ALERT
//      console.log(job)
    })
    data.sort((a,b)=>(a.ptNo - b.ptNo))
    jobs.set({dir:data, status:'Ok'})
  })


})

// -----------------------------------------------------------------------------

//let jobName;

function goto_job(e,j) {
  console.log(`select job[${j}]:`,$jobs.dir[j])

  /*
        register the job in router.js
        to communicate with /sprinter_data
  */
  sprinter_.shortName = $jobs.dir[j].shortName;
  sprinter_.data = null; // IMPORTANT

  //  redirectTo('upload');
  const nextp = '/sprinter-data'
  curRoute.set(nextp);
  window.history.pushState({path: nextp}, '', window.location.origin + nextp);
//  jobName.set(job.data[j])
}



</script>


<style>

h3, h2 {
  text-align:center;
  color: brown;
}
h5 {
	margin-collapse:collapse;
	margin-top: -10px;
  text-align:center;
  color: brown;
}

.pointer {
  cursor:pointer;
}

hbox.job:hover {
  background-color:rgb(210,210,210);
}


</style>

<MainMenu />
<h1>{$projectName}</h1>

<vbox class="ql" style="width:90%;background-color: rgb(195,195,195); padding:10pt;">
<h5>Jobs List</h5>

{#each $jobs.dir as job,j}

<hbox class="qj job" style="width:99%;padding:0 8px;">
<span>{job.shortName}</span>
<div class="pointer" on:click={(e)=>{goto_job(e,j)}}>[ edit ]</div>
</hbox>


{:else}
Connecting...
{/each}
</vbox>





<hbox class="qc" style="width:600pt; margin:10px; padding:10pt; background-color:darkgray;">
  <vbox class="qc">
    <hbox>ADD NEW FILE</hbox>
    <XLSX_file_input bind:sprinter />
  </vbox>
</hbox>



{#if sprinter.job?.name}

<RouterLink page={{path:'/sprinter-data', name:"Check Data"}} />

<button type="button" name="Upload">Upload To Server</button>

{/if}



<vbox>
</vbox>
