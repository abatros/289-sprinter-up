import { Meteor } from 'meteor/meteor';
import App from './App.svelte';
//import "./node_modules/295-tex-css/index.css"
//import ''

import "295-tex-css/index.css"


Meteor.startup(() => {
  new App({
    target: document.getElementById('app')
  });
});
