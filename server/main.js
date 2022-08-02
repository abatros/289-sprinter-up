import { Meteor } from 'meteor/meteor';

import get_control_points from './gps-data.js'
import './methods/gps-data.js'
import './methods/update-gps-data.js'
import './methods/publish.js'
import './methods/upload-raw-data.js'
import './methods/get-job-data.js'
import './methods/get-projects-list.js'
import './methods/get-jobs.js'
import './methods/create-project.js'
import './methods/get-loops-data.js'
import './methods/export-csv.js'

import {get_accessKeys, S3} from '294-aws-s3';

// import {s3_listObjects} from './s3-list-objects.js'

//let control_points ={}; // sid => {x,y,z,sf}

Meteor.startup(async () => {
  // code to run on server at startup
  // when all js files loaded. and ENV set.
  if (false) {
    const {stations, bb} = get_control_points();
    stations.forEach(station => {
      const {sid,x,y,z,sf} = station
      control_points[sid] = {x,y,z,sf}
    })
  }

  const projects = await list_projects();
  console.log(`Meteor.startup@26`,{projects})
});


/**
**    We need to get an endpoint and credentials to use the package.
**    The package operates only on that endpoint........
**    endpoint ~~~~~  s3Client (connected to endpoint)
**    depending on Credentials, s3Client can access all or some Buckets.
**/


// should be a method.
async function list_projects() {
  const config = get_accessKeys();
  const s3 = new S3(config);
  const data = await s3.listObjects("cb-survey",'projects/','/');
  console.log(`Projects:`,{data});
  //console.log(`Projects:`,data.Contents);
//  console.log(`Projects@40:`,data.CommonPrefixes.map(it=>it.Prefix));
  return data.CommonPrefixes.map(it=>it.Prefix);
}
