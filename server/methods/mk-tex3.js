function fix_date(date) {
  return date.toString().replace(/\(.*\)/,'(Asia/Bangkok)')
}

export function mk_tex3(loop) {
  const {stations,
    error, ae,
    project, loopNo,
    df_sum, db_sum, mean_sum, dist_sum, adj_sum,
    startp, report,
    job } = loop;


console.log({project})

  const _today = new Date();
  const date = fix_date(_today)

  const vtex =[`\\input style3.sty\n\n`];


  vtex.push(`
    \\def\\date{April 2022}
    \\def\\projectName{Kamala Beach Phucket}
    \\def\\location{Kamala Subdistrict, Kathu District, Phucket Province, Thailand}
    \\def\\vcfNote{The survey vertical control reference is from mean sea level (MSL)}
    \\def\\pageNo{1}

  `);



vtex.push(`\\ali ${startp.sid} !!!!!!${(+startp.gps_elevation).toFixed(3)} !fix: ${+(startp.gps_elevation).toFixed(3)}\\cr`)

  const endp = stations[stations.length-1];

  for (it of stations) {
//    console.log(it)
    if (!it.active) continue;

    // z : gps-elevation
    const {sid,df:fw,db:bw,mean,dist,adj,z,elevation,ae,gps_elevation,rem='rem'} = it;

    vtex.push(`\\ali !${fw.toFixed(3)} !${bw.toFixed(3)} !${mean.toFixed(3)} !${dist.toFixed(3)} !${adj.toFixed(4)} !!\\cr`)


    if (it == endp) {
      vtex.push(`\\ali ${sid} !!!!!!${ae.toFixed(3)} !fix: ${gps_elevation.toFixed(3)}\\cr`) // gps data

      vtex.push(`\\ali SUMMARY
          !${df_sum.toFixed(3)}
          !${db_sum.toFixed(3)}
          !${mean_sum.toFixed(3)}
          !${dist_sum.toFixed(3)}
          !${adj_sum.toFixed(3)}\\kern10pt!!\\cr`)
      vtex.push(`\\vskip0pt plus10pt`)
    }
    else {
      vtex.push(`\\ali ${sid} !!!!!!${ae.toFixed(3)} !\\cr`) // gps data
      vtex.push(`\\vskip0pt plus10pt`)
    }
  }


  /**
  // needs:
  //
  \def\actualerror{0.006 m}
  \def\closedLoopError{0.072}
  \def\allowedError{0.012}
  \def\sumdistance{567.321}
  **/

  vtex.push(`
\\def\\actualError{${(Math.abs(db_sum) - Math.abs(df_sum)).toFixed(3)} m}
\\def\\closedLoopError{${mean_sum.toFixed(3)}}
\\def\\allowedError{${ae.toFixed(3)}}
\\def\\sumdistance{${dist_sum.toFixed(3)}}
\\def\\dhgps{${loop.dh_gps_}}
\\def\\endp{${loop.endp.gps_elevation_}}
\\def\\startp{${loop.startp.gps_elevation_}}
  `)


//  console.log({loop})
  vtex.push(`\\SUMMARY`);


  const last_row = stations[stations.length-1];
//  console.log({last_row})


  //vtex.push(`\\egroup`)

  vtex.push('\\eject\\end')

  return vtex.join('\n');
} // mk_tex
