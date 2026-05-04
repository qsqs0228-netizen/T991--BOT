const { searchCharacter, searchGuild, getStageCut, getExpInfo, getCodiImageUrl } = require('./mgf');

const FOODS = [
  '치킨', '피자', '햄버거', '떡볶이', '라면', '삼겹살', '초밥', '돈까스',
  '짜장면', '짬뽕', '마라탕', '샐러드', '김밥', '순대국밥', '해장국', '파스타'
];

function rollDice() {
  const n = Math.floor(Math.random() * 6) + 1;
  return `🎲 주사위 결과: ${n}`;
}

function whatToEat() {
  const food = FOODS[Math.floor(Math.random() * FOODS.length)];
  return `🍽️ 오늘은 ${food} 어떠세요?`;
}

function hello(nickname) {
  const name = nickname || '모험가';
  return `👋 안녕하세요, ${name}님! 메키봇입니다.`;
}

function calculatorDamage() {
  return `🧮 데미지 계산기\n👉 https://mgf.gg/contents/damage.php\n(사이트에서 직접 입력해 주세요)`;
}

function calculatorLevel() {
  return `🧮 레벨업 계산기\n👉 https://mgf.gg/contents/level.php\n(사이트에서 직접 입력해 주세요)`;
}

function simulatorLink() {
  return `🛠️ 장비 시뮬레이터\n👉 https://mgf.gg/contents/simulator.php`;
}

function helpMessage() {
  return `🤖 메키봇 명령어 안내

🍁 스테이지
• !스테이지

🧮 계산기
• !데미지계산기
• !레벨업계산기

🔍 정보 검색
• !랭킹 닉네임
• !캐릭터 닉네임
• !경험치 닉네임
• !길드 길드명
• !대항전 길드명
• !수련장 길드명
• !길드보스 길드명
• !코디 닉네임
• !시뮬레이터

🎲 기타 / 재미
• !ㅁㅁㅈ : 메뉴 추천
• !주사위 : 주사위 굴리기
• !안녕 : 인사하기`;
}

async function handleCommand(text, sender = {}) {
  const parts = text.split(/\s+/);
  const cmd = parts[0];
  const arg = parts.slice(1).join(' ').trim();

  switch (cmd) {
    case '!스테이지':
      return await getStageCut();

    case '!데미지계산기':
      return calculatorDamage();

    case '!레벨업계산기':
      return calculatorLevel();

    case '!랭킹':
    case '!캐릭터':
      if (!arg) return '닉네임을 입력해주세요. 예: !랭킹 홍길동';
      return await searchCharacter(arg);

    case '!경험치':
      if (!arg) return '닉네임을 입력해주세요. 예: !경험치 홍길동';
      return await getExpInfo(arg);

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
      return await searchGuild(arg, '길드보스');

    case '!코디':
      if (!arg) return '닉네임을 입력해주세요. 예: !코디 홍길동';
      return await getCodiImageUrl(arg);

    case '!시뮬레이터':
      return simulatorLink();

    case '!주사위':
      return rollDice();

    case '!ㅁㅁㅈ':
      return whatToEat();

    case '!안녕':
      return hello(sender.nickname);

    case '!명령어':
    case '!도움':
    case '!help':
      return helpMessage();

    default:
      return null; // 무응답
  }
}

module.exports = { handleCommand };
