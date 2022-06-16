<!-- src/Modal.svelte -->

<script>
import assert from 'assert';
export let isOpenModal = false;
//export let endp ={}; // should be used as open....
//export let endp; // should be used as open....

import { createEventDispatcher } from 'svelte';
import {setContext} from 'svelte'

const dispatch = createEventDispatcher();

function trap_nan(x,m) {assert(!isNaN(x),m)}


function closeModal() {
  console.log(`closeModal3@10`)
    isOpenModal = false;
    dispatch('closeModal', { isOpenModal }); // Modal2::onClose
}

let enable_input = false;


function apply() {
  console.log('apply@41')
}
</script>


<div id="background"
    on:click={closeModal}
    style="display: {isOpenModal ? 'block' : 'none'};"></div>

<!--
<div id="modal" style="--display: {isOpenModal ? 'block' : 'none'};">
  hello
</div>
-->

<vbox class="qc" id="modal"
  style="--display: {isOpenModal ? 'flex' : 'none'};
  padding:10pt; min-width:500px;
  ">
  <slot></slot>
</vbox>


<style>
    #background {
      display: var(--display);
        position: fixed;
        z-index: 1;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(88,88,88,0.5);
    }

    #modal {
      display: var(--display);
        position: fixed;
        z-index: 2;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        filter: drop-shadow(0 0 20px #333);
    }

button {
  font-size: 14pt;
}
</style>
