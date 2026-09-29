(() => {
  'use strict';
  const scenes = [
    {image:'../assets/lake-nature.jpg',name:'湖与远山',alt:'暮光照亮山峰，林木与山色倒映在湖面',title:['山外','有山。'],line:'把目光放远一点。',subtitle:'WATER / REFLECTION',description:['山有轮廓。','水，让它有了另一面。']},
    {image:'../assets/peaks.jpg',name:'山脊',alt:'日光照亮陡峭的山峰，远处云雾交叠',title:['峰回','云起。'],line:'沿着光，望向山的另一面。',subtitle:'RIDGE / HORIZON',description:['山脊向远方延伸。','目光也随之向前。']},
    {image:'../assets/night.jpg',name:'夜色',alt:'繁星与淡淡夜云之下的雪山',title:['入夜','听山。'],line:'让白日的喧嚣，停在山外。',subtitle:'NIGHT / SILENCE',description:['夜色落在山肩。','星光缓缓浮现。']}
  ];
  let active=0;
  const $=id=>document.getElementById(id);
  function lines(el,parts){el.replaceChildren();parts.forEach((part,i)=>{if(i)el.append(document.createElement('br'));el.append(document.createTextNode(part));});}
  function selectScene(index){
    active=index;const scene=scenes[index];
    $('scene-image').src=scene.image;$('scene-image').alt=scene.alt;
    $('scene-count').textContent=String(index+1).padStart(2,'0');$('scene-name').textContent=scene.name;
    document.querySelectorAll('[data-scene]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.scene)===index)));
    if($('scene-title')){const title=$('scene-title');title.replaceChildren(document.createTextNode(scene.title[0]),document.createElement('br'));const last=document.createElement('span');last.textContent=scene.title[1];title.append(last);$('scene-line').textContent=scene.line;}
    if($('atlas-number')){$('atlas-number').textContent=String(index+1).padStart(2,'0');$('atlas-subtitle').textContent=scene.subtitle;lines($('atlas-description'),scene.description);}
    $('scene-status').textContent=`正在观看：${scene.name}`;
  }
  document.querySelectorAll('[data-scene]').forEach(button=>button.addEventListener('click',()=>selectScene(Number(button.dataset.scene))));
  $('next-scene')?.addEventListener('click',()=>selectScene((active+1)%scenes.length));
  $('quiet')?.addEventListener('click',()=>{const quiet=document.body.classList.toggle('quiet');$('quiet').setAttribute('aria-pressed',String(quiet));$('quiet').textContent=quiet?'返回长卷 ↙':'只看风景 ↗';document.querySelectorAll('.cinema-title,.cinema-index,.vertical-note,.cinema-caption,.cinema-footer,.land-brand').forEach(el=>{el.inert=quiet;});});
  $('color-mode')?.addEventListener('click',()=>{const color=document.body.classList.toggle('color');$('color-mode').setAttribute('aria-pressed',String(color));$('color-mode').textContent=color?'看黑白 ◐':'看原色 ◐';document.querySelectorAll('.art-frame img').forEach((img,i)=>img.alt=scenes[i].alt+(color?'（原色摄影）':'（黑白摄影）'));});
  $('contour-toggle')?.addEventListener('click',()=>{const hidden=document.body.classList.toggle('no-contours');$('contour-toggle').setAttribute('aria-pressed',String(!hidden));$('contour-toggle').querySelector('span').textContent=hidden?'关闭':'开启';});
  const dialog=$('image-dialog');let opener=null;
  document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>{opener=button;const scene=scenes[button.dataset.open==='active'?active:Number(button.dataset.open)];$('dialog-image').src=scene.image;$('dialog-image').alt=scene.alt;$('dialog-title').textContent=scene.name;dialog.showModal();}));
  document.querySelector('.close-dialog')?.addEventListener('click',()=>dialog.close());
  dialog?.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
  dialog?.addEventListener('close',()=>opener?.focus());
  if(new URLSearchParams(location.search).has('preview'))document.documentElement.classList.add('preview-mode');
})();
