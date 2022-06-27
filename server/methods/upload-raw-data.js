
import {s3Client, Bucket} from '../s3-client.js';

import YAML from 'yaml'
//import {s3put} from '../aws-s3.js'
//import fs from 'fs'

verbose =1;

Meteor.methods({
  'upload-sprinter-data': async (sprinter) =>{
    sprinter.timeStamp = new Date();
    sprinter.fromIp = 'localhost';

    console.log({sprinter})
    const fw_ptNo1 = sprinter.data[0].fw.ptNo;

//    const data = "comment: This is just a test!";
    const data = JSON.stringify(sprinter);
    const projectCode = sprinter.project.split('-')[0]
    const Key = `projects/${sprinter.project}/${projectCode}-sprinter-data-${fw_ptNo1}.json`;


    try {

      const cmd = {
        Body: JSON.stringify(sprinter,null, 2),
        Bucket,
        Key,
        ContentType: 'text/plain',
        ContentEncoding: 'utf8',
      }

      const retv1 = await s3Client.putObject(cmd)
      ;(verbose >0) && console.log(`putObject:`,retv1)
  //      if (retv1.error) throw('fatal@110')

      const retv ={
        status:'ok',
        link: `https://${Bucket}.us-east-1.linodeobjects.com/${Key}`
      }
      return retv;
    } catch(err) {
      console.log('upload-sprinter-data', {err})
      return {
        error: 'unable-to-supload',
        link: `https://${Bucket}.us-east-1.linodeobjects.com/${Key}`
      }
    }
  }
})

/**

//    should be in the client

**/

function sprinter_data(loops) {
  const _loops = [];
  loops.forEach(loop =>{
    const _loop = []; _loops.push(_loop);
    loop.stations.forEach(line =>{
//      console.log({line})
      const {sid, df, db, mean, dist} = line;
      _loop.push({sid, df, db, mean, dist})
    })
  })
  return _loops;
}
