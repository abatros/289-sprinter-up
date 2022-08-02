import {s3Client, Bucket} from '../s3-client.js';


async function write_csv(Key, loop) {
  const csv = [];
  let elevation = 100.00;
  loop.forEach(leg =>{
    const {fw,bw, flag_error, wrong_reading} = leg;
    const mean = (fw.dh - bw.dh)/2;
    const dist = (fw.dist + bw.dist)/2;
//    print(line)

    if (leg.active) {
      const comm = '';
  //    console.log(`${fw.sid || '**'};;;;${elevation.toFixed(3)};`);
  //    console.log(`;${fw.dh.toFixed(3)};${bw.dh.toFixed(3)};${mean.toFixed(3)};;${comm}`);

      csv.push(`${fw.sid || '**'};;;;;;${elevation.toFixed(5)};${fw.sid || '**'}`);
      csv.push(`;${fw.dh.toFixed(5)};${bw.dh.toFixed(5)};${mean.toFixed(5)};${dist.toFixed(5)};;;`);

      elevation += mean;
    }


  })


  const csv_ = csv.join('\n');
  console.log(csv_)

  try {

    const cmd = {
      Body: csv.join('\n'), //JSON.stringify(csv.join('\'), null, 2),
      Bucket,
      Key,
      ContentType: 'text/plain',
      ContentEncoding: 'utf8',
    }

    const retv1 = await s3Client.putObject(cmd)
    ;(verbose >0) && console.log(`putObject:`,retv1)
  }
  catch(error) {
    console.log(`error writing CSV`)
    throw error;
  }
}



Meteor.methods({
'export-csv': async (args)=>{
  console.log('method: export-csv')
  const {legs, report, projectName} = args;
  console.log(`method: export-csv <${projectName}> legs:${legs.length}`,report);


//  sprinter.timeStamp = new Date();
//  sprinter.fromIp = 'localhost';

//  console.log({sprinter})
//  const fw_ptNo1 = sprinter.data[0].fw.ptNo;

//    const data = "comment: This is just a test!";


  const loop = {legs, startp:{ptNo:report.startp},
    endp:{ptNo:report.endp},
    projectName
  };
  const data = JSON.stringify(loop);
  const projectCode = projectName.split('-')[0]
  const Key = `projects/${projectName}/${projectCode}-loop-${loop.startp.ptNo}.json`;

  console.log({loop})
  console.log({Key})

  try {

    const cmd = {
      Body: JSON.stringify(loop, null, 2),
      Bucket,
      Key,
      ContentType: 'text/plain',
      ContentEncoding: 'utf8',
    }

    const retv1 = await s3Client.putObject(cmd)
    ;(verbose >0) && console.log(`putObject:`,retv1)
//      if (retv1.error) throw('fatal@110')

    const Key2 = `projects/${projectName}/${projectCode}-loop-${loop.startp.ptNo}.csv`;
    await write_csv(Key2, loop.legs);


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
