const AWS = require('aws-sdk');
import YAML from 'yaml'
//import {s3put} from '../aws-s3.js'
import fs from 'fs'

Meteor.methods({
  'upload-sprinter-data': async (sprinter) =>{
    console.log({sprinter})
    const {loops, job} = sprinter;
    const {name, lastModified} = job;
    console.log({loops},{job})
//    const json_data = sprinter_data(loops)

    const local_fname = `/home/dkz/cb-survey/${job.name}.json`
    const s3_name = `${job.name}.json`
    fs.writeFileSync(local_fname, JSON.stringify(sprinter,null,'\t'), 'utf8')
    const retv2 = await s3put(local_fname, {type:'json', Key: s3_name})
    console.log(`s3put@147 JSON/DATA =>`,retv2)
    console.log(`s3put@148 JSON/DATA =>`,retv2)

    return retv;
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
