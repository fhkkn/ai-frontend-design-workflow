(() => {
  'use strict';
  const storageKey = 'frontend-workflow-meeting-notes-v1';
  const initialNotes = [
    { id: 'example-1', title: '产品体验讨论', date: '示例 · 06 月 18 日', body: '本次目标\n让第一次使用的用户更快找到下一步。\n\n讨论要点\n• 首页优先展示当前任务，减少重复说明。\n• 空状态需要解释原因，并给出可执行的操作。\n• 移动端保留编辑与保存，其他信息按需收起。\n\n已达成的决定\n先完善一个关键页面，通过实际操作验证后再扩展。\n\n下一步\n整理首版截图，核对主要操作和长文本表现。' },
    { id: 'example-2', title: '内容结构梳理', date: '示例 · 06 月 16 日', body: '目标\n梳理页面标题、说明和操作的优先级。\n\n下一步\n用真实内容验证版式，避免占位文字掩盖问题。' },
    { id: 'example-3', title: '首版回顾', date: '示例 · 06 月 12 日', body: '观察\n页面方向保持一致，后续重点检查小屏布局。\n\n决定\n先处理影响任务完成的问题，再调整局部装饰。' }
  ];
  const $ = (id) => document.getElementById(id);
  let notes = structuredClone(initialNotes);
  let storageWarning = '';
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || !parsed.length || !parsed.every(n => n && ['id', 'title', 'date', 'body'].every(k => typeof n[k] === 'string')) || new Set(parsed.map(n => n.id)).size !== parsed.length) throw new Error('Invalid stored data');
      notes = parsed;
    }
  } catch {
    storageWarning = '无法读取本地记录，当前显示示例。保存会尝试写入当前内容。';
  }
  let activeId = notes[0].id;
  let dirty = false;
  let pendingNewId = null;
  function fitBody() {
    $('body').style.height = 'auto';
    $('body').style.height = `${$('body').scrollHeight}px`;
  }
  function renderList() {
    $('count').textContent = String(notes.length).padStart(2, '0');
    const matches = notes.filter(n => n.title.toLocaleLowerCase().includes($('search').value.trim().toLocaleLowerCase()));
    $('note-list').replaceChildren();
    for (const note of matches) {
      const button = document.createElement('button');
      button.className = 'note-item';
      button.setAttribute('aria-current', String(note.id === activeId));
      const title = document.createElement('strong');
      title.textContent = note.title || '未命名纪要';
      const date = document.createElement('small');
      date.textContent = note.date;
      button.append(title, date);
      button.addEventListener('click', () => {
        if (note.id === activeId) return;
        if (!canLeave()) return;
        activeId = note.id;
        renderEditor();
        renderList();
        $('title').focus();
      });
      $('note-list').append(button);
    }
    if (!matches.length) {
      const empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = '没有匹配的纪要。试试其他标题，或清空搜索。';
      $('note-list').append(empty);
    }
  }
  function canLeave() {
    if (dirty && !window.confirm('当前修改尚未保存。放弃修改并继续？')) return false;
    if (pendingNewId) notes = notes.filter(n => n.id !== pendingNewId);
    pendingNewId = null;
    return true;
  }
  function renderEditor() {
    const note = notes.find(n => n.id === activeId);
    $('title').value = note.title;
    $('body').value = note.body;
    fitBody();
    $('note-date').textContent = note.date;
    dirty = false;
    $('save-state').textContent = '无未保存修改';
    $('feedback').textContent = storageWarning || '编辑后点击保存，内容仅存于当前浏览器。';
  }
  for (const id of ['title', 'body']) $(id).addEventListener('input', () => {
    dirty = true;
    $('save-state').textContent = '尚未保存';
    $('feedback').textContent = '有未保存的修改。';
    if (id === 'body') fitBody();
  });
  $('search').addEventListener('input', renderList);
  $('new-note').addEventListener('click', () => {
    if (!canLeave()) return;
    const note = { id: crypto.randomUUID(), title: '未命名纪要', date: '新建 · 本地草稿', body: '' };
    notes.unshift(note);
    pendingNewId = note.id;
    activeId = note.id;
    $('search').value = '';
    renderEditor();
    renderList();
    dirty = true;
    $('save-state').textContent = '尚未保存';
    $('feedback').textContent = '填写内容后保存这份新纪要。';
    $('title').focus();
    $('title').select();
  });
  $('save').addEventListener('click', () => {
    if (!$('title').value.trim()) {
      $('feedback').textContent = '请填写纪要标题后再保存。';
      $('title').focus();
      return;
    }
    const next = notes.map(n => n.id === activeId ? { ...n, title: $('title').value.trim(), body: $('body').value } : n);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      notes = next;
      pendingNewId = null;
      dirty = false;
      storageWarning = '';
      $('save-state').textContent = '已保存到本机';
      $('feedback').textContent = '已保存。刷新页面后仍可查看。';
      renderList();
    } catch {
      dirty = true;
      $('save-state').textContent = '未能保存';
      $('feedback').textContent = '无法写入浏览器存储。请先复制内容备份，再检查存储设置。';
    }
  });
  window.addEventListener('beforeunload', event => {
    if (dirty) { event.preventDefault(); event.returnValue = ''; }
  });
  renderEditor();
  renderList();
  window.addEventListener('resize', fitBody);
})();
