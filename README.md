# 메키봇 완성 가이드 (dev-dain 블로그 스타일)

**카카오톡 채널(플러스친구) 봇**으로 동작합니다. 사용자가 카카오톡에서 봇을 검색 → 친구 추가 → 1:1 대화로 `!랭킹 홍길동` 등을 입력하면 답변합니다.

---

## 1단계: GitHub에 코드 올리기

1. [https://github.com/new](https://github.com/new) 에서 새 저장소 만들기
   - 이름: `mgf-bot` (아무 이름이나 가능)
   - Public 선택
2. 이 폴더(`mgf-bot`)의 **모든 파일**을 업로드
   - `package.json`, `src/index.js`, `README.md`

> Git이 설치되어 있으면: `git init` → `git add .` → `git commit -m "first"` → `git push`  
> 아니면 GitHub 웹사이트에서 "Add file" → "Upload files" 로 직접 올리세요.

---

## 2단계: Render 무료 서버에 배포하기

1. [https://render.com](https://render.com) 접속 → GitHub 계정으로 로그인
2. 대시보드에서 **"New +"** → **"Web Service"** 클릭
3. 방금 만든 `mgf-bot` GitHub 저장소 선택
4. 아래 정보 입력:
   - **Name**: `mgf-bot` (아무 이름)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **"Create Web Service"** 클릭
6. 2~3분 기다리면 위에 **URL**이 생깁니다. 예:
   ```
   https://mgf-bot.onrender.com
   ```
   이 주소를 복사해두세요.

---

## 3단계: 카카오 오픈빌더 스킬 연결

1. [https://i.kakao.com](https://i.kakao.com) 접속 → 로그인
2. 챗봇 대시보드에서 **"스킬"** 탭 → **"스킬 만들기"**
3. 입력:
   - **스킬 이름**: `메키봇`
   - **URL**: `https://당신_렌더주소/skill`
     - 예: `https://mgf-bot.onrender.com/skill`
   - **메서드**: POST
   - **콘텐츠 타입**: application/json; charset=utf-8
4. **저장**

---

## 4단계: 시나리오 설정

1. 왼쪽 **"시나리오"** → **"시나리오 만들기"**
2. **블록 이름**: `메키봇` (아무 이름)
3. **사용자 발화**에서 기존 항목 지우고, **정규식 발화** 추가:
   ```
   ^!.*
   ```
   (이렇게 하면 `!`로 시작하는 모든 말이 이 스킬로 들어옵니다)
4. **봇 응답** → **"스킬 데이터 사용"** → `메키봇` 선택
5. **저장**
6. 위에 **"배포하기"** 클릭 → **"배포"**

---

## 5단계: 카카오톡 채널 만들고 연결

1. [https://channel.kakao.com](https://channel.kakao.com) 접속
2. **"채널 만들기"**
3. 채널 이름: `메키봇`
4. 카테고리: 게임 / 엔터테인먼트 등
5. 프로필 사진, 설명 등 입력 → **만들기**
6. 채널 관리 페이지에서 **"설정"** → **"챗봇 연결"** (또는 **"개발자 설정"**)
7. **"카카오 오픈빌더 연결"** → 방금 만든 챗봇 선택 → **연결**

---

## 6단계: 테스트

1. 카카오톡 앱에서 **검색창**에 `메키봇` 입력
2. 채널이 뜨면 **친구 추가**
3. 대화창에서 입력:
   - `!명령어`
   - `!주사위`
   - `!랭킹 홍길동`
   - `!스테이지`

---

## ⚠️ 중요: mgf.gg 크롤링 설정

현재 코드는 `mgf.gg` HTML 구조를 **추정**하여 작성했습니다. 만약 실제 사이트 구조와 다르면:

1. `src/index.js`의 `searchCharacter`, `searchGuild`, `getStageCut` 함수 안의 **cheerio 셀렉터**를 수정해야 합니다.
2. `mgf.gg`에서 데이터가 동적으로 로딩된다면, `puppeteer`를 추가로 설치해서 브라우저 자동화를 해야 할 수도 있습니다.

**현재 fallback 동작:** 크롤링 실패 시 해당 `mgf.gg` 페이지 링크를 깔끔하게 보여줍니다. 이 상태로도 기본 사용에는 문제없습니다.

---

## 파일 구조

```
mgf-bot/
├── package.json      # Node.js 설정
├── README.md         # 이 파일
└── src/
    └── index.js      # 봇 서버 메인 코드
```

## 라이선스

자유롭게 수정 및 사용하실 수 있습니다.
