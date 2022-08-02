import {s3Client, Bucket} from '../s3-client.js';
import {get_jobs, get_project_metadata} from '../lib/get-jobs.js';

//import YAML from 'yaml'
//import {s3put, s3get} from '../aws-s3.js'
//import fs from 'fs'

/**
**    EXPECT projectName
              4334-kamala-beach-phucket


      Get all JSON files : 4334-sprinter-data-xxxx.json

      Listing is showing 6 columns:

      Station
      dh Forward
      dh Backward
      dh mean
      distance
      adjustment
      elevation
      remarks
**/


async function get_loops_data(projectName) {
  const data = []; // aggregation of all legs



  const jobs = await get_jobs(projectName);
  let jobNo =0;
  for await (const job of jobs) {
    const retv = await s3Client.getObject(Bucket, job.Key)
    if (retv.httpStatusCode == 200) {
      const job = JSON.parse(retv.Body.toString());
      console.log({job})
      ++jobNo;
      job.data.forEach(row =>{
        row.jobNo = jobNo; //
      })
      data.push(...job.data)
    } else {
      throw `failed to load ${Key}`;
    }
  }


  data.forEach((it,j)=>{
      //    console.log(`ptNo:${it.fw.ptNo} sid:${it.fw.sid}`)
      console.log(`ptNo: ${it.fw.jobNo}-${it.fw.ptNo} sid:${it.fw.sid}`)
  })

  {
    console.log(`get-loops-data <${projectName}> (${data.length})`)
    const it = data[data.length-1];
    console.log(`ptNo: ${it.fw.jobNo}-${it.bw.ptNo} sid:${it.bw.sid} ***`)
  }


  console.log(`data.length:${data.length}`)

  return data;
}


Meteor.methods({
  'get-loops-data': async function(projectName) {
    const data = await get_loops_data(projectName)
/*
    const Key = `projects/${jobName}`;
    const retv = await s3Client.getObject(Bucket, Key)
    console.log(`get-job-data@19 (${Key}):`,{retv})
//    const json = JSON.parse(retv.Body)
//    console.log({json})
//    return retv.Body.toString('utf8');
    const job = Object.assign(JSON.parse(retv.Body.toString()), {status:'ok'});
    return job;
    */

  //  console.log(data)

    return {data};
  }
})
