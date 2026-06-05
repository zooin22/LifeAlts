# /push — 변경 내역 커밋 + 푸시

변경된 파일을 확인하고 커밋 메시지를 작성해 main 브랜치에 푸시합니다.

## 실행 순서

1. **변경 내역 확인**
   ```bash
   cd "E:\Workplace\LifeAlts\LifeAlts" && git status --short && git diff --stat
   ```

2. **스테이징** — 변경/신규 파일을 구체적으로 명시 (git add -A 금지)
   ```bash
   cd "E:\Workplace\LifeAlts\LifeAlts" && git add <파일들>
   ```

3. **커밋** — 최근 커밋 스타일 참고해서 한국어 메시지 작성
   ```bash
   cd "E:\Workplace\LifeAlts\LifeAlts" && git log --oneline -3
   ```
   ```bash
   git commit -m "$(cat <<'EOF'
   <type>: <요약>

   - 변경사항 1
   - 변경사항 2

   Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
   EOF
   )"
   ```

4. **푸시**
   ```bash
   cd "E:\Workplace\LifeAlts\LifeAlts" && git push origin main
   ```

## 커밋 타입
- `feat`: 새 기능
- `fix`: 버그 수정
- `chore`: 설정/도구/문서
- `refactor`: 리팩터링
- `docs`: 문서만 변경

## 주의
- 민감한 파일(.env 등) 스테이징 금지
- 변경 없으면 커밋하지 않음
- 이 스킬은 코드 작업 완료 후 자동으로 호출됨
