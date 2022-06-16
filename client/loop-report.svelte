<script>
import { onMount } from 'svelte';

export let report; // loop first row


onMount(function() {
})


function ae(q, report) {
  if (!report) return ''
  const dist = report.fw_dist + report.bw_dist;
  const ae = q * Math.sqrt(dist/1000)
  return ae.toFixed(3);
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

</vbox>
