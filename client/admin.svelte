<script>
import RouterLink from './router-link.svelte';
import {curRoute, projects, projectName} from './router.js';
import Modal2 from './Modal2.svelte';
import Modal3 from './Modal3.svelte';
import MainMenu from './top-navbar.svelte'

/*
https://stackoverflow.com/questions/58110067/passing-onclick-event-into-dynamically-created-sveltecomponent
*/
const instances =[];


function redirectTo(pathname){
  // change current router path
  curRoute.set(pathname);
//  console.log(`curRoute@42:`,curRoute)
  // push the path into web browser history API


  console.log(`redirectTo@33`,{page});
  window.history.pushState({path: page.path}, '', window.location.origin + page.path);
}

let isOpenModal = false;
let endp_Modal = ''


function closeModal() {
  _etime = new Date().getTime();
  console.log(`closing@25 Modal2 @${new Date().getTime()%10000000} `,{endp_Modal})
  if (isNaN(endp_Modal.gps_elevation)) {
    console.log(`Modal2 returning gps_elevation as NaN <${endp_Modal.gps_elevation}> fixing..`)
    endp_Modal.gps_elevation = +endp_Modal.gps_elevation;
//		 if (isNaN(endp_Modal.gps_elevation)) throw 'fatal@29'
  }
  isOpenModal = false;
  /**
  // Update either startp or endp
  **/

/*
  mk_Adjustment(loop)
  fix_loop(loop)
  console.log(`endp@52 loop.endp.gps_elevation:${loop.endp.gps_elevation}`)
  console.log(`endp@52 loop.endp.gps_elevation:${loop.endp.gps_elevation_}`)
  console.log(`endp@52 endp.gps_elevation:${endp.gps_elevation}`)
  console.log(`endp@52 endp.gps_elevation:${endp.gps_elevation_}`)
*/

//	 endp = loop.endp
  if (true) {
    console.log(`closing@58 Modal2 @[${new Date().getTime()%10000000}]`)
//    loop = loop; // IMPERATIF TO TRIGGER DOM REFRESH
  }
}

function openModal() {
  isOpenModal = true;
  modal_create_project.message ='';
}

const modal_create_project ={message:''}

function xapply() {
  modal_create_project.message ='talking to server - please wait...';
  console.log(`xapply <${new_projectName}>`)
  Meteor.call('create-project',{name:new_projectName}, (err,retv)=>{
    if (err) {
      modal_create_project.message = 'system-error@68';
      return;
    }
    console.log({retv})
    modal_create_project.message = retv.error || '';
  })
}

function xcloseModal() {
  console.log(`xcloseModal`)
  isOpenModal = false;
}

let new_projectName;
let new_project_error ='';

// --------------------------------------------------------------------------

const admin_p1_modal ={
  isOpen: false,
  open: (projectName)=>{
    console.log('admin_p1_modal.open');
    admin_p1_modal.isOpen = true;
    admin_p1_modal.projectName = projectName;
  }
}


// --------------------------------------------------------------------------

function reroute_upload(e,j) {
    console.log(`select project[${j}]:${$projects[j]}`)
  //  redirectTo('upload');
    const nextp = '/jobs'
    curRoute.set(nextp);
    window.history.pushState({path: nextp}, '', window.location.origin + nextp);
    projectName.set($projects[j])
}

</script>


<style>
h1 {color: purple;}
hbox {
  margin:2px;
  padding:2px;
  border: 0px solid rgba(165, 42, 42, 0.5);
  cursor: pointer;
  width:80%;
}
</style>

<MainMenu/>

<h1>{$projectName}</h1>


<vbox class="ql" style="width:80%;">


  {#each $projects as project, j}
  <hbox class="qj"
    bind:this={instances[j]}
    on:click={e => reroute_upload(e,j)}
  >
  <span>{project}</span>
  <div on:click={()=>{admin_p1_modal.open(project)}}>[admin]</div>
  </hbox>
  {/each}

<hbox style="margin-top:30px;"
  on:click={openModal}>
[create new project]
</hbox>

</vbox>


<Modal3 isOpenModal={isOpenModal} endp={endp_Modal} on:closeModal={closeModal}>
  Create a new project
  <input type="text" bind:value={new_projectName}
    style="font-size:16pt; width:90%; margin-top:5px;">
  <hbox class="qj" style="width:100%;margin-top:30pt;">
    <button on:click={xcloseModal}>Quit</button>
    <button on:click={xapply}>Apply</button>
  </hbox>
  <p>{modal_create_project.message}</p>
</Modal3>



<Modal3 isOpenModal={admin_p1_modal.isOpen} endp={endp_Modal} on:closeModal={closeModal}>
  {admin_p1_modal.projectName}
  <input type="text" bind:value={new_projectName}
    style="font-size:16pt; width:90%; margin-top:5px;">
  <hbox class="qj" style="width:100%;margin-top:30pt;">
    <button on:click={xcloseModal}>Quit</button>
    <button on:click={xapply}>Apply</button>
  </hbox>
  <p>{modal_create_project.message}</p>
</Modal3>
