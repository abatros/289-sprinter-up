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

//export let sdata; // sprinter data reduced
export let sprinter; // data
let sdata =[]; // alias used in HTML code
const verbose =1;


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

/*
	 mk_Adjustment(loop)
	 fix_loop(loop)
	 console.log(`endp@52 loop.endp.gps_elevation:${loop.endp.gps_elevation}`)
	 console.log(`endp@52 loop.endp.gps_elevation:${loop.endp.gps_elevation_}`)
	 console.log(`endp@52 endp.gps_elevation:${endp.gps_elevation}`)
	 console.log(`endp@52 endp.gps_elevation:${endp.gps_elevation_}`)
*/

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


//$: autorun62(sprinter);

$: {
  const x = sprinter.data;
  console.log(`just to test reactive var`)
	autorun62();
}



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
		// unconditional:
		if (!sdata[j].fw.sid || sdata[j].fw.sid.startsWith('*')) {
			if (auto) sdata[j-1].active = false;
		}


  })
}


function autorun62() {
	if (!sprinter) {
		sdata = [];
		return;
	}
	sdata = sprinter.data || [];
	console.log(`## autorun62 sdata.length:${sdata.length}`)
	//refresh_loop(sdata, {auto_uncheck:false})
	sdata.forEach(row => {
		row.active = true;
		validate_fw_bw(row);
	})
	detect_double_reading({auto:true})
return;

//	fix_loop(loop,'@108')
	const v = audit_loop(sprinter.data)
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

//	mk_Adjustment(sdata);
	;(function(){
		const v = audit_loop(sdata)
		if (v && v.length >0) {
	//		console.log(`audit_loop@111 =>`,v)
			throw 'fatal@145'
		}
	})();

}



// -------------------------------------------------------------------------



let busy_publishing = false;
let busy_message = {color:'white', message:''}





;(verbose) && console.log(`before onMount@12`, sprinter && sprinter.data)




onMount(()=>{
  ;(verbose) && console.log(`onMount@11`,{sdata})
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


//let startp_state = ''
async function every_sid_change() {
	/**
	// this gets data from binding {endp:loop.startp}
	//	or {endp:loop.endp}
	**/
	const endp_ = this.endp
	console.log(`EVERY_SID_CHANGE : database lookup if tagged as GPS station.`)
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
  <td>FW</td>
	<td>Station Identification</td>
	<td>gps</td>
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

<tr bind:this={row.tr}>

  <td class={`${(irow%2)?'odd':'even'} ${(row.active)?'':'inactive'}`}>
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
</style>
