import {s3Client, Bucket} from '../s3-client.js';


Meteor.methods({
  'get-project-metadata': (projectName) =>{
    console.log(`get-project-metadata(${projectName})`)
    return get_project_metadata(projectName); // Promise
//    return folders_lookup(); // premise
  },
})
