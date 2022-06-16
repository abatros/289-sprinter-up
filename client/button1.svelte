<script>
import { onMount } from 'svelte';
import {writable} from 'svelte/store'

export let action;
export let name;
export let tag;
export let group;

let button;
//let border_color = 'gray';
//let btn_class = 'inactive';
//let btn_class = new writable('inactive')
/*
      Button with a state ON/OFF
*/

onMount(function(){
  console.log(`onMount@8 `,{action},{name},{tag},{group})
  if (group) {
    group.list.push(button)
    console.log(`onMount@8 adding button (${group.list.length}):`, button)
    group.every_mount();
//    group.every_click();
  }
})


function click(){
  // for all buttons in the group , set OFF
  // set this one ON
  group.list.forEach((it,j) =>{
    //it.value = 'OFF';
    it.style.color='black'
    console.log(`--${j}`,it)
  })
  //button.value = "ON";
  button.style.color='brown'
  action();
}



</script>

<style>
  a {
    text-transform: uppercase;
    text-decoration: none;
    border: 1px solid gray;
    font-size:8pt;
    padding: 0.3rem;
    margin: 0 20px;
  }


</style>


<button name={tag} value="OFF"
  on:click|preventDefault={click}
  bind:this={button}
  >
  <slot></slot>
</button>
