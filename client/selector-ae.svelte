<script>
import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

export let category = 0;


/*
      https://svelte.dev/tutorial/component-bindings
*/


const select = num => () => category = num;
const select2 = (x) => function(){category = x;};
const select3 = num => () => {category = num;}


$: {
  console.log({category})
}


</script>


<style>
button {
  margin: 0 10px;
}
</style>



<hbox class="qr" style="width:100%;">
  <button type="button" name="button" on:click={select(1)}>0.003</button>
  <button type="button" name="button" on:click={select2(2)}>0.008</button>
  <button type="button" name="button" on:click={select3(3)}>0.012</button>
</hbox>
