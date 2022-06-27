import {s3Client, Bucket} from '../s3-client.js';


// should be a method.
async function get_jobs(projectName) {

  const projectCode = projectName.split('-')[0];

  const Prefix = `projects/${projectName}/${projectCode}-sprinter-data`;



  const data = await s3Client.listObjects(Bucket,Prefix);
  //console.log(`Jobs for ${projectName} :`,{data});

  /**
  **      Here we are looking for Objects : xlsx, yaml, json....
  **/

  //console.log(`Jobs:`,data.Contents);
//  console.log(`get-jobs@40:`,data.Contents.map(it=>it.Key));
  return data.Contents.map(it=>{
//    return it.Prefix.split('/')[1]
    const {Key, LastModified, Size} = it;
    return {Key, LastModified, Size}
  });
}


/*
**      Create an object (not a folder! there is no folders in S3)
        ex: s3://cb-survey/projects/${projectName}/${projectCode}-config.yaml
*/


function validate_projectName(name) {
  const projectCode = name.split('-')[0];
  if ((projectCode.length >5)||(projectCode.lenth<3)) {
    return {error: `projectCode is ${projectCode.length} characters - should be between 3 and 5`}
  }
  return {projectCode, projectName:name}
}



// -----------------------------------------------------------------------------

async function create_s3_project(cmd) {
  const {projectName, projectCode} = cmd;
  console.log(`create-s3-project(${projectName})`)
  const Key = `projects/${projectName}/${projectCode}-config.yaml`;

  const retv1 = await s3Client.headObject(Bucket,Key)
  console.log(`headObject`,{retv1})
  if (retv1.ETag) {
    console.log(`already exists`)
    return Object.assign(retv1,{error:'already exists'}); // already exists!
  }


  const Body = `projectName: ${projectName}`
  const retv2 = await s3Client.putObject({Bucket, Key, Body, ContentType:'application/yaml'})
  console.log({retv2})

  return retv2
}



// -----------------------------------------------------------------------------


Meteor.methods({
  'create-project': async (cmd) =>{
    const {name} = cmd;
    console.log(`create-project(${name})`)
    cmd = validate_projectName(name);
    const {error, projectCode, projectName} = cmd;
    if (error) return {error};

    // return a Promise, or use async/await

    const retv = await create_s3_project(cmd)
    console.log(`create_s3_project =>`,retv)
    return retv
  },
})
