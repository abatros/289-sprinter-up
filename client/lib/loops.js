import assert from 'assert';
//import {loops_data} from '../router.js'


// ----------------------------------------------------------------------------



// ----------------------------------------------------------------------------

export function resync_loops(loops_data, o={}) {
  const {verbose,
    com_data  // last column.
  } = o;

  ;(verbose >=2) && console.log(`resync_loops@14 loops_data (${loops_data.length})`)

  let fw_dist =0;
  let bw_dist =0;
  let fw_dh =0;
  let bw_dh =0; // should be -fw_dh
  let row1 =null;

  function restart_a_loop(row) {
    row.uplink = row1;
    row1 = row;
    row1.report = {}
    fw_dist =0;
    bw_dist =0;
    fw_dh =0;
    bw_dh =0; // should be -fw_dh
    ;(verbose >0) && console.log(`restart-a-loop at (${row1.fw.ptNo}) report:`,row1.report)
  }


  function close_current_loop(row) {
    Object.assign(row1.report, {fw_dist, bw_dist, fw_dh, bw_dh,
          startp: row1.fw.ptNo,
          endp: row?.fw.ptNo,
          endp_sid: row.fw.sid,
        })
    ;(verbose >0) && console.log(`closing-a-loop at (${row1.fw.ptNo}) REPORT:`,row1.report)
  }


  for (let irow=0; irow < loops_data.length; irow ++) {
    const row = loops_data[irow];

    ;(verbose >=2) && console.log(`resync_loops@34 ptNo:${row.fw.ptNo}`)
    if (!row.active) {
      row.com = '***';
      continue;
    }

    if (!row1) {
      // FIRST Loop
      restart_a_loop(row);
    }

    if (row.loop_Marker) {
      close_current_loop(row); // create report in row1
      restart_a_loop(row)
    }; // do not add first measure in next loop.


    // FORWARD
    fw_dist += row.fw.dist;
    fw_dh += row.fw.dh;

    // BACKWARD (to close the loop...)
    bw_dist += row.bw.dist;
    bw_dh += row.bw.dh;


    /**
          Summary for each row:
          distance_so_far
          elevation_so_far
          error_so_far

          TO BE USED IN COLORING RESULT.
    **/

    row.dist_so_far = fw_dist+bw_dist;
    row.error_so_far = fw_dh+bw_dh;

    /**

        detect unbalanced measure:
        ABS(dh(FW,k) + dh(BW,k)) < ae(k)

    **/

    {
      const q = 0.008; // should be set at the project level.
      const ae_ = Math.sqrt((row.fw.dist+row.bw.dist)/1000); // this is elevation(k)
      const error = Math.abs(row.fw.dh + row.bw.dh)

      if (error < 0.003* ae_) row.cat=1 // perfect
      else if (error < 0.008* ae_) row.cat=2 // good
      else if (error < 0.012* ae_) {
        console.log(`alert@101 cat3 ptNo:${row.fw.ptNo} error:${error.toFixed(4)} ae:${(ae_*0.012).toFixed(4)}`)
        row.cat=3;
      }
      else {
        row.cat = 4;
        console.log(`alert@102 cat4 ptNo:${row.fw.ptNo} error:${error.toFixed(4)} ae_max:${(ae_*0.012).toFixed(4)}`)
      }
    }


    /**

        Compute allowed/max error --- quality measure
        on cumulative dh ===> elevation

        THIS PART SHOULD BE AN OPTION: step-error, cumulative-error, ....

    **/


    const ae = 0.008 * Math.sqrt((fw_dist+bw_dist)/1000); // this is elevation(k)

//    row.com = fw_dist.toFixed(2);
//    row.com = (fw_dh + bw_dh).toFixed(3);
//    row.com = `${(fw_dh + bw_dh).toFixed(3)}/${(row.fw.dh + row.bw.dh).toFixed(3)}`;


    switch(com_data) {
      case 'step-error':
        row.com = `${((row.fw.dh + row.bw.dh)*1000).toFixed(0)}`;
        break;

      case 'cumulative-error':
        row.com = `${((fw_dh + bw_dh)*1000).toFixed(0)}:${(ae*1000).toFixed(0)}`;
        break;


      default:
        row.com = '***'
    }








    /*
          always close the current loop at the end.
    */

    if (irow >= loops_data.length-1) {
      close_current_loop(row);
      /**
      **  FIX the last row
          Here, we are on the last row, NOT the first row on next loop.
      **/
      row1.report.endp_sid = row.bw.sid,
      row1.report.endp = row?.bw.ptNo;
      row.uplink = row1; // exception
      break; // no need
    }

  }




  return loops_data;
}


// ----------------------------------------------------------------------------

function full_scan(o={}) {
  const {verbose} = o;
  const index = mk_loop_index();
  ;(verbose >0) && console.log(`full_scan@8 found ${index.length} loops`)
  ;(verbose >1) && console.log(`full_scan@9 index:`,index)
  // console.log(`full_report()`,{index})
  let uplink = null;

  for (const row of index) {
    //console.log({row})
    //console.log(`index[${row.ix}] offset:${row.offset} ptNo:${row.fw.ptNo}`)
    // scan until end of loop.
    scan_a_loop(row.offset, {verbose:0});
    if (uplink) row.uplink = uplink; // link to previous loop.
    //console.log(`report:`,row)
    uplink = row;
  }
}


function scan_a_loop(offset, o={}) {
  const {verbose} = o;

  assert((offset==0) || loops_data[offset].loop_Marker)
  const row1 = loops_data[offset]
  //console.log(`scan_a_loop(${offset}) ptNo:${row1.fw.ptNo}`)
//  offset +=1;
  let fw_dist =0;
  let bw_dist =0;
  let fw_dh =0;
  let bw_dh =0; // should be -fw_dh

  for (; offset<loops_data.length; offset++) {
    const row = loops_data[offset]
    ;(verbose >0) && console.log(`-- scan_a_loop@36 (${offset}) ptNo:${row.fw.ptNo}`)
    if (!row.active) {
      row.sum = undefined;
      continue;
    }

    if (row.loop_Marker && (row != row1)) break; // do not add first measure in next loop.

    fw_dist += row.fw.dist
    bw_dist += row.bw.dist;
    fw_dh += row.fw.dh;
    bw_dh += row.bw.dh;
    loops_data[offset].sum = fw_dist
    ;(verbose >0) && console.log(`-- scan_a_loop@43 (${offset}) ptNo:${row.fw.ptNo} fw_dist:${fw_dist.toFixed(2)}`)
  }
  //console.log(`-- next loop at loops_data[${offset}]`, loops_data[offset])
  row1.report = {
    startp: row1.fw.ptNo,
    endp: loops_data[offset]?.fw.ptNo,
    fw_dist,
    bw_dist,
    fw_dh,
    bw_dh,
  }
}



function mk_loop_index() {
  let loopNo =0;
  let previous_loop_offset =0;
  const row1 = loops_data[0];

  row1.loop_Marker = 'loopMarker'; // could be ix...

  const index = loops_data.filter((row,j) => {
//    row.previous_loop_offset = previous_loop_offset;
    row.offset = j;
//    row.ix = j
//    previous_loop_offset = j;
//    row.loopNo = ++loopNo;
    return (row.loop_Marker);
  })

  index.forEach((it,j)=>{
    it.ix = j; // important: used to find previous loopMarker
  })


  /*
//  console.log(index)
  const row1 = loops_data[0];
  if (row1 != index[0]) {
    const _index = [row1]
    _index.push(...index)
    return _index
  } */

  return index;
}

function scan_previous_loop(row) {
//  console.log({row})//
  console.log({loops_data})
  row.ptNo = row.fw.ptNo;
  const index = mk_loop_index();
  let starting_station = index[0];

  for (const row_ of index) {
    console.log(`ptNo:${row_.fw.ptNo} MATCH:${(row_ == row)}`)
    if (row_ == row) {
      break;
    }
    starting_station = row_
  }

  /**
        when UNCUT
        starting_row is the last ref-station
        ending is the removed station.
  **/

  console.log(`starting at row:`,starting_station.fw.ptNo)
  console.log(`ending at row:${row.fw.ptNo}`, row.loop_Marker)

  return {startAt:starting_station, next:row}
}
