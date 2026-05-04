const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(express.json());

const BASE = 'https://mgf.gg';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

// ===== mgf.gg 스크래핑 함수들 =====

async function searchCharacter(name) {
  try {
    const url = `${BASE}/contents/character.php?search=${encodeURIComponent(name)}`;
    const { data } = await axios.get(url, { headers: { 'User-Agent': UA }, timeout: 10000 });
    const $ = cheerio.load(data);

    // mgf.gg 실제 구조에서 캐릭터 정보 추출
    // (구조가 바뀌면 이 셀렉터를 수정해야 함)
    const rows = [];
    $('table tbody tr, .search-result .item, .character-list .item').each((_, el) => {
      const tds = $(el).find('td');
      if (tds.length >= 2) {
        const n = $(tds[0]).text().trim();
        const lv = $(tds[1]).text().trim();
        const job = tds.length > 2 ? $(tds[2]).text().trim() : '';
        const power = tds.length > 3 ? $(tds[3]).text().trim() : '';
        if (n) rows.push({ name: n, level: lv, job, power });
      }
    });

    if (rows.length === 0) {
      // 테이블 구조가 없으면 링크로 대체
      return `📋 ${name} 님의 캐릭터 정보를 직접 확인하세요.\n👉 ${url}`;
    }

    const r = rows[0];
    return `📋 캐릭터 정보\n닉네임: ${r.name}\n레벨: ${r.level || '-'}\n직업: ${r.job || '-'}\n전투력: ${r.power || '-'}`;
  } catch (err) {
    console.error('searchCharacter error:', err.message);
    return `📋 ${name} 님의 캐릭터 정보\n👉 ${BASE}/contents/character.php?search=${encodeURIComponent(name)}`;
  }
}

async function searchGuild(name, type='') {
  try {
    const url = `${BASE}/ranking/guild_ranking.php?search=${encodeURIComponent(name)}`;
    const { data } = await axios.get(url, { headers: { 'User-Agent': UA }, timeout: 10000 });
    const $ = cheerio.load(data);

    const rows = [];
    $('table tbody tr, .guild-list .item').each((_, el) => {
      const tds = $(el).find('td');
      if (tds.length >= 2) {
        const rank = $(tds[0]).text().trim();
        const gname = $(tds[1]).text().trim();
        const lv = tds.length > 2 ? $(tds[2]).text().trim() : '';
        const members = tds.length > 3 ? $(tds[3]).text().trim() : '';
        const server = tds.length > 4 ? $(tds[4]).text().trim() : '';
        const power = tds.length > 5 ? $(tds[5]).text().trim() : '';
        if (gname && gname.includes(name)) {
          rows.push({ rank, name: gname, level: lv, members, server, power });
        }
      }
    });

    if (rows.length === 0) {
      return `🏰 ${name} 길드 정보를 직접 확인하세요.\n👉 ${BASE}/contents/guild.php?search=${encodeURIComponent(name)}`;
    }

    const r = rows[0];
    let msg = `🏰 길드 정보\n길드명: ${r.name}\n순위: ${r.rank || '-'}\n레벨: ${r.level || '-'}\n인원: ${r.members || '-'}\n서버: ${r.server || '-'}\n전투력: ${r.power || '-'}`;
    if (type) msg += `\n컨텐츠: ${type}`;
    return msg;
  } catch (err) {
    console.error('searchGuild error:', err.message);
    return `🏰 ${name} 길드 정보\n👉 ${BASE}/contents/guild.php?search=${encodeURIComponent(name)}`;
  }
}

async function getStageCut() {
  try {
    const { data } = await axios.get(`${BASE}/contents/stage.php`, { headers: { 'User-Agent': UA }, timeout: 10000 });
    const $ = cheerio.load(data);

    const stages = [];
    $('table tbody tr, .stage-list .item').each((_, el) => {
      const tds = $(el).find('td');
      if (tds.length >= 2) {
        const stage = $(tds[0]).text().trim();
        const setting = $(tds[1]).text().trim();
        if (stage) stages.push(`${stage}: ${setting || '정보 없음'}`);
      }
    });

    if (stages.length === 0) {
      return `🍁 스테이지 최소컷\n👉 ${BASE}/contents/stage.php`;
    }

    return `🍁 스테이지 최소컷\n${stages.slice(0, 10).join('\n')}`;
  } catch (err) {
    console.error('getStageCut error:', err.message);
    return `🍁 스테이지 최소컷\n👉 ${BASE}/contents/stage.php`;
  }
}

// ===== 명령어 처리 =====

const FOODS = [
  '치킨','피자','햄버거','떡볶이','라면','삼겹살','초밥','돈까스',
  '짜장면','짬뽕','마라탕','샐러드','김밥','순대국밥','해장국','파스타',
  '보쌈','족발','쌀국수','샌드위치','칼국수','닭갈비','부대찌개','곱창'
];

function rollDice() {
  return `🎲 주사위 결과: ${Math.floor(Math.random()*6)+1}`;
}

function whatToEat() {
  return `🍽️ 오늘은 ${FOODS[Math.floor(Math.random()*FOODS.length)]} 어떠세요?`;
}

function helpMessage() {
  return `🤖 메키봇 명령어 안내\n\n🍁 스테이지\n• !스테이지\n\n🧮 계산기\n• !데미지계산기\n• !레벨업계산기\n\n🔍 정보 검색\n• !랭킹 닉네임\n• !캐릭터 닉네임\n• !경험치 닉네임\n• !길드 길드명\n• !대항전 길드명\n• !수련장 길드명\n• !길드보스 길드명\n• !코디 닉네임\n• !시뮬레이터\n\n🎲 기타 / 재미\n• !ㅁㅁㅈ : 메뉴 추천\n• !주사위 : 주사위 굴리기\n• !안녕 : 인사하기`;
}

async function handleCommand(text) {
  const parts = text.trim().split(/\s+/);
  const cmd = parts[0];
  const arg = parts.slice(1).join(' ').trim();

  switch (cmd) {
    case '!스테이지': return await getStageCut();
    case '!데미지계산기': return '🧮 데미지 계산기\n👉 https://mgf.gg/calc/calc.php';
    case '!레벨업계산기': return '🧮 레벨업 계산기\n👉 https://mgf.gg/calc/level.php';
    case '!시뮬레이터': return '🛠️ 장비 시뮬레이터\n👉 https://mgf.gg/sim';

    case '!랭킹':
    case '!캐릭터':
      if (!arg) return '닉네임을 입력해주세요. 예: !' + cmd + ' 홍길동';
      return await searchCharacter(arg);

    case '!경험치':
      if (!arg) return '닉네임을 입력해주세요. 예: !경험치 홍길동';
      return await searchCharacter(arg) + '\n\n📈 경험치 상세는 위 링크에서 확인하세요.';

    case '!코디':
      if (!arg) return '닉네임을 입력해주세요. 예: !코디 홍길동';
      return `👗 ${arg} 님의 코디\n👉 https://mgf.gg/contents/character.php?search=${encodeURIComponent(arg)}`;

    case '!길드':
      if (!arg) return '길드명을 입력해주세요. 예: !길드 모두있음';
      return await searchGuild(arg);

    case '!대항전':
      if (!arg) return '길드명을 입력해주세요. 예: !대항전 모두있음';
      return await searchGuild(arg, '대항전');

    case '!수련장':
      if (!arg) return '길드명을 입력해주세요. 예: !수련장 모두있음';
      return await searchGuild(arg, '수련장');

    case '!길드보스':
      if (!arg) return '길드명을 입력해주세요. 예: !길드보스 모두있음';
      return `👹 ${arg} 길드보스 정보\n👉 https://mgf.gg/ranking/guild_boss.php?search=${encodeURIComponent(arg)}`;

    case '!주사위': return rollDice();
    case '!ㅁㅁㅈ': return whatToEat();
    case '!안녕': return '👋 안녕하세요! 메키봇입니다.';
    case '!명령어': case '!도움': case '!help': return helpMessage();
    default: return null;
  }
}

// ===== 카카오 오픈빌더 스킬 서버 엔드포인트 =====

// 헬스체크
app.get('/', (req, res) => res.send('메키봇 서버 정상 작동 중!'));

// 카카오 오픈빌더 스킬 엔드포인트 (핵심)
app.post('/skill', async (req, res) => {
  try {
    const utterance = req.body.userRequest?.utterance?.trim() || '';
    
    // !로 시작하지 않으면 무시
    if (!utterance.startsWith('!')) {
      return res.json({
        version: '2.0',
        template: { outputs: [{ simpleText: { text: '명령어는 !로 시작해야 해요. (!명령어 참고)' } }] }
      });
    }

    const reply = await handleCommand(utterance);

    return res.json({
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: reply || '알 수 없는 명령어예요. !명령어 를 입력해보세요.'
            }
          }
        ]
      }
    });
  } catch (err) {
    console.error('Skill error:', err);
    return res.json({
      version: '2.0',
      template: {
        outputs: [{ simpleText: { text: '오류가 발생했어요. 잠시 후 다시 시도해주세요.' } }]
      }
    });
  }
});

// (선택) 오픈채팅봇 웹훅 형식도 지원
app.post('/webhook', async (req, res) => {
  try {
    const { event, message } = req.body;
    if (event !== 'message' || !message?.text?.startsWith('!')) {
      return res.json({ success: true });
    }
    const reply = await handleCommand(message.text.trim());
    return res.json({ success: true, message: { text: reply || '알 수 없는 명령어예요.' } });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.json({ success: true, message: { text: '오류가 발생했어요.' } });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`메키봇 서버 포트 ${PORT}에서 실행 중`);
});
