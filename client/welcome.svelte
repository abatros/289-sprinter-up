<script type="text/javascript">

import './router.js'
import RouterLink from './router-link.svelte';

export let show_welcome_panel = true;
let skip_welcome = false;

function close_panel() {
  localStorage.setItem('bypass-welcome', (skip_welcome)?+1:+0);
  show_welcome_panel = false; // to hide this panel.
}

</script>
<h1>Sprinter Up</h1>
<h5>Differential Double Leveling</h5>

<vbox style="background-color:rgb(9, 97, 148); padding:20pt 10pt;">
  <h2>Welcome</h2>

  <p>
    This App could not exists without
    the participation of professional people from CB-Survey,<br>dedicated to their daily work:
  </p>

  <p class="qc">
    pratuan thipsuk <span class="ftr">(Mister Green)</span><br>
    kanchaporn chaweetong <span class="ftr">(Lekky)</span><br>
    kriangsak roungsaeng <span class="ftr">(Mister KK)</span><br>
    thananan damsai <span class="ftr">(Joey)</span><br>
  </p>

  <p>
    And <i>of-course</i> under the supervision and with constant advises from grand-master K.Boonlerd
    <br>
    <rm>(Mister BD)</rm>.
  </p>

  <p>
  Many thanks to all &mdash; that was a really fun project.
  </p>


  <p style="-font-family:new times;font-weight:100; margin:10pt 0 60pt;">dominique.klutz@gmail.com</p>


  <p class="ftr">documentation will be online soon.</p>

  <p>
    <label for="">
      <input type="checkbox" bind:checked={skip_welcome}><ftr>do not show</ftr>
    </label>
    &emsp;&emsp;&emsp;&mdash;&emsp;&emsp;&emsp;
    <button type="button" name="button" on:click={close_panel}
    style="font-size:18ptpt;line-height:30pt;">&emsp;CONTINUE &emsp;
    </button>
    <RouterLink page={{path: '/projects', name: 'projects'}} />
  </p>


</vbox>

<style media="screen">
  h2, p {
    text-align: center;
    width:400pt;
    line-height:22pt;
    font-family: Nunito;
    margin: 20px;
  }
  h5 {
  	margin-collapse:collapse;
    margin: 5px;
    text-align:center;
    color: brown;
  }

  p {
    font-size:14pt;
    font-weight:700;
    color: #fff;
  }
  h2 {
    font-size:29pt;
    font-weight:800;
    color: #dbf514;
  }
  rm, ftr, .ftr {
    -font-family: 'new times';
    font-weight: 100;
  }
</style>
