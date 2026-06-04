# /dev — LifeAlts 개발 서버 + 외부 접속 QR 시작

외부에서 폰으로 앱을 테스트할 수 있도록 Expo 서버 + ngrok 터널을 자동으로 시작하고 QR 코드를 GitHub에 푸시합니다.

## 실행 순서

1. **포트 정리** — PowerShell로 8081 포트 점유 프로세스 종료
   ```powershell
   Stop-Process -Id (Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue
   ```

2. **Expo 서버 시작** — 백그라운드로 실행, "Waiting on" 로그 대기
   ```bash
   cd E:/Workplace/LifeAlts/LifeAlts && npx expo start
   ```

3. **ngrok 터널 시작** — 백그라운드로 실행
   - 바이너리 위치: `C:\Users\zooin\.ngrok3\ngrok.exe`
   - 명령: `ngrok.exe http 8081`
   - authtoken은 `~/.ngrok2/ngrok.yml`에 저장되어 있음

4. **터널 URL 확인** — ngrok 로컬 API 폴링
   ```bash
   curl -s http://localhost:4040/api/tunnels
   ```
   → `public_url` (https://xxxxx.ngrok-free.app) 추출

5. **QR 코드 생성** — `exp://[ngrok-hostname]` 형식으로 PNG 저장
   ```js
   // node_modules/qrcode 사용
   QRCode.toFile('./qr-expo.png', 'exp://xxxxx.ngrok-free.app', { width: 400 })
   ```

6. **GitHub 푸시** — QR 이미지 커밋 후 push
   ```bash
   git add qr-expo.png && git commit -m "temp: QR 코드 업데이트" && git push
   ```

7. **결과 보고** — GitHub 이미지 URL과 터널 URL 출력

## 주요 경로
- 프로젝트: `E:\Workplace\LifeAlts\LifeAlts`
- ngrok: `C:\Users\zooin\.ngrok3\ngrok.exe`
- GitHub: `https://github.com/zooin22/LifeAlts`
- QR 이미지: `qr-expo.png` (레포 루트)

## 주의
- ngrok 무료 계정은 세션마다 URL이 바뀜
- PC가 켜져 있는 동안만 터널 유지
- Expo Go 앱으로 스캔
