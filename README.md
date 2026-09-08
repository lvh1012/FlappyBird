# FLAPPY // BLUEPRINT

AERODYNAMIC TEST UNIT — game Canvas 2D mang phong cách bản vẽ kỹ thuật. TypeScript strict + Vite, không có runtime dependency, game engine hoặc raster sprite.

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

- Click/tap canvas rồi dùng Space, ArrowUp, chuột, touch hoặc pen để flap.
- READY: flap bắt đầu ngay. GAME OVER: chờ 400 ms rồi flap để về READY.
- P hoặc nút PAUSE/RESUME: tạm dừng. Chuyển tab tự dừng simulation; trạng thái pause thủ công được giữ.
- START TEST / RESTART / RETRY TEST là HTML button, hỗ trợ keyboard.
- SOUND ON/OFF lưu mute preference; best score lưu trên thiết bị.
- `?seed=12345`: tái lập pipe sequence; retry giữ nguyên seed. Seed là uint32, bao gồm 0.
- Development: `?debug=1` hoặc D khi canvas có focus hiển thị FPS, frame time, state, tọa độ, velocity, số pipe, score, seed và DPR. Debug module bị loại khỏi production build.

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

## GitHub

Source được phát triển qua branch `feat/flappy-blueprint` và review bằng pull request trước khi merge vào `main`. Workflow `.github/workflows/ci.yml` chạy formatting, lint, tests, build và upload `dist` làm artifact. Không cần Cloudflare secret cho CI này; deploy được quản lý bằng Pages Git integration.

## Architecture và quyết định kỹ thuật

- `game/Game.ts` là simulation không phụ thuộc DOM/Canvas; phát callback typed cho flap, score, collision, restart. State transitions tập trung, collision được xử lý trước scoring.
- `GameLoop` sở hữu duy nhất một RAF. Fixed step 1/120 giây, frame delta và accumulator cap 50 ms, tối đa 6 update mỗi frame. Lag dài làm simulation chậm lại thay vì cố catch-up. Resume xóa timestamp/accumulator.
- World cố định 432×768; viewport tách CSS pixels, device pixels và logical coordinates. Resize không reset gameplay. DPR cap 4 để giới hạn bộ nhớ; `setTransform` tránh scale cộng dồn.
- Bird dùng semi-implicit Euler, gravity 1500, flap -430, fall speed cap 850. Ceiling clamp y/velocity; ground và pipes gây game over. Collision circle radius 13 nhỏ hơn thân vẽ 23×18 để tạo độ dung sai.
- Difficulty thuần theo bậc mỗi 10 score, speed 160–208 và gap 172–142. Gap center giới hạn thay đổi 115 px giữa hai pipe; gap của pipe đã spawn không thay đổi.
- Seeded PRNG tách simulation, background và effects. Doodle offsets theo seed ổn định, background cache một lần. Cùng seed + input theo simulation tick + config tái lập simulation; không hứa cùng wall-clock input trên mọi frame rate.
- `PipeManager` quản lý spawn/move/remove và scoring exactly-once. ID tăng trong mỗi run; mỗi run reset toàn bộ pipe collection.
- Renderer chỉ đọc simulation. Particles tối đa 128; shake dùng renderer transform, không sửa collision position. Reduced motion giảm particles, tắt shake/idle bob.
- AudioContext khởi tạo sau user gesture, âm lượng nhỏ; lỗi audio disable audio, không chặn game. Storage validation bỏ dữ liệu hỏng; lỗi privacy/quota chuyển sang memory.
- Input dùng pointerdown duy nhất để tránh synthetic click double-trigger. Keyboard chỉ bắt trên canvas có focus. AbortController và HMR dispose dọn listener/RAF; pagehide/pageshow hỗ trợ bfcache.
- HTML controls, canvas description, focus ring và live status hỗ trợ accessibility. Gameplay phản xạ bằng Canvas vẫn cần nhìn để chơi.

## Kiểm chứng

Unit tests bao phủ integration physics, ceiling, long delta, NaN, collision edge/corner, difficulty bounds, PRNG reproducibility, seed validation, storage lỗi, state/restart, scoring exactly-once, pipe lifecycle và RAF pause/resume.

TypeScript, ESLint, Prettier và Vite production build đã thành công. Vitest báo 35/35 tests pass ở 7 test files, nhưng test runner không thoát trong runtime hiện tại, kể cả với các pool khác nhau; chưa xác nhận được exit code 0 của npm test. Cần chạy lại npm test/CI trong Node.js chuẩn trước khi deploy. Chưa thực hiện browser/device QA hoặc deploy thực tế lên Cloudflare. Mục tiêu 60 FPS chưa được benchmark trên thiết bị thật.
