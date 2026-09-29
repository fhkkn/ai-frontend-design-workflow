(() => {
  'use strict';
  const scenes = [
    { id:'lake', src:'assets/lake-nature.jpg', name:'湖与远山', title:['山外','有山。'], line:'把目光放远一点。', detail:'暮光入山，山色入水。', alt:'暮光照亮山峰，林木与山色倒映在湖面', desktop:'50% 14%', mobile:'52% 50%' },
    { id:'ridge', src:'assets/peaks.jpg', name:'山脊', title:['峰回','云起。'], line:'沿着光，望向山的另一面。', detail:'层层山脊，渐隐于远处。', alt:'林木延伸至远处山谷，群峰在日光与云雾中层叠', desktop:'50% 48%', mobile:'51% 50%' },
    { id:'night', src:'assets/night.jpg', name:'夜色', title:['入夜','听山。'], line:'让目光，在星光下停留。', detail:'山影沉静，星河渐明。', alt:'繁星与淡淡夜云之下的雪山轮廓', desktop:'50% 46%', mobile:'53% 50%' }
  ];
  const $ = id => document.getElementById(id);
  const stage = $('stage');
  const images = [$('landscape-a'), $('landscape-b')];
  let visibleImage = 0;
  let active = 0;
  let requested = 0;
  let requestVersion = 0;
  let isQuiet = false;
  let failedIndex = null;
  const loaded = new Map();

  function load(scene) {
    if (!loaded.has(scene.id)) {
      const promise = new Promise((resolve,reject) => {
        const img = new Image();
        img.onload = () => (img.decode ? img.decode().catch(()=>{}) : Promise.resolve()).then(()=>resolve(img));
        img.onerror = () => reject(new Error('Image unavailable'));
        img.src = scene.src;
      }).catch(error => { loaded.delete(scene.id); throw error; });
      loaded.set(scene.id,promise);
    }
    return loaded.get(scene.id);
  }

  function describe(index) {
    const scene = scenes[index];
    stage.dataset.scene = scene.id;
    $('chapter-number').textContent = String(index+1).padStart(2,'0');
    $('title-first').textContent = scene.title[0];
    $('title-second').textContent = scene.title[1];
    $('scene-line').textContent = scene.line;
    $('scene-name').textContent = scene.name;
    $('scene-detail').textContent = scene.detail;
    $('progress').textContent = `${String(index+1).padStart(2,'0')} / 03`;
    document.querySelectorAll('.chapters button').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.scene===scene.id)));
    document.title = `山水 · ${scene.title.join('')}`;
    history.replaceState(null,'',`#${scene.id}`);
  }

  async function select(index) {
    requested = (index+scenes.length)%scenes.length;
    const nextIndex = requested;
    const scene = scenes[nextIndex];
    const version = ++requestVersion;
    $('load-error').hidden = true;
    stage.setAttribute('aria-busy','true');
    try {
      await load(scene);
      if (version !== requestVersion) return;
      const nextImage = nextIndex === active && images[visibleImage].complete ? visibleImage : 1-visibleImage;
      const image = images[nextImage];
      image.src = scene.src;
      image.alt = scene.alt;
      image.style.setProperty('--desktop-position',scene.desktop);
      image.style.setProperty('--mobile-position',scene.mobile);
      images.forEach((item,i)=>{
        item.classList.toggle('is-visible',i===nextImage);
        item.setAttribute('aria-hidden',String(i!==nextImage));
      });
      active = nextIndex;
      visibleImage = nextImage;
      failedIndex = null;
      describe(active);
      $('status').textContent = `正在观看第 ${active+1} 景：${scene.name}。`;
    } catch {
      if (version !== requestVersion) return;
      requested = active;
      failedIndex = nextIndex;
      $('error-message').textContent = `“${scene.name}”未能加载，当前景色保持不变。`;
      $('load-error').hidden = false;
      $('status').textContent = '画面未能加载，可以重试。';
    } finally {
      if (version === requestVersion) stage.setAttribute('aria-busy','false');
    }
  }

  function quiet(value) {
    isQuiet = value;
    document.body.classList.toggle('is-quiet',value);
    document.querySelectorAll('[data-chrome]').forEach(element=>{
      element.inert = value;
      if(value) element.setAttribute('aria-hidden','true');
      else element.removeAttribute('aria-hidden');
    });
    $('quiet').setAttribute('aria-pressed',String(value));
    $('quiet-label').textContent = value ? '返回长卷' : '只看风景';
    $('quiet').focus({preventScroll:true});
    $('status').textContent = value ? '已进入纯观景模式，按 Escape 返回。' : '已返回长卷。';
  }

  document.querySelectorAll('.chapters button').forEach(button=>button.addEventListener('click',()=>select(scenes.findIndex(scene=>scene.id===button.dataset.scene))));
  $('previous').addEventListener('click',()=>select(requested-1));
  $('next').addEventListener('click',()=>select(requested+1));
  $('quiet').addEventListener('click',()=>quiet(!isQuiet));
  $('retry').addEventListener('click',()=>{if(failedIndex!==null) select(failedIndex);});
  document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();select(0);});
  window.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey) return;
    if(event.key==='Escape' && isQuiet){event.preventDefault();quiet(false);return;}
    if(event.key==='ArrowRight'||event.key==='ArrowLeft'){
      event.preventDefault();select(requested+(event.key==='ArrowRight'?1:-1));
    }
  });
  window.addEventListener('hashchange',()=>{
    const index=scenes.findIndex(scene=>`#${scene.id}`===location.hash);
    if(index>=0) select(index);
  });
  const initial = scenes.findIndex(scene=>`#${scene.id}`===location.hash);
  select(initial<0?0:initial);
})();
