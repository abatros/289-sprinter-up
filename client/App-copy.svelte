<script>
import {writable} from 'svelte/store'
import {onMount} from 'svelte';

import XLSX_file_input from './xlsx-file-input.svelte'
//import Loop from './survey-loop.svelte'
import Sprinter_panel from './sprinter-panel.svelte'
import Dialog from './edit-gps.svelte';
import Welcome from './welcome.svelte'

let sprinter = {data: [
	{fw: {ptNo:31,dh:1.323,dist:18.30},
	bw: {ptNo:32,dh:1.333,dist:18.31}
	},
	{fw: {ptNo:32,dh:2.323,dist:28.30},
	bw: {ptNo:33,dh:2.333,dist:28.31}
	}
]};

$: {
  const x = sprinter.data;
  console.log(`just to test "sprinter" reactive var`)
}


const bypass = +localStorage.getItem('bypass-welcome');
let show_welcome_panel = !bypass;
console.log({show_welcome_panel},{bypass})

let name;
let status = 0;

	const onCancel = (text) => {
		name = '';
		status = -1;
	}

	const onOkay = (text) => {
		name = text;
		status = 1;
	}

  const showDialog = () => {
		open(
			Dialog,
			{
				message: "What is your name?",
				hasForm: true,
				onCancel,
				onOkay
			},
			{
				closeButton: false,
    		closeOnEsc: false,
    		closeOnOuterClick: false,
			}
	  );
	};

	// -------------------------------------------------------------------------

	function upload_raw_data() {
		console.log(`loops: (${loops.length})`)
		console.log(`sprinter`,{sprinter})
		console.log(`job-name:`,sprinter.job.name)
		Meteor.call('upload-sprinter-data', sprinter, (err,retv)=>{
			if (err) throw 'fatal@49';
			console.log(`upload_raw_data@50 =>`,{retv})
		})
	}

	// -------------------------------------------------------------------------

	function clear_data() {
		sprinter.data.length =0;
	}

	// -------------------------------------------------------------------------


onMount(function(){
	console.log('mounted!')
	Meteor.call('get-job-data','book1.xlsx',(err,data)=>{
		if (err) throw 'fatal@63';
//		console.log({data})
//		const {loops, job} = data;
//		const {name, lastModified} = job;
//		console.log(`nloops:${loops.length}`,{job})
//		sprinter_data = data;
	})
})


/**
// Get demo-data
**/



</script>


<vbox class="container qc">
	<h2>Sprinter-Up</h2>
  <h5>Differential Double Levelling</h5>
	<h5>lekkyweb.com</h5>

  <!--
  <XLSX_file_input bind:loops/>
  <XLSX_file_input {loops}/>
  -->


	{#if show_welcome_panel}
	<Welcome bind:show_welcome_panel/>
	{:else}
	<hbox class="qj" style="width:600pt;">
  	<XLSX_file_input bind:sprinter/>
		<vbox>
			<button type="button" name="button" style="height:30pt;"
			on:click={clear_data}>clear data</button>
		</vbox>
	</hbox>
	{/if}

  <!--
  {#each $loops as loop}
  <button on:click={showDialog}>Show a dialog!</button>
  -->


  <!-- Simplest use: modal without an `id` or callback function -->
  <!--
  <button on:click={()=>getModal().open()}>
  	Open First Popup
  </button>
-->

	{#if !show_welcome_panel}
  <div class="">
    <Sprinter_panel {sprinter} />
  </div>


	<vbox style="
		margin:30pt; padding:10pt;
		border: 4px solid lightblue;
		width: 80%;
	">

	<hbox>
	<button type="button" name="button"
		on:click={upload_raw_data}
		>Upload Raw data</button>
	</hbox>

	</vbox>

	{/if}
</vbox>






<style media="screen">
h3, h2 {
  text-align:center;
  color: brown;
}
h5 {
	margin-collapse:collapse;
	margin-top: -10px;
  text-align:center;
  color: brown;
}

:global(body) {
  background-color: rgb(200,200,200)
}

</style>
