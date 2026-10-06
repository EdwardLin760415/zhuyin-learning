const lessons = {
  initials: {
    label: '第一站・聲母', title: '認識聲母', description: '聲母通常是音節開頭的聲音。點一個符號，聽聽它搭配例字的讀音。',
    items: [['ㄅ','包子'],['ㄆ','蘋果'],['ㄇ','媽媽'],['ㄈ','飛機'],['ㄉ','大象'],['ㄊ','兔子'],['ㄋ','奶奶'],['ㄌ','老虎'],['ㄍ','哥哥'],['ㄎ','咖啡'],['ㄏ','河馬'],['ㄐ','雞蛋'],['ㄑ','氣球'],['ㄒ','星星'],['ㄓ','蜘蛛'],['ㄔ','吃飯'],['ㄕ','獅子'],['ㄖ','日出'],['ㄗ','早安'],['ㄘ','刺蝟'],['ㄙ','森林']
    ]
  },
  medials: {
    label: '第二站・介符', title: '認識介符', description: '介符會放在聲母和韻母中間，幫忙把聲音連起來。',
    items: [['ㄧ','衣服'],['ㄨ','烏龜'],['ㄩ','魚兒']]
  },
  finals: {
    label: '第三站・韻母', title: '認識韻母', description: '韻母常常在音節的後面。聽聽看，嘴巴的形狀有什麼不同？',
    items: [['ㄚ','阿姨'],['ㄛ','喔喔'],['ㄜ','鵝蛋'],['ㄝ','夜晚'],['ㄞ','愛心'],['ㄟ','飛機'],['ㄠ','帽子'],['ㄡ','豆豆'],['ㄢ','安靜'],['ㄣ','森林'],['ㄤ','螃蟹'],['ㄥ','風箏'],['ㄦ','耳朵']]
  },
  tones: {
    label: '第四站・四聲', title: '聲音的四種表情', description: '同一個音，聲調不同，聽起來就像不同的表情。一起聽聽「ㄇㄚ」的變化。',
    items: [['ㄇㄚ','媽・第一聲'],['ㄇㄚˊ','麻・第二聲'],['ㄇㄚˇ','馬・第三聲'],['ㄇㄚˋ','罵・第四聲'],['˙ㄇㄚ','嗎・輕聲']]
  }
};

const quizItems = [
  {answer:'ㄅㄠ', word:'包子'}, {answer:'ㄇㄚ', word:'媽媽'}, {answer:'ㄉㄚ', word:'大象'},
  {answer:'ㄌㄠ', word:'老虎'}, {answer:'ㄏㄜ', word:'河馬'}, {answer:'ㄐㄧ', word:'雞蛋'},
  {answer:'ㄓㄓ', word:'蜘蛛'}, {answer:'ㄙㄣ', word:'森林'}, {answer:'ㄚ', word:'阿姨'},
  {answer:'ㄧ', word:'衣服'}, {answer:'ㄨ', word:'烏龜'}, {answer:'ㄇㄠ', word:'帽子'}
];
const categoryButtons = [...document.querySelectorAll('[data-category]')];
const grid = document.querySelector('#symbol-grid');
const learned = new Set(JSON.parse(localStorage.getItem('zhuyinLearned') || '[]'));
let currentCategory = 'initials';
let questionIndex = 0;
let currentQuestion;
let answered = false;

function speak(text) {
  if (!('speechSynthesis' in window)) {
    document.querySelector('#feedback').textContent = '這個瀏覽器目前沒有語音功能，可以跟著例字自己唸唷！';
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-TW';
  utterance.rate = 0.82;
  window.speechSynthesis.speak(utterance);
}

function renderCategory(key) {
  currentCategory = key;
  const lesson = lessons[key];
  document.querySelector('#category-eyebrow').textContent = lesson.label;
  document.querySelector('#category-title').textContent = lesson.title;
  document.querySelector('#category-description').textContent = lesson.description;
  categoryButtons.forEach(button => button.classList.toggle('active', button.dataset.category === key));
  grid.innerHTML = '';
  lesson.items.forEach(([symbol, word]) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `symbol-card${learned.has(symbol) ? ' learned' : ''}`;
    card.setAttribute('aria-label', `${symbol}，例字：${word}。點一下播放並記錄已練習`);
    card.innerHTML = `<span class="card-sound" aria-hidden="true">🔊</span><span class="symbol-main">${symbol}</span><span class="symbol-example">${word}</span>`;
    card.addEventListener('click', () => {
      speak(word);
      learned.add(symbol);
      localStorage.setItem('zhuyinLearned', JSON.stringify([...learned]));
      card.classList.add('learned');
      updateProgress();
    });
    grid.append(card);
  });
  document.querySelector('#guide-button').onclick = () => speak(lesson.items.slice(0, 4).map(item => item[1]).join('、'));
}

function updateProgress() {
  document.querySelector('#learned-count').textContent = learned.size;
  const count = Math.min(learned.size, 5);
  document.querySelector('#progress-label').textContent = `${count} / 5`;
  document.querySelector('#progress-fill').style.width = `${count * 20}%`;
}

function shuffledChoices(answer) {
  const pool = [...new Set([answer, ...quizItems.map(item => item.answer)])];
  const wrong = pool.filter(symbol => symbol !== answer).sort(() => Math.random() - 0.5).slice(0, 3);
  return [...wrong, answer].sort(() => Math.random() - 0.5);
}

function showQuestion() {
  currentQuestion = quizItems[questionIndex % quizItems.length];
  answered = false;
  document.querySelector('#quiz-count').textContent = `第 ${questionIndex + 1} 題`;
  document.querySelector('#feedback').textContent = '先按「播放聲音」，再選答案吧！';
  document.querySelector('#feedback').className = 'feedback';
  document.querySelector('#next-button').disabled = true;
  const choices = document.querySelector('#choices');
  choices.innerHTML = '';
  shuffledChoices(currentQuestion.answer).forEach(symbol => {
    const choice = document.createElement('button');
    choice.type = 'button';
    choice.className = 'choice';
    choice.textContent = symbol;
    choice.setAttribute('aria-label', `選擇 ${symbol}`);
    choice.addEventListener('click', () => answerQuestion(choice, symbol));
    choices.append(choice);
  });
}

function answerQuestion(button, symbol) {
  if (answered) return;
  answered = true;
  const feedback = document.querySelector('#feedback');
  const choices = [...document.querySelectorAll('.choice')];
  choices.forEach(choice => { choice.disabled = true; if (choice.textContent === currentQuestion.answer) choice.classList.add('correct'); });
  if (symbol === currentQuestion.answer) {
    feedback.textContent = `答對了！「${currentQuestion.word}」的注音組合是 ${currentQuestion.answer}。`;
    feedback.classList.add('good');
    [...currentQuestion.answer].forEach(mark => learned.add(mark));
    localStorage.setItem('zhuyinLearned', JSON.stringify([...learned]));
    updateProgress();
  } else {
    button.classList.add('incorrect');
    feedback.textContent = `差一點點！完整答案是 ${currentQuestion.answer}，再聽一次、再拼一次。`;
    feedback.classList.add('try-again');
  }
  document.querySelector('#next-button').disabled = false;
}

categoryButtons.forEach(button => button.addEventListener('click', () => renderCategory(button.dataset.category)));
document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', () => {
  document.querySelectorAll('.nav-link').forEach(item => item.classList.toggle('active', item === link));
}));
document.querySelector('#quiz-listen').addEventListener('click', () => speak(currentQuestion.word));
document.querySelector('#next-button').addEventListener('click', () => { questionIndex += 1; showQuestion(); });
renderCategory(currentCategory);
updateProgress();
showQuestion();

// 小一注音組合：短短兩步，拼出詞語與圖片，再解鎖收集冊角色。
const combinations = [
  { initial: 'ㄅ', final: 'ㄠ', word: '包', fullWord: '包子', emoji: '🥟' },
  { initial: 'ㄇ', final: 'ㄚ', word: '媽', fullWord: '媽媽', emoji: '👩' },
  { initial: 'ㄉ', final: 'ㄚ', word: '搭', fullWord: '搭車', emoji: '🚌' },
  { initial: 'ㄌ', final: 'ㄧ', word: '梨', fullWord: '梨子', emoji: '🍐' },
  { initial: 'ㄏ', final: 'ㄜ', word: '喝', fullWord: '喝水', emoji: '🥤' },
  { initial: 'ㄐ', final: 'ㄧ', word: '雞', fullWord: '雞蛋', emoji: '🥚' }
];
const characters = [
  { name: 'Hello Kitty', emoji: '🎀', color: '#ffd9df', note: '甜甜的第一張卡' },
  { name: '美樂蒂', emoji: '🐰', color: '#ffe0ee', note: '溫柔的粉紅朋友' },
  { name: '酷洛米', emoji: '😈', color: '#e3d9ff', note: '有個性的可愛夥伴' },
  { name: '大耳狗', emoji: '☁️', color: '#d9efff', note: '軟綿綿的天空朋友' },
  { name: '布丁狗', emoji: '🍮', color: '#fff0b8', note: '搖搖尾巴一起玩' },
  { name: '帕恰狗', emoji: '🐶', color: '#dff3e6', note: '活力滿滿的好朋友' }
];
let selectedInitial = 'ㄅ';
let selectedFinal = 'ㄠ';
let unlockedCharacters = Number(localStorage.getItem('zhuyinUnlockedCharacters') || 0);

function renderCollection() {
  const collectionGrid = document.querySelector('#collection-grid');
  collectionGrid.innerHTML = '';
  characters.forEach((character, index) => {
    const card = document.createElement('article');
    const unlocked = index < unlockedCharacters;
    card.className = `character-card${unlocked ? '' : ' locked'}`;
    card.innerHTML = `<div class="character-art" style="background:${character.color}">${unlocked ? character.emoji : '？'}</div><b>${unlocked ? character.name : '神秘朋友'}</b><small>${unlocked ? character.note : '完成組合解鎖'}</small><span class="lock" aria-hidden="true">${unlocked ? '✓' : '🔒'}</span>`;
    collectionGrid.append(card);
  });
  const status = document.querySelector('#collection-status');
  status.textContent = unlockedCharacters ? `已收集 ${unlockedCharacters} / ${characters.length} 位朋友，繼續拼音就能打開下一張卡！` : '先選一個注音組合，完成後解鎖第一位朋友！';
}

function matchingCombination() {
  return combinations.find(item => item.initial === selectedInitial && item.final === selectedFinal) || combinations[0];
}

function updateCombination() {
  const combo = matchingCombination();
  document.querySelector('#combo-initial').textContent = selectedInitial;
  document.querySelector('#combo-final').textContent = selectedFinal;
  document.querySelector('#combo-word').textContent = combo.word;
  document.querySelector('#word-picture').innerHTML = `<span class="picture-emoji" role="img" aria-label="${combo.fullWord}圖片">${combo.emoji}</span><b>${combo.fullWord}</b><small>${selectedInitial}＋${selectedFinal}</small>`;
  document.querySelector('#combo-speak').onclick = () => speak(combo.fullWord);
  document.querySelectorAll('.pick').forEach(button => button.classList.toggle('selected', button.dataset.value === selectedInitial || button.dataset.value === selectedFinal));
}

function buildPicker(selector, values, selected, onSelect) {
  const root = document.querySelector(selector);
  root.innerHTML = '';
  values.forEach(value => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `pick${value === selected ? ' selected' : ''}`;
    button.dataset.value = value;
    button.textContent = value;
    button.addEventListener('click', () => { onSelect(value); updateCombination(); });
    root.append(button);
  });
}

buildPicker('#initial-picker', ['ㄅ','ㄇ','ㄉ','ㄌ','ㄏ','ㄐ'], selectedInitial, value => { selectedInitial = value; });
buildPicker('#final-picker', ['ㄠ','ㄚ','ㄜ','ㄧ'], selectedFinal, value => { selectedFinal = value; });
document.querySelector('#unlock-button').addEventListener('click', () => {
  const combo = matchingCombination();
  speak(combo.fullWord);
  if (unlockedCharacters < characters.length) unlockedCharacters += 1;
  localStorage.setItem('zhuyinUnlockedCharacters', String(unlockedCharacters));
  renderCollection();
  document.querySelector('#collection-status').textContent = `太棒了！你拼出了「${combo.fullWord}」，新的朋友已加入收集冊！`;
  document.querySelector('#collection').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
updateCombination();
renderCollection();

document.querySelector('#reset-button').addEventListener('click', () => {
  localStorage.removeItem('zhuyinLearned');
  localStorage.removeItem('zhuyinUnlockedCharacters');
  learned.clear();
  unlockedCharacters = 0;
  selectedInitial = 'ㄅ';
  selectedFinal = 'ㄠ';
  questionIndex = 0;
  renderCategory('initials');
  buildPicker('#initial-picker', ['ㄅ','ㄇ','ㄉ','ㄌ','ㄏ','ㄐ'], selectedInitial, value => { selectedInitial = value; updateCombination(); });
  buildPicker('#final-picker', ['ㄠ','ㄚ','ㄜ','ㄧ'], selectedFinal, value => { selectedFinal = value; updateCombination(); });
  updateCombination();
  updateProgress();
  showQuestion();
  renderCollection();
  document.querySelector('#collection-status').textContent = '已清空進度，準備好再拼一次了！';
  document.querySelector('#combine').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
