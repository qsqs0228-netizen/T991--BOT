const axios = require('axios');
const cheerio = require('cheerio');

const BASE = 'https://mgf.gg';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function fetchHtml(url) {
  const { data } = await axios.get(url, {
    headers: { 'User-Agent': USER_AGENT },
    timeout: 8000
  });
  return cheerio.load(data);
}

// 캐릭터/랭킹 검색 (mgf.gg의 실제 폼 전송 방식에 맞춰 수정 필요)
async function searchCharacter(nickname) {
  try {
    // mgf.gg 캐릭터 검색 페이지
    const searchUrl = `${BASE}/contents/character.php?search=${encodeURIComponent(nickname)}`;
    const $ = await fetchHtml(searchUrl);

    // ⚠️ 실제 mgf.gg HTML 구조에 맞춰 셀렉터를 수정하세요.
    // 예시: 결과 테이블에서 닉네임, 레벨, 직업, 전투력 파싱
    const rows = [];
    $('table tbody tr, .character-list .item, .search-result .card').each((_, el) => {
      const name = $(el).find('.name, td:nth-child(1)').text().trim();
      const level = $(el).find('.level, td:nth-child(2)').text().trim();
      const job = $(el).find('.job, td:nth-child(3)').text().trim();
      const power = $(el).find('.power, td:nth-child(4)').text().trim();
      if (name) {
        rows.push({ name, level, job, power });
      }
    });

    if (rows.length === 0) {
      return `'${nickname}' 님의 정보를 찾을 수 없어요.`;
    }

    const r = rows[0];
    return `📋 캐릭터 정보\n닉네임: ${r.name}\n레벨: ${r.level || '-'}\n직업: ${r.job || '-'}\n전투력: ${r.power || '-'}`;
  } catch (err) {
    console.error('searchCharacter error:', err.message);
    return '캐릭터 정보를 불러오는 중 오류가 발생했어요.';
  }
}

// 길드 검색
async function searchGuild(guildName, type = '') {
  try {
    // 길드 랭킹 페이지에서 검색하거나, 길드 상세 페이지 URL을 추측
    const url = `${BASE}/ranking/guild_ranking.php?search=${encodeURIComponent(guildName)}`;
    const $ = await fetchHtml(url);

    // ⚠️ 실제 HTML 구조에 맞춰 수정하세요.
    const rows = [];
    $('table tbody tr, .guild-list .item').each((_, el) => {
      const name = $(el).find('.guild-name, td:nth-child(2)').text().trim();
      const level = $(el).find('.guild-lv, td:nth-child(3)').text().trim();
      const members = $(el).find('.members, td:nth-child(4)').text().trim();
      const server = $(el).find('.server, td:nth-child(5)').text().trim();
      const power = $(el).find('.power, td:nth-child(6)').text().trim();
      if (name && name.includes(guildName)) {
        rows.push({ name, level, members, server, power });
      }
    });

    if (rows.length === 0) {
      return `'${guildName}' 길드를 찾을 수 없어요.`;
    }

    const r = rows[0];
    let msg = `🏰 길드 정보\n길드명: ${r.name}\n레벨: ${r.level || '-'}\n인원: ${r.members || '-'}\n서버: ${r.server || '-'}\n전투력: ${r.power || '-'}`;
    if (type) {
      msg += `\n컨텐츠: ${type}`;
    }
    return msg;
  } catch (err) {
    console.error('searchGuild error:', err.message);
    return '길드 정보를 불러오는 중 오류가 발생했어요.';
  }
}

// 스테이지 최소컷 정보
async function getStageCut() {
  try {
    const $ = await fetchHtml(`${BASE}/contents/stage.php`);

    // ⚠️ 실제 HTML 구조에 맞춰 수정하세요.
    const stages = [];
    $('table tbody tr, .stage-list .item').each((_, el) => {
      const stage = $(el).find('.stage, td:nth-child(1)').text().trim();
      const setting = $(el).find('.setting, td:nth-child(2)').text().trim();
      if (stage) stages.push(`${stage}: ${setting || '정보 없음'}`);
    });

    if (stages.length === 0) {
      return '스테이지 정보를 불러올 수 없어요. (mgf.gg HTML 구조 확인 필요)';
    }

    return `🍁 스테이지 최소컷\n${stages.slice(0, 10).join('\n')}`;
  } catch (err) {
    console.error('getStageCut error:', err.message);
    return '스테이지 정보를 불러오는 중 오류가 발생했어요.';
  }
}

// 경험치/레벨업 예상
async function getExpInfo(nickname) {
  // 캐릭터 검색과 동일하게 레벨 정보 기반으로 예상일 계산
  // mgf.gg에 경험치 상세 페이지가 별도로 있다면 해당 URL 사용
  const charInfo = await searchCharacter(nickname);
  if (charInfo.includes('찾을 수 없')) return charInfo;

  // 레벨 파싱 후 예상일 계산 로직 추가 가능
  return `${charInfo}\n\n📈 경험치 및 레벨업 예상일은 사이트에서 확인해 주세요.\n👉 ${BASE}/contents/character.php?search=${encodeURIComponent(nickname)}`;
}

// 코디 이미지 (이미지 URL 스크래핑)
async function getCodiImageUrl(nickname) {
  // mgf.gg에 코디 조회 페이지가 있다면 해당 페이지에서 이미지 URL 파싱
  // 현재는 검색 페이지 링크만 제공
  return `👗 ${nickname} 님의 코디\n${BASE}/contents/character.php?search=${encodeURIComponent(nickname)}`;
}

module.exports = {
  searchCharacter,
  searchGuild,
  getStageCut,
  getExpInfo,
  getCodiImageUrl
};
