//import {s3Client, Bucket} from '../s3-client.js';

import {get_jobs, resync_project_metadata} from '../lib/get-jobs.js';
/**
    TWO WAYS to manage this:

    (1) look for folders.
    (2) have a yaml file listing the active projects.

    BOTH MUST have same output syntax.
**/



Meteor.methods({
  'get-jobs': async (projectName) =>{
    console.log(`get-jobs(${projectName})`)
    await resync_project_metadata(projectName)
    const jobs = await get_jobs(projectName);
//    return folders_lookup(); // premise
  return jobs;
  },
})
