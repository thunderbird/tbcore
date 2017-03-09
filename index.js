const fs = require('fs');
const readline = require('readline');
const {execSync} = require('child_process');

// parameters to manage processing

 // Max revisions to include (mostly for testing, make large for production)
const REV_COUNT = 5000;

// First revision
const FIRST_REV = 17600;

// Path to the repo to analyze
const REPO = 'd:\\repos\\comm-central';

// template string for hg output
const TEMPLATE = '{author|email},{diffstat},{date|shortdate},[[[{files}]]],[[[{desc}]]]\\n';

// Some people have alternate emails, or landings without emails. Consolidate into a single email.
const synonyms = {
  "Pidgeot18": "Pidgeot18@gmail.com",
  "kent@caspia.com": "rkent@caspia.com",
  "rkent": "rkent@caspia.com",
  "christian": "christian@hoffie.info",
  "Nomis101": "Nomis101@web.de",
  "Jorg K": "jorgk@jorgk.com",
  "clokep": "clokep@gmail.com",
  "mh+mozilla@glandium.org": "mh@glandium.org",
  "nthomas": "nthomas@mozilla.com",
  "philip.chee": "philip.chee@gmail.com",
  "Philip Chee": "philip.chee@gmail.org",
  "Frank-Rainer Grahl frgrahl@gmx.net": "frgrahl@gmx.net",
  "Neil Rashbrook": "neil@parkwaycc.co.uk",
  "ehsan.akhgari@gmail.com": "ehsan@mozilla.com",
  "gavin@gavinsharp.com": "gavin@mozilla.com",
  "iann_bugzilla@blueyonder.co.co.uk": "iann_cvs@blueyonder.co.uk",
  "mozilla@jorgk.com": "jorgk@jorgk.com",
  "philringnalda": "philringnalda@gmail.com",
  "squib": "squibblyflabbetydoo",
  "alta88": "alta88@gmail.com",
  "Jorg K and R Kent James": "rkent@caspia.com",
  "aceman": "acelists@atlas.sk",
  "cykesiopka@hotmail.com": "cykesiopka.bmo@gmail.com",

}

// 1) read revision data into an array of strings

let hgResult = execSync(`hg log -r ${FIRST_REV}:tip --cwd ${REPO} -l ${REV_COUNT} --template "${TEMPLATE}"`, {encoding: "utf-8"});
let hgLines = hgResult.split('\n');
//for (let line of hgLines) {
//  console.log(line);
//}
console.log(`Revision count: ${hgLines.length}`);

// 2) parse each revision into objects

let hgRevisions = [];

/*
  This structure will hold counts of changesets, per directory, indexed by email.
  Example:

  {
    jorgk@jorgk.com: {
      mailnews: 3,
      mail: 2
    },
  }
*/

let summedDirs = {};

for (let line of hgLines) {
  let [email, diffstat, date, files, desc] = line.split(',');
  if (!email || !desc) {
    // This seems to be extra lines on the checkin
    // console.log(`missing info for line ${line}`);
    continue;
  }
  //console.log(`line is ${line}`);
  //console.log(`email is ${email}`);

  // Consolidate synonyms
  email = synonyms[email] || email;

  // purge the delimiters from files and desc
  files = files.substring(3, files.length - 3);
  //console.log(`files: ${files}`);
  // mark modified directories
  let modifiedDirectories = {};
  let paths = files.split(' ');
  for (let path of paths) {
    //console.log(`file: ${path}`);
    let root = /^[^\/]*/.exec(path);
    if (root && root[0]) {
      //console.log(`root: ${root[0]}`);
      if (!summedDirs[email])
        summedDirs[email] = {};
      let mailDirs = summedDirs[email];
      let count = mailDirs[root[0]] || 0;
      mailDirs[root[0]] = ++count;
    }
  }
  //console.log(`summedDirs: ${JSON.stringify(summedDirs)}`);
}

let emails = [];
for (let email in summedDirs) {
  emails.push(email);
  //console.log('email is ' + email);
}
emails.sort();
//console.log(`emails.length is ${emails.length}`);

for (let email of emails) {
  let mailDirs = summedDirs[email];
  console.log(`email:${email} dirs: ${JSON.stringify(mailDirs)}`);
}
//console.log(`summedDirs: ${JSON.stringify(summedDirs)}`);

// Provide a consolidated, sorted report of Thunderbird contributors

const nottb = ["im", "suite"];
let tbCounts = {};

for (let email of emails) {
  let tbCount = 0;
  let mailDirs = summedDirs[email];
  for (let mailDir in mailDirs) {

    if (nottb.includes(mailDir))
      continue;
    tbCount += mailDirs[mailDir];
  }
  tbCounts[email] = tbCount;
  console.log(`email: ${email} tbcount: ${tbCount}`);
}

// now sort by contributions.
emails.sort((a, b) => {
  if (tbCounts[a] > tbCounts[b])
    return -1;
  if (tbCounts[a] < tbCounts[b])
    return 1
  return 0;
});

console.log();
console.log("Sorted contributions");
for (let email of emails) {
  console.log(`email: ${email} tbcount: ${tbCounts[email]}`);
}
