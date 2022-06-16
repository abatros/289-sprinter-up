<script>
import { onMount, onDestroy} from 'svelte';

export let row;
export let control;

let message = '';

/*

      PROBLEM HERE:
      we operate on hot data,
      we don't have a backup.

*/

function cheat() {
  //first: validate.
  if (isNaN(row.fw.dh)) {
    // display red
    message = 'Must be a number'
  }
  const mean = (row.fw.dh - row.bw.dh)/2
  row.fw.dh = mean;
  row.bw.dh = -mean;
}


function apply() {
  //first: validate.
  if (isNaN(row.fw.dh)) {
    // display red
    message = 'Must be a number'
  }
  row.fw.dh = +row.fw.dh // will trigger autorun ?
  row.bw.dh = +row.bw.dh // will trigger autorun ?
  row.fw.dist = +row.fw.dist // will trigger autorun ?
  row.bw.dist = +row.bw.dist // will trigger autorun ?
  //console.log(`apply@10`,{control})

  control.editRow_apply()
}

/*
$: {
  console.log(`autorun@29 just to test reactivity row:`, row)
}*/

/*

let _row ={
  fw: {dh:0, dist:0},
  bw: {dh:0, dist:0},
}
*/

onMount(function(){
  console.log(`onMount@26`)
})


onDestroy(function(){
  console.log(`onDestroy@26`)
})


</script>


<style>
td.qc {
  text-align: center;
}
td.ql {
  text-align: left;
}
td.qr {
  text-align: right;
}

input {
  font-size: 14pt;
}

input.input4 {
  width:70px;
}
input.sid {
  width:180px;
}

.brown {color:brown;}
</style>


<vbox style="width:800px; background-color:rgb(220,220,220); padding:15px;">
<b class="brown">Edit Row</b>
<table>
  <thead>
    <tr>
      <td></td>
      <td></td>
      <td style="border-bottom:3px solid brown;text-align:center;" colspan="2">FORWARD</td>
      <td></td>
      <td style="border-bottom:3px solid brown;text-align:center;" colspan="2">BACKWARD</td>
    </tr>
    <tr>
      <td>ptNo</td>
      <td>SID</td>
      <td class="qc">dh</td>
      <td class="qc">dist</td>
      <td>&emsp;ptNo&emsp;</td>
      <td class="qc">dh</td>
      <td class="qc">dist</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>{row.fw.ptNo}</b></td>
      <td><input class="sid" type="text" bind:value={row.fw.sid}></td>
      <td><input class="input4" type="text"  bind:value={row.fw.dh}></td>
      <td><input class="input4" type="text"  bind:value={row.fw.dist}></td>
      <td class="qc">&larr;<b>{row.bw.ptNo}</b></td>
      <td><input class="input4" type="text"  bind:value={row.bw.dh}></td>
      <td><input class="input4" type="text"  bind:value={row.bw.dist}></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>



<hbox class="qj" style="-width:100%;margin-top:30pt;padding:0 50px;">
  <button on:click={control.editRow_closeModal}>Quit</button>
  <button on:click={cheat}>Cheat</button>
  <button on:click={apply}>Apply</button>
</hbox>
<p>{message}</p>
</vbox>
