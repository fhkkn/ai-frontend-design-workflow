// Static integrity checks only. Browser verification is recorded separately.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = __dirname;
const files = [];
function walk(dir) {
  for (const item of fs.readdirSync(dir,{withFileTypes:true})) {
    const file = path.join(dir,item.name);
    if (item.isDirectory()) walk(file); else files.push(file);
  }
}
walk(root);
const errors = [];
let references = 0;
function checkReference(from,reference) {
  if (!reference || /^(?:[a-z][a-z\d+.-]*:|#|\/\/)/i.test(reference)) return;
  const clean = decodeURIComponent(reference.split(/[?#]/)[0]);
  let target = path.resolve(path.dirname(from),clean);
  if (!target.startsWith(root+path.sep) && target!==root) {
    errors.push(`${path.relative(root,from)}: reference outside example: ${reference}`);
    return;
  }
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target=path.join(target,'index.html');
  references++;
  if(!fs.existsSync(target)) errors.push(`${path.relative(root,from)}: missing ${reference}`);
}
for (const file of files) {
  if(!/\.(?:html|js|css|md)$/.test(file)) continue;
  const text=fs.readFileSync(file,'utf8');
  if(file.endsWith('.html')) for(const match of text.matchAll(/(?:href|src)=["']([^"']*)["']/g)) checkReference(file,match[1]);
  if(file.endsWith('.js')) {
    for(const match of text.matchAll(/["']([^"']+\.(?:jpg|png|webp|svg))["']/g)) checkReference(file,match[1]);
    const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
    if(result.status!==0) errors.push(`${path.relative(root,file)}: invalid JavaScript`);
  }
  if(file.endsWith('.md')) for(const match of text.matchAll(/\]\(([^)\s]+)\)/g)) checkReference(file,match[1]);
}
if(errors.length) { console.error(errors.join('\n')); process.exitCode=1; }
else console.log(JSON.stringify({checkedFiles:files.length,localReferences:references,result:'passed',scope:'Static references and JavaScript syntax; no browser checks'},null,2));
