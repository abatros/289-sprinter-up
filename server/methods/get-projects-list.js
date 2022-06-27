import {s3Client, Bucket} from '../s3-client.js';

/**
    TWO WAYS to manage this:

    (1) look for folders.
    (2) have a yaml file listing the active projects.

    BOTH MUST have same output syntax.
**/

async function folders_lookup_WRONG() {
  const retv = await s3Client.listObjects(Bucket,'projects','/')
  console.log(`listObjects <${Bucket}/projects>:`)
  retv.Contents.map(it=>{
    console.log(`-- s3://${Bucket}/${it.Key}`)
  })

  const plist =   retv.Contents.map(it=>{
      return it.Key
    })

  return plist;
}



// should be a method.
async function list_projects() {
//  const config = get_accessKeys();
//  const s3 = new S3(config);
  const data = await s3Client.listObjects("cb-survey",'projects/','/');
  console.log(`Projects:`,{data});
  //console.log(`Projects:`,data.Contents);
//  console.log(`Projects@40:`,data.CommonPrefixes.map(it=>it.Prefix));
  return data.CommonPrefixes.map(it=>{
    return it.Prefix.split('/')[1]
  });
}


Meteor.methods({
  'get-projects-list': () =>{
    return list_projects();
//    return folders_lookup(); // premise
  },


    'get-projects-list2': async function() {
    const retv = await s3get(keyName)
    console.log({retv})
    const json = JSON.parse(retv.Body)
    console.log({json})
//    return retv.Body.toString('utf8');
    return json;
  }
})
