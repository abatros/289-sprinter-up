<script>
import { onMount } from 'svelte';
import assert from 'assert'
//export let sprinter

import {projects, projectName, curRoute, sprinter_data, sprinter_,
      sdata_timeStamp,
      loops_data,
      editRow_data, // reactive var
    } from './router.js';

import RouterLink from './router-link.svelte';
import Loop_item from './loop-item.svelte';
import Loop_summary from './loop-summary.svelte';
import Loop_report from './loop-report.svelte';
import Modal3 from './Modal3.svelte';
import Modal3_editRow from './Modal3-edit-row.svelte';
import Button1 from './button1.svelte' // standard button
import MainMenu from './top-navbar.svelte'
import Selector_ae from './selector-ae.svelte'

import {resync_loops} from './lib/loops.js'

//projectName.set('nobody')
//loops_data.set([])

const verbose =0;
let sdata = []; // readings in another format
// there is no sprinter files here.

let com_data = ''; // last-col


/*

          DUPLICATE...................

*/

function detect_double_reading(sdata, o={}) {
  const {verbose=1, auto=true, threshold = 0.5} = o;


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
      if (Math.abs(row.fw.dh + row.bw.dh) > 0.005) {
        sdata[j-1].wrong_reading = 'wrong-reading';
        sdata[j].wrong_reading = 'wrong-reading';
        if (auto) sdata[j-1].active = false;
        console.log(`deactivate ${sdata[j-1].fw.ptNo} `,sdata[j-1])
      }
    }
    group_dist = row.dist;

    // unconditional:
    if (!sdata[j].fw.sid || sdata[j].fw.sid.startsWith('*')) {
      if (auto) sdata[j].active = false;
      console.log(`deactivate ${sdata[j].fw.ptNo} `,sdata[j])
    }


  })
  return sdata;
}


$: {
  console.log(`autorun@19 at:`,$sdata_timeStamp)

  /*
  loops_data.forEach(row =>{
    if (row.loop_Marker) {
      console.log(`--------------------
        NEW LOOP at ${row.fw.ptNo}\n--------------------`)

    }
    console.log(`${row.fw.dist.toFixed(2)} ${row.sum} ptNo:${row.fw.ptNo} (${row.fw.sid})`)
  })*/

  loops_data.set(detect_double_reading($loops_data))
  $loops_data.forEach(leg =>{
    if (!leg.active) console.log(`ptNo:${leg.fw.ptNo}`,{leg})
  })
  resync_loops($loops_data, {verbose:0, com_data});
  sdata = $loops_data;
  $loops_data.forEach(leg =>{
    if (!leg.active) console.log(`ptNo:${leg.fw.ptNo}`,{leg})
  })
  console.log(`autorun@36 loops_data (${$loops_data.length}) sdata (${sdata.length})`)
  if (false) {
  }
}


onMount(function(){
  if (!$projectName) {
    curRoute.set('/projects');
    window.history.pushState({path: '/projects'}, '', window.location.origin + '/projects');
    return;
  }

  Meteor.call('get-loops-data',($projectName),(err, retv)=>{
    if (err) throw err;


//    console.log({data})
//    sdata.push(...retv.data)
//    loops_data = retv.data;
    loops_data.set(retv.data)
    sdata_timeStamp.set(new Date())
return;
    resync_loops({verbose:0})
    sdata = $loops_data;
    console.log(`sdata (${sdata.length}) is ready.`)
    sdata.forEach(it=>{it.loop_Marker = it.loop_Marker || ''}) // remove undefined
//    sdata = sdata;
//    loops_data.push(...sdata)
  })
})

// ---------------------------------------------------------------------------

function resync_project() {
  const _etime = new Date();
  console.log(`resync_project@69 loops_data (${$loops_data.length}) sdata (${sdata.length})`)
  sdata_timeStamp.set(new Date())
return;

  resync_loops({verbose:0});
  console.log(`resync_project done etime:${(new Date().getTime() - _etime.getTime())/1000} ms.`)
  sdata = $loops_data;
}

// ---------------------------------------------------------------------------

$: {
  console.log(`autorun@47 editRow (Modal):`,$editRow_data)
  editRow = $editRow_data;
  if (editRow) {
    assert(!isNaN(editRow.fw.dist))
    assert(!isNaN(editRow.bw.dist))
    assert(!isNaN(editRow.fw.dh))
    assert(!isNaN(editRow.bw.dh))
    console.log(`editRow@95`,editRow)
    editRow.fw.dist = +editRow.fw.dist.toFixed(2)
    editRow.bw.dist = +editRow.bw.dist.toFixed(2)
    editRow.fw.dh = +editRow.fw.dh.toFixed(3)
    editRow.bw.dh = +editRow.bw.dh.toFixed(3)
    editRow_openModal();
  }
}


let editRow = undefined;
let editRow_isModalOpen = false;
let editRow_message = '';
const _editRow = {}; // copy : Modal3-editRow unable to make it's own backup copy

function editRow_closeModal() {
  _etime = new Date().getTime();
  editRow_isModalOpen = false;
  console.log(`closingModal@108`)
}

function editRow_openModal() {
//  Object.assign(_editRow, editRow); // PB with reactivity

  const {fw:{dh:dh_fw, dist:dist_fw, ptNo:ptNo_fw, sid:sid_fw},
    bw:{dh:dh_bw, dist:dist_bw, ptNo:ptNo_bw, sid:sid_bw}} = editRow;

  Object.assign(_editRow, {fw:{dh:dh_fw, dist:dist_fw, ptNo:ptNo_fw, sid:sid_fw},
      bw:{dh:dh_bw, dist:dist_bw, ptNo:ptNo_bw, sid:sid_bw}});

  console.log(`openModal@119 fw.dh:${_editRow.fw.dh.toFixed(3)} => ${editRow.fw.dh.toFixed(3)}`)
  _editRow.fw.dh = 3.1416;
  console.log(`openModal@120 fw.dh:${_editRow.fw.dh.toFixed(3)} => ${editRow.fw.dh.toFixed(3)}`)

  editRow_isModalOpen = true;
  editRow_message ='';
}

function editRow_apply() {
//  _etime = new Date().getTime();
  editRow_isModalOpen = false;
  console.log(`APPLY TODO`, {editRow},{_editRow})
  console.log(`APPLY TODO@126 fw.dh:${editRow.fw.dh.toFixed(3)} => ${_editRow.fw.dh.toFixed(3)}`)
//  editRow = _editRow; // reactive ???
  editRow_isModalOpen = false;
  sdata_timeStamp.set(new Date())
}

// ---------------------------------------------------------------------------

function recompute_step_error() {
  console.log(`recompute_step_error`)
  $loops_data.forEach(row =>{
    row.com = 'xxx'
  })

  sdata = $loops_data;

}


/**

      this works like a selector:
      last button pressed gets a highlight/border
      Buttons begongs to a group, (linked to a group)
      one button fired, reset other buttons.
      => all buttons register to the group (selector)

**/

let selected_com = 'resync';

function select_com() {
  const ctx = this;
  console.log(`select_com (${this.tag})`,)
  com_data = this.tag;

  switch(this.tag) {
    case 'step-error':
      sdata_timeStamp.set(new Date());
    break;
    case 'cumulative-error':
      sdata_timeStamp.set(new Date());
    break;
    case 'comments':
    break;
    default:
  }
}

const group1 = {
  list:[],
  every_mount: ()=>{
    // put address into list
    console.log('every_mount@177',this)
  },
  every_click: ()=>{
    // reset all except this-one
    console.log('every_click@180')
  }
}

// ---------------------------------------------------------------------------

const group_ae = {
  list:[],
  btn:[],
  every_mount: ()=>{
    // put address into list
    console.log('every_mount@207',this)
  },
  every_click: ()=>{
    // reset all except this-one
    console.log('every_click@211')
  }
}

let cat_ae = 0;

function change_ae() {
  console.log(`ae-changed`);
}

// ---------------------------------------------------------------------------
</script>

<style media="screen">

table {
	-display:grid;
	column-gap:0;
	table-layout: fixed;
  width: 100%;
}
tr.head td {
  text-align: center;
  min-width:40pt;
  padding: 0 10px;
}

td {
  text-align:right;
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

hbox.loopMarker td {
  border-top: 3px solid magenta;
}

hbox.loopMarker td.ptNo {
  border-left: 3px solid magenta;
}

input.mi {
  width:40px;
}


td .ql {
  text-align: left;
}

td .qc {
  text-align: center;
}


</style>

<MainMenu />

<h1>{$projectName}</h1>


<!--
<select multiple bind:value={flavours}>
	{#each menu as flavour}
		<option value={flavour}>
			{flavour}
		</option>
	{/each}
</select>
-->


<vbox class="qr" style="width:100%; margin:0 0 3px 0;">
  <Selector_ae bind:category={cat_ae} on:change={change_ae} />
</vbox>


<vbox class="qr" style="width:95%; margin:10px 0px -30px 0; padding-right:50px;">
  <hbox style="width:400px;height:20px; border-top:1px solid brown; border-right:1px solid brown;"></hbox>
</vbox>


<hbox class="qr" style="width:95%; margin:0 0px 10px 0; padding: 0 50px 0 0;">
  <Button1 group={group1} tag={'step-error'} action={select_com.bind({tag:'step-error'})}>Step Error</Button1>
  <span>&emsp;</span>
  <Button1 group={group1} tag={'cumulative-error'} action={select_com.bind({tag:'cumulative-error'})}>Cumulative Error</Button1>
  <span>&emsp;</span>
  <Button1 group={group1} tag={'comments'} action={select_com.bind({tag:'comments'})}>Comments</Button1>
  <span>&emsp;</span>
  <Button1 group={group1} tag={'resync'} action={select_com.bind({tag:'resync'})}>Resync</Button1>
  <span>&emsp;</span>
</hbox>


<table>

<thead>
<tr class="head">
  <td style="width:60px;">FW</td>
	<td style="width:180px;">Station Identification</td>
	<td style="width:15px;"></td>
  <td style="width:45px;">dH</td>
  <td style="width:45px;">dist</td>
	<td style="width:45px;">BW</td>
	<td style="width:45px;">dH</td>
  <td style="width:45px;text-align:center;">dist</td>
  <td style="width:80px; text-align:center;">
    <button type="button" name="button" on:click={resync_project}>{selected_com}</button>
  </td>
</tr>
</thead>


<tbody>

<tr>
   <td class="hrule-blue-bottom" colspan="8" style="padding:5pt 0 0 0;"></td>
</tr>

<!--
<tr style="border-bottom:0px solid blue;">
  <td style="padding-bottom:5px;"></td>
</tr>
-->


{#each sdata as row, irow}

  <!--
  {#if (row.loop_Marker)&&(row.ix >0)}
  <tr>
    <td colspan="8" style="text-align:center">
      <h3>REPORT2</h3>
      fw_dist:{row.report.fw_dist}
    </td>
  </tr>

  {/if} -->

  <Loop_item row={row} irow={irow} sdata={sdata}/>

  {#if (irow >= sdata.length-1)&&(irow>0)}
<!-- last row : show summary and report -->

    <Loop_summary report={row.uplink?.report}/>

    <tr>
      <td colspan="8" style="text-align:center">
        <vbox style="border:1px solid brown;padding:10px;">

          <Loop_report report={row.uplink?.report} legs={sdata} projectName={$projectName}/>

        </vbox>
      </td>
    </tr>


<!--
<hbox>
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

  <td> {row.com}
  </td>

</hbox> -->
{/if}

{:else}

<tr>
  <td colspan="8" style="text-align:center">
    <h3>LOADING DATA - please wait...</h3>
  </td>
</tr>

{/each}



</tbody>
</table>


<Modal3 isOpenModal={editRow_isModalOpen} on:closeModal={editRow_closeModal}>
  {#if editRow && (editRow!=null)}
  <Modal3_editRow row={editRow} control={{
    editRow_closeModal,
    editRow_apply
  }}/>
  {:else}
    editRow undefined
  {/if}
</Modal3>
