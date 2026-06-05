# 삶의 부캐 (LIFE Alts) — Claude 작업 가이드

## 프로젝트 개요
일상 활동(운동, 공부, 명상 등)을 RPG 직업 성장으로 변환하는 한국어 자기계발 앱.

## 기술 스택
- React Native 0.85.3 + TypeScript + Expo SDK 56.0.8
- React 19.2.3
- `@react-native-async-storage/async-storage` — 로컬 저장소 (서버 없음)
- `react-native-svg` — SVG 캐릭터 (현재 렌더러)
- `rive-react-native` v9.8.3 — 설치 완료, dev build 시 전환 예정
- 라우팅 없음 — Modal 오버레이 방식 단일 화면

## 파일 구조
```
src/
  types/index.ts               — 모든 TS 타입 (StatKey, Action, JobId 등)
  store/storage.ts             — AsyncStorage CRUD
  context/AppContext.tsx       — 전역 상태 (actions, character, routines, quests)
  utils/
    jobEngine.ts               — computeStats(), determineJob(), deriveCharacter()
    streak.ts                  — updateStreak()
    time.ts                    — getTimeOfDay(), TIME_PALETTE
    milestones.ts              — 마일스톤 보상 (25/50/75/100%)
    notifications.ts           — 알림 (Expo Go no-op, dev build에서만 동작)
    uuid.ts
  data/
    jobs.ts                    — JOBS[], JOB_MAP (16개 직업)
    voices.ts                  — getVoice() (직업별 보이스 라인)
    defaultRoutines.ts         — ROUTINE_SUGGESTIONS (13개 기본 루틴)
    shopItems.ts               — 상점 아이템 (소모품·칭호)
  components/
    Background.tsx             — 시간대별 배경
    Character.tsx              — 파사드 (RIVE_ENABLED 플래그로 SVG/Rive 선택)
    RewardToast.tsx            — 보상 토스트
    character/
      SvgCharacter.tsx         — SVG 페이퍼돌 (idle 호흡·celebrate·mood 표정)
      RiveCharacter.tsx        — Rive 통합 (dev build 전용)
      riveConfig.ts            — RIVE_ENABLED 플래그, JOB_ID_MAP, 상태머신 설정
    overlays/
      OnboardingOverlay.tsx    — 최초 온보딩 위저드
      StatsOverlay.tsx         — 스탯 탭 + 연대기(히트맵·직업변천사·한줄일지)
      QuestOverlay.tsx         — 퀘스트 수행 (일일 도장 + 메인퀘 완수/포기)
      GuildOverlay.tsx         — 의뢰소 (루틴 추가 + 메인퀘 생성)
      ShopOverlay.tsx          — 상점 (소지금·소모품·칭호)
      ReturnOverlay.tsx        — 복귀 환영 + 스트릭 복구권
      CelebrationOverlay.tsx   — 완수 축하 연출
      JobTransitionOverlay.tsx — 직업 전환 연출
  screens/HomeScreen.tsx       — 메인 HUD (하단 4탭 네비)
App.tsx                        — AppProvider + HomeScreen
docs/                          — 기획서, 개발문서, 개발자_가이드.md
```

## 핵심 설계 결정
- **스탯/직업은 저장 안 함** — actions 배열에서 매번 재계산 (룰 변경 시 데이터 오염 방지)
- **14일 롤링 윈도우 + ×0.9 일별 감쇠** — 최근 활동에 가중치
- **70% 콤보 임계값** — 2위 스탯이 1위의 70% 이상이면 조합 직업
- **금화 이원화** — 활동 금화(감쇠O, 직업 판정용) vs walletGold(평생 합계−spentGold, 화면 표시·소비)
- **캐릭터 파사드** — `Character`에 `job` + `celebrate` + `mood`만 전달, 렌더 방식은 은닉

## 직업 (16개)
단일: novice(0), warrior(1), mage(2), bard(3), rogue(4), monk(5), naturalist(6), merchant(7)
조합: paladin(8), alchemist(9), hunter(10), sage(11), healer(12), martial_artist(13), astrologer(14)
숨은: adventurer(15) — 모든 스탯 균등

## 개발 환경
- **에뮬레이터**: `LifeAlts_Pixel6` AVD, adb: `C:\Users\zooin\Android\Sdk\platform-tools\adb.exe`
- **Expo 서버**: `cd E:/Workplace/LifeAlts/LifeAlts && npx expo start`
- **에뮬 연결**: `adb reverse tcp:8081 tcp:8081` → `adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8081" host.exp.exponent`
- **Git**: `E:\Workplace\LifeAlts\LifeAlts\` (중첩 구조: 외부 LifeAlts\ → git 루트 LifeAlts\LifeAlts\)
- **GitHub**: https://github.com/zooin22/LifeAlts.git (branch: main)

## Rive 전환 체크리스트
1. ✅ rive-react-native v9.8.3 설치
2. Rive 에디터에서 `character.riv` 제작 (State Machine 1, job_id/mood/is_success 입력)
3. `assets/character.riv` 배치
4. `npx expo prebuild` + 개발 빌드
5. `src/components/character/riveConfig.ts`의 `RIVE_ENABLED = true`

## Phase 2 미구현
- Rive 실전환, 위젯(Expo Widgets), 경험 도감/칭호 확장, 친구/공유, 전직·티어
