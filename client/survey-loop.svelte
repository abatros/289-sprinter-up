<script>
import assert from 'assert'
import {onMount} from 'svelte'
import {setContext} from 'svelte'
//import {get_gps_data} from './process-loops.js';
//import {refresh_loop} from './refresh-loop.js';
//import {fix_loop, trap_loop, audit_loop, toFixed_loop} from './fix-loop.js'
// import ModalContent from './ModalContent.svelte';
import Modal2 from './Modal2.svelte';
let isOpenModal = false;
let endp_Modal = undefined; // could be used as isOpenModal
let _etime;

export let loop;
const verbose =0;
assert (loop.startp, 'corrupted loop.startp')
assert (loop.endp, 'missing loop.endp')

let startp = loop.startp;
let endp = loop.endp;

let recompute_flag = false; // set recompute button to red

let dim_Elevation =''; //dim-elevation
let dim_adjusted_Elevation = ''
let dim_Adj = ''
let dim_gps_startp = 'brown'
let dim_gps_endp = 'brown'

function trap_nan(x,m) {assert(!isNaN(x),m)}

function openModal2() {
	console.log(`openModal2 this:`,this) // ise this one
	console.log(`openModal2`,{endp}) // NOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
	const endp_ = this.endp;
	if (isNaN(endp_.gps_elevation)) endp_.gps_elevation=undefined;
  isOpenModal = true;
	endp_Modal = endp_;
 }

 function closeModal2() {
	 _etime = new Date().getTime();
	 console.log(`closing@25 Modal2 @${new Date().getTime()%10000000} `,{endp_Modal})
	 if (isNaN(endp_Modal.gps_elevation)) {
		 console.log(`Modal2 returning gps_elevation as NaN <${endp_Modal.gps_elevation}> fixing..`)
		 endp_Modal.gps_elevation = +endp_Modal.gps_elevation;
//		 if (isNaN(endp_Modal.gps_elevation)) throw 'fatal@29'
	 }
   isOpenModal = false;
	 /**
	 // Update either startp or endp
	 **/
	 mk_Adjustment(loop)
	 fix_loop(loop)
	 console.log(`endp@52 loop.endp.gps_elevation:${loop.endp.gps_elevation}`)
	 console.log(`endp@52 loop.endp.gps_elevation:${loop.endp.gps_elevation_}`)
	 console.log(`endp@52 endp.gps_elevation:${endp.gps_elevation}`)
	 console.log(`endp@52 endp.gps_elevation:${endp.gps_elevation_}`)

//	 endp = loop.endp
	 if (true) {
		 console.log(`closing@58 Modal2 @[${new Date().getTime()%10000000}]`)
		 loop = loop; // IMPERATIF TO TRIGGER DOM REFRESH
	 }
 }

import { writable } from 'svelte/store';
import Modal, { bind } from './modal.js';
//import Popup from './Popup.svelte';
const modal = writable(null);


const showModal = (endp) => {
	console.log(`showMo	<!--
  <td><button style="{(recompute_flag == true)?'color:red;':''}"
    on:click={function(){refresh_loop(loop,{fetch_gps:true})}}>recompute</button>
  </td>
  <td><button
    on:click={(e)=>publish(loop)}>publish</button>
  </td>
	-->
dal@15`,{endp})
	// here we can choose which modal to display.
	//setContext('endp',endp)
	modal.set(bind(Popup, { message: 'Surprise', endp, modal,
		onClose:applyGPS
	}));
}

function applyGPS(endp){
	console.log('closingModal@24 endp:',endp)
	update_gps_data(endp)
//	recompute();
	modal.set(null)
}


//import Modal,{getModal} from './Modal.svelte'
let selection;

let name; // set a name to show a Modal.
let status = 0;

const onCancel = (text) => {
	name = '';
	status = -1;
}

const onOkay = (text) => {
	name = text;
	status = 1;
}




/*
$: {
	startp = loop.startp;
	endp = loop.endp;
//  const l = loop;  Just look at startp, endp
  console.log(`startp.sid:${startp.sid} gps-elevation:${startp.gps_elevation} ${startp.elevation}`,)
  console.log(`endp.sid:${endp.sid} gps-elevation:${endp.gps_elevation} ${endp.elevation}`)
//  recompute_flag = true;
}*/


$: autorun62(loop);

function autorun62() {
	console.log(`autorun62`)
	if (!loop) return;
	refresh_loop(loop, {auto_uncheck:false})
return;

	fix_loop(loop,'@108')
	const v = audit_loop(loop)
	if (v && v.length >0) {
//		console.log(`audit_loop@111 =>`,v)
		throw 'fatal@112'
	}

	/***
	try {
		fix_loop(loop,'@108')
		trap_loop(loop, 'in autorun@109')
	}
	catch {
		console.log(`fatal@120 in autorun62`,{loop})
		throw 'fatal@120 autorun62'
	}
	loop.startp.elevation = +loop.startp.elevation;
	loop.endp.elevation = +loop.endp.elevation;
	loop.startp.gps_elevation = +loop.startp.gps_elevation;
	loop.endp.gps_elevation = +loop.endp.gps_elevation;
	assert(!isNaN(loop.startp.elevation), 'fatal@101')
	assert(!isNaN(loop.endp.elevation), 'fatal@102')
	assert(!isNaN(loop.startp.gps_elevation), 'fatal@107')
	assert(!isNaN(loop.endp.gps_elevation), 'fatal@108')
	console.log(`**************** autorun@62 every loop change`,loop)
//	loop = loop;
	startp = loop.startp;
	endp = loop.endp;
	assert(!isNaN(startp.elevation), 'fatal@103')
	assert(!isNaN(endp.elevation), 'fatal@104')
	**/

	mk_Adjustment(loop);
	;(function(){
		const v = audit_loop(loop)
		if (v && v.length >0) {
	//		console.log(`audit_loop@111 =>`,v)
			throw 'fatal@145'
		}
	})();

}

// -------------------------------------------------------------------------

function mk_Adjustment(loop) {
	const verbose =0;
	const error = loop.endp.gps_elevation - loop.endp.elevation;
	console.log(`mk_Adjustment computed-error:${error} startp/gps:${loop.startp.gps_elevation} endp/gps:${loop.endp.gps_elevation}`,{loop})

	if (!loop.endp.gps_elevation || !loop.endp.elevation) {
		return;
	}
//	assert(error == loop.error,'fatal@123')

	let D =0;
	loop.stations.forEach(it =>{
		if (it.active) D += it.dist;
	})

	;(verbose >0) && console.log(`mk_Adjustment total-dist:${D}`)

	let error_toGo = error;
	let dist_toGo = D;
	let adj_sum = 0;

	loop.stations.forEach((it,j) =>{
		if (it.active) {
			it.di = (error_toGo * it.dist)/dist_toGo
			adj_sum += it.di
			it.adj = it.di;
			it.ae = it.elevation + adj_sum; // adjusted elevation

			;(verbose >0) && console.log(`-- ${j} delta:${it.di.toFixed(5)} h:${it.elevation.toFixed(5)} => adj:${it.adj.toFixed(5)} `)
			error_toGo -= it.di
			dist_toGo -= it.dist
		}
	})

	Object.assign(loop, {adj_sum})
}

// -------------------------------------------------------------------------



let busy_publishing = false;
let busy_message = {color:'white', message:''}

function publish() {
//  const retv = await publish_loop(loop)
  busy_publishing = true;
	busy_message = {color:'green', message:'publishing - please wait...'}

	loop.stations.forEach(it =>{
		trap_nan(it.adj, 'fatal@160')
	})


  Meteor.call('publish',{loop, style},(err,data)=>{
    if (err) {
      message1 = `failed to send loop-report (system-error)`
      busy_message = {color:'red',
        message: `failed to publish (system-error)`
      }
      return;
    }
    const {pdfName, url} = data;
//    const url = `http://lekkyweb.com/${loop.job.name}`;
//    const url = `http://lekkyweb.com/${pdfName}`;
    busy_message = {color:'green',
      message: `visit &rarr;&emsp;<a href="${url}" target="_blank">${url}</a>`
    }
    console.log('PUBLISHED:',data)
    message1 = `loop-report sent successfully to server`
  })
}


function publish3() {
//  const retv = await publish_loop(loop)
  busy_publishing = true;
	busy_message = {color:'green', message:'publishing - please wait...'}

	loop.stations.forEach(it =>{
		trap_nan(it.adj, 'fatal@160')
	})


  Meteor.call('publish',{loop, style:'style3.sty'},(err,data)=>{
    if (err) {
      message1 = `failed to send loop-report (system-error)`
      busy_message = {color:'red',
        message: `failed to publish (system-error)`
      }
      return;
    }
    const {pdfName, url} = data;
//    const url = `http://lekkyweb.com/${loop.job.name}`;
//    const url = `http://lekkyweb.com/${pdfName}`;
    busy_message = {color:'green',
      message: `visit &rarr;&emsp;<a href="${url}" target="_blank">${url}</a>`
    }
    console.log('PUBLISHED:',data)
    message1 = `loop-report sent successfully to server`
  })
}



;(verbose) && console.log(`before onMount@12`,{loop})


  let loopNo = 0;
//let row1 = {sid: loop.sid1}
//  let last_row = loop.stations[loop.stations.length-1]

  let report = loop.report;


onMount(()=>{
  ;(verbose) && console.log(`onMount@11`,{loop})
//  startp_tr = loop.startp.tr;
  recompute_flag = false;
})

/*
$: {
  console.log(`startp_tr@64:`, loop_startp_tr)
  console.log(`startp_sid@64:`, loop_startp_sid)
}
*/


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

async function refresh_loop_(o={}) {
	audit_loop(loop, '@250');
	await refresh_loop(loop,o);
	audit_loop(loop, '@252')
	loop = loop;
}


//let startp_state = ''
async function every_sid_change() {
	/**
	// this gets data from binding {endp:loop.startp}
	//	or {endp:loop.endp}
	**/
//	loop.startp.gps_elevation = undefined;
//	console.log(`every_sid_change gps:`,loop.startp.gps_elevation)
//	console.log(`every_sid_change this:`,this)
//	console.log(`every_sid_change endp:`,endp)
	const endp_ = this.endp
	console.log(`EVERY_SID_CHANGE`,{endp_})

	switch(endp_) {
		case startp : {
				console.log(`onChange startp sid:${startp.sid}`,{startp});
//				startp.gps_elevation = 99.991;
				assert(startp.sid, 'fatal@189')
				const {sid,z,error} = await get_gps_data(startp.sid)
				dim_gps_startp = (error)?'dim':'';


				if (error) {
					console.log(`ALERT THIS STATION DOES NOT EXISTS IN THE DATABASE`)
					dim_gps_startp = 'dim'
					break;
				}


				startp.sid = sid;
				startp.gps_elevation = +z;
				startp.gps_elevation_ = startp.gps_elevation.toFixed(3);
				assert(startp.gps_elevation == endp_.gps_elevation, 'fatal@192')
				console.log(`onChange2 startp sid:${startp.sid}`,{startp});
				recompute_flag = endp_.invalid = (endp_.sid_ != endp_.sid);
				dim_Elevation = (endp_.invalid)?'dim':'';
				dim_adjusted_Elevation = (endp_.invalid)?'dim':'';
				dim_Adj = (endp_.invalid)?'dim':'';
				dim_gps_startp = (endp_.invalid)?'dim':'brown';


//				loop.stations[1].elevation = undefined;
				await refresh_loop(loop, {fetch_gps:true})
				toFixed_loop(loop)
				loop = loop;
//				loop.stations[1].elevation = loop.stations[1].elevation;
//				loop.startp.elevation = loop.startp.elevation;
				break;
			}

		case endp : {
				console.log(`onChange endp sid:${endp.sid}`,{endp});
	//			endp.gps_elevation = 99.999;
				assert(endp.sid, 'fatal@203')
				const {sid,z,error} = await get_gps_data(endp.sid)
				if (error) {
					console.log(`ALERT : station not found in database`);
					/**
					// Invalidate endp
					**/
					endp.gps_elevation = undefined;
		//			endp.gps_elevation_ = '***';
					loop.error = undefined;
					loop.stations.forEach(leg =>{
						leg.adj = leg.ae = undefined;
						// leg.adj_ leg.ae_ will be set by fix_loop
					})

	//				loop = loop;
					break;
				}


				endp.sid = sid;
				endp.gps_elevation = +z;
				console.log(`onChange2 endp sid:${endp.sid}`,{endp});
				/**
				// here no UI refresh yet
				**/

				assert(endp.gps_elevation == endp_.gps_elevation, 'fatal@210')

//				loop.stations[1].elevation = undefined;
//				loop.stations = loop.stations;
				//loop = loop;
loop.endp = endp;
return;

				await refresh_loop(loop, {fetch_gps:true})
				mk_Adjustment(loop)
				loop = loop;

//				endp_.gps_elevation = 99.999;
//				return;
				break;
			}

		default:
			console.log('onChange unknown endp_',{endp_})
			return;
	}

//	recompute();
	assert(startp == loop.startp, 'fatal@221');
	assert(endp == loop.endp, 'fatal@22');
}

//let startp_unsafe_flag = '';
let startp_unsafe_flag = '#';

function every_sid_keydown() {
	const verbose =0;
	const endp_ = this.endp
	;(verbose >0) && console.log(`every_sid_keydown`,{endp_})
	endp_.sid_ = endp_.sid_ || endp_.sid;
	;(verbose >0) && console.log(`every_sid_keydown endp_.sid:${endp_.sid_} => ${endp_.sid}`)
}

function every_sid_keyup() {
	const verbose =0;
	const endp_ = this.endp
	;(verbose >0) && console.log(`every_sid_keyup`,{endp_})
	switch(endp_) {
		case startp :
				;(verbose >0) && console.log(`keyup on startp gps:${startp.gps_elevation}`,{startp});
//				startp.sid_ = startp.sid_ || startp.sid;
//				console.log(`startp.sid:${startp.sid} <> ${startp.sid_}`)
				;(verbose >0) && console.log(`every_sid_keyup endp_.sid:${endp_.sid_} => ${endp_.sid}`)
				recompute_flag = endp_.invalid = (endp_.sid_ != endp_.sid);
				dim_Elevation = (endp_.invalid)?'dim':'';
				dim_adjusted_Elevation = (endp_.invalid)?'dim':'';
				dim_Adj = (endp_.invalid)?'dim':'';
				dim_gps_startp = (endp_.invalid)?'dim':'brown';
				startp = endp_;
				break;
		case endp :
				//console.log(`keyup on endp gps:${endp.gps_elevation}`,{endp});
//				endp_.invalid = (endp_.sid_ != endp_.sid);
//				endp = endp_;
				;(verbose >0) && console.log(`every_sid_keyup endp: ${endp_.sid_} => ${endp_.sid}`)
				endp_.invalid = (endp_.sid_ != endp_.sid);
				dim_adjusted_Elevation = (endp_.invalid)?'dim':'';
				dim_Adj = (endp_.invalid)?'dim':'';
				endp = endp_;
				break;
		default:
			console.log('unknown endp_',{endp_})
			return;
	}
}

// ===========================================================================


// ===========================================================================


// ===========================================================================

</script>

<Modal2 isOpenModal={isOpenModal} endp={endp_Modal} on:closeModal={closeModal2} />

<table>
<tr>
  <b style="color:brown;">LOOP {loopNo+1}</b>
</tr>

<tr>
  <td>FS</td>
  <td>BS</td>
  <td>Mean</td>
  <td>Dist.</td>
  <td>Station Identification</td>
	<td></td>
  <td>
		<vbox class="qc">
			<hbox>Comp.</hbox>
			<hbox>Elev.</hbox>
		</vbox>
	</td>
	<td>
		<vbox class="qc">
			<hbox>Adj.</hbox>
		</vbox>
	</td>
	<td>
		<vbox class="qc">
			<hbox>Adjusted</hbox>
			<hbox>Elev.</hbox>
		</vbox>
	</td>
  <td style="text-align:center"><b>GPS</b></td>
</tr>

<tr>
   <td class="hrule-blue-bottom" colspan="100%" style="padding:5pt 0 0 0;"></td>
 </tr>

<tr style="border-bottom:0px solid blue;">
  <td style="padding-bottom:5px;"></td>
</tr>


  <tr>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td><input class="tag {loop.startp.class_} "
      bind:value={loop.startp.sid}
			on:keyup={every_sid_keyup.bind({endp:loop.startp})}
			on:keydown={every_sid_keydown.bind({endp:loop.startp})}
			on:change={every_sid_change.bind({endp:loop.startp})}
      >
    </td>
  <td>
			<!--
			<button on:click={function(){
						modal_target_gps = loop.startp;
						//getModal().open();
					}}
						>
	      CB
	    </button> -->

			<!--
			<Modal show={$modal}>
			  <button on:click={function(){showModal(loop.startp)}}>CB</button>
			</Modal> -->


			<button on:click={openModal2.bind({endp:loop.startp})}>CB</button>

    </td>


    <td class="elevation {dim_Elevation}"
			>
			{startp.elevation_}
		</td>

		<td></td>

		<td class="{dim_adjusted_Elevation}">{startp.elevation_}</td> <!-- adjusted elevation -->

    <td bind:this={loop.startp.tdz} class="gps-elevation brown {dim_gps_startp}">
			<b>{startp.gps_elevation_}</b>
		</td>
  </tr>


{#each loop.stations as row, irow}

<tr bind:this={row.tr}>
  <td class={`${(irow%2)?'odd':'even'} ${(row.flag_error)?'red':''} ${(row.active)?'':'inactive'}`}>{row.df_}</td>
  <td class={`${(irow%2)?'odd':'even'} ${(row.flag_error)?'red':''} ${(row.active)?'':'inactive'}`}>{row.db_}</td>
  <td class={`${(irow%2)?'odd':'even'} ${(row.active)?'':'inactive'}`}>{row.mean_}</td>


  <td class="{(irow%2)?'odd':'even'} {row.wrong_reading}">{row.dist_}</td>

  {#if (irow>= loop.stations.length-1)}

  <td class="{(irow%2)?'odd':'even'}">
		<input class="tag {row.class_}" valuex={row.sid}
    bind:value={endp.sid}
		on:keyup={every_sid_keyup.bind({endp:loop.endp})}
		on:keydown={every_sid_keydown.bind({endp:loop.endp})}
		on:change={every_sid_change.bind({endp:loop.endp})}
    >
  </td>

  {:else}

  <td class="{(irow%2)?'odd':'even'}">
		<input class="tag {row.class_}" valuex={row.sid}
    bind:value={row.sid}
    >
  </td>
  {/if}

	<td class="{(irow%2)?'odd':'even'}">
		<input type="checkbox"
				bind:checked={row.active}
				on:change={checkbox_onChange.bind({row})}
				>

				{#if (irow>= loop.stations.length-1)}

					<!--
					<Modal show={$modal}>
						<button on:click={function(){showModal(loop.endp)}}>CB</button>
					</Modal> -->

					<button on:click={openModal2.bind({endp:loop.endp, from:'endp'})}>CB</button>

				{/if}

	</td>



  <!--
  No need two ways binding.
  <td bind:this={row.tdz} class="elevation"></td>
  -->

	<td class="{(irow%2)?'odd':'even'} {dim_Elevation}"
		style="{(!startp.gps_elevation)?'color:#8b8b8b;':''}">
		{#if row.active}
	  {row.elevation_}
		{:else}
		***
		{/if}
	</td>


	<td class="adj {(irow%2)?'odd':'even'} {dim_Adj}"
		style="{(recompute_flag)?'color:#8b8b8b;':''}">
		{#if row.active}
		<!--
	  {(row.adj)? row.adj.toFixed(4):''}
		-->
		{row.adj_}
		{:else}
		***
		{/if}
	</td>


	<td class="{(irow%2)?'odd':'even'} {dim_adjusted_Elevation}">
		{#if row.active}
		{row.ae_}
		{:else}
		***
		{/if}
	</td>


  <td class="{(irow%2)?'odd':'even'} gps-elevation {(endp.invalid)?'dim-brown':'brown'}">
		{#if (irow>= loop.stations.length-1)}
		<!--
		{(row.gps_elevation)? row.gps_elevation.toFixed(3):'***'} -->
		<b>{loop.endp.gps_elevation_}</b>
		<span style="display:none;">
			gps:{endp.gps_elevation} @[etime: {_etime - new Date().getTime()}]
		</span>
		{/if}
	</td>
</tr>

{/each}

<!--
<td><input type="checkbox"
      id={row.sid}
      bind:this|preventDefault={row.input}
      bind:checked={row.checked}
      on:change|preventDefault={(e)=>toggle_checkbox(e,row)} />
</td>

-->



<tr>
  <td class="hrule-blue-bottom" colspan="100%" style="padding:5pt 0 0pt 0;"></td>
</tr>

<tr>
  <td colspan="100%" style="padding:0pt 0 5pt 0;"></td>
</tr>


<tr style="border-top:0px solid green;
    padding-top:15px;
  ">

  <td>{loop.df_sum_}</td>
  <td>{loop.db_sum_}</td>
  <td>{loop.mean_sum_}</td>
  <td>{loop.dist_sum_}</td>
  <td>SUMMARY</td>
  <td>
    <!--
    <button type="button"
      on:click={(e)=>summary(loop)}>CB
    </button>
    -->
  </td>
	<td></td>
	<td class="adj_sum {dim_Adj}">{loop.adj_sum_}<span style='color:transparent;'>0</span></td>
	<td></td>
	<td class="">{loop.dh_gps_}</td>
  </tr>

	</table>





	<table style="margin-top:10pt;">
	<tr>
		<td colspan="8"></td>
		<td colspan="2"><button style="{(recompute_flag == true)?'color:red;':''}"
			on:click={refresh_loop_}
			>
			recompute
		</button>
	  </td>
		<td><button
	    on:click={(e)=>publish3(loop)}>publish v3</button>
	  </td>
	</tr>


  <!--

        INFORMATION PANEL

  -->

  <tr>
    <td colspan="100%" style="text-align:center">
      {#if recompute_flag}
      <hbox class="qc"
        style="width:80%; border: 1px solid orange;margin:10pt;padding:10pt;color:orange">
        <b>ALERT UNSAFE LOOP DATA</b>
      </hbox>
      {/if}
    </td>
  </tr>


  <!--
              URL link tp pdf
  -->

  <tr>
    <td colspan="100%" style="text-align:center">
      {#if busy_message.color != 'white'}
      <hbox class="qc"
        style="width:100%; -border: 1px solid orange; -margin:10pt; padding:5pt;color:{busy_message.color}">
        {@html busy_message.message}
      </hbox>
      {/if}
    </td>
  </tr>


  <tr><td>&emsp</td></tr>

	<tr>
    <td colspan="4">Diff of actual &emsp; {loop.mean_sum_}</td>
    <td colspan="5" style="text-align: left;"> </td>
  </tr>


	<tr>
    <td colspan="4">Diff of fixed points &emsp; {loop.dh_gps_}</td>
    <td colspan="5" style="text-align: left;">=  {loop.endp.gps_elevation_} - {loop.startp.gps_elevation_}</td>
  </tr>



	<tr>
    <td colspan="4">error &emsp; {loop.error_}</td>
    <td colspan="5" style="text-align: left;">= {loop.mean_sum_} - {loop.dh_gps_}</td>
  </tr>

	<tr><td>&emsp</td></tr>

  <tr>
    <td colspan="4">computed-elevation at endpoint:</td>
    <td style="text-align: left;"> {loop.endp.elevation_}</td>
  </tr>
	<tr>
    <td colspan="4">adjusted-elevation at endpoint:</td>
    <td style="text-align: left;"> {loop.endp.ae_}</td>
    <td colspan="3"> err:&ensp;{loop.error_}</td>
    <td colspan="2"> ae:&ensp;{loop.ae_} &ensp;=&ensp; {loop.qf} * ({loop.dist_sum_}/1000)^0.5</td>
  </tr>
  <tr><td>&emsp</td></tr>
  <tr><td>&emsp</td></tr>

<!--
  <tr>
    <td></td>
    <td></td>
    <td></td>
    <td style="color:red">0.0072</td>
    <td style="color:red; text-align:center;">&lt; 0.0066 Quality Failed</td>
  </tr>
-->

</table>



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
	color: gray;
}
</style>
