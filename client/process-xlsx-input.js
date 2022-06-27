import XLSX from 'xlsx';

import {xlsx2json} from '289-sprinter-lib'

const verbose =0;

export function process_xlsx_file (input_file) {
  ;(verbose) && console.log(`@33>>> jobName:${input_file.name} File:`,input_file)
  //      for (let i=0; i<input_files.length; i++) {console.log(`@33`,input_files[i])}

  const reader = new FileReader()
  //    reader.readAsDataURL(input_files[0]);
  const {name:jobName, lastModified} = input_file;
  //const p2 = process_loops.bind({jobName:input_file.name});

  return new Promise((resolve,reject)=>{
    function cb(data) {
      //;(verbose) &&
      console.log(`callback data:`,data)
      resolve(data)
    }
    reader.onload = process_xlsx2_data.bind({jobName, lastModified, cb});
    reader.readAsArrayBuffer(input_file) // => autorun
  })

} // read xlsx

// ---------------------------------------------------------------------------


function process_xlsx2_data(e, o={}) {
  const {verbose} = o;
  //        avatar = e.target.result
  const file = e.target; // bind to input_file
  // WRONG user getter ....const {name:jobName, lastModified} = file;
  //console.log(`this:`,this)
  ;(verbose) && console.log(`e.target.result@64 jobName:${this.jobName}`,e.target,{file})
  ;(verbose) && console.log(`e.target.result@65`,e.target.result)
  const data = xlsx2json(e.target.result)
  ;(verbose) && console.log(`processing done found ${data.length}`,{data})
  this.cb(data)
}





function xlsx2json_Obsolete(xlsx, o={}) {
  const {verbose} = o;
  const options_a = {
    cellDates:false
  }


  let workbook;
//  console.log(`${typeof xlsx} :${(xlsx instanceof ArrayBuffer)?a:b}:`,xlsx)

  if (xlsx instanceof ArrayBuffer) {
    workbook = XLSX.read(xlsx);
  } else {
    // assert it's a string
    workbook = XLSX.readFile(xlsx, options_a);
  }

  const options = {
    header: ['arrayNo','ptNo','height','dist','StaffType','ReferNo',
      'mtype','IsReferNo','Elevation','D.Elv','Cut','Fill','dh','sid']
  }

  const sheet1 = workbook.SheetNames[0];
  const raw_data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet1],options);
  console.log(raw_data)
  const data = validate_sheet(raw_data, {verbose})

  /*
  data.forEach(it =>{
    //console.log(format2(it))
    console.log({it})
  })*/

  return data;
}


// -------------------------------------------------------------------------


function validate_sheet(xr, o={}) {
  const {verbose} = o;
  let offset =0;
  let _ptNo =0;
  let _arrayNo =0; // base modulo 5
  let skipping = true;

  const data =[]; // one or more loops incomplete

function push_sequence(j) {
  const o = { // Forward
    fw: {sid: xr[j].sid,
          ptNo: xr[j].ptNo,
          dh: xr[j].height-xr[j+1].height,
          dist: xr[j].dist+xr[j+1].dist
        },
    bw: {sid: xr[j+1].sid,
      ptNo: xr[j+1].ptNo,
      dh: xr[j+2].height-xr[j+3].height,
      dist: xr[j+2].dist+xr[j+3].dist
    }
  }
  data.push(o)
}

/*
  for (let j=0; j<xr.length; j+=1) {
    xr[j].arrayNo = +xr[j]['arrayNo'];
    xr[j].ptNo = +xr[j]['ptNo'];
    console.log(`@29`,xr[j])
  }
*/

function log(j,s,exit=true) {
  console.log(`[${_arrayNo}:${_ptNo}]`,s, xr[j])
  if (exit) process.exit();
}


function warning(s) {
  console.log(`[${_arrayNo}:${_ptNo}] *warning* `,s);
}

function notice(s) {
  console.log(`[${_arrayNo}:${_ptNo}] *notice* `,s);
}

function fatal(j,s, exit=true) {
  console.error(`[${_arrayNo}:${_ptNo}]`,s, xr[j])
  ;(exit) && process.exit()
}


function skip_until_BFFB(jj) {
  for (let j=jj; j<xr.length; j+=1) {
    //console.log(xr[j])
    if (xr[j].mtype != 'BFFB-Mean') continue;
    return j;
  }
  return xr.length;
}


  main_loop:
  for (let j=0; j<xr.length; j+=1) {
    if (skipping) {
      if (isNaN(+xr[j].arrayNo)) {
          ;(verbose >1) && console.log(`skipping `,xr[j])
          continue;
        }
        // switch mode
        offset = j - xr[j].arrayNo;
        _ptNo = xr[j].ptNo
        _arrayNo = xr[j].arrayNo
        ;(verbose >0) && console.log(`SYNC at xr[${j}]:`,xr[j])
        //process.exit();
        skipping = false; // entering in a loop
        notice(`re-entering in parsing mode`)
      }

//    const {'arrayNo','ptNo','Height','Distance','StaffType',
//      'Meas-Type','IsReferNo','dH','sid'} = xr[j];

    if (isNaN(xr[j].arrayNo)) {
      // switch back to skipping
      skipping = true;
      warning(`Missing arrayNo - doing resync.`)
      ;(verbose >0) && log(j,`Missing arrayNo => RE-SYNC `,false)
      continue;
    }


    if (xr[j].arrayNo != _arrayNo) {
      warning(`@63 sequence arrayNo ${_arrayNo} => ${xr[j].arrayNo} reseting-Ok.`)
      _arrayNo = xr[j].arrayNo
    }


    if (xr[j].arrayNo < _arrayNo) {
      fatal(`arrayNo changed to smaller number`)
    }

    for (let k=0; k<5; k++) {
      if (_arrayNo +k != xr[j+k].arrayNo) {
        ;(verbose >0) && log(j+k, `@64 arrayNo expected:${_arrayNo +k} found:"${xr[j+k].arrayNo} => RE-SYNC"`, false)
        skipping = true;
        warning(`Missing arrayNo[${k}] - doing resync.`)
        continue main_loop; // +=1
      }
    }

    if (xr[j+4].mtype != 'BFFB-Mean') {
      fatal(j+4, `(${xr[j+4].arrayNo}:${xr[j+4].ptNo})  Meas-Type expected: 'BFFB-Mean' found:${xr[j+4].mtype}`,false)
      console.log('FATAL ERROR in sequence BFFB - trying to recover...')
      const nj = skip_until_BFFB(j)
      j = nj;
      _arrayNo = xr[j+1].arrayNo;
      _ptNo = xr[j+1].ptNo
//      fatal(j,`nj:${nj}`)
      notice(`fixed/resync at (${_arrayNo}:${_ptNo})`)
      continue main_loop; // will add +1
    }


    if (xr[j].mtype != 'B') log(j, `(${xr[j].arrayNo}:${xr[j].ptNo})  Meas-Type expected:'B' found:${xr[j].mtype}`)
    if (xr[j+1].mtype != 'F') log(j+1, `(${xr[j+1].arrayNo}:${xr[j+1].ptNo})  Meas-Type expected:'F' found:${xr[j+1].mtype}`)
    if (xr[j+2].mtype != 'F') log(j+2, `(${xr[j+2].arrayNo}:${xr[j+2].ptNo})  Meas-Type expected:'F' found:${xr[j+2].mtype}`)
    if (xr[j+3].mtype != 'B') log(j+3, `(${xr[j+3].arrayNo}:${xr[j+3].ptNo})  Meas-Type expected:'B' found:${xr[j+3].mtype}`)


    /**
    ** if the FIRST one change we can adjust.
    **/

    if (xr[j].ptNo != _ptNo) {
      warning(`${xr[j].arrayNo}  ptNo expected: ${_ptNo} found:${xr[j].ptNo}`)
      console.log(`RE-ADJUSTING FIRST ptNo in a sequence. ${_ptNo} => ${xr[j].ptNo}`)
      _ptNo = xr[j].ptNo;
      // proceed.
    }

    /**
        those must be in sequence
    **/


    if (xr[j+1].ptNo != _ptNo+1) log(j+1,`${xr[j+1].arrayNo}  ptNo expected: ${_ptNo+1} found:${xr[j+1].ptNo}`)
    if (xr[j+2].ptNo != _ptNo+1) log(j+2, `${xr[j+2].arrayNo}  ptNo expected: ${_ptNo+1} found:${xr[j+2].ptNo}`)
    if (xr[j+3].ptNo != _ptNo) log(j+3,`${xr[j+3].arrayNo}  ptNo expected: ${_ptNo} found:${xr[j+3].ptNo}`)
    if (xr[j+4].ptNo != _ptNo+1) log(j+4,`${xr[j+4].arrayNo}  ptNo expected: ${_ptNo+1} found:${xr[j+4].ptNo}`)


    for (let k=0; k<4; k++) {
      if (!isNaN(xr[j+k].dh)) log(j+k, `dh should be null ${xr[j+k].dh}`)
    }
    if (isNaN(xr[j+4].dh)) log(j+4, `Invalid dh ${xr[j+4].dh}`)



    ;(verbose >0) && console.log(`Sequence starting at arrayNo:${_arrayNo} ptNo:${_ptNo} is Ok.`)

    push_sequence(j)

    _arrayNo = xr[j+4].arrayNo +1; // next
    _ptNo += 1;

    j +=4;
  } // loop
  if (!skipping)
    notice(`closing sheet. Ok.`)

  return data;
}
