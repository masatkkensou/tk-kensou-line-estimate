'use strict';
const steps = [
  { key: 'room', name: '部屋の大きさ', title: 'お部屋は何畳ですか？', description: '施工したいお部屋の広さをお選びください。', choices: [
    ['6', '6畳', 'コンパクトなお部屋'], ['8', '8畳', 'ゆとりのあるお部屋'], ['10', '10畳', '広めのリビングに'], ['12', '12畳', '開放的な空間に']] },
  { key: 'additionalRooms', name: '追加の部屋', title: 'ほかのお部屋も張り替えますか？', description: '同じ広さの部屋は正式見積で数量を調整します。', choices: [['6','6畳',''],['8','8畳',''],['10','10畳',''],['12','12畳','']] },
  { key: 'scope', name: '施工範囲', title: 'どこを張り替えますか？', description: 'クロスを張り替える範囲をお選びください。', choices: [
    ['walls', '壁のみ', '壁を新しく、気分も新しく'], ['ceiling', '壁＋天井', 'お部屋全体をすっきり一新']] },
  { key: 'wallpaper', name: 'クロス', title: 'クロスのグレードは？', description: 'ご予算やお好みに合わせてお選びください。', choices: [
    ['standard', 'STANDARD', '量産品 · シンプルで使いやすい定番'], ['select', 'SELECT', '一般品 · 色柄や質感にこだわりたい方へ']] },
  { key: 'style', name: 'クロスのイメージ', title: 'どんな雰囲気が好きですか？', description: 'イメージをお選びください。価格は変わりません。', choices: [
    ['bright', '明るい白', '明るく、清潔感のある空間'], ['calm', '落ち着いた白', 'やわらかく、あたたかな空間'], ['hotel', 'ホテル風', '上品で、洗練された空間'], ['bedroom', '寝室向け', 'ゆっくりくつろげる空間'], ['accent', 'アクセントクロス', '一面に、お気に入りの彩りを']] },
  { key: 'furniture', name: '家具移動', title: 'お部屋に家具はありますか？', description: '施工時に移動が必要な家具をお選びください。', choices: [
    ['none', '家具なし', '空室・ご自身で移動する場合'], ['small', '小型家具あり', '椅子や小さな棚など'], ['large1', '大型家具1点', 'ベッドやソファなど'], ['large2', '大型家具2点以上', '大型家具が複数ある場合']] },
  { key: 'options', name: '追加オプション', title: '一緒に、もっと心地よく。', description: 'ご希望の工事を選択できます。複数選択・選択なしもOK。', choices: [
    ['floor', '床張替え', '足元からお部屋をリフレッシュ'], ['baseboard', '巾木交換', '壁と床の境目もきれいに'], ['plates', 'スイッチ・コンセントプレート交換', '細部まで清潔感を'], ['lighting', '照明交換', '明かりで雰囲気を変える'], ['rail', 'カーテンレール交換', '窓まわりもすっきり']] }
];
let currentStep = 0;
let answers = { options: [], additionalRooms: [] };
const screen = document.getElementById('screen');
const yen = value => new Intl.NumberFormat('ja-JP').format(value);
const label = (key, value) => steps.find(step => step.key === key).choices.find(choice => choice[0] === value)[1];
function calculateEstimate(values) {
 const p=window.ESTIMATE_PRICING;
 const rooms=[Number(values.room),...(values.additionalRooms||[]).map(Number)];
 const scope=values.scope==='ceiling'?'wallsAndCeiling':'walls';
 const area=Math.round(rooms.reduce((sum,n)=>sum+p.rooms[n][scope],0)*10)/10;
 const days=Math.max(1,Math.ceil((area-1e-9)/p.dailyCapacity));
 const material=Math.round(area*p.material[values.wallpaper]);
 const labor=Math.round(area*p.laborRate);
 const travel=days*p.travelPerDay;
 const management=Math.round((material+labor+travel)*p.managementRate);
 const cost=material+labor+travel+management;
 const wallpaperPrice=Math.ceil(cost/(1-p.grossMargin)/p.roundTo)*p.roundTo;
 const lines=[{name:'クロス張替え（'+rooms.map(n=>n+'畳').join('＋')+'・'+label('scope',values.scope)+'）',amount:wallpaperPrice},{name:'家具移動',amount:p.furniture[values.furniture]}];
 for(const option of values.options) lines.push({name:label('options',option),amount:option==='floor'?rooms.reduce((sum,n)=>sum+p.rooms[n].floor,0):p.options[option]});
 const subtotal=lines.reduce((sum,line)=>sum+line.amount,0);
 const tax=Math.round(subtotal*p.taxRate);
 return {lines,subtotal,tax,total:subtotal+tax,area,days,material,labor,travel,management,cost,wallpaperPrice};
}
function render() {
  const result = currentStep === steps.length;
  document.getElementById('step-label').textContent = `STEP ${currentStep + 1} / ${steps.length + 1}`;
  document.getElementById('step-name').textContent = result ? '概算金額' : steps[currentStep].name;
  document.getElementById('progress').style.width = `${(currentStep + 1) / ${steps.length + 1} * 100}%`;
  if (result) renderResult(); else renderQuestion();
}
function renderQuestion() {
  const step = steps[currentStep];
  const multiple = step.key === 'options' || step.key === 'additionalRooms';
  screen.innerHTML = `<div class="question-heading"><span class="question-number">Q${String(currentStep + 1).padStart(2, '0')}</span><h2 tabindex="-1">${step.title}</h2><p>${step.description}</p></div>
    <fieldset class="choices ${step.key === 'room' ? 'room-grid' : ''}"><legend class="sr-only">${step.title}</legend>${step.choices.map(([value, title, description]) => `<label class="choice"><input type="${multiple ? 'checkbox' : 'radio'}" name="${step.key}" value="${value}" ${(multiple ? (answers[step.key] || []).includes(value) : answers[step.key] === value) ? 'checked' : ''}><span class="choice-text"><strong>${title}</strong><small>${description}</small></span><span class="indicator" aria-hidden="true"></span></label>`).join('')}</fieldset>
    ${multiple ? '<p class="option-note">追加しない場合は、そのまま概算金額へお進みください。</p>' : ''}
    <div class="navigation">${currentStep > 0 ? '<button class="back" id="back">← 戻る</button>' : ''}<button class="primary" id="next" ${!multiple && !answers[step.key] ? 'disabled' : ''}>${step.key === 'options' ? '概算金額を見る' : '次へ'} <span aria-hidden="true">→</span></button></div><p class="microcopy">${multiple ? 'ここまでの入力内容は、あとから変更できます。' : '選択してから「次へ」をタップしてください。'}</p>`;
  screen.querySelectorAll('input').forEach(input => input.addEventListener('change', () => {
    if (multiple) answers[step.key] = [...screen.querySelectorAll('input:checked')].map(item => item.value);
    else answers[step.key] = input.value;
    document.getElementById('next').disabled = false;
  }));
  document.getElementById('next').addEventListener('click', () => { currentStep++; render(); focusHeading(); });
  document.getElementById('back')?.addEventListener('click', goBack);
}
function focusHeading() { screen.querySelector('h2').focus({ preventScroll: true }); document.querySelector('.wizard').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
function goBack() { currentStep--; render(); focusHeading(); }
function renderResult() {
  const estimate = calculateEstimate(answers);
  screen.innerHTML = `<div class="result-heading"><span class="result-check" aria-hidden="true">✓</span><p class="eyebrow">YOUR ESTIMATE</p><h2 tabindex="-1">お部屋の概算はこちらです。</h2><p>品質重視の丁寧な施工。施工起因の不具合には1年保証（条件あり）。</p></div>
    <div class="price-box"><span class="price-caption">税込概算金額 <b>仮価格</b></span><p class="total"><span>¥</span>${yen(estimate.total)}<small>〜</small></p><p>税抜 ¥${yen(estimate.subtotal)} ＋ 消費税 ¥${yen(estimate.tax)}</p></div>
    <p class="disclaimer">これは概算価格です。正式価格・工期は現地確認後に確定します。施工保証は当社施工に起因する不具合が対象です。適用条件・対象外事項は契約時にご案内します。</p>
    <p class="option-note">想定施工面積：${estimate.area}㎡ ／ 施工日数目安：${estimate.days}日（2人施工・60㎡/日）</p><h3>お選びいただいた内容</h3><dl class="summary">${steps.map(step => `<div><dt>${step.name}</dt><dd>${(step.key === 'options' || step.key === 'additionalRooms') ? ((answers[step.key] || []).length ? answers[step.key].map(value => label(step.key,value)).join('、') : 'なし') : label(step.key,answers[step.key])}</dd></div>`).join('')}</dl>
    <details><summary>料金の内訳を見る（税抜）</summary><dl class="summary">${estimate.lines.map(line => `<div><dt>${line.name}</dt><dd>¥${yen(line.amount)}</dd></div>`).join('')}</dl><p class="detail-note">オプションは1部屋あたりの仮の一式料金です。数量・仕様・下地の状態により正式価格は変わります。</p></details>
    <button class="primary photo-button" id="photo">写真を送って無料見積 <span aria-hidden="true">↗</span></button><p class="microcopy">写真送信はデモ動作です。登録・送信は行いません。</p><div class="result-navigation"><button class="back" id="back">← 戻って変更</button><button class="reset" id="reset">最初からやり直す</button></div>`;
  document.getElementById('back').addEventListener('click', goBack);
  document.getElementById('photo').addEventListener('click', () => document.getElementById('demo-dialog').showModal());
  document.getElementById('reset').addEventListener('click', () => { answers = { options: [], additionalRooms: [] }; currentStep = 0; render(); focusHeading(); });
}
document.getElementById('close-dialog').addEventListener('click', () => document.getElementById('demo-dialog').close());
render();
