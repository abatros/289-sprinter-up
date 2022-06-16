<script>
import { onMount } from 'svelte';
import assert from 'assert'
//export let sprinter
import {projects, projectName, curRoute, sprinter_data, sprinter_} from './router.js';
import RouterLink from './router-link.svelte';

const verbose =0;
let sdata = [];

onMount(function(){
  console.log({sprinter_})

  if (!$projectName) {
    curRoute.set('/projects');
    window.history.pushState({path: '/projects'}, '', window.location.origin + '/projects');
    return;
  }

  sdata = sprinter_.data;
//  sdata.length =0;
//  sdata.push(... sprinter_.data)
  sdata.forEach(row => {
    row.active = true;
    validate_fw_bw(row);
  })
  detect_double_reading({auto:true});

})


function validate_fw_bw(row) {

  /**
  // should be opposite sign
  // difference between reading should be less 3mm
  // because bs_ht opposite sign fs_ht
  //  we should not have
  **/
  ;(verbose>=2) && console.log(`station[${j}]:`,it)
  if ((row.fw.dh <0) && (row.bw.dh <0)) {
  //      console.log(`flag_error bs:${it.bs_ht} fs:${it.fs_ht}`)
    row.flag_error = 1;
  }
  else
  if ((row.fw.dh >0) && (row.bw.dh >0)) {
    //    console.log(`flag_error bs:${it.bs_ht} fs:${it.fs_ht}`)
    row.flag_error = 2;
  }
  else {
    let e = row.fw.dh + row.bw.dh; // because opposite sign
    //    if (e<0) e = -1;
    row.flag_error = ((e > 0.003)||(e < -0.003))?3:0;
  }
  //;(verbose>=2) &&
	if (row.flag_error)
	console.log(`flag_error@227 ${row.flag_error} fw:${row.fw.dh} fs:${row.bw.dh}`,row)
}

function detect_double_reading(o={}) {
  const {verbose=1, auto, threshold = 0.5} = o;


  let group_dist =0; // to group legs with similar distance to predict retry

  sdata.forEach((row,j) =>{
    row.wrong_reading = '';
		row.dist = (row.fw.dist + row.bw.dist)/2;
		//;(verbose >0) && console.log(`detect-double-reading@179 group_dist:${group_dist}`,row)
    if (Math.abs(row.dist - group_dist) < threshold) { // 50cm
      /**
      // We predict it's a wrong/duplicate reading
      **/
			;(verbose >0) && console.log(`detect-double-reading@179 j:${j} sid:${row.fw.sid}`,row)
      assert(j>0, `fatal@54 leg[${j}]:${row.dist} g:${group_dist}`)
      sdata[j-1].wrong_reading = 'wrong-reading';
      sdata[j].wrong_reading = 'wrong-reading';
      if (auto) sdata[j-1].active = false;
    }
    group_dist = row.dist;
  })
}

function checkbox_onChange() {
	const {row} = this;
	console.log(`checkbox_onChange@307 sid:${row.sid} active:${row.active}`,{row})

	/**
	// DO NOT  row.active = !row.active;
	because binding already operates.
	console.log(`checkbox_onChange@309 sid:${row.sid} active:${row.active}`,{row})
	**/

	// refresh_loop(loop); // this one recompute the flag.........
}

function ptNo_click(e) {
  const row = sdata[this.irow]
  console.log(`ptNo_click irow:${this.irow}`,e)
  console.log(`sdata[${this.irow}]`,sdata[this.irow])
  console.log(`alt-key:${e.altKey}`)
  if (e.altKey) {
    if (row.loop_Marker) {
      console.log('remove-a-loop-Marker')
      sdata[this.irow].loop_Marker = false; // IMPORTANT
    } else {
      console.log('set-a-loop-Marker')
      sdata[this.irow].loop_Marker = true
    }
  }
}

</script>

<style media="screen">

table {
	-display:grid;
	column-gap:0;
	table-layout: fixed;
}
td {
  text-align: right;
  min-width:50pt;
  padding: 0 10px;
}

button {
	font-size:15px;
}

.red {color:red;}
.brown {color:brown;}
.dim-brown {color:#d48888;}

button.green {color:green;}

input.tag {
  height:20pt;
  font-size: 12pt;
  margin-left:10pt;
  width: 120pt;
	font-family: monospace;
}

input.tag .controlp {
  color: red;
}

.hrule-blue-bottom {
  border-bottom:5px solid rgb(135, 137, 247);
}
.hrule-blue-top {
  border-top:5px solid rgb(135, 137, 247);
}

td.even {
	background-color: #BEBEBE;
}

td.dim {
	color: #8b8b8b;
}

td.wrong-reading {
	color: magenta;
}

td.inactive {
	_color: gray;
	opacity: 0.3;
}


td.ptNo {
  cursor:pointer;
}

tr.loopMarker td {
  border-top: 3px solid magenta;
}

tr.loopMarker td.ptNo {
  border-left: 3px solid magenta;
}

</style>


<table>

<tr>
  <td>FW</td>
	<td>Station Identification</td>
	<td></td>
  <td>dH</td>
  <td>dist</td>
	<td>BW</td>
	<td>dH</td>
  <td>dist</td>
</tr>


<tr>
   <td class="hrule-blue-bottom" colspan="100%" style="padding:5pt 0 0 0;"></td>
 </tr>

<tr style="border-bottom:0px solid blue;">
  <td style="padding-bottom:5px;"></td>
</tr>



{#each sdata as row, irow}

<tr bind:this={row.tr}
    class={`${(row.loop_Marker)?'loopMarker':''}`}
    >

  <td title="Q + click to start a loop here."
    on:click={ptNo_click.bind({irow})}
    class={`ptNo ${(irow%2)?'odd':'even'} ${(row.active)?'':'inactive'}`}
    >
		{row.fw.ptNo}
	</td>

	<td class="">
		<input class="tag {row.class_}" valuex={row.sid}
    bind:value={row.fw.sid}
    >
  </td>

	<td class="{(irow%2)?'odd':'even'}">
		<input type="checkbox"
				bind:checked={row.active}
				on:change={checkbox_onChange.bind({row})}
				>
	</td>


	<td class={`${(irow%2)?'odd':'even'} ${(row.flag_error)?'red':''} ${(row.active)?'':'inactive'}`}>
		{row.fw.dh.toFixed(4)}
	</td>


	<td class={`${(irow%2)?'odd':'even'}  ${row.wrong_reading}`}>
		{row.fw.dist.toFixed(3)}
	</td>


	<td class={`${(irow%2)?'odd':'even'} ${(row.active)?'':'inactive'}`}>
		{row.bw.ptNo}
	</td>


	<td class={`${(irow%2)?'odd':'even'} ${(row.flag_error)?'red':''} ${(row.active)?'':'inactive'}`}>
		{row.bw.dh.toFixed(4)}
	</td>
	<td class={`${(irow%2)?'odd':'even'} ${row.wrong_reading}`}>
		{row.bw.dist.toFixed(3)}
	</td>


</tr>

{#if (irow >= sdata.length-1)&&(irow>0)}
<!-- last row -->
<tr>
	<td>
		{row.bw.ptNo}
	</td>

	<td class="">
		<input class="tag {row.class_}" valuex={row.sid}
		bind:value={row.bw.sid}
		>
	</td>

	<td class="">
		<input type="checkbox"
				bind:checked={row.active}
				on:change={checkbox_onChange.bind({row})}
				>

	</td>


</tr>
{/if}

{/each}



</table>
