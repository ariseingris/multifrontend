# DEMO FRONTEND MASTER PLAN
## USTH Innovation 2026 — Shared Demo Platform, Simulator, UI, Animation, QA & Bugbook

> **Mục đích:** Đây là tài liệu giao việc/đặc tả kỹ thuật để một coding agent khác có thể đọc và triển khai toàn bộ hệ thống frontend demo cho các đề tài mà không cần tự suy đoán kiến trúc.
>
> **Ưu tiên tuyệt đối:** demo ổn định, trực quan, quay video/pitch đẹp, mô phỏng dữ liệu có logic, scenario có thể điều khiển, animation vừa đủ, không làm quá mức production backend.

---

# 0. SOURCE OF TRUTH VÀ PHẠM VI

Các đề tài được dùng làm cơ sở gồm:

1. VitalChain
2. PulseGuard
3. FactSafe
4. AquaSense
5. Hirdop Power
6. DataCool
7. STEMLab AI
8. FireScout AI
9. PAM

Các tài liệu dự án mô tả những hướng khác nhau: VitalChain là giám sát chuỗi lạnh dược phẩm realtime; PulseGuard là cảnh báo lũ quét/sạt lở; FactSafe là giám sát khí độc/bụi/vi khí hậu nhà máy; AquaSense là giám sát ao nuôi tôm; Hirdop là năng lượng + cảnh báo lũ; DataCool là thermal intelligence cho data center; STEMLab là virtual lab + AI Tutor + Research Co-Pilot; FireScout là UAV AI trinh sát cháy; PAM là thiết bị cảnh báo khí/bụi tối giản.

Nguồn dự án xác nhận:
- VitalChain tập trung realtime temperature monitoring, cảnh báo tức thời và dữ liệu điện tử phục vụ GSP/GDP. 
- PulseGuard dùng mưa + độ ẩm đất + độ nghiêng và điểm khác biệt là vẫn cảnh báo tại chỗ khi mất sóng.
- FactSafe dùng NH3, CO, H2S, CH4, PM2.5/PM10 và vi khí hậu, có risk score và báo cáo QCVN.
- AquaSense dùng DO, pH, ORP, độ mặn, nhiệt độ và ý tưởng “nhịp sinh học” ngày/đêm.
- Hirdop kết hợp điện sạch 24/7 và AI cảnh báo lũ cục bộ.
- DataCool tập trung heatmap rack, PUE, tiết kiệm năng lượng và carbon report.
- STEMLab không phải sensor dashboard; cần virtual experiment + AI Tutor + Research Co-Pilot.
- FireScout cần drone-view + AI bounding boxes cho người/điểm nóng + command alert.
- PAM ưu tiên LED 3 màu + còi, dashboard chỉ là mô phỏng phụ.

**Nguyên tắc nguồn dữ liệu:**
- Những con số/threshold được ghi rõ là “SOURCE” chỉ được lấy khi tài liệu dự án thực sự cung cấp.
- Những giá trị simulator không có trong tài liệu phải ghi là “DEMO DEFAULT”, không được trình bày trong pitch như thông số đã được kiểm chứng.
- Không tự biến giá trị mô phỏng thành claim khoa học/medical/safety thật.

---

# 1. MỤC TIÊU HỆ THỐNG

## 1.1. Demo phải kể được một câu chuyện

Mỗi demo phải có flow:

`NORMAL → EARLY SIGNAL → WARNING → CRITICAL → ALERT → ACTION → RECOVERY → NORMAL`

Không chỉ hiển thị chart đẹp.

Ví dụ VitalChain:

`Temperature stable`
→ `temperature slowly rises`
→ `warning`
→ `critical`
→ `Zalo/SMS alert mock`
→ `operator acknowledges`
→ `temperature recovers`
→ `incident closed`

PulseGuard:

`normal weather`
→ `rain increases`
→ `soil moisture increases`
→ `tilt starts moving`
→ `2/3 indicators cross risk`
→ `local siren ON`
→ `network OFF`
→ `local protection continues`
→ `network restored`

DataCool:

`normal rack map`
→ `hotspot forms`
→ `AI predicts thermal risk`
→ `recommend cooling adjustment`
→ `human Approves`
→ `temperature decreases`
→ `estimated energy saving increases`

---

# 2. KIẾN TRÚC TỔNG THỂ

## 2.1. Không tạo 9 codebase độc lập

Dùng:

- một shared frontend engine
- một shared simulator protocol
- một shared scenario engine
- một shared event system
- một shared chart system
- một shared visual system
- config riêng cho từng project

Chỉ STEMLab / FireScout / PAM có UI architecture khác, nhưng vẫn dùng chung primitives:

- Header
- StatusBadge
- ScenarioControl
- EventTimeline
- AlertPanel
- KPI cards
- Toast
- Modal
- Demo clock
- simulator connection
- recording mode

## 2.2. Port cố định

| Project | Port |
|---|---:|
| Demo Controller | 3000 |
| VitalChain | 3001 |
| PulseGuard | 3002 |
| FactSafe | 3003 |
| AquaSense | 3004 |
| Hirdop Power | 3005 |
| DataCool | 3006 |
| STEMLab AI | 3007 |
| FireScout AI | 3008 |
| PAM | 3009 |

Mỗi project mở độc lập trên localhost để quay OBS.

## 2.3. Đề xuất cấu trúc

```text
demo-platform/
├── frontend/
│   ├── core/
│   │   ├── charts/
│   │   │   ├── LineChart
│   │   │   ├── MultiLineChart
│   │   │   ├── AreaBandChart
│   │   │   ├── BarChart
│   │   │   ├── Gauge
│   │   │   ├── Heatmap
│   │   │   └── Timeline
│   │   ├── components/
│   │   │   ├── Header
│   │   │   ├── KPI
│   │   │   ├── Status
│   │   │   ├── Alert
│   │   │   ├── Scenario
│   │   │   ├── EventTimeline
│   │   │   └── Modal
│   │   ├── simulation/
│   │   ├── animation/
│   │   ├── theme/
│   │   └── recording/
│   ├── projects/
│   │   ├── vitalchain/
│   │   ├── pulseguard/
│   │   ├── factsafe/
│   │   ├── aquasense/
│   │   ├── hirdop/
│   │   └── datacool/
│   └── special/
│       ├── stemlab/
│       ├── firescout/
│       └── pam/
├── simulator/
│   ├── core/
│   │   ├── clock.py
│   │   ├── scenario.py
│   │   ├── noise.py
│   │   ├── smoothing.py
│   │   ├── events.py
│   │   └── protocol.py
│   ├── projects/
│   │   ├── vitalchain.py
│   │   ├── pulseguard.py
│   │   ├── factsafe.py
│   │   ├── aquasense.py
│   │   ├── hirdop.py
│   │   ├── datacool.py
│   │   ├── stemlab.py
│   │   ├── firescout.py
│   │   └── pam.py
│   └── vitalchain_simulator.py
├── controller/
│   └── demo_controller.py
├── scripts/
│   ├── demo.sh
│   ├── start-all.sh
│   └── stop-all.sh
├── demos/
│   ├── vitalchain.yaml
│   ├── pulseguard.yaml
│   ├── factsafe.yaml
│   ├── aquasense.yaml
│   ├── hirdop.yaml
│   ├── datacool.yaml
│   ├── stemlab.yaml
│   ├── firescout.yaml
│   └── pam.yaml
├── docs/
│   ├── DEMO_FRONTEND_MASTER_PLAN.md
│   └── BUGBOOK.md
└── README.md
```

---

# 3. NGUYÊN TẮC UI CHUNG

## 3.1. Video-first

Dashboard không được thiết kế như SaaS production bình thường.

Target:

- 16:9
- ưu tiên 1920x1080
- không scroll trong màn hình chính
- thông tin chính nằm trong viewport đầu tiên
- chữ đủ lớn khi quay OBS
- KPI dễ đọc
- chart có chuyển động
- scenario control chỉ xuất hiện trong debug/demo mode

## 3.2. Layout chuẩn

```text
┌──────────────────────────────────────────────────────────────┐
│ LOGO / PROJECT          LIVE ●     DEVICE     NETWORK        │
├──────────────────────────────────────────────────────────────┤
│ KPI 1          KPI 2          KPI 3          KPI 4            │
├───────────────────────────────────┬──────────────────────────┤
│                                   │                          │
│         HERO VISUALIZATION        │     ALERT / STATUS       │
│         55–65% width              │     25–35% width         │
│                                   │                          │
├───────────────────────────────────┴──────────────────────────┤
│ EVENT TIMELINE / RECENT EVENTS                                │
├──────────────────────────────────────────────────────────────┤
│ SCENARIO CONTROLS (ẩn trong record mode)                      │
└──────────────────────────────────────────────────────────────┘
```

## 3.3. Không lạm dụng animation

Animation chỉ phục vụ:

1. thay đổi trạng thái
2. hướng mắt người xem
3. chứng minh realtime
4. làm scenario có cảm giác “đang xảy ra”

Không dùng:

- bounce vô nghĩa
- transition quá dài
- mọi component cùng chuyển động
- particle background nặng
- 3D nếu không tạo giá trị

### Quy tắc duration

- hover: 120–180 ms
- tab: 180–250 ms
- KPI value: 300–500 ms
- alert entrance: 250–400 ms
- critical pulse: 1.0–1.5 s/cycle
- chart update: 250–700 ms
- scenario transition: 500–1000 ms
- recovery: 1–3 s
- không animation quan trọng nào > 4 s

## 3.4. Accessibility / màu

Không dùng màu làm tín hiệu duy nhất.

Mỗi state cần:

- màu
- icon
- text
- optional sound indicator

State:

- normal
- info
- warning
- critical
- offline
- recovered

---

# 4. DESIGN TOKENS

Dùng CSS variables thay vì hard-code màu khắp project.

```css
:root {
  --bg: #07111f;
  --surface: #0d1a2b;
  --surface-2: #122238;
  --border: #24364d;
  --text: #eef5ff;
  --muted: #8ea2ba;

  --normal: #35d07f;
  --info: #4da3ff;
  --warning: #f5b942;
  --critical: #ff5d6c;
  --offline: #8d9aad;
  --recovered: #63d9a1;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
}
```

## 4.1. Project theme

Không đổi toàn bộ architecture chỉ vì màu.

### VitalChain
- chủ đạo: medical / trust / cold
- nền: navy lạnh
- accent: cyan/blue
- warning: amber
- critical: red
- recovered: green

### PulseGuard
- chủ đạo: environment / mountain / emergency
- nền: deep blue/green
- rain: blue
- soil: earth/amber
- tilt: purple/orange
- critical: red

### FactSafe
- chủ đạo: industrial safety
- nền: dark industrial
- gas channels: distinct but muted
- risk: green → yellow → red
- zone map phải đọc nhanh

### AquaSense
- chủ đạo: aquatic
- nền: deep navy/teal
- DO: cyan
- pH: purple
- ORP: green
- salinity: amber
- temperature: orange
- biological band: translucent

### Hirdop
- chủ đạo: clean energy
- điện: cyan/green
- water: blue
- flood: orange/red
- diesel comparison: neutral gray

### DataCool
- chủ đạo: data center / thermal
- dark graphite
- temperature heatmap: cool → warm → critical
- savings: green
- AI recommendation: violet/blue
- approval: green
- reject: red

### STEMLab
- chủ đạo: educational / scientific
- nền sáng hoặc dark scientific
- progress: blue
- success: green
- mistake: orange/red
- AI Tutor: accent purple/blue

### FireScout
- chủ đạo: emergency command center
- dark command UI
- detection boxes: yellow/orange/red
- drone telemetry: cyan
- command alert: red
- smoke: gray transparent

### PAM
- chủ đạo: consumer safety
- very simple
- green/yellow/red
- giant LED indicator
- siren state
- minimal text

---

# 5. SHARED DATA CONTRACT

## 5.1. Telemetry

```json
{
  "type": "telemetry",
  "project": "vitalchain",
  "scenario": "compressor_failure",
  "timestamp": "2026-08-01T10:00:00Z",
  "deviceId": "VC-001",
  "metrics": {
    "temperature": 7.2
  },
  "status": "warning",
  "network": "online"
}
```

## 5.2. Event

```json
{
  "type": "event",
  "project": "vitalchain",
  "scenario": "compressor_failure",
  "timestamp": "2026-08-01T10:00:03Z",
  "event": "threshold_exceeded",
  "severity": "critical",
  "metric": "temperature",
  "value": 8.4,
  "message": "Temperature exceeded critical threshold"
}
```

## 5.3. Alert

```json
{
  "type": "alert",
  "severity": "critical",
  "title": "Critical temperature",
  "message": "Storage temperature is outside the safe range.",
  "channels": ["dashboard", "sms_mock", "zalo_mock"],
  "acknowledged": false
}
```

## 5.4. Action

```json
{
  "type": "action",
  "action": "acknowledge_alert",
  "actor": "operator",
  "timestamp": "..."
}
```

---

# 6. SIMULATOR CORE

## 6.1. Mục tiêu

Simulator không được random vô nghĩa.

Sai:

```python
value = random.uniform(min, max)
```

Đúng:

```text
baseline
+ smooth_noise
+ scenario_drift
+ event_transition
+ bounded_random_noise
```

## 6.2. Đặc tính

Mỗi metric có:

- baseline
- min
- max
- warning threshold
- critical threshold nếu có
- trend
- noise
- response speed
- recovery speed
- unit
- decimal precision

## 6.3. Sample model

```python
value(t) =
    baseline
    + daily_component(t)
    + scenario_component(t)
    + smooth_noise(t)
```

Scenario component nên là:

- ramp
- sigmoid
- gaussian pulse
- step
- decay

Không dùng random jump liên tục.

## 6.4. Seed

Mọi scenario phải deterministic khi có seed.

```bash
python vitalchain_simulator.py --project vitalchain --scenario compressor_failure --seed 42
```

Cùng seed + cùng scenario = cùng sequence.

Điều này rất quan trọng khi quay lại video.

## 6.5. Demo speed

Hỗ trợ:

```text
0.25x
0.5x
1x
2x
4x
8x
```

Khuyến nghị quay video:

- 2x cho bình thường
- 4x cho buildup dài
- 1x khi alert xảy ra

Không làm simulator chạy nhanh bằng cách tạo dữ liệu phi vật lý; chỉ thay đổi demo clock.

---

# 7. SCENARIO ENGINE

Mỗi scenario có:

```yaml
id: compressor_failure
duration_sec: 90
phases:
  - normal
  - drift
  - warning
  - critical
  - alert
  - recovery
  - recovered
```

Mỗi phase có:

- duration
- metric target
- event trigger
- animation
- alert
- recovery behavior

## 7.1. Scenario chuẩn

Mỗi project tối thiểu:

- normal
- warning
- critical
- recovery
- offline/disconnect nếu phù hợp

---

# 8. PROJECT SPEC — VITALCHAIN

## 8.1. Bản chất

VitalChain là nền tảng IoT giám sát chuỗi lạnh dược phẩm realtime. Tài liệu mô tả sensor truyền dữ liệu nhiệt độ lên cloud, cảnh báo khi sai lệch kéo dài và hỗ trợ GSP/GDP.

## 8.2. UI

### Header
- VitalChain
- Live
- Device VC-001
- Location: demo cold room
- Network
- Last update

### KPI
1. Current temperature
2. Safe status
3. Alert response timer
4. Device connectivity

### Hero chart
Line chart:
- temperature
- safe band
- warning line
- critical line
- current point

### Right panel
- current status
- sensor
- location
- alert
- response countdown

### Timeline
- normal
- temperature rising
- warning
- critical
- alert sent
- operator acknowledged
- recovered

## 8.3. Scenario

### Normal
Temperature dao động nhỏ quanh baseline.

### Door open
- temperature tăng từ từ
- network vẫn online
- warning sau một khoảng
- critical nếu tiếp tục

### Compressor failure
- temperature tăng đều
- slope rõ hơn door-open
- critical
- alert

### Freeze fault
- temperature giảm quá thấp
- status chuyển warning/critical

## 8.4. Demo parameters

Nếu source không quy định ngưỡng cụ thể, dùng **DEMO DEFAULT**, không claim là chuẩn GSP/GDP:

```yaml
temperature:
  unit: "°C"
  baseline: 5.0
  noise: 0.08
  warning: 7.0
  critical: 8.0
  low_warning: 2.0
  low_critical: 1.0
```

Đây là giá trị để UI hoạt động, không phải chứng nhận dược phẩm.

## 8.5. Animation

- chart line realtime
- current value count-up nhẹ
- critical card pulse
- alert toast slide-in
- timeline event append
- notification badge pulse
- recovery smooth

Không làm toàn màn hình đỏ.

## 8.6. Mock Zalo/SMS

Không gọi API thật.

Hiển thị:

```text
ALERT SENT
Zalo ZNS ✓
SMS ✓
Dashboard ✓
```

Có timestamp và response latency.

## 8.7. QA

Check:

- threshold không đảo
- chart không nhảy đột ngột
- alert chỉ fire một lần cho một incident
- acknowledgement không tạo alert mới
- recovery đóng incident
- reset xóa state
- offline không làm mất local chart
- recording mode 16:9 không scroll

---

# 9. PROJECT SPEC — PULSEGUARD

## 9.1. Bản chất

PulseGuard dùng:
- mưa
- độ ẩm đất
- độ nghiêng

Một điểm nổi bật của source là logic cảnh báo dựa trên nhiều chỉ số và khả năng cảnh báo tại chỗ khi mất sóng.

## 9.2. UI

### KPI
- Rain
- Soil moisture
- Tilt
- Risk score
- Network

### Hero
Multi-line normalized chart.

Không được để 3 metric có unit khác nhau trên cùng trục mà không normalize.

Có 2 lựa chọn:

1. normalized index 0–100
2. 3 mini charts

Khuyến nghị normalized hero + raw values trong KPI.

### Risk gauge
0–100.

### Local alarm panel

```text
LOCAL SAFETY
Siren: ON/OFF
Network: ONLINE/OFFLINE
Local controller: ACTIVE
```

## 9.3. Scenario

### Normal
Tất cả ổn định.

### Heavy rain
- rain tăng trước
- soil moisture tăng trễ
- tilt dao động nhẹ

### Landslide risk
- rain cao
- soil moisture cao
- tilt tăng
- ít nhất 2 chỉ số vượt risk condition
- risk score tăng
- siren ON

### Communication loss
- network OFF
- dashboard ghi nhận offline
- local controller vẫn hoạt động
- local siren vẫn ON khi threshold đạt

## 9.4. Demo parameters

DEMO DEFAULT:

```yaml
rain:
  unit: "mm/h"
  baseline: 2
  warning: 30
  critical: 60

soil_moisture:
  unit: "%"
  baseline: 45
  warning: 70
  critical: 85

tilt:
  unit: "°"
  baseline: 0.2
  warning: 2.0
  critical: 4.0

risk:
  warning: 55
  critical: 75
```

Không gọi đây là threshold địa kỹ thuật thực tế.

## 9.5. Logic

```text
risk_count =
  rain >= warning
  + soil >= warning
  + tilt >= warning

if risk_count >= 2:
    warning/critical based on severity
```

## 9.6. Animation

- rain drops chỉ ở mini visual, không particle nặng
- gauge needle
- warning glow
- siren icon pulse
- network disconnect transition
- local alarm remains active

Đây là một trong những animation quan trọng nhất của PulseGuard vì nó chứng minh USP.

---

# 10. PROJECT SPEC — FACTSAFE

## 10.1. Bản chất

FactSafe theo source giám sát:
- NH3
- CO
- H2S
- CH4
- PM2.5
- PM10
- temperature
- humidity

Có:
- multi-gas dashboard
- zone risk
- unified risk score
- SMS/Zalo
- QCVN report

## 10.2. UI

### Header
Factory Safety Command Center.

### KPI
- Overall Risk
- Active Alerts
- Highest-risk Zone
- Sensor Health

### Hero
Multi-line gas chart.

### Secondary
Dust bar chart:
- PM2.5
- PM10

### Factory map
2D grid:

```text
ZONE A   ZONE B   ZONE C
  ●        ●        ●

ZONE D   ZONE E   ZONE F
  ●        ●        ●
```

Node color/state = risk.

### Risk score
0–100.

## 10.3. Scenario

### Normal
all gas stable.

### Gas leak
- one gas rises first
- risk score starts rising
- nearby zone becomes warning
- then critical
- alert

### Dust increase
- PM2.5/PM10 increase
- gas remains stable
- risk changes

### Multi-hazard
- gas + dust + microclimate
- overall risk becomes critical

## 10.4. DEMO DEFAULT values

Do NOT present as regulatory thresholds unless verified.

```yaml
NH3: demo_warning=20, demo_critical=40
CO: demo_warning=35, demo_critical=80
H2S: demo_warning=5, demo_critical=10
CH4: demo_warning=10, demo_critical=20
PM2.5: demo_warning=35, demo_critical=75
PM10: demo_warning=80, demo_critical=150
```

The source discusses QCVN mapping, but UI demo values must be explicitly configurable.

## 10.5. AI risk score

Do not fake a sophisticated ML model.

Use a transparent demo formula:

```text
normalized hazard scores
→ weighted aggregation
→ temporal trend bonus
→ risk score
```

Display:

```text
AI RISK SCORE
78 / 100

Drivers:
H2S ↑
PM2.5 ↑
Humidity ↑
```

If actual ML does not exist, label:

`DEMO AI / SIMULATED INFERENCE`

## 10.6. Report

Button:

`Generate QCVN Report`

Fake generation progress:

0 → 30 → 65 → 100%

Then modal:

- reporting period
- zones
- incidents
- sensor coverage
- export mock

No fake file if not implemented.

---

# 11. PROJECT SPEC — AQUASENSE

## 11.1. Metrics

Source xác nhận:
- DO
- pH
- ORP
- salinity
- temperature

## 11.2. UI

### KPI
5 metric cards.

### Hero
Multi-line chart nhưng phải có toggles:

```text
☑ DO
☑ pH
☑ ORP
☑ Salinity
☑ Temperature
```

Không hiển thị 5 đường cùng màu.

### Biological rhythm tab

Đây là USP nên chiếm diện tích lớn.

```text
NORMAL BIOLOGICAL BAND
████████████████

actual line
──────────────
```

Area chart:
- expected band
- actual
- anomaly region

## 11.3. Scenario

### Normal day
daily cycle.

### Dawn oxygen drop
- DO giảm gần rạng sáng
- risk tăng
- other metrics mostly stable

### Sensor fouling
- one sensor slowly drifts
- AI quality indicator giảm
- alert maintenance

### Pond selector
- Pond A
- Pond B
- Pond C

## 11.4. DEMO DEFAULT

Không có source threshold cụ thể → cấu hình được:

```yaml
DO:
  baseline: 6.0
  warning: 4.5
  critical: 3.5

pH:
  baseline: 7.8
  warning_low: 7.0
  warning_high: 8.8

ORP:
  baseline: 220
  warning_low: 150

salinity:
  baseline: 15
  noise: 0.15

temperature:
  baseline: 28
  noise: 0.2
```

Các số trên chỉ dành cho simulator demo.

## 11.5. Animation

- day/night progress
- DO dip smooth
- band remains stable
- anomaly marker
- sensor quality badge
- pond switch crossfade

Không dùng animation sóng nước lớn làm background.

---

# 12. PROJECT SPEC — HIRDOP POWER

## 12.1. Bản chất

Source mô tả:
- small hydro
- clean 24/7 electricity
- edge AI
- water-level anomaly / flood warning
- operation without broadband Internet

## 12.2. UI

Có thể gộp thành một dashboard.

### KPI
- Power output
- Voltage
- Energy generated
- Diesel savings
- Water level
- Vibration
- System status

### Hero
Power generation line.

### Secondary
- water level
- vibration

### Savings
Bar:
`Hirdop vs Diesel`

## 12.3. Scenario

### Normal generation
power stable.

### High load
power changes.

### Flood warning
- water level rises
- vibration changes
- flood risk rises

### Turbine anomaly
- vibration rises
- power efficiency falls
- maintenance recommendation

### Offline
- edge system continues
- local alarm remains

## 12.4. DEMO DEFAULT

```yaml
power:
  unit: kW
  baseline: 8.5
  noise: 0.25

voltage:
  unit: V
  baseline: 230
  warning_low: 215
  warning_high: 245

water_level:
  unit: m
  baseline: 0.8
  warning: 1.2
  critical: 1.5

vibration:
  unit: mm/s
  baseline: 1.2
  warning: 3.0
  critical: 5.0
```

Đây là demo-only.

## 12.5. Savings

Nếu dùng source claim:

- source mô tả giá điện diesel khoảng 0.40–0.45 USD/kWh.
- UI nên ghi rõ `demo comparison`.

Không tự tính ROI mới nếu chưa có input đầy đủ.

---

# 13. PROJECT SPEC — DATACOOL

## 13.1. Bản chất

Source xác nhận:
- thermal map
- rack-level hotspot
- PUE
- energy saving
- carbon report
- AI recommends, human approves
- cơ sở mẫu 100 rack / IT load 1 MW / PUE 1.58
- source claim payback khoảng 4.9 tháng trong mô hình.

## 13.2. UI

Đây là dashboard quan trọng nhất về visualization.

### KPI
- PUE
- Hot Racks
- Cooling Load
- Estimated Savings
- Carbon
- AI Recommendation

### Hero: Rack Heatmap

Grid:

```text
R01 R02 R03 R04 R05 ...
R11 R12 R13 R14 R15 ...
...
```

Mỗi rack:
- temperature
- status
- trend

### Tooltip

```text
Rack R17
Temperature: 31.8°C
Trend: ↑
Risk: HIGH
```

## 13.3. Heatmap requirements

Không dùng gradient quá nhiều.

State:

- cool
- normal
- warm
- hot
- critical

Heatmap phải có legend.

## 13.4. PUE

Line chart theo thời gian.

Scenario:

`PUE 1.58 → 1.62 → AI recommendation → 1.55`

Đây là demo visualization, không phải kết quả đo thật.

## 13.5. AI recommendation

Panel:

```text
AI THERMAL RECOMMENDATION

Hotspot detected:
Rack R17–R21

Suggested action:
Increase cooling allocation to Zone B
Reduce overcooling in Zone D

Estimated:
- Cooling energy: -12%
- Hotspot risk: -68%

[ APPROVE ] [ REJECT ]
```

Không tự động apply.

Source xác nhận mô hình `AI recommends - Human approves`.

## 13.6. Scenario

### Normal
uniform racks.

### Hotspot
one zone warms.

### Cooling imbalance
one zone too cold, another too hot.

### AI recommendation
recommendation appears.

### Approved
heatmap recovers.

### Rejected
risk remains.

## 13.7. Animation

- rack color transition 500–900 ms
- hotspot pulse only on affected racks
- recommendation panel slide in
- approve → green confirmation
- reject → remain unchanged
- PUE line updates gradually

Không làm toàn heatmap nhấp nháy.

---

# 14. PROJECT SPEC — STEMLAB AI

## 14.1. KHÔNG dùng sensor dashboard

Source xác nhận STEMLab là:
- Virtual Lab
- AI Tutor
- Research Co-Pilot

## 14.2. UI architecture

Màn hình chính:

```text
┌─────────────────────────────────────────────────────────────┐
│ STEMLab AI                         Experiment 03     72%     │
├───────────────────────┬─────────────────────────────────────┤
│                       │ AI TUTOR                             │
│  EXPERIMENT CANVAS    │                                      │
│                       │ Step 1 ✓                             │
│  [equipment]          │ Step 2 ✓                             │
│  [simulation]         │ Step 3 ⚠                             │
│                       │ Step 4 ○                             │
│                       │                                      │
│                       │ "Bạn đang đặt probe sai vị trí."    │
├───────────────────────┴─────────────────────────────────────┤
│ STEP TIMELINE / PROGRESS                                    │
└─────────────────────────────────────────────────────────────┘
```

## 14.3. AI Tutor

Không biến thành chatbot full-screen.

AI Tutor phải:

1. biết current step
2. phát hiện mistake
3. highlight vùng sai
4. giải thích ngắn
5. đưa hint
6. cho retry
7. ghi nhận progress

### Interaction

```text
Student action
→ simulator validates
→ mistake detected
→ highlight
→ tutor hint
→ student fixes
→ step completed
```

## 14.4. Scenario

- correct flow
- wrong reagent/equipment
- wrong order
- wrong parameter
- successful recovery

## 14.5. Research Co-Pilot

Có thể là tab riêng.

UI:

- research question
- source list
- evidence cards
- design checklist
- AI suggestions
- chat only as secondary surface

Không fake “research completed” nếu không có source.

## 14.6. Animation

- step completion check
- highlight incorrect object
- progress bar
- tutor message typing 300–800 ms, không giả 5–10 giây
- experiment simulation changes immediately after action

---

# 15. PROJECT SPEC — FIRESCOUT AI

## 15.1. Bản chất

Source yêu cầu:
- drone camera mock
- AI detect person
- hotspot through smoke
- command alert

## 15.2. UI

```text
┌─────────────────────────────────────────────────────────────┐
│ FIRESCOUT COMMAND                         DRONE-01 ● LIVE    │
├───────────────────────────────────────┬─────────────────────┤
│                                       │ DETECTIONS           │
│         DRONE CAMERA                  │                     │
│                                       │ PERSON x2            │
│       ┌───────────────┐               │ HOTSPOT x3           │
│       │ person 92%    │               │ SMOKE HIGH           │
│       └───────────────┘               │                     │
│                 HOTSPOT 87%           │ COMMAND ALERT        │
│                                       │ [ACKNOWLEDGE]        │
├───────────────────────────────────────┴─────────────────────┤
│ DRONE TELEMETRY: ALT | SPEED | BATTERY | GPS | LINK         │
└─────────────────────────────────────────────────────────────┘
```

## 15.3. Detection model

Không cần real CV model cho demo.

Simulator tạo:

```json
{
  "type": "detection",
  "class": "person",
  "confidence": 0.92,
  "bbox": [x, y, w, h]
}
```

và:

```json
{
  "class": "hotspot",
  "confidence": 0.87,
  "bbox": [...]
}
```

## 15.4. Scenario

### Patrol
no detection.

### Smoke
smoke appears.

### Hotspot
hotspot appears.

### Person in danger
person detected.

### Critical
multiple detections + alert.

### Command acknowledgement
operator clicks acknowledge.

## 15.5. Animation

- bounding box smooth interpolation
- confidence number updates
- smoke opacity slowly changes
- detection badge pulse
- alert popup
- camera pan optional

Không random bbox mỗi frame.

Sai:

```text
bbox = random()
```

Đúng:

```text
target bbox
→ interpolation
→ bounded drift
```

---

# 16. PROJECT SPEC — PAM

## 16.1. Bản chất

Source mô tả:
- ESP32
- Sharp GP2Y1014AU0F
- MiCS-5524
- LED 3 màu
- còi
- PM2.5 / gas
- thiết bị tối giản

## 16.2. UI cực đơn giản

```text
┌─────────────────────────────────┐
│ PAM SAFETY DEVICE               │
│                                 │
│          ●                      │
│       STATUS LED                │
│                                 │
│         SAFE                    │
│                                 │
│ PM2.5       GAS                 │
│ 12          LOW                 │
│                                 │
│ Buzzer: OFF                     │
└─────────────────────────────────┘
```

## 16.3. State

### Green
SAFE.

### Yellow
WARNING.

### Red
DANGER.

### Gas leak
red + buzzer animation.

Không tạo 5 tab.

## 16.4. DEMO DEFAULT

Không lấy demo thresholds làm chuẩn sức khỏe.

```yaml
pm25:
  normal: 15
  warning: 35
  critical: 75

gas_index:
  normal: 20
  warning: 50
  critical: 80
```

Các giá trị là simulator index nếu không có calibration thật.

## 16.5. Animation

- LED glow
- buzzer icon pulse
- status text transition
- number count
- red state persistent

Không flashing đỏ quá nhanh gây khó chịu khi quay.

---

# 17. CHART ENGINE

## 17.1. Line chart

Dùng cho:

- VitalChain
- Hirdop
- PUE
- sensor telemetry

Features:

- sliding window
- threshold lines
- current value
- tooltip
- status zone
- smooth animation

## 17.2. Multi-line chart

Dùng:

- PulseGuard
- FactSafe
- AquaSense

Yêu cầu:

- toggle
- legend
- normalized option
- distinct series
- no more than 5–6 prominent lines cùng lúc

## 17.3. Area Band

Dùng AquaSense.

Cần:

- upper band
- lower band
- actual line
- anomaly marker

## 17.4. Bar

Dùng:

- dust
- diesel comparison
- energy saving

Không dùng bar animation quá lâu.

## 17.5. Gauge

Dùng:

- risk
- system health
- progress

Gauge không nên quá nhiều.

## 17.6. Heatmap

Chỉ DataCool cần chart type mới trong nhóm dashboard.

Yêu cầu:

- CSS grid hoặc canvas
- 100 rack không được tạo lag
- update theo diff nếu có thể
- hover tooltip
- selected rack
- legend
- keyboard focus optional

---

# 18. MULTICHART — CÁC LỖI DỄ XẢY RA

## 18.1. Unit mismatch

Ví dụ:

- pH 7
- temperature 28
- ORP 220

Không thể vẽ cùng raw scale.

Fix:
- normalize
- separate axis
- toggles

## 18.2. Chart update memory leak

Triệu chứng:
- vài phút sau lag
- CPU tăng
- browser memory tăng

Fix:
- giới hạn window
- cleanup interval
- cleanup subscription
- không tạo chart instance mới mỗi render

## 18.3. Duplicate points

Triệu chứng:
- chart có 2 timestamp giống nhau

Fix:
- timestamp key
- monotonic simulation clock
- deduplicate

## 18.4. Out-of-order data

Fix:
- sort by timestamp
- hoặc reject stale event

## 18.5. Threshold line nhảy

Threshold phải static theo config.

Không tạo threshold từ random telemetry.

## 18.6. Responsive overflow

Check:
- 1366x768
- 1600x900
- 1920x1080
- 2560x1440

Target recording = 1920x1080.

---

# 19. ANIMATION ENGINE

## 19.1. State transition

Mọi component phải phản ứng với state:

```text
NORMAL
WARNING
CRITICAL
OFFLINE
RECOVERING
RECOVERED
```

## 19.2. Alert animation

Sequence:

```text
event triggered
→ status changes
→ chart marker
→ KPI changes
→ alert panel opens
→ toast
→ timeline event
```

Tất cả không được xảy ra ở cùng một millisecond.

Delay demo:

- t=0 event
- t=150ms status
- t=250ms KPI
- t=350ms alert
- t=500ms timeline

## 19.3. Reduced motion

Nếu:

```css
@media (prefers-reduced-motion: reduce)
```

disable major motion.

---

# 20. DEMO CONTROLLER

Port 3000.

UI:

```text
PROJECT
[ VitalChain ▼ ]

SCENARIO
[ Compressor Failure ▼ ]

SPEED
[ 1x ]

DURATION
[ 90s ]

[ START ]
[ PAUSE ]
[ RESET ]

Recording Mode
[ ON ]

Open Project
localhost:3001
```

## 20.1. Controller không được là dependency bắt buộc

Project vẫn phải chạy độc lập:

```bash
./demo.sh vitalchain compressor_failure
```

Controller chỉ convenience layer.

## 20.2. URL record mode

Ví dụ:

```text
http://localhost:3001/?record=true
```

Record mode:

- hide debug controls
- hide cursor-sensitive controls
- maximize visualization
- no scroll
- stable header
- no dev logs

---

# 21. DEMO SCRIPT

Mỗi project có demo script.

Ví dụ VitalChain:

```yaml
project: vitalchain
scenario: compressor_failure
steps:
  - at: 0
    state: normal
  - at: 15
    state: drift
  - at: 30
    state: warning
  - at: 45
    state: critical
  - at: 48
    action: send_alert
  - at: 55
    action: acknowledge
  - at: 65
    state: recovery
  - at: 85
    state: recovered
```

Không phụ thuộc click tay để tạo video đẹp.

---

# 22. LOGIC SIMULATOR CHI TIẾT

## 22.1. Noise

Noise phải smooth.

Dùng:

```text
white noise
→ low-pass / EMA
→ bounded noise
```

Không:

```python
random.uniform(-5, 5)
```

mỗi tick.

## 22.2. Ramp

```python
value += slope * dt
```

## 22.3. Recovery

```python
error = baseline - value
value += recovery_rate * error * dt
```

## 22.4. Hysteresis

Threshold alert phải có hysteresis để tránh:

```text
warning
warning
normal
warning
normal
```

khi value quanh threshold.

Ví dụ:

```text
enter warning at 70
exit warning below 67
```

DEMO DEFAULT, configurable.

## 22.5. Debounce

Alert cần vượt threshold trong thời gian tối thiểu trước khi trigger nếu project yêu cầu “sustained deviation”.

---

# 23. EVENT ENGINE

Mỗi incident có ID:

```text
INC-2026-0001
```

State:

```text
OPEN
ACKNOWLEDGED
RECOVERING
RESOLVED
```

Không tạo event mới mỗi tick.

Ví dụ:

```text
temperature > critical
→ OPEN

still > critical
→ same incident

operator ack
→ ACKNOWLEDGED

temperature recovers
→ RECOVERING

stable
→ RESOLVED
```

---

# 24. MOCK NOTIFICATION ENGINE

Không gọi:

- Zalo API thật
- SMS gateway thật
- cloud notification thật

Mặc định:

```text
MockNotificationService
```

API:

```python
send(channel, payload)
```

Return:

```json
{
  "success": true,
  "channel": "zalo_mock",
  "latency_ms": 340
}
```

Latency phải realistic-looking nhưng deterministic theo seed.

---

# 25. UI AI — QUY TẮC CHUNG

AI UI phải trả lời:

1. AI thấy gì?
2. AI dự đoán gì?
3. AI đề xuất gì?
4. Người dùng có quyền gì?

Không dùng panel:

```text
AI: Something is wrong.
```

Quá chung.

Dùng:

```text
AI DETECTION
Hotspot probability: 87%
Trend: increasing
Affected zone: B
Recommendation: rebalance cooling
Confidence: 0.87
```

## 25.1. AI không được tự hành động nguy hiểm

DataCool:
`Recommend → Human Approve`

FireScout:
`Detect → Command Alert → Human Decision`

STEMLab:
`Detect mistake → Hint → Student retry`

PulseGuard:
local safety rule có thể trigger alarm vì đó là core safety scenario, nhưng UI phải phân biệt `local rule` với `AI prediction`.

---

# 26. PERFORMANCE TARGET

## Frontend

- initial load < 3s trên máy demo bình thường
- animation 60fps khi có thể
- không memory leak sau 10 phút
- chart window giới hạn
- không CPU 100% chỉ vì simulator

## Simulator

- tick mặc định 250–1000 ms
- demo speed không tạo hàng nghìn points/second
- timestamp logical, không cần real-world second-by-second

## Data retention trong UI

Khuyến nghị:

```text
hero chart: 60–180 points
event timeline: 20–50 events
```

Không giữ vô hạn.

---

# 27. CÁC ĐOẠN CODE CÓ XÁC SUẤT SAI CAO

Agent phải review kỹ các khu vực sau.

## 27.1. useEffect / interval

Lỗi phổ biến:

```js
setInterval(...)
```

mà không cleanup.

Fix:

```js
useEffect(() => {
  const id = setInterval(tick, interval);
  return () => clearInterval(id);
}, [...]);
```

## 27.2. stale closure

Simulator state dùng React state cũ.

Fix:
- functional update
- ref cho clock
- external store nếu cần

## 27.3. chart re-instantiation

Không tạo chart mới mỗi render.

## 27.4. race condition scenario reset

Case:

```text
scenario A running
→ user reset
→ scenario B starts
→ old timer emits event
```

Fix:
- scenario generation ID
- AbortController/cancellation
- clear timers

## 27.5. event duplicate

Mỗi event cần unique ID.

## 27.6. threshold crossing

Trigger phải dùng:

```text
previous < threshold
current >= threshold
```

thay vì:

```text
current >= threshold
```

nếu không sẽ emit alert mỗi tick.

## 27.7. NaN / undefined metric

UI phải fallback:

```text
— 
```

không render:

```text
NaN°C
```

## 27.8. timestamp

Không trộn:
- real wall clock
- demo clock
- UTC string
- local time

Chọn một canonical timestamp + formatter.

---

# 28. BUGBOOK — QUY TẮC GHI BUG

Tạo file ở root repository:

```text
BUGBOOK.md
```

Template:

```md
# BUGBOOK

## BUG-001 — [TITLE]

### Project
VitalChain

### Severity
P0 / P1 / P2 / P3

### Status
OPEN / INVESTIGATING / FIXED / VERIFIED / WONTFIX

### Environment
- OS:
- Browser:
- Resolution:
- Build:
- Scenario:

### Reproduction
1.
2.
3.

### Expected
...

### Actual
...

### Root cause
...

### Fix
...

### Regression test
...

### Verified at
...

### Notes
...
```

## Severity

### P0
Demo không chạy / crash / blank screen.

### P1
Core scenario không hoạt động / alert sai / chart sai.

### P2
UI lỗi nhưng demo vẫn chạy.

### P3
Cosmetic.

---

# 29. BUGS PHẢI CHECK TRONG QUÁ TRÌNH IMPLEMENTATION

## P0 checklist

- blank screen
- JS runtime exception
- simulator không connect
- port conflict
- build fail
- import fail
- route fail
- project config không load

## P1

- scenario không trigger
- threshold sai
- alert spam
- reset không reset
- recovery không resolve
- offline logic sai
- chart freeze
- AI panel hiển thị sai state

## P2

- chart label overlap
- tooltip ngoài viewport
- mobile/responsive irrelevant nhưng desktop resize phải không vỡ
- animation giật
- text overflow
- icon lệch

## P3

- shadow
- spacing
- border
- font size
- micro animation

---

# 30. QA SAU MỖI PROJECT

Agent phải chạy:

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Unit tests

```bash
npm test
```

Nếu project không có test framework thì tối thiểu chạy typecheck/build.

## Manual scenario test

Mỗi scenario:

1. start
2. observe normal
3. wait trigger
4. verify warning
5. verify critical
6. verify alert
7. acknowledge
8. verify recovery
9. reset
10. verify clean initial state

---

# 31. QA VISUAL

Mỗi project phải test tại:

- 1366×768
- 1600×900
- 1920×1080
- 2560×1440

Primary target:

`1920×1080`

Check:

- không horizontal scroll
- không vertical scroll trong record mode
- KPI không wrap
- chart không overflow
- modal không ra ngoài màn hình
- tooltip không bị cắt
- critical state không làm layout shift
- font đủ lớn khi OBS recording

---

# 32. QA DATA

Check:

- min <= baseline <= max
- warning < critical nếu metric tăng là xấu
- warning_low < critical_low nếu metric giảm là xấu
- unit chính xác
- precision ổn định
- không NaN
- không Infinity
- không duplicate timestamp
- không negative value nếu domain không cho phép
- recovery không overshoot quá mức
- noise không vượt giới hạn

---

# 33. QA SCENARIO

Mỗi scenario phải có bảng kiểm:

```text
[ ] START
[ ] NORMAL STATE
[ ] FIRST SIGNAL
[ ] WARNING
[ ] CRITICAL
[ ] EVENT
[ ] ALERT
[ ] USER ACTION
[ ] RECOVERY
[ ] RESOLVED
[ ] RESET
```

Scenario đặc biệt:

### PulseGuard
```text
[ ] network OFF
[ ] local logic continues
[ ] local alarm ON
```

### DataCool
```text
[ ] hotspot
[ ] AI recommendation
[ ] approve
[ ] recovery
```

### FireScout
```text
[ ] person detection
[ ] hotspot detection
[ ] command alert
[ ] acknowledgement
```

### STEMLab
```text
[ ] correct step
[ ] wrong step
[ ] tutor detects
[ ] highlight
[ ] retry
[ ] success
```

### PAM
```text
[ ] green
[ ] yellow
[ ] red
[ ] buzzer
[ ] recovery
```

---

# 34. ANTI-FLAKE RULES

Demo phải deterministic.

Không để:

- random alert timing
- random scenario phase
- random bbox
- random color
- random chart scale
- random initial state

Mỗi demo có:

```yaml
seed: 42
```

Nếu muốn variation:

```yaml
seed: 42
seed_variants:
  - 42
  - 43
  - 44
```

---

# 35. RECORDING MODE

URL:

```text
?record=true
```

Record mode phải:

- hide scenario buttons
- hide debug panel
- hide simulator FPS
- hide seed
- hide developer logs
- preserve event timeline
- preserve status
- preserve alert
- preserve visual story

Optional:

```text
?scenario=compressor_failure&speed=2&autoplay=true&record=true
```

---

# 36. DEMO VIDEO SCRIPTING

## VitalChain

Shot 1:
Normal dashboard.

Shot 2:
Temperature slowly rises.

Shot 3:
Warning.

Shot 4:
Critical.

Shot 5:
Zalo/SMS mock appears.

Shot 6:
Operator acknowledges.

Shot 7:
Recovery.

## PulseGuard

Shot 1:
Normal mountain station.

Shot 2:
Heavy rain.

Shot 3:
soil moisture rises.

Shot 4:
tilt changes.

Shot 5:
risk critical.

Shot 6:
network OFF.

Shot 7:
local siren remains ON.

## FactSafe

Shot 1:
factory normal.

Shot 2:
gas rises.

Shot 3:
zone changes.

Shot 4:
risk score rises.

Shot 5:
alert.

Shot 6:
generate report.

## AquaSense

Shot 1:
pond normal.

Shot 2:
day/night cycle.

Shot 3:
DO deviates.

Shot 4:
biological band anomaly.

Shot 5:
maintenance alert.

## Hirdop

Shot 1:
power stable.

Shot 2:
diesel comparison.

Shot 3:
water level rises.

Shot 4:
AI/local warning.

## DataCool

Shot 1:
all racks normal.

Shot 2:
hotspot appears.

Shot 3:
AI recommendation.

Shot 4:
human approves.

Shot 5:
heatmap cools.

Shot 6:
PUE/savings improves.

## STEMLab

Shot 1:
experiment starts.

Shot 2:
student performs wrong step.

Shot 3:
AI highlights exact mistake.

Shot 4:
hint.

Shot 5:
student corrects.

Shot 6:
progress increases.

## FireScout

Shot 1:
drone patrol.

Shot 2:
smoke.

Shot 3:
hotspot detection.

Shot 4:
person detection.

Shot 5:
command alert.

## PAM

Shot 1:
green.

Shot 2:
yellow.

Shot 3:
red.

Shot 4:
buzzer.

Shot 5:
recovery.

---

# 37. THỨ TỰ IMPLEMENTATION

## Phase 0 — Audit

Không code ngay.

Agent phải:

- inspect repository
- identify existing `iot-demo-template`
- identify existing `engine.js`
- identify existing `style.css`
- identify existing `vitalchain_simulator.py`
- identify chart library
- identify build system
- identify current ports
- identify existing project configs

Output:

```text
AUDIT.md
```

## Phase 1 — Shared core

Implement:

- theme
- layout
- KPI
- status
- timeline
- alert
- scenario
- simulator protocol
- recording mode

## Phase 2 — Simulator

Implement:

- clock
- seed
- noise
- trend
- scenario phases
- event engine
- reset
- pause
- speed

## Phase 3 — VitalChain

Làm đầu tiên vì architecture đơn giản và dễ test.

## Phase 4 — PulseGuard

Test offline/local alarm.

## Phase 5 — FactSafe

Test multi-metric + zone map.

## Phase 6 — AquaSense

Test area-band chart.

## Phase 7 — Hirdop

Test dual-domain dashboard.

## Phase 8 — DataCool

Implement heatmap.

## Phase 9 — STEMLab

Separate UI.

## Phase 10 — FireScout

Detection visualization.

## Phase 11 — PAM

Minimal UI.

## Phase 12 — Final polish

- visual QA
- animation QA
- performance
- OBS recording
- scenario replay
- bugbook
- README

---

# 38. ACCEPTANCE CRITERIA

Project chỉ được coi là DONE khi:

## Functional

- [ ] starts on fixed port
- [ ] simulator starts
- [ ] normal state works
- [ ] at least 3 scenarios work
- [ ] alert works
- [ ] recovery works
- [ ] reset works
- [ ] pause works
- [ ] speed works

## Visual

- [ ] 1920×1080 works
- [ ] no scroll in record mode
- [ ] no layout jump
- [ ] typography readable
- [ ] charts readable
- [ ] alert visible
- [ ] timeline readable

## Reliability

- [ ] no console error during 5-minute run
- [ ] no obvious memory leak
- [ ] no duplicate alerts
- [ ] no duplicate event IDs
- [ ] no NaN
- [ ] no frozen chart
- [ ] reset leaves clean state

## Demo

- [ ] one-click scenario start
- [ ] deterministic result
- [ ] visually understandable without explanation
- [ ] scenario tells a story
- [ ] USP visible within first 30–60 seconds

---

# 39. NHỮNG THỨ KHÔNG ĐƯỢC LÀM

1. Không duplicate toàn bộ code cho từng project.
2. Không xây production backend chỉ để demo.
3. Không tích hợp Zalo/SMS thật nếu chưa cần.
4. Không gọi API AI thật nếu mock là đủ.
5. Không tạo chart 3D chỉ vì “AI”.
6. Không thêm quá nhiều tab.
7. Không random dữ liệu mỗi tick.
8. Không fake regulatory threshold thành “chuẩn”.
9. Không để AI panel nói chung chung.
10. Không để animation chiếm CPU.
11. Không để scenario phụ thuộc click timing thủ công.
12. Không sửa shared core chỉ vì một project có requirement rất đặc biệt nếu có thể config/extension.
13. Không phá UI hiện tại trước khi audit.
14. Không refactor lớn khi chưa có regression test.
15. Không gọi project DONE chỉ vì `npm run build` pass.

---

# 40. DEBUG COMMANDS

Đề xuất:

```bash
./demo.sh vitalchain normal
./demo.sh vitalchain compressor_failure

./demo.sh pulseguard landslide
./demo.sh pulseguard communication_loss

./demo.sh factsafe gas_leak
./demo.sh factsafe dust_spike

./demo.sh aquasense low_oxygen
./demo.sh aquasense sensor_fouling

./demo.sh hirdop flood_warning
./demo.sh hirdop turbine_anomaly

./demo.sh datacool hotspot
./demo.sh datacool cooling_imbalance

./demo.sh stemlab wrong_step
./demo.sh firescout fire_detection
./demo.sh pam gas_leak
```

## Start all

```bash
./scripts/start-all.sh
```

## Stop all

```bash
./scripts/stop-all.sh
```

---

# 41. LOGGING

Development:

```text
[SIM] scenario=gas_leak phase=warning
[EVENT] EVT-001 threshold_crossed
[ALERT] ALT-001 sent
[UI] status warning
```

Production/record mode:

- không hiển thị log
- console vẫn có thể log error
- không spam console mỗi tick

---

# 42. CONFIG SCHEMA

Ví dụ:

```js
export const vitalChainConfig = {
  id: "vitalchain",
  port: 3001,
  title: "VitalChain",
  category: "cold-chain",
  metrics: [
    {
      id: "temperature",
      label: "Temperature",
      unit: "°C",
      baseline: 5,
      warning: 7,
      critical: 8,
      direction: "high"
    }
  ],
  scenarios: [
    "normal",
    "door_open",
    "compressor_failure",
    "freeze_fault"
  ]
}
```

Config phải chứa domain metadata, không chứa UI state runtime.

---

# 43. DOMAIN-SPECIFIC CHECKLIST

## VitalChain
- [ ] temperature
- [ ] safety band
- [ ] sensor
- [ ] location
- [ ] alert timer
- [ ] Zalo/SMS mock
- [ ] incident history
- [ ] GSP/GDP wording không bị overclaim

## PulseGuard
- [ ] rain
- [ ] soil
- [ ] tilt
- [ ] multi-signal logic
- [ ] risk gauge
- [ ] local siren
- [ ] network loss
- [ ] local autonomy

## FactSafe
- [ ] gases
- [ ] dust
- [ ] microclimate
- [ ] zones
- [ ] unified risk
- [ ] alert
- [ ] report
- [ ] no fake regulatory certification

## AquaSense
- [ ] 5 metrics
- [ ] toggles
- [ ] biological band
- [ ] day/night
- [ ] pond selector
- [ ] sensor fouling
- [ ] oxygen anomaly

## Hirdop
- [ ] power
- [ ] voltage
- [ ] energy
- [ ] diesel comparison
- [ ] water level
- [ ] vibration
- [ ] flood alert
- [ ] edge/offline story

## DataCool
- [ ] rack grid
- [ ] temperature
- [ ] hotspot
- [ ] PUE
- [ ] energy savings
- [ ] carbon
- [ ] AI recommendation
- [ ] human approve/reject

## STEMLab
- [ ] experiment canvas
- [ ] step state
- [ ] wrong action
- [ ] AI highlight
- [ ] hint
- [ ] retry
- [ ] progress
- [ ] research co-pilot

## FireScout
- [ ] drone camera
- [ ] person bbox
- [ ] hotspot bbox
- [ ] confidence
- [ ] smoke
- [ ] command alert
- [ ] acknowledgement
- [ ] telemetry

## PAM
- [ ] LED state
- [ ] PM2.5
- [ ] gas
- [ ] buzzer
- [ ] green/yellow/red
- [ ] minimal UI

---

# 44. RISKS VÀ PHÒNG NGỪA

## Risk 1 — Simulator nhìn giả

Nguyên nhân:
- random quá mạnh
- chart nhảy
- scenario không có causal order

Fix:
- deterministic seed
- smooth trend
- phase-based scenario

## Risk 2 — Dashboard quá nhiều thứ

Fix:
- one hero
- four KPIs
- one secondary panel
- event timeline

## Risk 3 — AI trông như chatbot

Fix:
- contextual recommendation
- confidence
- reason
- action
- human approval

## Risk 4 — Multi-chart khó đọc

Fix:
- toggle
- normalize
- max visible series
- units rõ

## Risk 5 — Animation gây lag

Fix:
- CSS transform/opacity
- requestAnimationFrame khi cần
- chart library built-in animation
- không animate layout dimensions liên tục

## Risk 6 — Reset lỗi

Fix:
- reset simulator
- reset frontend store
- clear event list
- clear alerts
- clear timers
- reset scenario ID

## Risk 7 — Agent sửa core làm hỏng project khác

Fix:
- shared core tests
- snapshot/config tests
- chạy tất cả project smoke test sau core change

## Risk 8 — Demo claim quá mức

Fix:
- UI dùng wording:
  - `DEMO`
  - `SIMULATED`
  - `ESTIMATED`
  - `AI RECOMMENDATION`
  khi phù hợp.

---

# 45. SMOKE TEST TOÀN BỘ HỆ THỐNG

Script phải kiểm tra:

```text
3000 controller       PASS
3001 vitalchain       PASS
3002 pulseguard       PASS
3003 factsafe         PASS
3004 aquasense        PASS
3005 hirdop           PASS
3006 datacool         PASS
3007 stemlab          PASS
3008 firescout        PASS
3009 pam              PASS
```

Sau đó:

```text
scenario load         PASS
simulator connection  PASS
telemetry             PASS
event                 PASS
alert                 PASS
reset                 PASS
```

---

# 46. FINAL RELEASE GATE

Trước khi quay video:

```text
[ ] Git clean
[ ] Build all pass
[ ] Lint pass
[ ] Tests pass
[ ] All ports verified
[ ] OBS resolution 1920x1080
[ ] Browser zoom 100%
[ ] No notification from OS
[ ] No password popup
[ ] No debug UI
[ ] Scenario deterministic
[ ] Seed fixed
[ ] Video script ready
[ ] BUGBOOK updated
```

---

# 47. PRIORITY MATRIX

| Feature | Priority |
|---|---|
| Shared layout | P0 |
| Simulator | P0 |
| Scenario engine | P0 |
| Alert system | P0 |
| Event timeline | P0 |
| Recording mode | P0 |
| VitalChain | P0 |
| PulseGuard offline | P0 |
| FactSafe zone map | P0 |
| AquaSense biological band | P1 |
| Hirdop dual-domain | P1 |
| DataCool heatmap | P0 |
| STEMLab step tutor | P0 |
| FireScout detection | P0 |
| PAM LED/buzzer | P0 |
| Real backend | P3 |
| Real Zalo/SMS | P3 |
| Real cloud | P3 |
| Auth | P3 |
| Production database | P3 |

---

# 48. AGENT EXECUTION PROMPT

Agent phải đọc file này trước khi sửa code.

## Instructions

```text
You are implementing a video-first local demo platform for multiple USTH Innovation 2026 projects.

DO NOT start by rewriting the repository.

STEP 1:
Audit the existing repository and identify:
- framework
- package manager
- existing frontend
- existing iot-demo-template
- chart library
- simulator
- engine.js
- style.css
- existing ports
- existing configs

STEP 2:
Create AUDIT.md with:
- current architecture
- reusable components
- files to preserve
- files to modify
- files to create
- known risks

STEP 3:
Implement the shared core first.

STEP 4:
Do not duplicate codebases. Use shared components/configuration.

STEP 5:
Implement deterministic simulator behavior:
- seeded
- smooth
- scenario-based
- phase-based
- bounded
- resettable
- pausable
- speed-controlled

STEP 6:
Implement event/alert lifecycle:
OPEN → ACKNOWLEDGED → RECOVERING → RESOLVED.

STEP 7:
Implement recording mode:
?record=true

STEP 8:
Implement projects in this order:
VitalChain
PulseGuard
FactSafe
AquaSense
Hirdop
DataCool
STEMLab
FireScout
PAM

STEP 9:
After every project:
- build
- lint
- test/typecheck
- manual scenario test
- record bug in BUGBOOK.md if found

STEP 10:
After any shared-core change:
run smoke tests for ALL projects.

IMPORTANT:
- Never invent real regulatory thresholds.
- Demo-only thresholds must be configurable and labelled.
- Never present simulated AI inference as validated ML.
- Never use uncontrolled random telemetry.
- Never create alert spam.
- Never leave timers/subscriptions running after unmount/reset.
- Never let recording mode depend on manual clicks.
- Never claim DONE just because build passes.

Definition of Done:
- project starts on fixed localhost port
- normal scenario works
- minimum 3 scenarios work
- critical event works
- alert works
- recovery works
- reset works
- no console errors during 5-minute demo
- no obvious memory leak
- 1920x1080 record mode is clean
- visual story is understandable within 30–60 seconds
```

---

# 49. GHI CHÚ VỀ CLAIM VÀ THÔNG SỐ

Các tài liệu dự án chứa nhiều claim kinh doanh/kỹ thuật. Frontend demo không được biến claim thành “measurement”.

Ví dụ:

- DataCool source mô tả cơ sở mẫu 100 rack, IT load 1 MW, PUE 1.58 và mô hình payback khoảng 4.9 tháng. Có thể dùng trong KPI/pitch nếu ghi rõ là **mô hình cơ sở mẫu/ước tính**, không phải telemetry simulator.
- VitalChain source mô tả Monitoring-as-a-Service, realtime monitoring và cảnh báo qua Zalo/SMS.
- PulseGuard source nhấn mạnh cảnh báo sớm và hoạt động khi mất sóng.
- FactSafe source mô tả unified risk score và tự động hóa báo cáo.
- STEMLab source mô tả AI Tutor phát hiện sai từng bước và Research Co-Pilot.
- FireScout source mô tả detection người/điểm nóng qua smoke.
- PAM source mô tả LED 3 màu + buzzer.

Khi hiển thị KPI business:

```text
ESTIMATED
MODEL
DEMO
SIMULATED
```

phải được dùng khi cần để tránh hiểu nhầm.

---

# 50. KẾT LUẬN KIẾN TRÚC

Không xây:

```text
9 project × 9 frontend engines
```

Xây:

```text
                 DEMO CONTROLLER
                       │
             ┌─────────┴─────────┐
             │                   │
       Shared Demo Core      Simulator Core
             │                   │
     ┌───────┼────────┐          │
     │       │        │          │
 VitalChain PulseGuard FactSafe  ...
     │       │        │
     └───────┴────────┘
             │
       Project Config
             │
      Scenario Engine
             │
       Video Recording
```

Mục tiêu cuối cùng không phải là một “dashboard framework” chung chung.

Mục tiêu là:

> **Một local demo infrastructure cho phép mỗi đề tài có localhost riêng, dữ liệu mô phỏng có logic, scenario có thể điều khiển, UI chuyên biệt theo domain, animation vừa đủ, và có thể quay một demo/pitch ổn định bất kỳ lúc nào.**

