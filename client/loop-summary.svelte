<script>
import { onMount } from 'svelte';

export let report; // loop first row


onMount(function() {
})


</script>


<style>
td {
  text-align: right;
  padding: 0 5px 0 0;
  background-color: #F0EAEA;
}

td.ql {
  text-align: left;
  padding: 0 5px;
}
</style>

<tr>

  <td colspan="3" class="ql">
    Midway summary :
    {report?.endp_sid}
  </td>


  <td>
		{report?.fw_dh.toFixed(3)}
	</td>

	<td>
		{report?.fw_dist.toFixed(2)}
	</td>

  <td></td>

  <td>
		{report?.bw_dh.toFixed(3)}
	</td>


	<td>
    {report?.bw_dist.toFixed(2)}
	</td>



</tr>
