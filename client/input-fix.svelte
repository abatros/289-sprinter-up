<script>

/*
      https://svelte.dev/tutorial/component-bindings
*/

/*
import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

const select = num => () => category = num;
const select2 = (x) => function(){category = x;};
const select3 = num => () => {category = num;}
*/

let fix_value = '';
export let status = {};

let this_input;

$: {
  //console.log({fix_value})
  if (isNaN(fix_value)) {
    //console.log(`alert NaN <${fix_value}>`)
    status = {error:'NaN'}
  } else {
    status = {value:fix_value}
  }

  if (this_input) {
    if (isNaN(fix_value)) {
      this_input.style.color = 'red'
    } else {
      this_input.style.color = 'black'
    }
  }
}

$:{
  // console.log({this_input})
}

$:{
  // console.log(`status@44: `,status)
}

function keyup() {
  console.log(`keyup`)
}

function focusout() {
  // console.log(`focusout:`,this)
  if (isNaN(fix_value)) {
    status = {error:'NaN'}
  } else {
    status = {value:fix_value, cmd:'compute'}
  }
}

</script>


<style>
button {
  margin: 0 10px;
}
</style>



<input type="text" style="width:6em;" bind:value={fix_value}
  on:keyup={keyup}
  on:focusout={focusout}
  bind:this={this_input}>
