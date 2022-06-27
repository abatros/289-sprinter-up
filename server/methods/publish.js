import fs from 'fs'
import assert from 'assert'
import { exec, execSync } from "child_process";
const AWS = require('aws-sdk');
import YAML from 'yaml'
import {mk_tex3} from './mk-tex3.js'
const verbose =0;

function get_s3cfg_accessKeys(fn) {
  retv = {}
  const lines = fs.readFileSync(fn,'utf8')
    .split('\n')
    .filter(line =>{
      if (line.startsWith('access_key')) return 1;
      if (line.startsWith('secret_key')) return 1;
      return 0;
    })
    .forEach(line =>{
      const v = line.split(' ');
      retv[v[0].trim()] = v[2].trim();
    })


  const {access_key:accessKeyId, secret_key:secretAccessKey} = retv;
  const retv2 = {accessKeyId, secretAccessKey};
  ;(verbose >0) && console.log(`get_s3cfg_accessKeys:`,{retv2})
  return retv2;
}

function get_accessKeys() {
  let env1 = process.env.METEOR_SETTINGS && JSON.parse(process.env.METEOR_SETTINGS)
  env1 = env1 || get_s3cfg_accessKeys('/home/dkz/.s3cfg');
  return env1;
}


/*
GitHUB.
*/
const {accessKeyId, secretAccessKey} = get_accessKeys();

const endpoint = 'https://us-east-1.linodeobjects.com';
const Bucket = 'cb-survey';


const s3 = new AWS.S3({
              accessKeyId,
              secretAccessKey,
              endpoint,
              s3ForcePathStyle: true, // needed with minio?
              signatureVersion: 'v4',
//              region:'default',
//              http_continue_timeout: 0 //# disable 'expect: 100-continue'
    });

console.log(`publish.js (init) S3`, s3.endpoint)


async function s3put(fileName, o={}) {
  const {type, Key} = o;

  assert(Key, 's3put@10 Missing Key')

  /**
  // SEE:
  https://www.ibm.com/docs/en/aspera-on-cloud?topic=resources-aws-s3-content-types
  **/

  let ContentType;
  switch(type) {
    case 'pdf':
      ContentType = 'application/pdf';
    break;
    case 'xlsx':
      ContentType = 'application/vnd.ms-excel';
    break;
    default:
      ContentType = 'text/plain;charset=utf8';
  }


  const data = fs.readFileSync(fileName) // Buffer
  console.log(`data.length@22: ${data.length}`)
  const p = {
    Bucket,
    Key,
    ContentType,
    ACL: 'public-read',
    Body: data
  };
  const retv3 = await s3.putObject(p).promise().
  then(retv =>{
    console.log(`then@61 `,{retv})
    return retv
  })
  .catch(err =>{
    console.log(`s3.putObject@61 failed:`,{err})
  });
  ;(verbose >=0) && console.log(`s3put writing@34 <${Key}> ETag:<${retv3.ETag}>`)
  return retv3
}


Meteor.methods({
  'publish': async (cmd_) =>{
    const {loop, style} = cmd_
    console.log(`using style <${style}>`,{cmd_})
    /**
    // SHOULD BE ASYNC WITH PROMISE
    **/
    const {stations} = loop;
    /*
    let z = loop.startz;
    stations.forEach((it,j) =>{
      z += it.mean;
      it.z = z;
      console.log(`${it.sid}  dh:${it.mean.toFixed(3)} ${z.toFixed(3)} ${it.elevation}`)
    })
    */
    const xfile = fs.readFileSync('/home/dkz/cb-survey/project-kamala-beach-phuket.yaml', 'utf8')
    if (!xfile || xfile.length <=0) {
      throw 'fatal@121 yaml not found'
    }
//    console.log({xfile})
    const xdata = YAML.parse(xfile)
//    console.log({xdata})
    Object.assign(loop,xdata);

    let tex_code;
    switch (style) {
      case 'style3.sty': {
        tex_code = mk_tex3(loop);
        break;
      }
      default:
      tex_code = mk_tex(loop);
    }


    const {project, loopNo=1, job} = loop;

    const fName = `elevation-report-${project.fname}-${job.name}-${loopNo+1}`;
    fs.writeFileSync(`/home/dkz/cb-survey/${fName}.tex`, tex_code, 'utf8')


    fs.writeFileSync(`/home/dkz/cb-survey/${fName}.json`, JSON.stringify(loop,null,'\t'), 'utf8')
    const retv2 = await s3put('/home/dkz/cb-survey/'+fName+'.json', {type:'json', Key: fName+'.json'})
    console.log(`s3put@147 JSON/DATA =>`,retv2)

    const yaml_code = YAML.stringify(loop,{});
    fs.writeFileSync(`/home/dkz/cb-survey/${fName}.yaml`, yaml_code, 'utf8')
    const retv3 = await s3put('/home/dkz/cb-survey/'+fName+'.yaml', {type:'json', Key: fName+'.yaml'})
    console.log(`s3put@147 YAML =>`,retv3)

    const cmd = `pdftex  -output-dir=/home/dkz/cb-survey  /home/dkz/cb-survey/${fName}.tex`;

    try {
      const retv = execSync(cmd, {}).toString('utf8');
      console.log(`[${cmd}] => ${retv}`)
      const v = retv.split('Output written on')
      console.log({v})
      const v2 = v[1].trim().split(' ')
      console.log({v2})
      console.log(`Output:<${v2[0]}>`)

      if (false) {
        /**
        // Should do streaming here...
        **/
      } else {
        const retv = await s3put('/home/dkz/cb-survey/'+fName+'.pdf', {type:'pdf', Key: fName+'.pdf'})
        console.log(`s3put@101 =>`,retv)
        return {log:retv, pdfName:fName+'.pdf',
            url: `http://us-east-1.linodeobjects.com/cb-survey/${fName}.pdf`
          }
      }

    }
    catch(err) {
      console.log(`[${cmd}] => error`)
      console.log('FAILED',err)
      return ''

  //    console.log('FAILED',`[${err.err.id}]`,{err})
  //    return err.id
    }


  }
})


/**
//    this is export in TeX format
//    this file will import a style
**/

function mk_tex(loop) {
  const {stations,
    error, ae,
    project, loopNo,
    df_sum, db_sum, mean_sum, dist_sum, adj_sum,
    startp, report,
    job } = loop;

//console.log({loop})

function fix_date(date) {
  return date.toString().replace(/\(.*\)/,'(Asia/Bangkok)')
}


  const _today = new Date();
//  const date = _today.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })
//  const date = _today.toString().replace(/\(.*\)/,'(Asia/Bangkok)')
  const date = fix_date(_today)

  const vtex = [`\\topskip10pt\\vsize=290mm\\voffset=-30pt
\\pdfpageheight 297mm
\\font\\TT = cmtt10 at 12pt
  `];

  mk_page_header2(vtex, loop)

  function mk_page_header2_Obsolete(vtex,loop) {
    vtex.push(`
\\bgroup

    REPORT ELEVATION --- Project: ${project.name} {\\bf LOOP-${loopNo+1}}
    \\par job origin: {\\TT ${job.name.toUpperCase()}}
    \\par lastModified: ${fix_date(new Date(job.lastModified))}
    \\par published: ${date}
    \\par
\\egroup
    `);
  }


  function mk_page_header(vtex,loop) {
    vtex.push(`
    \\bgroup\\parskip=5pt
    REPORT ELEVATION --- Project: ${project.name} {\\bf LOOP-${loopNo+1}}
    \\par job origin: {\\TT ${job.name.toUpperCase()}}
    \\par lastModified: ${fix_date(new Date(job.lastModified))}
    \\par published: ${date}
    \\par
    \\egroup
    `);
  }

  mk_table_header(vtex, loop)

  function mk_table_header(vtex,loop) {
    vtex.push(`
\\dimen12=1.2pt
\\vskip10pt
\\halign{\\vrule width\\dimen12 \\vrule height11pt depth4pt width0pt
   \\kern5pt\\hfil#\\hfil\\kern5pt\\vrule    % sid
  &\\kern5pt\\hfil#\\kern2pt\\vrule   % fw
  &\\kern5pt\\hfil#\\kern2pt\\vrule   % bw
  &\\kern12pt\\hfil#\\kern2pt\\vrule   % mean
  &\\kern12pt\\hfil#\\kern2pt\\vrule   % distance
  &\\kern12pt\\hfil#\\kern2pt\\vrule   % Adj
  &\\kern12pt\\hfil#\\kern5pt\\vrule   % Elevation
  &\\kern2pt\\hfil#\\hfil\\kern2pt
  \\vrule width\\dimen12  % Remarks
  \\cr
\\noalign{\\hrule height0.0pt depth\\dimen12}
Station \\vrule height18pt depth10pt width0pt
& Forward
& Backward
& Mean\\kern4pt
&Distance
& Adj.\\kern14pt
&Elevation\\hfil
&\\kern25pt Remarks\\kern25pt
\\cr
\\noalign{\\hrule height0.0pt depth\\dimen12}
`)
}


vtex.push(`${startp.sid} &&&&&&${(+startp.gps_elevation).toFixed(3)} &fix: ${+(startp.gps_elevation).toFixed(3)}\\cr`)
//vtex.push(`\\noalign{\\hrule}`)

//vtex.push(`&${fw.toFixed(3)} &${bw.toFixed(3)} &${mean.toFixed(3)} &${dist.toFixed(3)} &${adj} &&\\cr`)


  const endp = stations[stations.length-1];

  for (it of stations) {
//    console.log(it)
    if (!it.active) continue;

    // z : gps-elevation
    const {sid,df:fw,db:bw,mean,dist,adj,z,elevation,ae,gps_elevation,rem='rem'} = it;

    vtex.push(`\\noalign{\\hrule}`)
    vtex.push(`&${fw.toFixed(3)} &${bw.toFixed(3)} &${mean.toFixed(3)} &${dist.toFixed(3)} &${adj.toFixed(4)} &&\\cr`)

    vtex.push(`\\noalign{\\hrule}`)
//    vtex.push(`${sid} &&&&&&${elevation.toFixed(3)} &${sid}\\cr`)

    if (it == endp)
      vtex.push(`${sid} &&&&&&${ae.toFixed(3)} &fix: ${gps_elevation.toFixed(3)}\\cr`) // gps data
    else
    vtex.push(`${sid} &&&&&&${ae.toFixed(3)} &\\cr`) // gps data
  }

  vtex.push(`\\noalign{\\hrule height0pt depth\\dimen12}`)

//  console.log({loop})

  vtex.push(`SUMMARY \\vrule width0pt height20pt depth10pt
    &${df_sum.toFixed(3)} &${db_sum.toFixed(3)} &${mean_sum.toFixed(3)} &${dist_sum.toFixed(3)} &${adj_sum.toFixed(3)}\\kern10pt&&\\cr`)
  vtex.push(`\\noalign{\\hrule height0.0pt depth\\dimen12}`)


  const last_row = stations[stations.length-1];
  console.log({last_row})

  vtex.push('}\n\\vskip30pt')

  /*
  vtex.push(`\\hbox to400pt{\\hfil gps-elevation at endpoint: ${last_row.gps_elevation.toFixed(3)}}`)
  vtex.push(`\\hbox to400pt{\\hfil computed elevation: ${last_row.elevation.toFixed(3)}}`)
  vtex.push(`\\hbox to400pt{\\hfil ${(last_row.gps_elevation-last_row.elevation).toFixed(3)}}`)
  vtex.push(`\\hbox to400pt{\\hfil Actual Error: ${error.toFixed(3)}}`)
  vtex.push(`\\hbox to400pt{\\hfil Allowable Error: ${ae.toFixed(3)}}`)
  */


  /*
  vtex.push(`\\par Class: 2`)
  qf \\sqrt{\\sum_{k=1}^{${stations.length}} dist_k \\over 1000}
  */

  vtex.push(`
  \\setbox102=\\vbox\\bgroup
  \\hsize=110pt
  $$0.012 \\sqrt{${dist_sum.toFixed(3)} \\over 1000} = ${ae.toFixed(3)}$$
  \\egroup\\ht102=30pt\\dp102=20pt
  `);



  vtex.push(`\\halign\\bgroup
    \\hfil# & =\\kern10pt #\\hfil\\cr`)

  vtex.push(`Error (FW\\&BW) & ${(Math.abs(db_sum) - Math.abs(df_sum)).toFixed(3)} m\\cr`)
  vtex.push(`\\noalign{\\kern10pt}`)
  vtex.push(`Error (Closed loop) & ${mean_sum.toFixed(3)} m\\cr`)

//  vtex.push(`Allowable Error & $0.012 \\sqrt{${dist_sum.toFixed(3)} \\over 1000}$\\cr`)
  vtex.push(`Allowable Error & \\hbox{\\box102}\\cr`)

  vtex.push(`& ${ae.toFixed(3)} m\\cr`)


//  vtex.push(`FINAL & \\hbox{\\box102}\\cr`)


  vtex.push(`\\egroup`)




  vtex.push('\\end\\bye')

  return vtex.join('\n');
} // mk_tex


function mk_page_header2(vtex,loop) {
  vtex.push(`
\\vtop{
\\dimen12=1.2pt % rules thickness
\\font\\ft = cmss10 at 10pt\\ft
\\font\\FT = cmssbx10 at 14pt\\ft
\\font\\fti = cmti10 at 10pt\\ft


\\setbox101=\\vbox to70pt{
\\hsize = 120pt
\\parskip=0pt\\parindent=0pt
\\hbox to\\hsize{\\kern5pt Surveyed by\\hfil}
%\\hbox{\\pdfximage{./cb-logo1.jpeg}}
\\setbox0=\\hbox{\\pdfximage width110pt {/home/dkz/cb-logo1.jpeg}\\pdfrefximage\\pdflastximage}
\\kern5pt
\\box0
\\vss
}

\\setbox103=\\vbox to70pt{
\\vfil
\\hbox{\\FT Leveling Computations}
\\vfil
}


\\setbox107=\\vbox to70pt{
\\hsize=120pt
\\kern5pt
\\hbox{\\kern5pt Page :}
\\vfil
\\hbox to\\hsize{\\hss 1 of 1\\hss}
\\vfil\\vfil
\\hrule
\\kern5pt
\\hbox{\\kern5pt Date :}
\\vfil
\\hbox to\\hsize{\\hss ${loop.project.date}\\hss}
\\vfil\\vfil
}

\\setbox 110 =\\vbox{
\\hsize=400pt
\\parskip3pt\\parindent5pt
\\kern3pt
\\par
Project: ${loop.project.name}
\\par
Location: ${loop.project.location}
\\par Note:
\\fti ${loop.vcf.text}
{\\ft ${loop.vcf.code}}
\\par
\\kern5pt
}


    %%
    %% BODY
    %%

\\hrule height\\dimen12
\\hbox to\\hsize\\bgroup
\\vrule width\\dimen12
\\ht101=60pt
\\box101
\\vrule width\\dimen12
\\hss
\\box103
\\hss
\\vrule width\\dimen12
\\box107
\\vrule width\\dimen12
\\egroup
\\hrule height\\dimen12

\\hbox to\\hsize\\bgroup
\\vrule width\\dimen12
\\kern5pt
\\box110\\hss
\\vrule width\\dimen12
\\egroup
\\hrule height\\dimen12
}
`)
}
