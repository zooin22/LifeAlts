# /typecheck — TypeScript 타입 체크

프로젝트 전체 TypeScript 타입 오류를 검사합니다. 빌드 없이 타입만 확인합니다.

## 실행 순서

1. **tsc --noEmit 실행**
   ```powershell
   & "E:\Workplace\LifeAlts\LifeAlts\node_modules\.bin\tsc.cmd" --noEmit 2>&1
   ```

2. **결과 해석**
   - 출력 없음 → 타입 오류 없음 ✅
   - `error TS....` 출력 → 오류 목록 확인 후 수정

## 주요 경로
- tsc: `E:\Workplace\LifeAlts\LifeAlts\node_modules\.bin\tsc.cmd`
- tsconfig: `E:\Workplace\LifeAlts\LifeAlts\tsconfig.json`

## 주의
- `rive-react-native` 타입은 패키지 설치 후 자동 해소됨
- `RiveCharacter.tsx` 는 RIVE_ENABLED=false 시 번들에 미포함 → 타입 경고 무시 가능
