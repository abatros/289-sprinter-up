<script>
import RouterLink from './router-link.svelte';
import {curRoute, projects, projectName} from './router.js';
import Modal2 from './Modal2.svelte';
import Modal3 from './Modal3.svelte';
import MainMenu from './top-navbar.svelte'
import Nav_link from './nav-link.svelte';

function onChange(e) {
  console.log(e.target.value)
}
function everyKeyUp(e) {
//  console.log(`input`,e.target.value)
//  console.log(`input`,e)
  err_message = ''
  if (e.keyCode == 13) {
    // process the PIN number:
    const retv = validate_pin_number(e.target.value)
    if (retv.error) {
      pin_Code = ''
      prompt = 're-enter your PIN number'
      err_message = 'invalid PIN number'
    }
    else {
      prompt ='';
      err_message = 'success'
      err_message = `success : welcome back ${retv.name}`
      registered_user = retv;
    }
  }
}

function validate_pin_number(pn) {
  if (pn != '9999') {
    return {error:'invalid-pin-number'}
  }

  const retv = {name:'lekky2.0'};
  localStorage.setItem('registered-user', retv);
  return retv
}


let pin_Code;
let prompt = 'Enter your PIN number';
let err_message = ''
let registered_user = null
</script>


<style>

</style>




<MainMenu/>

<vbox class="qc" style="margin-top:100px;">
  <p>{prompt}</p>
  <input
    style="width:60px; font-size:16pt; font-family=monospace"
    type="text" name=""
    bind:value={pin_Code}
    on:change={onChange}
    on:keyup={everyKeyUp}
    >
  <p>{err_message}</p>
  {#if (registered_user)}
    <Nav_link page={'/projects'}>projects</Nav_link>
  {/if}
</vbox>
