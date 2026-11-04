// Quân Sư GDQP — Tự học (specs/002-cong-hoc-sinh). Trang tĩnh, không tài khoản; tiến độ lưu trên máy học sinh.
(function selfStudy(root) {
  'use strict';
  const STORE = 'qsgdqp.tuhoc.v1';
  const doc = root.document;
  const app = () => doc.getElementById('app');
  const cache = { index: null, levels: {} };

  // ---------- Tiến độ (localStorage; trình duyệt chặn thì chỉ mất phần ghi nhớ) ----------
  function today() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  function load() {
    let data = null;
    try { data = JSON.parse(root.localStorage.getItem(STORE) || 'null'); } catch (_) { data = null; }
    data = data && typeof data === 'object' ? data : {};
    return { level: data.level || '', last: data.last || null, read: data.read || {}, correct: data.correct || {}, wrong: data.wrong || {},
      daily: data.daily?.date === today() ? data.daily : { date: today(), count: 0 }, streak: data.streak || { date: '', days: 0 } };
  }
  let progress = load();
  function save() { try { root.localStorage.setItem(STORE, JSON.stringify(progress)); } catch (_) { /* bỏ qua */ } }
  const key = (level, lesson) => `${level}:${lesson}`;
  function readPercent(level, lesson, sections) {
    return sections ? Math.round(100 * Math.min(1, (progress.read[key(level, lesson)] || []).length / sections)) : 0;
  }
  function practicePercent(level, lesson, questions) {
    return questions ? Math.round(100 * Math.min(1, (progress.correct[key(level, lesson)] || []).length / questions)) : 0;
  }
  function markRead(level, lesson, sectionId) {
    const list = progress.read[key(level, lesson)] ||= [];
    if (!list.includes(sectionId)) { list.push(sectionId); save(); }
  }
  function answered(level, question, ok) {
    if (progress.daily.date !== today()) progress.daily = { date: today(), count: 0 };
    progress.daily.count += 1;
    if (progress.daily.count === (cache.index?.dailyGoal || 20) && progress.streak.date !== today()) {
      const yesterday = new Date(Date.now() - 86400000);
      const y = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      progress.streak = { date: today(), days: progress.streak.date === y ? progress.streak.days + 1 : 1 };
    }
    const wrong = progress.wrong[level] ||= [];
    if (ok) {
      const list = progress.correct[key(level, question.lesson)] ||= [];
      if (!list.includes(question.id)) list.push(question.id);
      if (wrong.includes(question.id)) wrong.splice(wrong.indexOf(question.id), 1);
    } else if (!wrong.includes(question.id)) wrong.push(question.id);
    save();
  }

  // Quân hàm theo số câu đã làm đúng (mỗi câu tính một lần) của trình độ đang học.
  const RANKS = [[0, 'Binh nhì'], [30, 'Binh nhất'], [80, 'Hạ sĩ'], [150, 'Trung sĩ'], [250, 'Thượng sĩ'],
    [400, 'Thiếu úy'], [600, 'Trung úy'], [850, 'Thượng úy'], [1200, 'Đại úy']];
  function rank(level) {
    const total = Object.entries(progress.correct).filter(([name]) => name.startsWith(`${level}:`)).reduce((sum, [, ids]) => sum + ids.length, 0);
    let index = 0;
    while (index + 1 < RANKS.length && total >= RANKS[index + 1][0]) index += 1;
    const next = RANKS[index + 1];
    return { total, name: RANKS[index][1], next: next ? { name: next[1], need: next[0] - total } : null };
  }

  // ---------- Dữ liệu ----------
  async function json(url) {
    const response = await root.fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Không tải được ${url}`);
    return response.json();
  }
  async function index() { return cache.index ||= await json('data/index.json'); }
  async function levelData(level) { return cache.levels[level] ||= await json(`data/${level}.json`); }

  // ---------- Giao diện ----------
  function el(tag, attrs = {}, ...children) {
    const node = doc.createElement(tag);
    for (const [name, value] of Object.entries(attrs)) {
      if (value === undefined || value === null || value === false) continue;
      if (name === 'class') node.className = value;
      else if (name === 'text') node.textContent = value;
      else if (name.startsWith('on')) node.addEventListener(name.slice(2), value);
      else node.setAttribute(name, value === true ? '' : value);
    }
    for (const child of children.flat()) if (child !== null && child !== undefined && child !== false) node.append(child);
    return node;
  }
  function bar(percent) { const fill = el('i'); fill.style.width = `${percent}%`; return el('span', { class: 'bar', 'aria-hidden': 'true' }, fill); }
  function render(...nodes) { const main = app(); main.replaceChildren(...nodes.flat().filter(node => node !== null && node !== undefined && node !== false)); main.focus({ preventScroll: true }); root.scrollTo?.(0, 0); }

  function currentLevel(summary) {
    return summary.levels.some(level => level.id === progress.level) ? progress.level : '';
  }

  function levelPicker(summary) {
    return el('div', {},
      el('h1', { text: 'Em học trình độ nào?' }),
      el('div', { class: 'tiles' }, summary.levels.map(level => el('a', { class: 'tile tile-learn', href: `#/trinh-do/${level.id}` },
        level.label, el('small', { text: `${level.lessons.length} bài` })))));
  }

  async function home() {
    const summary = await index();
    const level = currentLevel(summary);
    if (!level) return render(levelPicker(summary));
    const info = summary.levels.find(item => item.id === level);
    const goal = summary.dailyGoal;
    const last = progress.last?.level === level ? info.lessons.find(item => item.lesson === progress.last.lesson) : null;
    render(
      el('h1', { text: `${info.label} — chào em!` }),
      el('div', { class: 'tiles' },
        el('a', { class: 'tile tile-learn', href: `#/bai/${last?.lesson || info.lessons[0].lesson}` }, 'Học bài', el('small', { text: 'Video của thầy và nội dung bài' })),
        el('a', { class: 'tile tile-practice', href: '#/on-tap' }, 'Ôn tập', el('small', { text: 'Ôn nhanh, câu sai, tốc độ' })),
        el('a', { class: 'tile tile-exam', href: '#/kiem-tra' }, 'Kiểm tra', el('small', { text: 'Thi thử 45 phút' })),
        el('a', { class: 'tile tile-mission', href: '#/nhiem-vu' }, 'Nhiệm vụ hôm nay',
          el('small', { text: `${Math.min(progress.daily.count, goal)}/${goal} câu${progress.streak.days > 1 ? ` · ${progress.streak.days} ngày liền` : ''}` }))),
      rankCard(level),
      last ? el('a', { class: 'card resume', href: `#/bai/${last.lesson}` },
        el('span', {}, el('strong', { text: 'Học tiếp: ' }), `Bài ${last.lesson}. ${last.title}`), el('span', { class: 'btn btn-primary', text: 'Mở' })) : null,
      el('h2', { text: 'Các bài' }),
      el('ul', { class: 'card lessons' }, info.lessons.map(lesson => el('li', {},
        el('a', { class: 'lesson-link', href: `#/bai/${lesson.lesson}` },
          el('div', { class: 'lesson-title', text: `Bài ${lesson.lesson}. ${lesson.title}` }),
          el('div', { class: 'lesson-meta' },
            el('span', {}, `Đã học ${readPercent(level, lesson.lesson, lesson.sections)}%`, bar(readPercent(level, lesson.lesson, lesson.sections))),
            lesson.questions ? el('span', {}, `Đã ôn ${practicePercent(level, lesson.lesson, lesson.questions)}%`, bar(practicePercent(level, lesson.lesson, lesson.questions))) : null,
            lesson.videos ? el('span', { text: '▶ Có video' }) : null))))));
  }

  function rankCard(level) {
    const current = rank(level);
    return el('p', { class: 'card rank' }, el('strong', { text: `Quân hàm: ${current.name}` }),
      ` · ${current.total} câu đúng${current.next ? ` · còn ${current.next.need} câu đúng để lên ${current.next.name}` : ' · hàm cao nhất'}`);
  }

  async function practiceMenu() {
    const summary = await index();
    const level = currentLevel(summary);
    if (!level) return render(levelPicker(summary));
    const info = summary.levels.find(item => item.id === level);
    const wrong = (progress.wrong[level] || []).length;
    render(el('h1', { text: 'Ôn tập' }), rankCard(level),
      el('div', { class: 'tiles' },
        el('a', { class: 'tile tile-practice', href: '#/on-tap/tat-ca' }, 'Ôn nhanh', el('small', { text: '10 câu trộn các bài' })),
        el('a', { class: 'tile tile-wrong', href: '#/cau-sai' }, 'Câu sai', el('small', { text: wrong ? `${wrong} câu cần làm lại` : 'Chưa có câu sai' })),
        el('a', { class: 'tile tile-speed', href: '#/toc-do' }, 'Tốc độ', el('small', { text: '15 giây mỗi câu' }))),
      el('h2', { text: 'Ôn theo bài' }),
      el('ul', { class: 'card lessons' }, info.lessons.filter(lesson => lesson.questions).map(lesson => el('li', {},
        el('a', { class: 'lesson-link', href: `#/on-tap/${lesson.lesson}` },
          el('div', { class: 'lesson-title', text: `Bài ${lesson.lesson}. ${lesson.title}` }),
          el('div', { class: 'lesson-meta' }, el('span', {}, `Đã ôn ${practicePercent(level, lesson.lesson, lesson.questions)}%`,
            bar(practicePercent(level, lesson.lesson, lesson.questions))), el('span', { text: `${lesson.questions} câu` })))))));
  }

  async function examPage() {
    const summary = await index();
    const level = currentLevel(summary);
    if (!level) return render(levelPicker(summary));
    render(el('h1', { text: 'Kiểm tra' }),
      el('div', { class: 'card' }, el('strong', { text: 'Bài thi thử' }),
        el('p', { class: 'muted', text: '30 câu trắc nghiệm trộn các bài, 45 phút. Nộp bài mới biết điểm (thang 10) và đáp án.' }),
        el('a', { class: 'btn btn-primary', href: `#/thi-thu?l=${Date.now()}`, text: 'Bắt đầu thi thử' })),
      el('div', { class: 'card' }, el('strong', { text: 'Kiểm tra trên lớp' }),
        el('p', { class: 'muted', text: 'Bài kiểm tra tính điểm do thầy cô mở trên lớp. Em quét mã QR thầy cô chiếu, đăng nhập bằng mã học sinh và mã PIN của em.' })));
  }

  function paragraphs(section) {
    const nodes = [];
    const figuresAt = position => section.figures.filter(figure => figure.after === position).map(figure =>
      el('figure', {}, figure.images.map(img => el('img', { src: img, alt: figure.text, loading: 'lazy' })), el('figcaption', { text: figure.text })));
    section.paragraphs.forEach((text, position) => { nodes.push(...figuresAt(position), el('p', { text })); });
    nodes.push(...figuresAt(section.paragraphs.length));
    return nodes;
  }

  async function lessonPage(number) {
    const summary = await index();
    const level = currentLevel(summary);
    if (!level) return render(levelPicker(summary));
    const data = await levelData(level);
    const lesson = data.lessons.find(item => item.lesson === Number(number));
    if (!lesson) return home();
    progress.last = { level, lesson: lesson.lesson }; save();
    const sectionNodes = lesson.sections.map(section => {
      const heading = el(section.level <= 1 ? 'h2' : section.level === 2 ? 'h3' : 'h4', { text: section.heading });
      return el('section', { class: 'section', 'data-section': section.id }, heading, paragraphs(section));
    });
    render(
      el('a', { href: '#/', class: 'muted', text: '← Các bài' }),
      el('h1', { text: `Bài ${lesson.lesson}. ${lesson.title}` }),
      lesson.videos.map(video => el('div', { class: 'video' }, el('iframe', {
        src: `https://www.youtube-nocookie.com/embed/${video.id}`, title: video.title || `Video bài ${lesson.lesson}`,
        loading: 'lazy', allow: 'encrypted-media; picture-in-picture; fullscreen', allowfullscreen: true, referrerpolicy: 'strict-origin-when-cross-origin',
      }))),
      el('p', { class: 'credit', text: data.credit }),
      sectionNodes,
      el('p', { class: 'credit', text: data.credit }),
      el('div', { class: 'actions' },
        lesson.questions.length ? el('a', { class: 'btn btn-primary', href: `#/on-tap/${lesson.lesson}`, text: `Ôn tập bài này (${lesson.questions.length} câu)` }) : null,
        data.lessons.some(item => item.lesson === lesson.lesson + 1) ? el('a', { class: 'btn', href: `#/bai/${lesson.lesson + 1}`, text: 'Bài tiếp theo →' }) : null));
    // Mục được tính là đã học khi em cuộn tới; trình duyệt cũ thì tính khi mở bài.
    const mark = id => markRead(level, lesson.lesson, id);
    if (typeof root.IntersectionObserver === 'function') {
      const observer = new root.IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { mark(entry.target.dataset.section); observer.unobserve(entry.target); }
      }), { threshold: 0.4 });
      sectionNodes.forEach(node => observer.observe(node));
    } else lesson.sections.forEach(section => mark(section.id));
  }

  function shuffle(items) {
    const list = [...items];
    for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
    return list;
  }

  // Ưu tiên câu em chưa làm đúng; mỗi lượt 10 câu.
  function pickQuestions(level, pool, size = 10) {
    const done = new Set(Object.entries(progress.correct).filter(([name]) => name.startsWith(`${level}:`)).flatMap(([, ids]) => ids));
    const fresh = shuffle(pool.filter(question => !done.has(question.id)));
    return [...fresh, ...shuffle(pool.filter(question => done.has(question.id)))].slice(0, size);
  }

  // mode: 'on' (ôn, có giải thích), 'sai' (câu đã làm sai), 'toc-do' (15 giây/câu), 'thi' (thi thử: 30 câu, 45 phút, chấm khi nộp).
  async function practicePage(which, title, mode = 'on') {
    const summary = await index();
    const level = currentLevel(summary);
    if (!level) return render(levelPicker(summary));
    const data = await levelData(level);
    const all = data.lessons.flatMap(lesson => lesson.questions);
    const wrongIds = new Set(progress.wrong[level] || []);
    const pool = mode === 'sai' ? all.filter(question => wrongIds.has(question.id))
      : ['tat-ca', 'nhiem-vu', 'toc-do', 'thi-thu'].includes(which) ? all
        : data.lessons.find(lesson => lesson.lesson === Number(which))?.questions || [];
    if (!pool.length) {
      return render(el('p', { text: mode === 'sai' ? 'Em chưa có câu sai nào. Giỏi lắm!' : 'Bài này chưa có câu ôn tập.' }), el('a', { class: 'btn', href: '#/on-tap', text: 'Về Ôn tập' }));
    }
    const round = mode === 'thi' ? shuffle(all).slice(0, 30) : mode === 'sai' ? shuffle(pool).slice(0, 10) : pickQuestions(level, pool);
    let position = 0; let right = 0; let timer = null;
    const choices = [];
    const stop = () => { if (timer) { root.clearInterval(timer); timer = null; } };
    const deadline = mode === 'thi' ? Date.now() + 45 * 60 * 1000 : 0;
    const finish = () => {
      stop();
      if (mode === 'thi') {
        round.forEach((question, i) => { const ok = choices[i] === question.answer; if (ok) right += 1; answered(level, question, ok); });
        const score = Math.round((right / round.length) * 100) / 10;
        return render(el('h1', { text: `Điểm thi thử: ${score}/10` }), el('p', { text: `Đúng ${right}/${round.length} câu.` }), rankCard(level),
          el('ol', { class: 'card review' }, round.map((question, i) => el('li', { 'data-ok': String(choices[i] === question.answer) },
            el('div', { text: question.q }),
            el('div', { class: 'muted', text: `Em chọn: ${choices[i] >= 0 ? 'ABCD'[choices[i]] : 'bỏ trống'} · Đáp án: ${'ABCD'[question.answer]}. ${question.options[question.answer]}` })))),
          el('div', { class: 'actions' }, el('a', { class: 'btn btn-primary', href: `#/thi-thu?l=${Date.now()}`, text: 'Thi lại' }), el('a', { class: 'btn', href: '#/', text: 'Về trang chủ' })));
      }
      return render(el('h1', { text: 'Xong lượt ôn!' }), el('p', { text: `Em đúng ${right}/${round.length} câu.` }), rankCard(level),
        el('p', { class: 'muted', text: `Nhiệm vụ hôm nay: ${Math.min(progress.daily.count, summary.dailyGoal)}/${summary.dailyGoal} câu.` }),
        el('div', { class: 'actions' }, el('a', { class: 'btn btn-primary', href: `${root.location.hash.replace(/\?.*$/, '')}?l=${Date.now()}`, text: 'Ôn tiếp' }), el('a', { class: 'btn', href: '#/', text: 'Về trang chủ' })));
    };
    const show = () => {
      stop();
      if (position >= round.length) return finish();
      const question = round[position];
      const feedback = el('p', { class: 'feedback', role: 'status' });
      const clock = el('p', { class: 'clock', 'aria-live': 'off' });
      const next = el('button', { class: 'btn btn-primary', type: 'button', hidden: mode !== 'thi', text: position + 1 < round.length ? 'Câu tiếp' : mode === 'thi' ? 'Nộp bài' : 'Xem kết quả', onclick: () => { position += 1; show(); } });
      const reveal = choice => {
        stop();
        const ok = choice === question.answer;
        if (ok) right += 1;
        answered(level, question, ok);
        buttons.forEach((button, i) => { button.disabled = true; if (i === question.answer) button.dataset.state = 'right'; else if (i === choice) button.dataset.state = 'wrong'; });
        feedback.dataset.ok = String(ok);
        feedback.textContent = `${ok ? 'Đúng rồi!' : choice < 0 ? `Hết giờ! Đáp án: ${'ABCD'[question.answer]}.` : `Chưa đúng. Đáp án: ${'ABCD'[question.answer]}.`}${question.why ? ` ${question.why}` : ''}`;
        next.hidden = false; next.focus();
      };
      const buttons = question.options.map((text, choice) => el('button', { class: 'option', type: 'button', text: `${'ABCD'[choice]}. ${text}`, onclick: () => {
        if (mode === 'thi') { choices[position] = choice; buttons.forEach((button, i) => { button.dataset.state = i === choice ? 'picked' : ''; }); return; }
        reveal(choice);
      } }));
      if (mode === 'thi' && choices[position] >= 0) buttons[choices[position]].dataset.state = 'picked';
      if (mode === 'thi') choices[position] = choices[position] ?? -1;
      const tick = () => {
        if (mode === 'thi') {
          const left = Math.max(0, deadline - Date.now());
          clock.textContent = `Còn ${Math.floor(left / 60000)}:${String(Math.floor(left / 1000) % 60).padStart(2, '0')}`;
          if (!left) { for (let i = position; i < round.length; i += 1) choices[i] = choices[i] ?? -1; finish(); }
        } else if (mode === 'toc-do') {
          const left = Math.max(0, Math.ceil((started + 15000 - Date.now()) / 1000));
          clock.textContent = `Còn ${left} giây`;
          if (!left) reveal(-1);
        }
      };
      const started = Date.now();
      if (mode === 'thi' || mode === 'toc-do') { tick(); timer = root.setInterval(tick, 500); }
      render(el('p', { class: 'muted', text: `${title} · Câu ${position + 1}/${round.length} · Bài ${question.lesson}` }), clock,
        el('p', { class: 'question', text: question.q }),
        el('ul', { class: 'options' }, buttons.map(button => el('li', {}, button))), feedback, el('div', { class: 'actions' }, next));
    };
    show();
  }

  // Gửi tiến độ về cổng trên lớp (máy thầy): cổng mở #/gui-tien-do?ve=<địa chỉ cổng>; em đồng ý thì quay về
  // <địa chỉ cổng>#tien-do=<tóm tắt>. Chỉ gửi số liệu học (%, câu đúng, quân hàm), không gửi gì khác.
  function progressSummary(summary, level) {
    const info = summary.levels.find(item => item.id === level);
    const lessons = {};
    for (const lesson of info.lessons) {
      const pair = [readPercent(level, lesson.lesson, lesson.sections), practicePercent(level, lesson.lesson, lesson.questions)];
      if (pair[0] || pair[1]) lessons[lesson.lesson] = pair;
    }
    const current = rank(level);
    return { v: 1, level, date: today(), correct: current.total, rank: current.name, streak: progress.streak.days || 0,
      today: progress.daily.date === today() ? progress.daily.count : 0, lessons };
  }

  async function sendProgressPage() {
    const query = new URLSearchParams(root.location.hash.split('?')[1] || '');
    const link = root.SelfStudyProgress;
    const back = link ? link.returnUrl(query.get('ve')) : '';
    if (!back) return render(el('h1', { text: 'Gửi tiến độ' }), el('p', { text: 'Địa chỉ cổng trên lớp không đúng. Em mở lại từ cổng của thầy nhé.' }));
    const summary = await index();
    const level = currentLevel(summary);
    if (!level) return render(el('p', { text: 'Em chưa học trên trang này nên chưa có tiến độ để gửi.' }), levelPicker(summary));
    const data = progressSummary(summary, level);
    const info = summary.levels.find(item => item.id === level);
    const host = new URL(back).host;
    render(el('h1', { text: 'Gửi tiến độ cho thầy/cô' }),
      el('div', { class: 'card' },
        el('p', {}, 'Gửi tới cổng trên lớp: ', el('strong', { text: host })),
        el('p', { text: `${info.label} · ${data.rank} · ${data.correct} câu đúng · ${Object.keys(data.lessons).length} bài đã học/ôn · hôm nay ${data.today} câu.` }),
        el('p', { class: 'muted', text: 'Chỉ gửi số liệu học tập ở trên. Thầy/cô xem theo mã số sinh viên em đăng nhập ở cổng.' })),
      el('div', { class: 'actions' },
        el('a', { class: 'btn btn-primary', id: 'send-progress', href: `${back}#${link.HASH_KEY}=${link.encode(data)}` }, 'Đồng ý gửi'),
        el('a', { class: 'btn', href: back }, 'Không gửi')));
  }

  async function route() {
    const hash = root.location.hash.replace(/\?.*$/, '');
    const [, page, arg] = hash.split('/');
    try {
      if (page === 'trinh-do' && arg) { progress.level = arg; save(); root.location.hash = '#/'; return; }
      if (page === 'bai') return await lessonPage(arg);
      if (page === 'on-tap' && !arg) return await practiceMenu();
      if (page === 'on-tap') return await practicePage(arg, arg === 'tat-ca' ? 'Ôn nhanh' : `Ôn tập bài ${arg}`);
      if (page === 'cau-sai') return await practicePage('tat-ca', 'Câu sai', 'sai');
      if (page === 'toc-do') return await practicePage('toc-do', 'Tốc độ', 'toc-do');
      if (page === 'thi-thu') return await practicePage('thi-thu', 'Thi thử', 'thi');
      if (page === 'kiem-tra') return await examPage();
      if (page === 'gui-tien-do') return await sendProgressPage();
      if (page === 'nhiem-vu') return await practicePage('nhiem-vu', 'Nhiệm vụ hôm nay');
      return await home();
    } catch (error) {
      render(el('p', { text: 'Không tải được nội dung. Em kiểm tra mạng rồi tải lại trang nhé.' }), el('p', { class: 'muted', text: error.message }));
    } finally {
      syncHeader();
    }
  }

  async function syncHeader() {
    const summary = await index().catch(() => null);
    if (!summary) return;
    const select = doc.getElementById('level');
    if (select && !select.options.length) {
      select.append(el('option', { value: '', text: 'Chọn…' }), ...summary.levels.map(level => el('option', { value: level.id, text: level.label })));
      select.addEventListener('change', () => { if (select.value) root.location.hash = `#/trinh-do/${select.value}`; });
    }
    if (select) select.value = currentLevel(summary);
    const info = summary.levels.find(level => level.id === currentLevel(summary));
    const credit = doc.getElementById('credit');
    if (credit) credit.textContent = info ? info.credit : 'Nội dung: Tài liệu dạy và học GDQP&AN trình độ trung cấp, cao đẳng; SGK GDQP&AN 10, 11, 12 (NXB Giáo dục Việt Nam).';
  }

  root.addEventListener('hashchange', route);
  route();
  root.QuanSuTuHoc = { progress: () => progress, route };
})(window);
