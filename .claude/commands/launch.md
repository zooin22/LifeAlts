# /launch — 에뮬레이터에서 앱 실행

adb reverse 설정 후 Expo Go로 앱을 실행합니다. Metro 서버가 이미 켜져 있어야 합니다.

## 실행 순서

1. **에뮬레이터 상태 확인**
   ```powershell
   $adb = "C:\Users\zooin\Android\Sdk\platform-tools\adb.exe"
   & $adb devices
   ```
   - `emulator-5554 device` 가 보이면 정상
   - 없으면 에뮬레이터 먼저 시작:
     ```powershell
     $emu = "C:\Users\zooin\Android\Sdk\emulator\emulator.exe"
     Start-Process $emu -ArgumentList "-avd LifeAlts_Pixel6" -WindowStyle Hidden
     ```
     → 부팅 완료까지 ~30초 대기

2. **포트 포워딩** (에뮬레이터 localhost → 호스트 PC Metro)
   ```powershell
   $adb = "C:\Users\zooin\Android\Sdk\platform-tools\adb.exe"
   & $adb reverse tcp:8081 tcp:8081
   ```

3. **Expo Go로 앱 실행**
   ```powershell
   & $adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8081" host.exp.exponent
   ```

4. **Metro 서버 확인** (실행 안 된 경우)
   ```powershell
   $conn = Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue
   if (-not $conn) { "Metro NOT running — npx expo start 먼저 실행하세요" }
   ```

5. **앱 로드 확인** — `/screenshot` 으로 화면 캡처해서 앱이 뜨는지 확인

## 주요 경로
- adb: `C:\Users\zooin\Android\Sdk\platform-tools\adb.exe`
- 에뮬레이터: `C:\Users\zooin\Android\Sdk\emulator\emulator.exe`
- AVD 이름: `LifeAlts_Pixel6`
- Expo Go 패키지: `host.exp.exponent`

## Metro 서버 시작 (필요 시)
```bash
cd E:/Workplace/LifeAlts/LifeAlts && npx expo start
```
→ "Waiting on http://localhost:8081" 로그 확인 후 `/launch` 실행
