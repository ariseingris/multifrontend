# MULTIFRONTEND — Đặc tả đại lượng, scenarios và nhiệm vụ Codex

**Phiên bản:** 1.0 — 23/10/2026  
**Repository mục tiêu:** https://github.com/ariseingris/multifrontend  
**Phạm vi:** AquaSense, FactSafe, FireScout AI; simulator, telemetry, biểu đồ, logs và tích hợp dashboard React.  
**Trạng thái:** tài liệu **đề xuất triển khai**, KHÔNG xác nhận code đã được sửa hoặc mô phỏng đã được kiểm thử.

> **Chỉ dẫn cho Codex:** Hãy đọc toàn bộ file này như một implementation specification. Trước tiên đọc repository thật; đối chiếu mọi đường dẫn, API và cấu trúc kiểu dữ liệu. Không khẳng định một tính năng/AI đã hoạt động nếu chỉ được mô phỏng. Thực hiện thay đổi nhỏ, tương thích ngược và chạy kiểm thử trước khi đề nghị commit. Không push nếu chưa được chủ repository chấp thuận.

## 0. Xuất xứ dữ liệu, giới hạn và nguyên tắc

### Nguồn đã tham chiếu
- `AquaSense_Ban_De_Xuat_Dau_Tu.docx.pdf` — trang 6–7, 9, 14; năm chỉ tiêu DO, pH, ORP, độ mặn, nhiệt độ; Kalman + LSTM; tính khả thi còn phải pilot.
- `AquaSense_Pitch.pptx` — slide 4: cùng năm chỉ tiêu môi trường.
- `USTH_Inn 2026_FactSafe.docx` — trang 4, 6–8: NH3, CO, H2S, CH4, PM2.5, PM10, nhiệt độ, độ ẩm; chỉ số rủi ro theo vùng; cảnh báo môi trường công nghiệp.
- `USTH_Inn 2026_FireScout AI.docx` — trang 3–6, 8–9: UAV/drone với camera nhiệt + camera thường; phát hiện người/điểm nóng, truyền cảnh báo về dashboard, định vị mục tiêu.
- `firescout-của-khánh.pptx` — slide 3–4: drone bay trong không gian hẹp, AI nhận diện nạn nhân/điểm nóng, dữ liệu thời gian thực cho chỉ huy.
- Các file code người dùng đã gửi: `App.tsx`, `main.tsx`, `vite.config.ts`, `index.html`, hai cặp `config.ts`/`Dashboard.tsx` của AquaSense và FactSafe. Các file này cho thấy React + TS + Vite, `Dashboard`, `LiveChart`, `ThresholdChart`, `Gauge`, Zustand stores, `useDataBridge` và các project được chọn bởi `VITE_PROJECT`.
- **Chưa kiểm tra toàn bộ repository** ở lần tạo tài liệu này (không tải được GitHub trực tiếp); Codex bắt buộc đọc project thực tế trước khi code. Hiện chưa có `FireScout` trong `App.tsx` được gửi; cần kiểm tra repo mới nhất trước khi tạo project.

### Quy tắc bắt buộc
1. Phân biệt **raw sensor**, **derived metric**, **AI/detection output**, **simulation ground truth**, **UI status**.
2. Tất cả số liệu kịch bản bên dưới là **DEMO/SIMULATION ASSUMPTIONS**, không phải giới hạn y sinh/công nghiệp được chứng nhận, không phải kết quả AI đã kiểm chứng; cảnh báo phải gắn nhãn tương ứng.
3. **Không fake telemetry thành đo thực**; nếu chưa nhận packet, dùng `—`/empty state, không mặc định `0`.
4. **Không coi heuristic hoặc normalized score là chỉ số an toàn đã hiệu chuẩn.**
5. Không tính “độ chính xác AI” chỉ từ dữ liệu giả hoặc ground truth tạo cùng công thức đầu ra; độ tin cậy mô hình chỉ đánh giá với ground truth độc lập.
6. Không giả định drone an toàn để bay thực hoặc phát hiện người qua khói trong mọi điều kiện; các demo chỉ là tình huống tổng hợp.
7. Ngưỡng của FactSafe phải được phê duyệt bởi người có chuyên môn EHS theo khí, thời gian phơi nhiễm và tiêu chuẩn hiện hành trước khi dùng trong thực tế.
8. Không log mỗi packet; log **chuyển trạng thái** với anti-spam/debounce/hysteresis.

## 1. Kiến trúc chung và UI mục tiêu

### Frontend Figma đang có
Bố cục: header (Logo, Settings), ba status cards, grid hai cột (Chart 1, Chart 2; Chart 3, Describe), panel Logs ngang toàn chiều rộng, footer Scenarios. Tái sử dụng cho mọi project; không hardcode AquaSense vào component dùng chung.

### Sơ đồ trách nhiệm
- **Scenario engine/backend simulator:** tạo chuỗi dữ liệu theo `scenarioId`, `elapsedSimMinutes`, seed; tiến trình ở backend là nguồn sự thật.
- **WebSocket transport:** nhận lệnh start/pause/resume/reset/speed; gửi telemetry + event (sử dụng schema hiện có hoặc mở rộng tương thích ngược).
- **Store:** lưu latest, history, trạng thái, timeline; giới hạn số mẫu lưu hoặc downsample.
- **Project config:** các metric, units, display precision, demo thresholds, scenarios.
- **UI shared:** `DashboardLayout`, `MetricCard`, `ChartCard`, `InsightPanel`, `ActivityLog`, `ScenarioControls`; dùng props và children/render slots.
- **UI project-specific:** chọn ba metric chủ đạo, chart type, insight và alerts riêng dự án.

### Ràng buộc hợp đồng telemetry đề xuất (chỉ áp dụng sau khi so sánh với schema hiện có)
```ts
interface SimulationPacket {
  project: 'aquasense' | 'factsafe' | 'firescout';
  scenarioId: string;
  timestamp: string;            // ISO-8601; thời gian phát packet
  elapsedSimMinutes: number;    // thời gian mô phỏng, tăng theo speed
  metrics: Record<string, number | null>;
  status?: 'normal' | 'warning' | 'critical' | 'recovering';
  // Optional extension; không được phá schema hiện hữu
  quality?: Record<string, 'valid' | 'degraded' | 'missing' | 'simulated'>;
  source?: 'simulator' | 'sensor';
}
```
Đừng đổi tất cả types sang schema mới nếu pipeline hiện hữu hỗ trợ metric numeric và metadata theo cách khác. Nếu cần cảnh báo sensor-health độc lập, dùng `sensorStatus` riêng, không gán `critical` water status do sensor noise.

### Hành vi UI chung
- Ba status cards hiển thị giá trị mới nhất, unit, trend, cảnh báo và nhãn `SIMULATED`.
- Ba chart **khác biệt về nội dung**, ưu tiên line/time-series; ghi đơn vị trục Y và thời gian mô phỏng trục X; threshold bands nếu có.
- `Describe` tóm tắt scenario, nguyên nhân, cảnh báo hiện tại, khuyến nghị *trong bối cảnh demo*.
- `Logs` ghi start, threshold enter/exit, detected event, recovery, pause/resume/reset/complete theo sim time.
- Khi reset: xóa history/session events của phiên hiện tại hoặc đánh dấu session mới, không nối đường dữ liệu kịch bản cũ.
- Pause: không phát packet mới và không tăng sim time. Speed ảnh hưởng sim time nhất quán; tránh nhân tốc độ hai lần ở frontend và backend.
- Mobile: cards và charts xếp dọc. Header/footer tồn tại; không xóa control đang chạy.

---

## 2. AquaSense — ba đại lượng ưu tiên

### Từ tài liệu và config đã cung cấp
File `projects/aquasense/config.ts` có `do_mg_l`, `ph`, `orp_mv`, `salinity_ppt`, `water_temperature_c`. Ba metric nổi bật cần hiển thị (các metric còn lại vẫn được stream và có thể thấy trong details):

| Card/Chart | Key code | Unit | Chart | Derived values có thể tính |
|---|---|---|---|---|
| 1. Dissolved Oxygen | `do_mg_l` | mg/L | Threshold time series | slope mg/L/h, duration below warning, time-to-threshold nếu slope âm ổn định |
| 2. Water Temperature | `water_temperature_c` | °C | Line chart | moving mean, dT/dt, daily min/max |
| 3. pH | `ph` | — | Line chart | pH swing=max−min, deviation from moving baseline |

**Config được gửi:** DO warning `4.5`, critical `3.5` mg/L; DO normal range `4.5–7.5`; pH and temp have own ranges. **Cần xác minh ý nghĩa `warningMin/criticalMin` vs `thresholds` để tránh rule conflict.** Đây là demo thresholds, không bảo đảm an toàn sinh học toàn diện.

### AS-1 `normal` — Normal Day Cycle (120 sim phút)
- DO keyframes: `(0,6.3),(20,5.9),(40,5.5),(60,5.2),(80,5.7),(100,6.3),(120,6.7)` mg/L.
- Temp: 27.5–30.0°C, pH 7.7–8.2; ORP/salinity giữ trong normal range config.
- Continuous smooth interpolation with fixed seed small noise; `status=normal`.
- Events: started, completed; no warnings, no false alarms.
- Verify three cards and charts update, timestamps ordered, no zero before first packet.

### AS-2 `low_oxygen` — Dawn Oxygen Drop (120 phút)
- DO keyframes: `(0,6.4),(20,5.8),(40,4.8),(60,4.1),(80,3.2),(90,3.0),(100,4.1),(110,5.2),(120,6.0)`.
- Temp and pH change gently, not responsible for main alert.
- States by DO: warning when `<4.5`; critical when `<3.5`; recovery when climbing back; normal above threshold plus hysteresis/cooldown.
- Event: warning entered, critical entered, simulated intervention, recovery, normal restored.
- Do not report real aerator switched on without actual hardware feedback.
- Verify warning/critical use existing stores; threshold on chart and descriptive insight synchronized.

### AS-3 `sensor_fouling` — Sensor Fouling (120 phút)
- Simulated pond true DO about 6.0; raw observed DO noisy and drifts with signal spikes after minute 30.
- Example raw milestones `(0,6.1),(20,6.5),(40,5.3),(60,7.7),(80,3.5),(100,8.1),(120,5.1)`; `filtered` around 6.0–6.2 (illustrative only unless real filter implemented).
- Display raw and filtered as separate series if schema supports; if not, prioritize observed DO and sensor-quality indicator; no bogus “actual AI filter”.
- Sensor-quality warning separate from water-quality hazard; suggest cleaning/calibration.
- Test that raw sensor spikes do not automatically imply confirmed pond oxygen emergency.

---

## 3. FactSafe — ba đại lượng ưu tiên

### Nguồn & lựa chọn
Tài liệu FactSafe đo khí độc/khí cháy, bụi và vi khí hậu. Source `factsafeConfig` có `nh3_ppm`, `co_ppm`, `h2s_ppm`, `ch4_percent`, `pm25_ug_m3`, `pm10_ug_m3`, `temperature_c`, `humidity_percent`; kịch bản hiện có `normal`, `gas_leak`, `dust_event`. MVP ưu tiên theo khả năng minh họa hai sự cố:

| Card/Chart | Key | Unit | Chart | Derived metrics |
|---|---|---|---|---|
| 1. NH3 | `nh3_ppm` | ppm | Time series with demo thresholds | dNH3/dt, peak ppm, threshold exceedance duration, 5-min average |
| 2. PM2.5 | `pm25_ug_m3` | µg/m³ | Time series / optional bar by zone | mean over selected time, cumulative concentration×time (exposure proxy, **not certified dose**) |
| 3. Unified zone risk | Prefer existing `riskScore` or `zone_*_risk` derived | 0–100 demo score | Time series (or gauge + time trend) | peak risk, time above configured score, highest-risk zone |

**Vì sao không dùng CO làm chart chính?** Giữ CO/H2S/CH4 trong telemetry và secondary details. Ba slots trên có thể demo khí, bụi và ảnh hưởng tổng hợp, đúng định hướng hồ sơ. Risk score là **derived**, không phải sensor trực tiếp; không đủ dữ liệu để suy ra an toàn pháp lý. Nếu project hiện chưa có `riskScore` trong packet có thể dùng normalized severity theo thuật toán hiện hữu và ghi rõ DEMO.

**Demo thresholds từ config được gửi:** NH3 warning `30`, critical `50` ppm; PM2.5 warning `55`, critical `100` µg/m³; CO `35/70`, H2S `5/10`, CH4 `5/8` (đây là sample app values, không xác nhận ngưỡng quy định). Không gắn nhãn “QCVN compliant”.

### FS-1 `normal` — Normal Factory (60 phút)
- NH3 base `7–12 ppm`, PM2.5 `12–24 µg/m³`, risk score ~`10–25` demo units.
- CO/H2S/CH4 bình ổn dưới ngưỡng config; zone A–D có risk thấp; noise nhỏ, seed cố định.
- No warnings. Logs: scenario started, normal telemetry, completed.

### FS-2 `gas_leak` — NH3 Leak, Zone B (100 phút)
- NH3 B keyframes `(0,10),(20,18),(40,32),(60,55),(75,65),(85,38),(100,14)` ppm.
- B rise first; zone A/C/D lower. PM2.5 gần baseline.
- Warning when crossing `30`, critical above `50` **per demo config**, recovery after simulated isolation/ventilation.
- Zone B risk climbs and becomes highest; use centralized risk calculation, not frontend-side duplicate magic numbers.
- Event logs: suspected leak, warning, critical, simulated containment, recovered.
- Real-world caveat: gas leak is dangerous; these simulations do not substitute a certified system or emergency procedures.

### FS-3 `dust_event` — Particulate Event, Zone D (100 phút)
- PM2.5 D keyframes `(0,18),(20,35),(40,68),(60,115),(75,130),(90,65),(100,25)` µg/m³.
- NH3 remains baseline; PM10 rises with PM2.5 (e.g. ~1.5×, bounded by config); zone D worst.
- Severity warning `>55`, critical `>100` per demo config; risk score tracks zone D event.
- Logs: dust threshold crossed, high-risk zone D, simulated dust collection/ventilation, recovery.
- Validate no gas-leak event fired just because aggregated risk increases.

### FactSafe technical check
Current uploaded `FactSafeDashboard.tsx` has `LiveChart` for `nh3_severity`, `co_severity`, `h2s_severity`, `ch4_severity` and dust bars; confirm backend actually emits these derived keys. If not, compute consistently in simulator or adapt to raw keys. Reuse `riskScore` and zone risk where available; avoid fixed `Sensor health 100%` if unverified. Existing scenario identifiers must remain stable.

---

## 4. FireScout AI — ba đại lượng ưu tiên

### Rationale and capability boundaries
FireScout is a **vision + UAV rescue reconnaissance system**, not stationary air quality IoT. Its provided docs specify thermal + visible cameras, detection of persons and hotspots, and real-time command dashboard. They do **not** define a validated telemetry schema or detection confidence thresholds. Therefore the three metrics and all numbers below are **proposed demo specifications** for coding and need simulator validation.

| Card/Chart | Suggested key (NEW, confirm repo) | Unit | Chart | Derived values |
|---|---|---|---|---|
| 1. Target detection confidence | `detection_confidence` | % | Time-series line | mean/peak confidence, stable detections, detection latency |
| 2. Thermal hotspot temperature estimate | `hotspot_temp_c` | °C | Time-series line with demo band | ΔT relative to background, temperature rise rate, hotspot persistence |
| 3. UAV link quality | `link_quality_percent` | % | Time-series line | packet loss %, disconnection time, link warning duration (requires packet counters where available) |

**Cần thiết để demo đầy đủ nhưng không nhồi vào 3 chart:** `detected_person_count` (integer; cumulative unique tracks if tracker exists, otherwise instantaneous frame count), `flight_elapsed_s`, `battery_percent`, `telemetry_age_ms`, `gps_quality`, `target_track_id` (optional), `video_available`, `flight_mode`, bounding boxes and visible/thermal overlays if video simulation is separately supported. Không bắt buộc dựng video stream khi chưa có dữ liệu/video source.

**Confidence** là output mô hình, không phải xác suất nạn nhân chắc chắn hiện diện nếu chưa hiệu chuẩn. **Thermal temperature** là giá trị mô phỏng từ camera/sensor, không được suy ra “nhiệt độ của người” hay khả năng phát hiện xuyên khói chắc chắn. **Link quality** là telemetry diagnostic của drone, không phải thông số môi trường cháy. Những đại lượng này tạo ba hướng kiểm thử thực tế: AI, nguy cơ nhiệt, thông tin liên lạc.

### Proposed demo classification (không phải tiêu chuẩn PCCC)
- Detection confidence `>=80%` for ≥3 consecutive frames: `candidate_detection` (không tự coi là confirmed victim). `50–80%` tentative; `<50%` uncertain. Threshold configurable.
- Hotspot estimated temperature: relative to background ΔT (ví dụ > 30°C) and persistence required; **không dùng ngưỡng nhiệt tuyệt đối để kết luận cháy/nạn nhân**.
- Link quality `<40%` for ≥5 simulated seconds: degraded link; `<15%` for ≥5 seconds: lost/critical link. Reset status only after hysteresis.
- Phân biệt `missionStatus` (`searching`, `candidate_found`, `link_degraded`, `aborted`, `completed`) với status sensor-level.

### FSCT-1 `routine_recon` — Routine Reconnaissance (120 sim giây)
- No confirmed targets. Detection confidence fluctuates `5–35%` from background noise.
- Thermal hotspot estimate `28–40°C`, little ΔT vs background; link quality `90–99%`.
- Logs: mission started, telemetry healthy, scan completed; no fabricated victim detection.
- Verify stream, three charts, timeline, empty target list.

### FSCT-2 `victim_hotspot` — Possible Victim and Hotspot (120 giây)
- Phase 0–30s: routine search; confidence `10–30%`, hotspot `35–45°C`, link `90–98%`.
- Phase 30–55s: thermal hotspot emerges (`45→85°C` sample), confidence rises (`35→76%`).
- Phase 55–90s: candidate human detection confidence rises to `82–94%` for stable frames; show `candidate_detected` / `needs_operator_confirmation` and separate hotspot event. Do not label confirmed rescued person.
- Phase 90–120s: target remains tracked or moves out of FOV; chart and logs record tracking status and last-seen timestamp.
- Chart 1 confidence; chart 2 hotspot; chart 3 stable link. Insight: operator should inspect thermal/visible imagery; simulated candidate marker only.

### FSCT-3 `smoke_link_loss` — Smoke/Obstruction + Link Degradation (120 giây)
- Flight sees dense simulated smoke/visual occlusion; model confidence drops `75→25%` during 35–70s; occasional false positives are *candidates*, not real people.
- Link quality keyframes `(0,97),(25,93),(45,55),(60,28),(75,10),(90,30),(105,75),(120,94)` %.
- Hotspot estimate can remain moderate 40–65°C with uncertainty flagged; **do not hallucinate thermal value when frames unavailable**. Use null/quality missing if packets cease.
- Events: link degraded, connection lost, telemetry stale, reconnecting, recovered; distinguish real lack of data from low numeric reading.
- When link drops, UI retains last timestamp and displays STALE / NO SIGNAL. No continuous fake packets across a genuine simulated blackout unless a separate simulator-state channel expressly marks them as synthetic.

### FireScout integration rules
- Search repository for an existing FireScout/Firescout project and simulator; if absent, add new `projects/firescout/` using existing project contract. Update `App.tsx` project selector only if the new dashboard and engine can be wired correctly.
- FireScout scenario IDs: `routine_recon`, `victim_hotspot`, `smoke_link_loss`; do not conflate them with FactSafe IDs.
- Use `elapsedSimSeconds` or consistent duration conversion; project configs elsewhere use `duration` without documented unit. Inspect actual engine first to avoid 120 seconds being interpreted as 120 minutes.
- Default shared metric config type might not encode boolean/string/video detections. Keep numeric primary fields in `metrics`, structured detection annotations via backward-compatible optional event payload / separate store.
- If no real vision AI model exists: **generate synthetic detections in simulator**, label `SIMULATED CANDIDATE`, do not claim computer-vision inferencing.

---

## 5. Đặc tả điều khiển và kiểm thử chung

### Scenario control behavior
| Control | Expected backend/store behavior | Expected UI behavior |
|---|---|---|
| Start | reset per-session state, seed, set t=0, emit first sample | clear old chart series, log start |
| Pause | freeze advancement; no new data except explicit control ack | paused badge, charts do not advance |
| Resume | continue same session and seed | data resumes, no reset |
| Speed | apply multiplier once in canonical engine | show effective speed |
| Reset | t=0, clear event state and false alarm debounce | chart cleared, neutral awaiting new data |
| Complete | stop emitter at duration | completion event once |
| Disconnect | expose connectivity/staleness separately | last-known value labeled stale |

### Minimum tests per scenario
1. Stable scenario ID matches config and simulator registry; can select/start from frontend.
2. Keyframes/interpolation deterministic with fixed seed; no impossible NaN/Infinity.
3. Data carries correct metrics, units, timestamps, time sequence; correct project id.
4. Status transition tests include hysteresis and deduplicated logs.
5. Pause/resume/reset/speed behavior; no duplicated timers/subscriptions.
6. Charts update at simulated speed, with correct units and no cross-project residue.
7. FireScout loss test: missing data is not converted to zero and no false “live” reading displayed.
8. Existing AquaSense and FactSafe routes are not broken; check one additional legacy project.
9. `npm run build`, typecheck/lint/tests if scripts exist; simulator tests; document skipped tests.
10. Verify mobile and desktop screenshot match to the extent available.

### Recommended implementation order
**Phase A — Recon:** inspect repository, `package.json`, simulator engine, transport schema, `ProjectConfig`, `App.tsx`, dashboard components, real files vs this spec. Summarize discrepancies. Do not overwrite user changes.

**Phase B — Scenario engine:** implement the existing AquaSense scenarios; implement FactSafe scenarios; add FireScout simulator+project **only if architecture permits**. Put timeseries generation in engine, not React. Ensure deterministic fixtures and test all transitions.

**Phase C — Integration:** wire telemetry and derived metrics; project config and scenario selection; status, charts, logs, insight text; use existing `ThresholdChart`, `LiveChart`, `Gauge` if compatible. Make one reusable `ChartCard`/layout; keep project-specific props outside shared UI.

**Phase D — Figma UI:** adopt screenshot-backed shared layout (header/status 3 cards/2×2 content grid/log/footer) from existing code and optional `figma-react-patch.zip`. ZIP is an **unverified starter**, audit before application. Preserve chart data and interactions; correct light theme visual details.

**Phase E — QA & Git:** test each of nine scenarios, check all other projects, inspect diff, output commands/results. Work on feature branch `feat/multi-project-scenarios` without deleting unrelated work. **Do not push/merge without user approval.**

### Acceptance criteria
- **AquaSense:** 3 measurable values, 3 scenarios, correct DO/sensor-fouling distinction.
- **FactSafe:** 3 chart values incl. derived zone risk, 3 scenarios, distinction gas vs dust.
- **FireScout:** 3 appropriate values, 3 scenarios, simulated detection vs actual inference clearly labeled, link outage data honest.
- **Shared:** Figma-inspired dashboard, reusable cards and chart slots, telemetry valid, no regressions in project switching.
- **Validation:** successful build, scenario-specific tests, clear limitations report.

---

## 6. LỆNH CHO CODEX — COPY & PASTE

```text
You are the implementation engineer for this repository:
https://github.com/ariseingris/multifrontend

Read MULTIFRONTEND_SCENARIOS_CODEX_SPEC.md completely and implement it.
The markdown spec is a proposed implementation plan, NOT proof of existing behavior.
First inspect the actual repository structure and check git status; reconcile the spec
with existing contracts and keep all other projects working. Do not require me to
manually move files, rename folders or integrate ZIPs.

Implement three deterministic scenarios each for AquaSense, FactSafe, and FireScout AI.
Prioritize simulator/telemetry and tests before Figma UI changes. FireScout may not
exist yet in the repo, so verify before creating anything. Use a reusable React
layout with 3 status cards, 3 charts, insights, logs, and scenario controls. Maintain
functional existing charts and WebSocket/store integration. Add the minimal new
telemetry keys required; avoid breaking changes. Mark synthetic values and detection
outputs SIMULATED, and do not claim real AI inference, certified safety thresholds,
or confirmed victim detection. Avoid uncontrolled auto-play or bogus readings.

Run all available tests, typecheck, and build. Validate at least one other existing
project. Report changed files, implementation choices, any assumptions, successful
and failed checks, how to preview each scenario, and Git status.
Do not push, force-push, reset work, or merge without my explicit approval.
Proceed through implementation autonomously, asking only if an external credential
or genuinely destructive change is unavoidable.
```

## 7. Những điểm chưa xác minh và bất nhất cần giải quyết

- Tài liệu AquaSense pitch và bản đề xuất đầu tư nêu **giá thiết bị / BOM khác nhau**; các con số kinh doanh không liên quan trực tiếp telemetry, không dùng làm dữ liệu chart. Đặc tả scenario ưu tiên code config hiện có.
- FireScout pitch sơ bộ và đề án chính thức trình bày **hai mức chi phí nguyên mẫu khác nhau**; không suy luận thông số drone/detection từ chi phí.
- Các tài liệu FireScout không xác nhận cấu trúc packet, tần suất frame, cảm biến link quality hay ngưỡng confidence. Đề xuất có thể phải đổi theo simulator hiện có; *không* coi giả định là thiết bị thực tế.
- FactSafe demo thresholds không phải mức phơi nhiễm pháp lý được xác thực; không dùng demo để ra quyết định an toàn lao động.
- FactSafe `sensor health=100%` trong frontend hiện có là hardcoded; cần sửa thành measured/derived hoặc N/A.
- `AquaSenseDashboard.tsx` đã dùng `useEffect` cập nhật elapsed scenario phía frontend; cần kiểm tra backend cũng cập nhật hay không để không đếm thời gian gấp đôi.
- Chưa biết `Dashboard` shared shell có render footer/scenario/logs như thế nào; không thay thế mù.
- Cần kiểm tra logger/event types trước khi thêm event names mới.

**End of implementation specification.**
