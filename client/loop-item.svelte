<script>
import { onMount } from 'svelte';

import {resync_loops} from './lib/loops.js'
import {sdata_timeStamp, editRow_data} from './router.js'
export let row;
export let irow;
export let sdata; // loops - need to update when cutting loops

import Loop_report from './loop-report.svelte'
import Loop_summary from './loop-summary.svelte'


function edit_row(e) {
  if (e.altKey) {
      console.log('edit-row')
      /*
                HOW TO send message to loops.svelte to open editRow ?
                (1) A callback in loop-item arguments?
                  <Loop_item row={row} irow={irow} sdata={sdata} editRow....  />

                (2) communicate w/ global reactive variable
                    in router.js (for now)
                    editRow_signal
      */
      editRow_data.set(row); // will open the Modal reactively.
  } else {

  }
}

function ptNo_click(e) {
//  console.log(`alt-key:${e.altKey}`)
  if (e.altKey) {
    if (!row.loop_Marker) {
      // empty string is NULL
//      console.log('remove-a-loop-Marker')
      row.loop_Marker = 'loopMarker';
      row.dirty = true;
    } else {
//      console.log('set-a-loop-Marker')
      row.loop_Marker = '';
      row.dirty = true;
    }
    console.log(`click =>`,row)
    sdata[irow] = row;

    if (false) {
      resync_loops()
    } else {
      sdata_timeStamp.set(new Date()) // signal to rebuild.
    }



    //const retv = scan_previous_loop(row)
    //console.log({retv})
//    full_scan(); // update project_data, by adding a report on each loop.
    //resync_loops();
    /*

            first row of each loop, has a link to previous loop.report
            It's a convenience prop
            When we reach a new loop, we have access to current loop report.
    */

    // console.log(`NEW LOOP starting at ${row}`)
  }
}




function checkbox_onChange() {
	const row = this;
	console.log(`checkbox_onChange@48 sid:${row.fw.sid} active:${row.active} row:`,row)
//  full_scan();
  if (false) {
    resync_loops();
  } else {
    sdata_timeStamp.set(new Date()) // fire autorun in loops.svelte
  }
	/**
	// DO NOT  row.active = !row.active;
	because binding already operates.
	console.log(`checkbox_onChange@309 sid:${row.sid} active:${row.active}`,{row})
	**/

	// refresh_loop(loop); // this one recompute the flag.........
}

onMount(function() {
  console.log('onMount loop-item:')
})


function ae_color(row) {
    /*
    const error = Math.abs(row.fw.dh + row.bw.dh);
    const _ae = Math.abs(Math.sqrt((row.fw.dist+row.bw.dist)/1000));
    */

    const error = Math.abs(row.error_so_far);
    const _ae = Math.abs(Math.sqrt((row.dist_so_far)/1000));

    // ae =  q * _ae;

    if (error < 0.003* _ae) color='green'
    else if (error < 0.008* _ae) color='yellow'
    else if (error < 0.012* _ae) color='orange'
    else color = 'red'

    return color;
}


function ae1_color(row) {
    const error = Math.abs(row.fw.dh + row.bw.dh);
    const _ae = Math.abs(Math.sqrt((row.fw.dist+row.bw.dist)/1000));

    // ae =  q * _ae;

    if (error < 0.003* _ae) color='green'
    else if (error < 0.008* _ae) color='yellow'
    else if (error < 0.012* _ae) color='orange'
    else color = 'red'

    return color;
}


</script>

<style>

td {
  text-align:right;
  padding: 0 5px 0 0;
}

td.ptNo {
  cursor:pointer;
  -width:60px;
  -justify-content: end;
  padding:0 5px 0 0;
  text-align: right;
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


tr.loopMarker td {
  border-top: 3px solid magenta;
}

tr.loopMarker td.ptNo {
  -border-left: 3px solid magenta;
}


.green-state {
  background-color:#b8ddb8;
}
.yellow-state {
  background-color:#ddddaf;
}
.orange-state {
  background-color:#fbc9c7;
}
.red-state {
  background-color:red;
}

.triangle-down {
  -margin-top:20px;
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 16px solid red;
    }

</style>

{#if (row.loop_Marker)}

<Loop_summary report={row.uplink?.report}/>

<tr>
  <td colspan="8" style="text-align:center">
    <vbox style="border:1px solid brown;padding:10px;">

      <Loop_report report={row.uplink?.report} />

    </vbox>
  </td>
</tr>

{/if}


<tr bind:this={row.hbox}
    class={`row ${row.loop_Marker}`}
    >

  <td title="Q + click to start a loop here."
    on:click={ptNo_click.bind({irow,row})}
    class={`ptNo ${(irow%2)?'odd':'even'} ${(row.active)?'':'inactive'}`}
    >
    {#if row.loop_Marker}
    <div class="triangle-down"></div>
    {/if}


		<b style="color:rgb(80,80,80)">{row.jobNo}:{row.fw.ptNo}</b>
    <span style="display:inline-block; width:10px; height:4px; background-color:{ae1_color(row)}; margin-right:0px;"></span>
	</td>

	<td class="">
		<input class="tag {row.class_}" valuex={row.sid}
    bind:value={row.fw.sid}
    >
  </td>

	<td
    class="{(irow%2)?'odd':'even'}"
    on:click={edit_row.bind({irow,row})}
  >
		<input type="checkbox"
				bind:checked={row.active}
				on:change={checkbox_onChange.bind(row)}
				>
	</td>


	<td class={`${(irow%2)?'odd':'even'} ${(row.flag_error)?'red':''} ${(row.active)?'':'inactive'} ${(+row.cat >=2)?'wrong-reading':''}`}>
		{row.fw.dh.toFixed(3)}
	</td>


	<td class={`${(irow%2)?'odd':'even'}  ${row.wrong_reading}`}>
		{row.fw.dist.toFixed(2)}
	</td>


	<td class={`${(irow%2)?'odd':'even'} ${(row.active)?'':'inactive'}`}>
		&larr; <b style="color:rgb(80,80,80)">{row.bw.ptNo}</b>
	</td>


	<td class={`${(irow%2)?'odd':'even'} ${(row.flag_error)?'red':''} ${(row.active)?'':'inactive'} ${(+row.cat >=2)?'wrong-reading':''}`}>
		{row.bw.dh.toFixed(3)}
	</td>
	<td class={`${(irow%2)?'odd':'even'} ${row.wrong_reading}`}>
		{row.bw.dist.toFixed(2)}
	</td>


  {#if row.active}
  <td title={row.com} class={`${ae_color(row)}-state`}>{row.com} ({row.cat})</td>
  {:else}
  <td title={row.com}>***</td>
  {/if}
</tr>
