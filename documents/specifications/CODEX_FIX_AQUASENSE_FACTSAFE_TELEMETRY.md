# Codex task — sửa telemetry/scenarios AquaSense & FactSafe

**Ngày:** 2026-10-24  
**Repo:** https://github.com/ariseingris/multifrontend  
**Ưu tiên:** khắc phục dữ liệu thật sự đi qua pipeline mô phỏng, không chỉ làm chart trông có dữ liệu.  
**Phạm vi:** AquaSense và FactSafe. **KHÔNG sửa FireScout AI** trừ khi cần vá thành phần chia sẻ theo cách tương thích ngược. Không hồi sinh những project đã được xóa.

## 1. Hiện trạng người dùng nhìn thấy

- FactSafe: cả ba status cards hiển thị `—`, tất cả biểu đồ ghi `No telemetry. Open Scenarios and run a simulation.` Description ghi Connected nhưng không có telemetry. Footer cho thấy scenario stopped/normal. Điều này **chưa đủ để kết luận** lỗi simulator: trước hết hãy kích hoạt scenario và kiểm tra phản hồi/lệnh WebSocket, project ID, stream registration, parsing, store và chart subscriptions.
- AquaSense: có telemetry, ba cards đang hiển thị DO ~6.19 mg/L, temperature ~27.6 °C, pH ~7.72; ba charts chạy nhưng tuyến dữ liệu rất ngắn/ít biến động trong ảnh; scenario dropdown `Normal Day Cycle`, speed 1x/10x/60x/300x/600x, Pause/Reset đã xuất hiện. Không được tuyên bố “không có scenario”; phải kiểm tra đủ `normal`, `low_oxygen`, `sensor_fouling`, và liệu UI có render danh sách sau khi mở dropdown hay không.
- Ảnh không chứng minh được FireScout lỗi. Giữ nguyên.

## 2. Kết quả cuối cùng bắt buộc

1. Tại `/?project=aquasense` và `/?project=factsafe`: người dùng chọn một trong ba scenario của từng dự án, nhấn Start, stream liên tục cập nhật ba KPI và ba charts; pause/resume, speed, reset hoạt động.
2. Không có số đo => `—` + empty state, **không dùng 0 làm giá trị thay thế**. Nếu simulator bị ngắt, hiển thị Disconnected / No telemetry, không ghi Connected chỉ vì WebSocket từng kết nối.
3. Dữ liệu **tự sinh dựa trên sim elapsed time** và scenario tương ứng, hợp lý và có thể kiểm thử; không render random trực tiếp trong React. Có seed để tái lập, optional noise nhẹ và deterministic.
4. Metric key và đơn vị phải đúng **theo từng project**; không lấy chart title làm đơn vị, không trộn ppm với µg/m³, không gán đơn vị cho pH hay risk score.
5. Một simulator session chỉ thuộc về một project; chuyển project/reset phải tách dữ liệu lịch sử, events và selected scenario (hoặc lọc theo project/session ID), không thấy dữ liệu cũ tràn sang project mới.
6. Logs ghi event transitions quan trọng (start, warning, critical, recovered, pause/resume, reset, complete, sensor quality), không spam mỗi packet.

## 3. Phân tích nguyên nhân gốc trước khi code

Đọc code thực tế và mô tả flow: `UI scenario controls -> command encoder -> WebSocket server -> scenario manager -> data generator -> telemetry broadcast -> frontend useDataBridge -> Zustand store -> latest/history -> chart`. Kiểm tra ít nhất:

- Server đang chạy ở endpoint nào, `VITE_WS_URL` có chính xác không, client có thật sự nhận data không (log dev-mode).
- `start_scenario` payload `project` có trùng chính xác `aquasense` / `factsafe`, scenario ID có tồn tại, handler có thực thi không; trường status đang chạy có được publish không.
- Simulator có module FactSafe/route đúng không; `?project=factsafe` có thay đổi cả simulator target hay chỉ frontend UI?
- Client có lọc nhầm packet theo project, action type, field name (`metrics`, time, status), hoặc store bị reset khi component rerender/switch?
- Tại sao FactSafe ở screenshot trạng thái stopped; thử Start trước khi xác định stream bị lỗi.
- Vì sao AquaSense X-axis chỉ hiển thị ~6.7–7.5 sim phút; chart rolling-window hợp lý hay data chỉ có vài sample? Cần kiểm tra timestamp, sample rate, ẩn/hiện window, mount/remount.
- Đừng tạo fake data riêng trong React để che lỗi backend. **Simulator/backend là nguồn dữ liệu chuẩn**; nếu kiến trúc repo vốn client-side simulator thì giữ owner thống nhất và test được.

## 4. Hợp đồng đại lượng — AquaSense

Giữ tất cả các metric khác (ORP, salinity, quality) trong telemetry và diagnostics nếu đang tồn tại; ba đại lượng chính:

| Card/chart | Key bắt buộc | Unit hiển thị | Chart | Precision |
|---|---|---|---|---|
| Dissolved oxygen | `do_mg_l` | `mg/L` | line + demo threshold | 2 |
| Water temperature | `water_temperature_c` | `°C` | line | 1 |
| pH | `ph` | **không đơn vị** | line | 2 |

AquaSense config hiện có demo DO threshold: warning `< 4.5 mg/L`, critical `< 3.5 mg/L`. Tránh xung đột với `normalMin`/`warningMin` trong cấu hình. Đây là **demo thresholds** không phải quy chuẩn an toàn đã xác minh.

### AS-1 `normal` — Normal Day Cycle
Duration 120 sim phút. Linear/smooth deterministic interpolation: 
- DO mg/L: `(0,6.3),(20,5.9),(40,5.5),(60,5.2),(80,5.7),(100,6.3),(120,6.7)`.
- Water temperature °C: `(0,28.0),(30,27.3),(60,27.0),(90,29.0),(120,30.0)`.
- pH: `(0,7.9),(30,7.7),(60,7.7),(90,8.0),(120,8.2)`.
- Expected water state normal, charts visibly change as sim time progresses; minor low-noise only, never artificial high-frequency jitter.

### AS-2 `low_oxygen` — Dawn Oxygen Drop
Duration 120 sim phút.
- DO mg/L: `(0,6.4),(20,5.8),(40,4.8),(60,4.1),(80,3.2),(90,3.0),(100,4.1),(110,5.2),(120,6.0)`.
- Temperature and pH vary mildly within healthy demo baseline; do not make them fall to 0.
- State transitions normal -> warning when DO < 4.5 -> critical when DO < 3.5 -> recovering -> normal once recovered. Use hysteresis/debounce so log events are not repeated.
- Description: simulated overnight depletion; recovery is **simulated intervention**, not actual aerator activation.

### AS-3 `sensor_fouling` — Sensor Fouling
Duration 120 sim phút.
- Simulated ground-truth DO about 6.0–6.2 mg/L; raw sensor reading drifts/spikes after ~30 min; pH/temp stable.
- Keep `do_mg_l` consistent with current API semantics. If adding optional `do_raw_mg_l`, `do_filtered_mg_l`, `sensor_quality`, document exactly which is used by cards/alerts. Preserve backward compatibility.
- **Do not confuse sensor-fault warning with dangerous pond oxygen**. Separate `sensorHealth` from `waterStatus` where feasible; if raw DO falls below threshold during fouling, gate water warnings when degraded and explain uncertain sensor reading.
- Never claim a Kalman filter is real if merely synthesizing filtered demonstration values. Label "simulated filtered signal" unless existing implementation actually computes filtering.

## 5. Hợp đồng đại lượng — FactSafe

Source `factsafe/config.ts` (uploaded version) defines `nh3_ppm`, `co_ppm`, `h2s_ppm`, `ch4_percent`, `pm25_ug_m3`, `pm10_ug_m3`, `temperature_c`, `humidity_percent`; plus potential derived `zone_*_risk`, `riskScore`. Keep all existing metric keys used by other views. Three highlighted charts:

| Card/chart | Key | Unit chính xác | Chart | Precision |
|---|---|---|---|---|
| Ammonia (NH₃) | `nh3_ppm` | `ppm` | time-series line | 1 |
| Fine particles (PM2.5) | `pm25_ug_m3` | `µg/m³` | time-series line | 1 |
| Unified zone risk | `riskScore` or **verified actual risk key** | `demo score` (0–100), **không đơn vị vật lý** | line | 0 |

Do not use a nonexistent `unified_risk` metric in the chart unless the simulator actually emits it. Prefer consistent derived risk source used by FactSafe status card and chart. Derive stable zone risk and overall score from emissions/measurements; avoid circular formulas or pretending it is an approved EHS index. Normalization and weights must be clearly marked **DEMO-DEFAULT**, configurable, with documented formula. If using `latest.riskScore` outside metrics, convert properly into chart history without breaking existing packet interfaces. Other metric units: CO/H2S `ppm`; CH4 `%`; PM10 `µg/m³`; temperature `°C`; humidity `%`.

The existing config lists example thresholds for NH3 `warning: 30 ppm`, `critical: 50 ppm`, PM2.5 `warning: 55 µg/m³`, `critical: 100 µg/m³`; treat as **simulation defaults only**. Regulatory health safety depends on exposure duration, assessment methodology and legal context, so do not present as certified workplace exposure limits.

### FS-1 `normal` — Normal Factory
Duration 60 sim phút. Smooth baseline (all simulated):
- NH3 ppm: `(0,6),(15,9),(30,7),(45,10),(60,8)`.
- PM2.5 µg/m³: `(0,18),(15,22),(30,20),(45,25),(60,19)`.
- CO 4–9 ppm; H2S 0.2–1.0 ppm; CH4 0.1–0.5%; PM10 30–45 µg/m³; temp 25–29°C; humidity 45–65% (deterministic profiles or interpolations).
- Risk score remains low and changes modestly, with no warning/critical events.

### FS-2 `gas_leak` — Ammonia Leak · Zone B
Duration 100 sim phút; isolate risk mainly Zone B:
- NH3 ppm: `(0,8),(20,12),(35,26),(50,37),(65,57),(75,68),(85,40),(100,12)`.
- PM2.5 remains ~18–30 µg/m³; unrelated gases near baseline.
- Warning threshold NH3 >=30 ppm; critical >=50 ppm (DEMO only); zone B risk rises, then recovers as simulated leak is mitigated.
- Log only transitions, with zone name and sim timestamp. Description must say simulated gas leak, not confirmed real incident.

### FS-3 `dust_event` — Dust Event · Zone D
Duration 100 sim phút; isolate risk mainly Zone D:
- PM2.5 µg/m³: `(0,20),(20,35),(35,61),(50,92),(65,122),(75,145),(85,75),(100,25)`.
- NH3 near 5–12 ppm; PM10 should correlate positively with PM2.5 (e.g. 1.4–1.8x) unless physical sampling logic says otherwise.
- PM2.5 warning >=55 µg/m³; critical >=100 µg/m³ (DEMO only). Zone D risk rises then recovers.

**Derived Unified Zone Risk:** specify a transparent monotonic demo formula. Suggested general structure: per metric normalized severity `clamp(100 * (v - baseline)/(criticalThreshold - baseline), 0, 100)` with baseline below warning; zone risk = weighted/max aggregation of zone-relevant severity, overall = maximum of zone risks. Clearly justify mapping of location and severity. If current project already has a function, reconcile/keep it instead of introducing a conflicting new model. Ensure no threshold transition depends on an unrelated metric. Metric scores should be 0–100 and show changing values.

## 6. UI and telemetry rules

- Header logo/settings; three status cards; Chart 1 & Chart 2 top row, Chart 3 & Description second row, logs below, scenarios controls footer (respect Figma shared layout).
- Distinct Y axes per metric, showing labels `mg/L`, `°C`, `pH` (axis/title only; pH is unitless), `ppm`, `µg/m³`, and `Risk score (0–100)`.
- Timestamp X-axis uses *elapsed simulation minutes* with sensible interval / one decimal or minute ticks. No duplicate X tick labels due excessive rounding. Historical window should retain enough points to illustrate all scenario phases, with downsampling if necessary.
- At sample cadence defined by simulator, update latest KPI, chart history, Description, Logs. Do not compute a new simulation every React render. Do not assume 1x realtime simulation must show dramatic change in just a few seconds; high-speed options should visibly progress through phases.
- Buttons Start, Pause, Resume, Reset and speed must issue actual commands; error states actionable and distinguish server stopped vs scenario stopped.
- Scenario dropdown must list all three AquaSense or FactSafe options, not only currently selected name.
- Show explicit `SIMULATED` badge/labels. Don't falsely claim calibrated industrial safety risk or AI predictions.
- Show `No telemetry` until first accepted packet for current `(project, session)`. Avoid stale sample after project change.
- Connection indicator must reflect actual WebSocket state; scenario status separate from socket status.

## 7. Required debugging / automated tests

1. Unit tests for each generator at t=0, each important keyframe, duration end; deterministic output for same seed/time; finite numeric values within plausible simulator bounds.
2. For each project, all three scenario IDs registered and accepted by backend; start command returns acknowledgement or status, and telemetry appears within expected simulator tick interval.
3. Validate schema/metric keys, unit definitions, timestamp monotonic, sim elapsed increment and speed; packet integrity.
4. AquaSense: `normal` no warning; `low_oxygen` transitions normal -> warning -> critical -> recovery; `sensor_fouling` sensor warning without false water critical when measurement degraded.
5. FactSafe: `normal` baseline; `gas_leak` NH3 changes and Zone B risk changes; `dust_event` PM2.5/PM10 change and Zone D risk changes; events correct.
6. Pause means no time advancement/data emission except explicit control/status heartbeat; resume continues from same sim position; reset clears current session/history and returns initial state; speed changes don't multiply time twice.
7. Component tests verify units per project, title labels, no numeric 0 when missing, graphs populate from real simulator stream, project switches clear/filter history.
8. Run available frontend TS checks/build, simulator/backend tests, and where possible a browser smoke test visiting `/?project=aquasense` and `/?project=factsafe` and running all six scenarios. Fix any errors introduced.
9. If WebSocket server requires extra manual launch command, document exact command and its location. Provide one concise launch path for both frontend and simulator.

## 8. Ordered implementation plan

1. Preserve current changes; inspect git status + code, no destructive reset. Trace why FactSafe has no telemetry, why AquaSense chart window is narrow; report causes with file paths and line references.
2. Fix scenario registrations/commands/streaming/schema/simulator first. Make both projects emit correct changing data. Prefer existing engine/generator over rewriting it.
3. Ensure per-project stores/selectors/history are correct. Resolve risk-score data shape explicitly.
4. Wire status cards and three charts to same stream. Correct units, axis precision, labels, Description and Logs. Keep reusable Figma layout.
5. Test all six scenarios end-to-end; run build/test/lint if available; visually check chart phase changes at faster speed.
6. Summarize files changed, root causes, test results, outstanding issues. Do not push/merge without user approval.

## 9. Constraints

- Do not modify FireScout scenario, FireScout page, or other projects unless necessary shared fix; if shared fix affects them, test for regression.
- No unapproved dependency upgrades, fake ML claims, arbitrary data generated in frontend components, or replacing live telemetry with static chart placeholders.
- Keep `aquasense`, `factsafe`, `firescout` URLs intact.
- No `git reset --hard`, no force push, no deletion of unrelated user files. Commit only after user approves.

## 10. Ready-to-run instruction to Codex

> Read `CODEX_FIX_AQUASENSE_FACTSAFE_TELEMETRY.md` entirely. Implement it in the current `multifrontend` workspace. Do not stop after planning: inspect, diagnose, change code, create tests, run checks and report. Do not push without my approval. Treat the actual repository architecture as source of truth and distinguish simulation defaults from certified safety thresholds. Keep FireScout unchanged.
