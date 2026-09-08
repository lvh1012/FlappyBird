# FLAPPY // BLUEPRINT

AERODYNAMIC TEST UNIT — game Canvas 2D mang phong cách phác thảo bút bi trên giấy note. TypeScript strict + Vite, không có runtime dependency, game engine hoặc raster sprite.

## Chạy và kiểm tra

Yêu cầu Node.js >=22.12 (CI dùng `.node-version`).

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
npm run preview
```

`npm run check` chạy lint, unit tests và production build. `npm run format:check` kiểm tra Prettier. Commit `package-lock.json`; CI dùng `npm ci`.

## Điều khiển

- Visual theme: giấy ngà dịu `#ECE6D2`, nét bút bi xanh `#1E4F9A`, grid xanh nhạt chạy liên tục toàn viewport; lớp grain được tạo một lần nên không nhấp nháy.
- Canvas phủ viewport, nét bút bi xanh trên giấy ngà. World giữ chiều cao logic 768, có chiều rộng tối thiểu 432 và tự mở rộng theo aspect ratio để gameplay phủ ngang tablet/desktop mà không kéo giãn bird hay pipe.
- Mobile portrait thu gọn chrome; landscape thấp chuyển controls sang bên phải. Nút Fullscreen chỉ hiện khi browser hỗ trợ, giữ controls trong fullscreen container.
- Xoay màn hình hoặc chuyển Fullscreen khi đang chơi sẽ pause; chủ động Resume để tiếp tục. Restart trong lúc chơi chỉ khả dụng sau khi pause để tránh bấm nhầm.

- Click/tap canvas rồi dùng Space, ArrowUp, chuột, touch hoặc pen để flap.
- READY: flap bắt đầu ngay. GAME OVER: chờ 400 ms rồi flap để về READY.
- P hoặc nút PAUSE/RESUME: tạm dừng. Chuyển tab tự dừng simulation; trạng thái pause thủ công được giữ.
- START TEST / RESTART / RETRY TEST là HTML button, hỗ trợ keyboard.
- SOUND ON/OFF lưu mute preference; best score lưu trên thiết bị.
- `?seed=12345`: tái lập pipe sequence; retry giữ nguyên seed. Seed là uint32, bao gồm 0.
- Development: `?debug=1` hoặc D khi canvas có focus hiển thị FPS, frame time, state, tọa độ, velocity, số pipe, score, seed và DPR. Debug module bị loại khỏi production build.

## Challenge system

- 8 clearance đầu là onboarding, chỉ có static pipe.
- Sau onboarding, `EventDirector` chọn deterministic challenge theo score-independent clearance progression: updraft, downdraft, precision route và oscillating valve.
- Wind zone có vùng dashed, label và các luồng nét bút chuyển động theo hướng lực trước khi tác động. Khi bật `prefers-reduced-motion`, animation chuyển thành indicator tĩnh. Vertical force được cap để không phá physics bounds.
- Precision route là mục tiêu tùy chọn trong gap: clearance thường vẫn an toàn; bay qua target nhận perfect bonus và tăng combo.
- Moving valve chỉ xuất hiện từ clearance 24 và luôn được theo sau bởi một recovery pipe.
- Difficulty vật lý dựa trên clearance, không dựa trên bonus score. Vì vậy combo không làm game tăng tốc ngoài dự kiến.
- Game-over report ghi nguyên nhân va chạm, clearance và best combo của run.

## Cloudflare Pages

Dự án là static site. Không cần Worker, database, API key hoặc environment variable trong client.

| Thiết lập              | Giá trị            |
| ---------------------- | ------------------ |
| Project name           | `flappy-blueprint` |
| Production branch      | `main`             |
| Framework preset       | Vite hoặc None     |
| Root directory         | root repository    |
| Build command          | `npm run build`    |
| Build output directory | `dist`             |
| Node version           | `.node-version`    |

Trong Cloudflare dashboard: Workers & Pages → tạo Pages project → Connect to Git → chọn repository → nhập cấu hình trên → deploy. Git integration sẽ build khi push. Chỉ kết nối production branch sau khi CI thành công; Pages Git integration không tự đợi workflow Quality.

Tham khảo: [Cloudflare Pages Vite guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/).

Có thể deploy `dist` qua Wrangler sau khi đăng nhập Cloudflare:

```bash
npm run build
npx wrangler pages deploy dist --project-name flappy-blueprint
```

`wrangler.toml` dùng `pages_build_output_dir`, không phải Workers assets configuration. `public/_headers` được Vite chép sang `dist`: security headers và immutable cache cho assets có hash. Không cấu hình SPA rewrite vì chỉ có một trang và không có client-side routing.

### Continuous deployment bằng GitHub Actions

`.github/workflows/deploy.yml` chạy khi có commit vào `main` hoặc khi được gọi thủ công bằng `workflow_dispatch`. Workflow cài dependency từ lockfile, chạy formatting, lint, tests và production build trước khi deploy `dist` bằng Wrangler.

Tạo Cloudflare Pages project tên `flappy-blueprint`, sau đó thêm hai repository secrets tại **Settings → Secrets and variables → Actions**:

| Secret                  | Giá trị                                             |
| ----------------------- | --------------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID trong Cloudflare dashboard               |
| `CLOUDFLARE_API_TOKEN`  | API token có quyền ghi Cloudflare Pages cho account |

Workflow dùng GitHub environment `production` và concurrency group cố định: deployment mới hơn sẽ hủy deployment production cũ còn đang chạy. Không lưu credentials trong source hoặc build output.

## GitHub

Source được phát triển qua branch `feat/flappy-blueprint` và review bằng pull request trước khi merge vào `main`. Workflow `.github/workflows/ci.yml` chạy formatting, lint, tests, build và upload `dist` làm artifact. Không cần Cloudflare secret cho CI này; deploy được quản lý bằng Pages Git integration.

## Architecture và quyết định kỹ thuật

- `game/Game.ts` là simulation không phụ thuộc DOM/Canvas; phát callback typed cho flap, score, collision, restart. State transitions tập trung, collision được xử lý trước scoring.
- `GameLoop` sở hữu duy nhất một RAF. Fixed step 1/120 giây, frame delta và accumulator cap 50 ms, tối đa 6 update mỗi frame. Lag dài làm simulation chậm lại thay vì cố catch-up. Resume xóa timestamp/accumulator.
- Responsive world dùng kích thước tối thiểu 432×768 và mở rộng logical width đối xứng theo diện tích hiển thị; bird giữ đúng vị trí của khung game cũ, HUD tự căn giữa, background/ground được tile xuyên suốt và pipe spawn tới mép phải. Viewport tách CSS pixels, device pixels và logical coordinates. Resize không reset gameplay và redraw khi pause. DPR tối đa 4, backing buffer tối đa 4 triệu pixels (~16 MB RGBA); `setTransform` tránh scale cộng dồn. CSS dùng dynamic viewport units và safe-area insets.
- Bird dùng semi-implicit Euler, gravity 1500, flap -430, fall speed cap 850. Ceiling clamp y/velocity; ground và pipes gây game over. Collision circle radius 13 nhỏ hơn thân vẽ 23×18 để tạo độ dung sai.
- Difficulty thuần theo bậc mỗi 10 clearance, speed 160–208 và gap 172–142. Gap center delta tăng từ 80 đến tối đa 122 px; moving valve dao động 12–18 px trong giới hạn world an toàn.
- Seeded PRNG tách simulation, background và effects. Doodle offsets theo seed ổn định, background cache một lần. Cùng seed + input theo simulation tick + config tái lập simulation; không hứa cùng wall-clock input trên mọi frame rate.
- `PipeManager` quản lý spawn/move/remove, wind zone, valve phase và clearance exactly-once. `EventDirector` áp dụng unlock threshold, challenge budget, no-repeat selection và recovery pipe.
- Renderer chỉ đọc simulation. Particles tối đa 128; shake dùng renderer transform, không sửa collision position. Reduced motion giảm particles, tắt shake/idle bob.
- AudioContext khởi tạo sau user gesture, âm lượng nhỏ; lỗi audio disable audio, không chặn game. Storage validation bỏ dữ liệu hỏng; lỗi privacy/quota chuyển sang memory.
- Input dùng pointerdown duy nhất để tránh synthetic click double-trigger. Keyboard chỉ bắt trên canvas có focus. AbortController và HMR dispose dọn listener/RAF; pagehide/pageshow hỗ trợ bfcache.
- HTML controls, canvas description, focus ring và live status hỗ trợ accessibility. Gameplay phản xạ bằng Canvas vẫn cần nhìn để chơi.

## Kiểm chứng

Unit tests bao phủ integration physics và wind force, collision, difficulty bounds, PRNG reproducibility, event determinism, onboarding, valve recovery, precision target, state/restart, combo scoring, pipe lifecycle, storage và RAF pause/resume.

TypeScript, ESLint, Prettier và Vite production build đã thành công. GitHub Actions chạy toàn bộ Vitest suite trước khi merge. Chưa thực hiện browser/device QA trên thiết bị thật. Mục tiêu 60 FPS chưa được benchmark trên thiết bị thật.
