<script>
import {router, projects, projectName, curRoute, sprinter_data, sprinter_} from './router.js';

export let page ; //= {path: '/welcome',name: 'Welcome'}


function redirectTo(event){
  // change current router path
  curRoute.set(event.target.pathname);
  // push the path into web browser history API
  window.history.pushState({path: page}, '', window.location.origin + page);
}

</script>


<style>
  a {
    text-transform: uppercase;
    text-decoration: none;
    border: 1px solid gray;
    font-size:8pt;
    padding: 0.3rem;
    margin: 0 20px;
  }
</style>


<a href={page} on:click|preventDefault={redirectTo}>
  <slot></slot>
</a>
