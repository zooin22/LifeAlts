# /screenshot — 에뮬레이터 스크린샷 캡처

에뮬레이터 현재 화면을 캡처해서 55% 리사이즈 후 Claude가 볼 수 있도록 읽어옵니다.

## 실행 순서

1. **스크린샷 캡처 + 풀**
   ```powershell
   $adb = "C:\Users\zooin\Android\Sdk\platform-tools\adb.exe"
   & $adb shell screencap -p /sdcard/s.png
   & $adb pull /sdcard/s.png "E:\Workplace\LifeAlts\LifeAlts\.s.png" 2>$null | Out-Null
   & $adb shell rm /sdcard/s.png
   "captured"
   ```

2. **55% 리사이즈** (컨텍스트 토큰 절감)
   ```powershell
   Add-Type -AssemblyName System.Drawing
   $img = [System.Drawing.Image]::FromFile("E:\Workplace\LifeAlts\LifeAlts\.s.png")
   $nw = [int]($img.Width * 0.55); $nh = [int]($img.Height * 0.55)
   $bmp = New-Object System.Drawing.Bitmap $nw, $nh
   $g = [System.Drawing.Graphics]::FromImage($bmp)
   $g.DrawImage($img, 0, 0, $nw, $nh); $img.Dispose()
   $bmp.Save("E:\Workplace\LifeAlts\LifeAlts\.s-small.png", [System.Drawing.Imaging.ImageFormat]::Png)
   $bmp.Dispose(); $g.Dispose()
   "resized to $nw x $nh"
   ```

3. **Read 툴로 `.s-small.png` 읽기** — Claude가 이미지를 직접 확인할 수 있도록
   - 파일 경로: `E:\Workplace\LifeAlts\LifeAlts\.s-small.png`

4. **화면 설명** — 보이는 UI 상태를 간단히 설명

## 주요 경로
- adb: `C:\Users\zooin\Android\Sdk\platform-tools\adb.exe`
- 원본: `E:\Workplace\LifeAlts\LifeAlts\.s.png`
- 리사이즈: `E:\Workplace\LifeAlts\LifeAlts\.s-small.png`

## 주의
- 에뮬레이터가 켜져 있어야 함 (꺼져 있으면 `/launch` 먼저)
- `.s.png` / `.s-small.png` 는 `.gitignore`에 추가 권장
