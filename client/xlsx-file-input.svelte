<script>
const verbose =1;
let input_files;
let input; // dom element
let message1 ='';
//import {process_loops} from './process-loops.js'
//import {process_loops} from './process-loops.js'
import {process_xlsx_file, reset_loop} from './process-xlsx-input.js'
//import {refresh_loop} from './refresh-loop.js'

//export let loops;
export let sprinter; // {job, timestamp, data}

function autorun14(input_file) {
  //autorun(input_files[0])

  message1 = 'processing file, please wait...'
//  console.log({message1})


  const retv = process_xlsx_file(input_file)
  .then(async (retv)=>{
    ;(verbose) && console.log(`autorun@13:`,{retv})

    message1 = `found ${retv.length} stations &lt;${retv[0].fw.sid}&gt;  <b>ptNo:${retv[0].fw.ptNo}</b> `

      /*
      reset_loop(loop)
      await get_loop_gps_data(loop)
      // that does a job of creating row1
      */
//    await refresh_loop(loop, {fetch_gps:true})

    sprinter.job = {au:'dkz', name:input_file.name, lastModified:input_file.lastModified};
    sprinter.data = retv;
//    console.log(`@@@@@@@@@@@@@@@@@@@@@@@@@@@ sprinter.job:`,sprinter.job)
    //loops = loops_
//      $loops = [...loops_]
  }) // then
} // autorun14

$: {
  const x = sprinter.data;
  console.log(`just to test reactive var`)
}

$: {
  if (input_files && input_files.length >0) {
    ;(verbose) && console.log(`input_files ${input_files.length} loaded@102`, input_files)
    autorun14(input_files[0])
  }
}

/*
function autorun (input_file) {
  console.log(`@33 File:`,input_file)
  //      for (let i=0; i<input_files.length; i++) {console.log(`@33`,input_files[i])}

  const reader = new FileReader()
  //    reader.readAsDataURL(input_files[0]);
  reader.onload = process_loops;
  reader.readAsArrayBuffer(input_files[0]) // => autorun
} // read xlsx
*/

</script>


<vbox class="ql"
    style="
    border:0px solid blue;
    padding:10pt 10pt 0 30px;">
  <input style="font-size:1em;"
    bind:files={input_files}
    bind:this={input}
  type="file" name="" value="" placeholder="select XLSX file">
  <p>{@html message1}</p>
</vbox>
