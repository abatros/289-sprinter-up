<script>
import { onMount } from 'svelte';
import FIX_input from './input-fix.svelte'


import {projects,
  //projectName,
    curRoute, sprinter_data, sprinter_,
      sdata_timeStamp,
      loops_data,
      editRow_data, // reactive var
    } from './router.js';


export let report; // loop first row
export let legs;
export let projectName

let fix_start = {};
let fix_end = {};
let apply_btn;

$:{
  console.log(`report FIX(start) status:`,fix_start)
  if (fix_start.cmd == 'compute') {
    console.log(`computing elevation at fix-end...`)
  } else {
    if (apply_btn) apply_btn.disabled = true;
  }
}

$:{
  if (fix_end.cmd == 'compute') {
    console.log(`report FIX(end) status:`,fix_end)
    console.log(`computing elevation at fix-end...`)
    if(apply_btn && fix_start.cmd == 'compute') {
      apply_btn.disabled = false;
      apply_btn.focus()
    }
  } else {
    if(apply_btn) apply_btn.disabled = true;
  }
}



onMount(function() {
})


function ae(q, report) {
  if (!report) return ''
  const dist = report.fw_dist + report.bw_dist;
  const ae = q * Math.sqrt(dist/1000)
  return ae.toFixed(3);
}


function compute_error() {
  console.log(`error DH: ${fix_end.value - fix_start.value}`)
}

function export_csv() {
  console.log(`export-csv report sdata `, {report}, $sprinter_data)

  console.log(`export-csv project:<${projectName}> (${loops_data.length}) first-station:${report.startp} last-station:${report.endp}`)

  Meteor.call('export-csv', {legs:$loops_data, projectName, report}, (error, data) =>{
    if (error) throw error;
    console.log('export done check the bucket.',data)
  })
}

</script>


<style>

td {
  text-align: right;
}
.green-state {
  background-color:#b8ddb8; padding: 1px 3px;
}
.yellow-state {
  background-color:#ddddaf; padding: 1px 3px;
}
.orange-state {
  background-color:#fbc9c7; padding: 1px 3px;
}
.red-state {
  background-color:red; padding: 1px 3px;
}


hbox.qj {
  justify-content: space-between;
  width:100%;
}

hbox.baseline, .baseline {
  align-items: baseline;
}


hfil {
  display: inline-block;
  flex-grow: 1;
  height:0;
}

hfil {
  display: inline-block;
  flex-grow: 2;
  height:0;
}

hss {
  display: inline-block;
  flex-grow: 2;
  flex-shrink: 2;
  height:0;
}

</style>


<h4 style="margin:3px;">REPORT &emsp; Closed Loop {report?.startp} &rarr; {report?.endp} &rarr; {report?.startp}</h4>
<vbox class="ql" style="font-family:monospace;font-size:11pt;">
  <table style="table-layout:fixed;">
    <thead>
    <tr>
      <td style="width:40pt;"></td>
      <td style="width:80pt;"><b>dist &emsp;</b></td>
      <td style="width:80pt;"><b>dh &emsp;</b></td>
      <td></td>
    </tr>
    </thead>

    <tbody>
    <tr>
      <td>forward: </td>
      <td>{report?.fw_dist.toFixed(2)}</td>
      <td>{report?.fw_dh.toFixed(3)}</td>
      <td></td>
    </tr>

    <tr>
      <td>backward: </td>
      <td>{report?.bw_dist.toFixed(2)}</td>
      <td>{report?.bw_dh.toFixed(3)}</td>
      <td></td>
    </tr>

    <tr>
      <td>sum: </td>
      <td>{(report?.fw_dist+report?.bw_dist).toFixed(2)}</td>
      <td>{(report?.fw_dh+report?.bw_dh).toFixed(3)}</td>
      <td>&emsp;&mdash;&emsp;[<span class="green-state">AE1</span>:{ae(0.003,report)} <span class="yellow-state">AE2</span>:{ae(0.008,report)} <span class="orange-state">AE3</span>:{ae(0.012,report)}]</td>
    </tr>


  </tbody>
  </table>

<vbox>
  <hbox class="qj baseline" style="margin-top:10px; padding: 0 30px;">
    FIX(start):&ensp;
    <FIX_input bind:status={fix_start}/>
    &emsp;&mdash;&emsp;
    FIX(end):&ensp;
    <FIX_input bind:status={fix_end}/>
    <hfil/>
    &emsp;&rarr;&emsp;
    <hfil/>
    <input type="submit" on:click={compute_error}
      on:submit={compute_error}
      bind:this={apply_btn} disabled value=" APPLY ">
    </hbox>

  <hbox class="qj baseline" style="margin-top:10px; padding: 0 30px;">
    dh (error): {(report?.fw_dh + report?.bw_dh).toFixed(3)}
    &ensp;&mdash;&ensp; Actual error:

    <input type="submit" on:click={export_csv}
      on:submit={export_csv}
      value=" export CSV ">

  </hbox>

</vbox>

</vbox>
