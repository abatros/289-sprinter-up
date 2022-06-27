import assert from 'assert'
import {s3Client, Bucket} from '../s3-client.js';




export async function get_jobs(projectName) {

  const projectCode = projectName.split('-')[0];

  const Prefix = `projects/${projectName}/${projectCode}-sprinter-data`;

//  const metadata = await get_project_metadata(projectName)


  //await resync_project_metadata(projectName, true)

  const retv = await s3Client.listObjects(Bucket,Prefix);
  //console.log(`Jobs for ${projectName} :`,{retv});

  /**
  **      Here we are looking for Objects : xlsx, yaml, json....
  **/

  //console.log(`Jobs:`, retv.Contents);
//  console.log(`get-jobs@40:`,data.Contents.map(it=>it.Key));

  const jobs = retv.Contents.map(it=>{
//    return it.Prefix.split('/')[1]
    const {Key, LastModified, Size} = it;
    return {Key, LastModified, Size}
  });

  //console.log({jobs})

  assert(Array.isArray(jobs))
  jobs.forEach(job =>{
    const {Key, LastModified, Size} = job;
    job.shortName = Key.split('/')[2];
    const regex1 = /^.*\-([0-9]+)\.json/
    // then extract %d.json
    const match = job.shortName.match(regex1)
//      console.log(`match1:`,match[1])
    job.ptNo = +match[1]
    // if NOT a number ALERT
//      console.log(job)
  })
  jobs.sort((a,b)=>(a.ptNo - b.ptNo))

  return jobs;

}

// ----------------------------------------------------------------------------


export async function get_project_metadata(projectName) {

  const Key = projectName + `/${projectName.split('-')[0]}-project.yaml`;
  let main = {};

  const retv = await s3Client.getObject(Bucket, Key)
  if (retv.httpStatusCode == 200) {
    const json = JSON.parse(retv.Body.toString());
    console.log(`project_metadata(${Key}) `,json)
  } else {
    console.log(`project_metadata(${projectName}) failed to load ${Key} => rebuilding...`);
  }


}

// ----------------------------------------------------------------------------

/*
              read project.yaml if exists
              read all sprinter data
              analyse sequence ptNo
              update project.yaml
*/

export async function resync_project_metadata(projectName) {
  const Key = 'projects/' +projectName + `/${projectName.split('-')[0]}-project.json`;
  let project = {};

  const retv = await s3Client.getObject(Bucket, Key)
  if (retv.httpStatusCode == 200) {
    project = JSON.parse(retv.Body.toString());
    console.log(`project_metadata(${Key}) `, project)
  } else {
    console.log(`project_metadata(${projectName}) failed to load ${Key} => Ok`);
  }

  project.name = project.name || projectName;
  assert(project.name == projectName)

  project.files = []

  const jobs = await get_jobs(projectName); // Array - possibly empty.

  for (const job of jobs) {
    //console.log(`resync_project_metadata@100`,{job})
    // open sprinter_data
    // record first/last ptNo.
    const Key = job.Key; // full key ready
    const retv = await s3Client.getObject(Bucket, Key)
    // if (retv.error) .... very bad...
    const json = JSON.parse(retv.Body)
//    console.log(`resync_project_metadata@100`,{json})
    //console.log(`resync_project_metadata@108`,json.data[0])
    //console.log(`resync_project_metadata@109`,json.data[json.data.length-1])
    const startp = json.data[0].fw.ptNo
    const endp = json.data[json.data.length-1].bw.ptNo

    const startp_id = json.data[0].fw.sid
    const endp_id = json.data[json.data.length-1].bw.sid

    console.log(`resync_project_metadata@110 startp:${startp} (${startp_id}) endp/midp:${endp} (${endp_id})`)
    /*
    const Key = `projects/${jobName}`;
    console.log(`get-job-data@19 (${Key}):`,{retv})
//    return retv.Body.toString('utf8');
    const job = Object.assign(JSON.parse(retv.Body.toString()), {status:'ok'});
    */

    project.files.push({Key,startp,endp,startp_id,endp_id})
  }


  console.log(project)
  const retv2 = await s3Client.putObject({Body:JSON.stringify(project,{space:2}), Bucket, Key, ContentType:'application/json'})
  console.log(`putObject(${Key}):`,{retv2})
  return retv2;
}
