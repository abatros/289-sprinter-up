<script>
import { onMount } from 'svelte';

//export let sprinter
import {projects, projectName, curRoute, sprinter_data, sprinter_} from './router.js';
import RouterLink from './router-link.svelte';
import Sprinter_data_edit from './sprinter-data-edit.svelte'
import MainMenu from './top-navbar.svelte';

onMount(function(){
  console.log(`onMount - shortName: ${sprinter_.shortName}`,{sprinter_})

  if (!$projectName) {
    curRoute.set('/projects');
    window.history.pushState({path: '/projects'}, '', window.location.origin + '/projects');
  }

  console.log(`sprinter.data@18:`, sprinter_.data)

  /**
          Expect to get data, when loading a file.
          IF data empty, try to load from s3.
  **/

  if (sprinter_.data) {
    console.log(`sprinter_data is ready`,sprinter_.data)
    return;
  }


  /*
        Operates always on same Bucket
        sprinter_.shortName fully qualify to get data
        The server will compute the Key to use.
  */

  console.log('reloading sprinter data from S3',sprinter_.shortName)
  const jobName = `${$projectName}/${sprinter_.shortName}`; // .JSON
  Meteor.call('get-job-data', jobName, (err, job)=>{
    if (err) throw err;

    console.log(`@40`, job)
    console.log(`@41`, job.data)
    sprinter_.data = job.data;

//    console.log(`@41`,{sprinter_})
  })


})


function upload_data() {
  sprinter_.project = $projectName;
  console.log(`Upload-DATA:`,sprinter_);
  sprinter_.data.forEach((row,i) =>{
    //console.log(`${i+1} ptNo:[${row.fw.ptNo}] active:${row.active} [${row.fw.sid}]`)
  })

  Meteor.call('upload-sprinter-data',sprinter_,(err,retv)=>{
    console.log(`upload-sprinter-data`,{retv})
    // update GUI and re-route
  })

}


</script>


<vbox>

  <MainMenu/>
  <h1>{$projectName}</h1>

  <h5>jobName : {sprinter_.shortName}</h5>
  {#if sprinter_.data  && sprinter_.data.length >0}

  <h4>data set [{sprinter_.data[0].fw.ptNo}:{sprinter_.data[sprinter_.data.length-1].bw.ptNo}] &mdash; from : {sprinter_.jobName}</h4>
  <Sprinter_data_edit />

  {:else}
    Connecting...

  {/if}



  <vbox style="margin: 30pt; padding: 10pt; border: 4px solid lightblue; width: 80%;">
    <hbox>
      <button type="button" name="button"
        on:click={(e)=>upload_data()}
      >Upload DATA</button>
    </hbox>
  </vbox>


</vbox>
