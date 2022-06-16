<script>
import {projects, projectName, curRoute, sprinter_data, sprinter_} from './router.js';

import Nav_link from './nav-link.svelte';
</script>

<style>

h2 {
  text-align:center;
  color: brown;
  margin: 5px 0 10px 0;
  font-size: 12pt;
}
</style>

<h2>Sprinter-Up</h2>

<hbox class="qc">
  <Nav_link page={'/welcome'}>welcome</Nav_link>
  <Nav_link page={'/projects'}>projects</Nav_link>
  <Nav_link page={'/jobs'}>jobs</Nav_link>
  <Nav_link page={'/loops'}>loops</Nav_link>
  <Nav_link page={'/admin'}>admin</Nav_link>
  <Nav_link page={'/about'}>about</Nav_link>
</hbox>
