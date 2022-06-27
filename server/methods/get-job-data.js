import {s3Client, Bucket} from '../s3-client.js';

//import YAML from 'yaml'
//import {s3put, s3get} from '../aws-s3.js'
//import fs from 'fs'

/**
**    EXPECT jobName
              4334-kamala-beach-phucket/4334-sprinter-data-1.json
**/



Meteor.methods({
  'get-job-data': async function(jobName) {

    const Key = `projects/${jobName}`;
    const retv = await s3Client.getObject(Bucket, Key)
    console.log(`get-job-data@19 (${Key}):`,{retv})
//    const json = JSON.parse(retv.Body)
//    console.log({json})
//    return retv.Body.toString('utf8');
    const job = Object.assign(JSON.parse(retv.Body.toString()), {status:'ok'});
    return job;
  }
})
