# MULTICHART SPEC — DEMO FRONTEND / SIMULATOR
## Bản đặc tả tập trung vào chart, dữ liệu mô phỏng, random range, scenario và tính ổn định

> **Mục tiêu chính**
>
> Đây là tài liệu dành cho agent/code agent triển khai frontend demo để quay video pitch/demo.
> Không nhằm xây dựng hệ thống IoT production, không dùng simulator để khẳng định số liệu vận hành thực tế,
> và không biến dashboard thành một hệ thống backend phức tạp.
>
> Nguyên tắc cốt lõi:
>
> `SIMULATOR → TELEMETRY → CHART → STATE → ALERT → ACTION → RECOVERY`
>
> Dữ liệu phải **đẹp, liên tục, có nguyên nhân**, không phải random độc lập từng điểm.

---

# 0. PHẠM VI VÀ GIỚI HẠN

## 0.1 Những gì tài liệu này quyết định

Tài liệu quyết định:

- Chart nào cần có cho từng project.
- Chart nào là HERO chart và chart nào chỉ hỗ trợ.
- Metric nào đi cùng nhau.
- Unit của từng metric.
- Khoảng dữ liệu demo.
- Baseline.
- Noise.
- Rate cập nhật.
- Window dữ liệu hiển thị.
- Cách tạo trend.
- Cách tạo anomaly.
- Cách recovery.
- Threshold và hysteresis.
- Khi nào phát sinh event.
- Khi nào chart đổi trạng thái.
- Cách tránh dữ liệu nhảy vô lý.
- Cách tránh multi-chart gây lag hoặc sai unit.
- Cách test sau khi hoàn thành.

## 0.2 Những gì KHÔNG được làm

Không:

- random `Math.random()` độc lập cho từng datapoint;
- random metric không có quan hệ nhân quả;
- cho người dùng kéo slider tự do tới giá trị vô lý;
- trộn metric khác unit trên cùng một Y-axis mà không chuẩn hóa;
- dùng một threshold giả rồi gọi đó là regulatory threshold;
- làm chart quá nhiều khiến người xem không biết nhìn vào đâu;
- thêm backend chỉ để chart demo chạy;
- làm AI thành chatbot nếu sản phẩm không phải chatbot;
- cho scenario thay đổi đột ngột từ bình thường sang critical nếu câu chuyện sản phẩm cần phát hiện sớm;
- để chart reset bằng cách refresh toàn trang;
- để interval cũ tiếp tục chạy sau reset/switch scenario.

---

# 1. NGUYÊN TẮC SOURCE OF TRUTH

Mỗi parameter phải có một trong 3 trạng thái:

### SOURCE-VERIFIED
Có nguồn tài liệu/domain cụ thể hỗ trợ.

### DEMO-DEFAULT
Giá trị được chọn để mô phỏng đẹp, hợp lý và ổn định cho video.
Không được trình bày như giới hạn pháp lý/kỹ thuật chính thức.

### PLACEHOLDER
Chưa đủ thông tin từ hồ sơ dự án; agent không được tự biến nó thành fact.

Trong UI demo nên tránh chữ:
- "standard"
- "regulatory limit"
- "safe by law"

nếu giá trị chỉ là DEMO-DEFAULT.

Nên dùng:
- "Demo threshold"
- "Operational threshold"
- "Scenario threshold"
- "Configured limit"

---

# 2. CHUẨN CHUNG CHO MULTICHART

## 2.1 Sampling

Khuyến nghị:

```yaml
simulator_tick_ms: 1000
chart_update_ms: 1000
visible_window_seconds: 120
history_points: 120
```

Nếu muốn demo nhanh:

```yaml
0.5x: simulation time slower
1x: default
2x: 2 seconds = 1 simulated second
4x: fast demo
8x: stress/demo mode only
```

Không tạo 60 datapoint/giây chỉ để làm chart trông "real-time".

## 2.2 Random model

Mỗi metric:

```text
value(t)
= baseline
+ smooth_noise(t)
+ scenario_component(t)
+ correlated_component(t)
+ recovery_component(t)
```

Không:

```text
value(t) = random(min, max)
```

## 2.3 Smooth noise

Dùng noise có memory:

```python
noise[t] = 0.85 * noise[t-1] + random_gaussian(0, sigma)
```

Sau đó clamp theo khoảng demo.

Có thể thêm low-frequency drift:

```text
drift += gaussian(0, tiny_sigma)
drift *= 0.995
```

## 2.4 Random seed

Mỗi scenario có seed:

```yaml
normal: 101
warning: 202
critical: 303
recovery: 404
```

Mục tiêu:
- quay lại cùng scenario → gần như cùng câu chuyện;
- screenshot/video không thay đổi bất ngờ;
- bug dễ reproduce.

## 2.5 Random range

Mỗi metric có:

```yaml
display:
  min:
  max:

normal:
  center:
  noise_sigma:

warning:
  target:
  duration:

critical:
  target:
  duration:

recovery:
  target:
  duration:
```

Không dùng `min/max` làm target. `min/max` chỉ là hard safety clamp của simulator.

---

# 3. CHUẨN CHUNG CHO CHART

## HERO chart

Mỗi project chỉ nên có 1 chart chính.

HERO chart phải trả lời ngay:

> "Điều gì đang xảy ra?"

Chart phụ trả lời:

> "Tại sao nó xảy ra?"
> "Hậu quả là gì?"
> "Hệ thống phản ứng thế nào?"

## Số chart

Dashboard 16:9:

- 1 HERO chart.
- 2–4 chart phụ.
- KPI cards không tính là chart.
- Event timeline không tính là chart.

Không quá 5 visualizations động cùng lúc trên một viewport.

## Multi-axis

Chỉ dùng 2 Y-axis khi:

- 2 metric có cùng thời gian;
- scale chênh lệch lớn;
- người xem cần so sánh quan hệ.

Nếu có 3+ metric khác unit:
- toggle;
- small multiples;
- normalize;
- hoặc tách chart.

Không nhét 5 unit vào 5 Y-axis.

---

# 4. VITALCHAIN

## 4.1 Mục tiêu visual

Câu chuyện:

```text
NORMAL
→ door opens
→ temperature begins rising
→ early warning
→ critical
→ notification
→ action
→ recovery
```

HERO chart phải làm người xem thấy được **temperature trajectory**.

## 4.2 HERO — Temperature line

```yaml
chart: line
x: timestamp
y: temperature
unit: °C
visible_window: 120s

baseline:
  center: 5.0
  normal_range: [3.0, 7.0]

demo_threshold:
  warning_high: 7.0
  critical_high: 8.0
  warning_low: 2.0
  critical_low: 1.0

hard_clamp:
  min: -1
  max: 12

normal_noise_sigma: 0.08
warning_noise_sigma: 0.12
critical_noise_sigma: 0.18
```

Nguồn domain:
WHO/PAHO xác nhận phần lớn vaccine dùng trong chương trình tiêm chủng được bảo quản ở +2°C đến +8°C; tuy nhiên từng vaccine có thể có điều kiện riêng.

Vì vậy chart có thể dùng 2–8°C làm **domain reference**, nhưng nếu dashboard nói về một sản phẩm vaccine cụ thể phải lấy threshold từ product specification.

## 4.3 Scenario: normal

```text
start = 5.0
drift ≈ 0
noise = ±0.1
```

Không cho temperature dao động 3 → 7 liên tục.

Độ đẹp:
```text
4.8 → 5.1 → 5.0 → 5.2 → 4.9 → 5.1
```

## 4.4 Scenario: door_open

Đặc điểm:

- tăng chậm lúc đầu;
- sau đó tăng rõ;
- không jump ngay lên critical.

```yaml
phase_0:
  0-15s:
    target: 5.2

phase_1:
  15-40s:
    target_ramp: 5.2 -> 6.8

phase_2:
  40-65s:
    target_ramp: 6.8 -> 7.8

phase_3:
  65-90s:
    target: 8.2
```

Chart phải cho phép người xem nhận ra:

> "Hệ thống phát hiện xu hướng trước khi vượt quá nhiều."

## 4.5 Scenario: compressor_failure

Khác door open:

- slope lớn hơn;
- temperature tiếp tục tăng dù scenario bắt đầu từ mức bình thường;
- alert severity tăng nhanh hơn.

```text
5.0 → 5.3 → 5.8 → 6.5 → 7.4 → 8.2
```

## 4.6 Scenario: freeze_fault

```text
5.0 → 4.2 → 3.1 → 2.0 → 1.3 → 0.8
```

Không cần xuống -10°C chỉ để làm critical.

## 4.7 Chart phụ

### Detection latency gauge

```yaml
normal: 12-25s
warning: 15-35s
critical: 20-45s
display_target: "< 60s"
```

Đây là KPI demo theo câu chuyện sản phẩm, không phải cam kết backend thực tế.

### Alert timeline

Mỗi event:

```text
timestamp
severity
metric
value
state
notification
acknowledged
```

### Fleet mini-chart

Không animate tất cả thiết bị cùng biên độ.

Ví dụ 6 devices:

```text
VC-001  5.1°C  online
VC-002  4.8°C  online
VC-003  5.3°C  online
VC-004  7.2°C  warning
VC-005  5.0°C  online
VC-006  4.9°C  online
```

Chỉ 1–2 device nên thay đổi trong scenario.

---

# 5. PULSEGUARD

## 5.1 Metric

```text
rainfall
soil_moisture
tilt
risk_score
network_status
local_alarm
```

## 5.2 HERO — normalized multi-line

Ba metric không nên dùng raw value cùng Y-axis.

Dùng:

```text
normalized = (value - baseline) / (warning - baseline)
```

hoặc map về 0–100%.

Hiển thị legend rõ:

```text
Rain
Soil moisture
Tilt
```

## 5.3 Raw values

DEMO-DEFAULT:

```yaml
rain_mm_h:
  normal: 0-5
  warning: 20-35
  critical: 50-70
  hard_clamp: 100

soil_moisture_percent:
  normal: 35-55
  warning: 60-75
  critical: 78-90
  hard_clamp: 100

tilt_deg:
  normal: 0.05-0.4
  warning: 1.0-2.0
  critical: 3.0-5.0
  hard_clamp: 8.0
```

Các khoảng trên chỉ là **DEMO-DEFAULT**, không phải ngưỡng địa chất universal.

## 5.4 Scenario normal

Tất cả dao động nhẹ:

```text
rain: 2 ± 1
soil: 45 ± 2
tilt: 0.2 ± 0.05
risk: 15-30
```

## 5.5 Scenario heavy_rain

Quan hệ nhân quả:

```text
rain ↑
↓
soil moisture ↑ với delay
↓
risk ↑
```

Không tăng soil moisture cùng timestamp với rainfall.

Ví dụ:

```text
t=0: rain 4
t=10: rain 15
t=20: rain 28
t=30: soil 48
t=45: soil 61
t=60: soil 72
```

## 5.6 Scenario landslide

Phải thể hiện **multi-sensor agreement**:

```text
rain ↑
soil ↑
tilt ↑
risk ↑↑
```

Rule:

```text
risk critical
IF
  >= 2 sensors warning
AND
  at least 1 sensor critical
```

Không để tilt nhảy từ 0.2 → 5.0 trong 1 tick.

## 5.7 Communication loss

Quan trọng:

```text
network = OFFLINE
cloud chart = frozen/degraded
local sensors = continue
local siren = ACTIVE
```

Điểm demo:

> mất mạng ≠ mất khả năng cảnh báo tại chỗ.

---

# 6. FACTSAFE

## 6.1 Vấn đề lớn nhất

Không được đặt NH3, CO, H2S, CH4, PM2.5 lên một Y-axis raw.

Các gas có unit/concentration khác nhau.

## 6.2 HERO — Gas multi-line

Có 2 lựa chọn:

### Recommended

Normalized severity chart:

```text
severity = current / configured_demo_threshold
```

Y:

```text
0 = baseline
1 = threshold
>1 = exceed
```

Tooltip vẫn hiển thị raw value.

### Alternative

Small multiples:

```text
NH3
CO
H2S
CH4
```

## 6.3 DEMO DEFAULT

Không coi đây là QCVN.

```yaml
NH3:
  baseline: 10-20 ppm
  warning: 30-40
  critical: 50-70

CO:
  baseline: 5-20 ppm
  warning: 35-50
  critical: 70-100

H2S:
  baseline: 0.2-1 ppm
  warning: 5
  critical: 10-20

CH4:
  baseline: 0.1-2 %
  warning: 5
  critical: 8
```

Đặc biệt H2S cần cẩn thận vì exposure limits khác nhau theo tiêu chuẩn/jurisdiction. OSHA/NIOSH có các giới hạn riêng; không dùng một con số demo để tuyên bố compliance.

## 6.4 Scenario normal

Tất cả gần baseline.

## 6.5 Scenario gas_leak

Không tăng 4 khí cùng tốc độ.

Ví dụ:

```text
NH3 ↑↑
CO  slight ↑
H2S stable
CH4 stable
```

Từ đó UI cho thấy:

> hệ thống biết zone/loại hazard nào đang thay đổi.

## 6.6 Scenario dust_event

Gas ổn định.

```text
PM2.5 ↑↑
PM10 ↑↑
gas ≈ baseline
```

Chart phụ:

```text
bar chart:
Zone A
Zone B
Zone C
Zone D
```

Mỗi zone có:

```yaml
PM25
PM10
risk
```

## 6.7 Multi-hazard

Ví dụ:

```text
Zone B:
  NH3 ↑
  PM2.5 ↑
  humidity ↑
  risk = critical
```

Không cho tất cả zone đỏ.

Chỉ 1–2 zone đỏ để heatmap có ý nghĩa.

## 6.8 Risk score

```text
risk = weighted combination
```

Không cần ML thật.

Ví dụ:

```text
risk =
  max(gas_severity)
  * 0.55
  + dust_severity * 0.25
  + microclimate_factor * 0.20
```

Clamp:

```text
0..100
```

---

# 7. AQUASENSE

## 7.1 Metric

```text
DO
pH
ORP
salinity
water_temperature
```

## 7.2 Vấn đề lớn nhất

5 metric có unit và scale khác nhau.

Không dùng:

```text
5 lines / same raw Y-axis
```

Recommended:

```text
main chart:
  selected metrics
toggle:
  DO
  pH
  ORP
  salinity
  temperature
```

Mặc định chỉ bật:

```text
DO
temperature
```

## 7.3 HERO — DO

DO là visual priority vì thiếu oxygen là câu chuyện dễ hiểu.

DEMO-DEFAULT:

```yaml
DO_mg_L:
  normal: 5.5-7.0
  warning: 4.0-5.0
  critical: 2.5-3.5
  hard_clamp: 0-10
```

Không dùng đây như universal shrimp threshold.

## 7.4 Biological rhythm chart

Đây là chart đặc trưng.

```text
x = time of day
y = DO
band = learned_normal_range
actual = observed
```

Band ví dụ:

```text
02:00 → 5.0 ± 0.4
06:00 → 4.3 ± 0.4
10:00 → 6.2 ± 0.5
14:00 → 7.0 ± 0.5
18:00 → 6.0 ± 0.4
22:00 → 5.4 ± 0.4
```

Chỉ là DEMO-DEFAULT để tạo câu chuyện ngày/đêm.

## 7.5 Scenario dawn_oxygen_drop

Câu chuyện:

```text
night
↓
photosynthesis low
↓
DO gradually falls
↓
pre-alarm
↓
critical
↓
aerator action
↓
recovery
```

Không làm:

```text
7.0 → 2.5
```

trong 1–2 seconds.

## 7.6 Sensor fouling

Quan trọng: sensor fault không giống water event.

Ví dụ:

```text
DO:
  5.8 → 5.7 → 5.8 → 5.7

ORP:
  210 → 211 → 210

temperature:
  28.0 → 28.1
```

nhưng:

```text
sensor_quality ↓
signal_stability ↓
```

Có thể biểu diễn bằng:

- confidence badge;
- quality bar;
- sensor health timeline.

---

# 8. HIRDOP POWER

## 8.1 Metric

```text
power_kW
energy_kWh
voltage_V
water_level_m
vibration_mm_s
diesel_baseline
saving
```

## 8.2 HERO — Power

```yaml
power_kW:
  baseline: 8.5
  normal_range: 7.5-10
  high_load: 10-12
  hard_clamp: 15
```

DEMO-DEFAULT.

## 8.3 Voltage

```text
baseline = 230 V
normal = 225-235
warning = 215-245
```

Nếu cần regulatory/electrical compliance thì lấy theo hệ thống thực tế; không tự tuyên bố.

## 8.4 Energy

Energy không được random độc lập.

Công thức:

```text
energy[t] = energy[t-1] + power_kW * dt_hours
```

Ví dụ tick 1 sec:

```text
dt_hours = 1 / 3600
```

Đây là một điểm dễ sai.

## 8.5 Diesel comparison

Không random saving.

```text
diesel_cost = estimated_diesel_energy * diesel_unit_cost
hydro_cost = hydro_energy * hydro_unit_cost

saving = diesel_cost - hydro_cost
```

Nếu chỉ demo UI:
- ghi rõ "estimated";
- không dùng số này làm financial claim.

## 8.6 Flood scenario

Quan hệ:

```text
water level ↑
↓
risk ↑
```

Vibration có thể tăng sau đó:

```text
water ↑
delay
vibration ↑
```

Không làm:

```text
water ↑ + vibration ↑ + power ↑
```

cùng tick nếu không có lý do.

## 8.7 Turbine anomaly

```text
power stable
water stable
vibration ↑
```

Đây là anomaly machine chứ không phải flood.

---

# 9. DATACOOL

## 9.1 Đây là chart khó nhất

DataCool có 2 lớp:

```text
spatial:
  rack heatmap

temporal:
  PUE / power / temperature
```

## 9.2 Rack heatmap

Ví dụ:

```yaml
rows: 4
columns: 8
rack_count: 32
```

Mỗi rack:

```json
{
  "rackId": "R-17",
  "inletTemp": 23.8,
  "loadPct": 72,
  "status": "normal"
}
```

## 9.3 Normal temperature

Reference:
ASHRAE's published guidance gives a recommended inlet temperature range of 18–27°C for A1–A4 equipment environments.

For demo:

```text
normal:
  21-25°C

warning:
  25-27°C

critical:
  > 27°C
```

Không gọi đây là universal equipment shutdown threshold.

## 9.4 Heatmap scenario hotspot

Không làm cả rack đỏ.

Ví dụ:

```text
R17  28.5°C
R18  29.1°C
R25  27.8°C
```

Các rack còn lại:

```text
22-25°C
```

Visual này tạo pattern rõ.

## 9.5 Cooling imbalance

Ví dụ:

```text
left side:
  22-24

right side:
  26-29
```

AI có thể nhận ra:

```text
localized thermal imbalance
```

## 9.6 PUE

Không random PUE từng tick.

PUE:

```text
PUE = total_facility_power / IT_equipment_power
```

Demo:

```text
baseline: 1.55-1.65
improvement: 1.55 → 1.48
```

Chuyển chậm.

## 9.7 AI recommendation

UI:

```text
AI DETECTED
Hotspot concentration in Rack Zone B

RECOMMENDATION
Increase airflow to Zone B
Reduce cooling oversupply in Zone A

EXPECTED
Temperature: -1.2°C
PUE: 1.58 → 1.52

[Approve] [Reject]
```

Không cho AI tự động thay đổi trạng thái nếu concept là:

```text
AI recommends → Human approves
```

## 9.8 Carbon

Nếu có carbon chart:

```text
carbon = energy_kWh * emission_factor
```

Không random carbon độc lập với energy.

---

# 10. STEMLAB AI

Đây không phải sensor dashboard.

## 10.1 Không dùng multi-line sensor chart

Thay bằng:

```text
Experiment progress
Step timeline
Accuracy trend
Mistake distribution
```

## 10.2 Accuracy

Không random:

```text
60, 80, 40, 90, 20...
```

Dùng learning trend:

```text
58
61
64
63
69
72
76
78
```

Có noise nhẹ.

## 10.3 Step timeline

```text
1 Select equipment      ✓
2 Set initial condition ✓
3 Apply force           ✕
4 Record result         -
5 Explain result        -
```

AI Tutor highlight step 3.

## 10.4 Mistake distribution

Bar:

```text
Wrong parameter       42%
Wrong order           28%
Unit conversion       18%
Observation            12%
```

Demo-only.

---

# 11. FIRESCOUT AI

## 11.1 Không phải chart-first UI

HERO:

```text
drone camera
```

Overlay:

```text
person bbox
smoke bbox
hotspot bbox
confidence
```

## 11.2 Detection data

```json
{
  "type": "detection",
  "class": "hotspot",
  "confidence": 0.94,
  "bbox": [0.62, 0.31, 0.18, 0.22]
}
```

Dùng normalized bbox:

```text
0..1
```

để camera responsive không làm bbox lệch.

## 11.3 Detection confidence

Không random từng frame.

```text
0.81
0.84
0.87
0.91
0.94
0.93
```

Nếu object mất:

```text
confidence ↓
bbox opacity ↓
```

sau đó remove.

## 11.4 Event timeline

```text
14:32:10 smoke detected
14:32:12 hotspot detected
14:32:14 person detected
14:32:15 alert sent
14:32:19 command acknowledged
```

---

# 12. PAM

PAM phải tối giản.

## 12.1 HERO

```text
large LED indicator
```

State:

```text
GREEN
YELLOW
RED
```

## 12.2 Demo values

```yaml
PM2.5:
  green: 15
  yellow: 35
  red: 75

gas_index:
  green: 20
  yellow: 50
  red: 80
```

Chỉ là demo mapping.

## 12.3 Timeline

```text
12:00 GREEN
12:05 GREEN
12:10 YELLOW
12:11 RED
12:13 RED
12:15 YELLOW
12:17 GREEN
```

Không cần chart phức tạp.

---

# 13. SIMULATOR ENGINE CHUNG

## 13.1 Data object

```json
{
  "timestamp": 1750000000,
  "project": "vitalchain",
  "scenario": "door_open",
  "deviceId": "VC-001",
  "metrics": {
    "temperature": 6.4
  },
  "state": "WARNING"
}
```

## 13.2 Event object

```json
{
  "timestamp": 1750000020,
  "type": "threshold_exceeded",
  "severity": "warning",
  "metric": "temperature",
  "value": 7.2,
  "message": "Temperature crossed configured warning threshold"
}
```

## 13.3 Scenario phases

Mọi scenario nên có:

```text
SETUP
BASELINE
SIGNAL
WARNING
CRITICAL
ACTION
RECOVERY
RESOLVED
```

Không bắt buộc mọi project có đủ 8 phase.

## 13.4 Ramp function

Recommended:

```python
def smoothstep(x):
    x = max(0, min(1, x))
    return x*x*(3 - 2*x)
```

```python
value = start + (target - start) * smoothstep(progress)
```

Tốt hơn linear jump.

## 13.5 Recovery

Recovery phải có quán tính:

```text
critical
↓
action
↓
rapid improvement
↓
slow stabilization
↓
normal
```

Không:

```text
8.5 → 5.0
```

trong một tick.

---

# 14. CORRELATION MATRIX

Đây là phần rất quan trọng để tránh simulator giả.

| Project | Primary | Secondary | Quan hệ |
|---|---|---|---|
| VitalChain | temperature | alert latency | temp → state → alert |
| PulseGuard | rain | soil, tilt | rain → soil → tilt/risk |
| FactSafe | gas/dust | zone risk | sensor → zone risk |
| AquaSense | DO | temp/time | time → DO rhythm |
| Hirdop | power | energy | power → energy |
| Hirdop | water | vibration | water → vibration |
| DataCool | rack temp | PUE | load/cooling → temp/PUE |
| STEMLab | accuracy | mistakes | mistakes → accuracy trend |
| FireScout | detections | command | detection → alert → command |
| PAM | gas/PM | LED | metric → state → LED |

---

# 15. HARD RULES CHO RANDOM

## Rule 1 — random không được tạo state

Sai:

```python
if random.random() > 0.5:
    status = "critical"
```

Đúng:

```python
status = state_machine.evaluate(metric)
```

## Rule 2 — random chỉ tạo variation

```text
signal = deterministic_signal + noise
```

## Rule 3 — scenario quyết định direction

```text
scenario = door_open
→ temperature direction = upward
```

## Rule 4 — metric liên quan phải có lag nếu cần

```text
rain → soil moisture
```

không đồng thời.

## Rule 5 — recovery có state riêng

Không random về normal.

---

# 16. THRESHOLD + HYSTERESIS

Không dùng:

```python
if value > threshold:
    warning
else:
    normal
```

Vì chart sẽ nhấp nháy.

Dùng:

```yaml
warning_enter: 7.0
warning_exit: 6.7
critical_enter: 8.0
critical_exit: 7.6
```

Áp dụng cho mọi sensor dashboard.

## Debounce

Ví dụ:

```yaml
min_duration_above_threshold: 3s
```

hoặc:

```text
3 consecutive samples
```

trước khi event mở.

---

# 17. MULTICHART PERFORMANCE

## Giới hạn

Mỗi chart:

```text
120–300 points
```

Không giữ vô hạn.

Nếu cần history:

```text
raw data store riêng
chart chỉ giữ visible window
```

## React/Vue/JS

Tránh:

```text
setState → recreate chart → setState → recreate chart
```

Chart instance nên sống lâu.

Chỉ update dataset.

## Cleanup

Mọi:

```text
setInterval
setTimeout
WebSocket
EventSource
requestAnimationFrame
```

phải có cleanup.

---

# 18. CÁC LỖI CÓ XÁC SUẤT CAO

## BUG-CLASS A — stale closure

Triệu chứng:
- chart chỉ cập nhật giá trị cũ;
- scenario đổi nhưng chart vẫn chạy scenario cũ.

Fix:
- ref/state architecture rõ;
- cleanup interval;
- scenarioId/version token.

## BUG-CLASS B — duplicate interval

Triệu chứng:
- chart chạy nhanh dần;
- mỗi reset có thêm datapoint;
- CPU tăng.

Fix:
```text
stopSimulation()
clearInterval()
cancelAnimationFrame()
startSimulation()
```

## BUG-CLASS C — duplicate event

Triệu chứng:
- một crossing tạo 5 alerts.

Fix:
```text
eventId
lastState
debounce
```

## BUG-CLASS D — mixed units

Triệu chứng:
- chart nhìn đẹp nhưng không có ý nghĩa.

Fix:
- raw chart;
- normalized chart;
- small multiples;
- hoặc separate chart.

## BUG-CLASS E — random spike

Triệu chứng:
```text
5.1 → 8.9 → 5.0
```

Fix:
- smooth noise;
- rate limiter;
- max delta per tick.

## BUG-CLASS F — NaN

Check:

```javascript
Number.isFinite(value)
```

Nếu false:
```text
drop datapoint
```
hoặc dùng last-known-good.

## BUG-CLASS G — timestamp

Tất cả chart phải có:

```text
monotonic timestamp
```

Không để timestamp tương lai hoặc đảo ngược.

---

# 19. DATA VALIDATION CONTRACT

Mỗi metric phải pass:

```text
1. finite
2. correct unit
3. within hard clamp
4. delta within max rate
5. timestamp monotonic
6. scenario-compatible
```

Ví dụ:

```yaml
temperature:
  hard_min: -1
  hard_max: 12
  max_delta_per_sec: 0.35
```

Nếu simulator tạo:

```text
5.2 → 9.8
```

trong 1 sec:

```text
INVALID
```

---

# 20. SCENARIO TEST MATRIX

## VitalChain

```text
normal
door_open
compressor_failure
freeze_fault
recovery
reset
```

## PulseGuard

```text
normal
heavy_rain
landslide
communication_loss
recovery
reset
```

## FactSafe

```text
normal
gas_leak
dust_event
multi_hazard
recovery
reset
```

## AquaSense

```text
normal
dawn_oxygen_drop
sensor_fouling
recovery
reset
```

## Hirdop

```text
normal
high_load
flood
turbine_anomaly
offline
recovery
reset
```

## DataCool

```text
normal
hotspot
cooling_imbalance
ai_recommend
approve
reject
recovery
reset
```

## STEMLab

```text
correct
wrong_step
wrong_order
wrong_parameter
recovery
reset
```

## FireScout

```text
patrol
smoke
hotspot
person
critical
acknowledge
reset
```

## PAM

```text
green
yellow
red
gas_leak
recovery
reset
```

---

# 21. VIDEO-FIRST RULES

## 1920×1080

Target:

```text
header: 8–10%
KPI: 12–15%
hero: 45–55%
supporting: 20–25%
timeline/control: 8–12%
```

Không scroll.

## Animation

```yaml
micro_transition: 150-250ms
card_transition: 250-400ms
alert_enter: 300-500ms
critical_pulse: 1.2-2.0s
chart_update: 1s
scenario_transition: 2-8s
```

Không animate mọi thứ.

Chỉ animate:
- metric thay đổi;
- state transition;
- alert;
- AI recommendation;
- recovery.

---

# 22. UI PRIORITY

## Priority P0

Phải hoàn thành:

- HERO chart;
- current state;
- scenario button;
- alert;
- simulator;
- reset;
- stable data.

## Priority P1

- supporting charts;
- timeline;
- fleet/zone;
- mock notification;
- AI action.

## Priority P2

- report;
- advanced filters;
- secondary KPI;
- decorative animation.

## Priority P3

Không làm nếu chưa cần:

- authentication;
- real database;
- real SMS/Zalo;
- production notification;
- complicated permissions;
- real ML model;
- realtime cloud deployment.

---

# 23. CÂU HỎI CẦN CHỐT TRƯỚC KHI AGENT CODE

Không cần hỏi lại tất cả. Chỉ cần chốt những thứ có thể làm architecture thay đổi.

## Q1 — Chart library

Nếu codebase hiện tại đã dùng Chart.js:
→ tiếp tục Chart.js.

Nếu chưa:
→ chọn một chart library duy nhất cho nhóm dashboard.

Không trộn Chart.js + Recharts + ECharts chỉ vì mỗi chart.

## Q2 — Data transport

Nếu frontend-only:
→ simulator có thể chạy cùng process/browser.

Nếu muốn tách simulator:
→ WebSocket/SSE.

Không cần REST polling chỉ để demo realtime.

## Q3 — Replay

Nên có:

```text
deterministic replay
```

để quay lại cùng scenario.

## Q4 — Number of devices

Khuyến nghị:

```text
VitalChain: 6
PulseGuard: 4
FactSafe: 4 zones × 3 sensors
AquaSense: 3 ponds
Hirdop: 1 main unit
DataCool: 32 racks
```

Đây là demo scale, không phải claim production deployment.

## Q5 — Chart density

Default:
```text
1 hero + 2-3 supporting
```

Nếu video cần:
```text
1 hero + 4 supporting
```

Không vượt quá 5 animated visualizations trên cùng viewport.

---

# 24. CÂU HỎI KHÔNG NÊN HỎI USER

Agent không nên làm gián đoạn bằng các câu hỏi kiểu:

- "Bạn muốn màu xanh hay xanh đậm?"
- "Bạn muốn animation 0.3 hay 0.5 giây?"
- "Bạn muốn random 5 hay 10 điểm?"
- "Bạn muốn chart cao bao nhiêu px?"

Những thứ này phải được quyết định bằng design system.

Chỉ hỏi khi câu trả lời có thể thay đổi architecture hoặc câu chuyện demo.

---

# 25. CÁCH PHÂN BIỆT DOMAIN FACT VÀ DEMO

UI có thể hiển thị:

```text
Configured threshold
```

thay vì:

```text
Legal limit
```

cho các giá trị chưa được xác nhận.

Ví dụ:

### VitalChain
2–8°C có domain support cho phần lớn vaccine trong cold chain.
Nhưng từng vaccine có thể có specification riêng.

### FactSafe
Exposure limits của NH3/H2S/CO phụ thuộc tiêu chuẩn và mục đích.
Không dùng demo threshold để tuyên bố QCVN/OSHA/NIOSH compliance.

### AquaSense
DO/pH/salinity/temp phụ thuộc loài, giai đoạn nuôi và hệ thống ao.
Không coi một range demo là universal.

### DataCool
ASHRAE có recommended/allowable ranges và phải phân biệt hai khái niệm.
Không dùng một threshold demo làm shutdown limit.

### Hirdop/PulseGuard
Ngưỡng water level, vibration, tilt, rainfall cần dữ liệu địa điểm/thiết bị thực tế nếu muốn claim engineering.

---

# 26. ACCEPTANCE TEST CHO MULTICHART

## Test A — Normal

Sau 2 phút:

```text
không có critical event
không có spike bất thường
chart không nhảy
memory không tăng liên tục
```

## Test B — Scenario

Click scenario.

Expected:

```text
chart changes
→ threshold crossing
→ state changes
→ event appears
→ alert appears
→ action appears
```

## Test C — Recovery

Expected:

```text
critical
→ action
→ recovering
→ normal
```

Không reset ngay về normal.

## Test D — Reset

Click reset.

Expected:

```text
old timer stopped
old interval stopped
old events cleared
chart returns baseline
scenario = normal
```

## Test E — Switch scenario quickly

```text
door_open
→ compressor_failure
→ freeze_fault
→ normal
```

Không có event từ scenario cũ xuất hiện trong scenario mới.

## Test F — Long run

Chạy 10–15 phút.

Check:

```text
CPU
memory
FPS
chart point count
duplicate events
interval count
```

---

# 27. FINAL CHECKLIST CHO AGENT

Trước khi nói DONE:

```text
[ ] shared chart component exists
[ ] simulator is deterministic
[ ] scenario is deterministic
[ ] random noise is smooth
[ ] hard clamps exist
[ ] max delta exists
[ ] threshold hysteresis exists
[ ] event debounce exists
[ ] timestamp is monotonic
[ ] chart points are bounded
[ ] interval cleanup works
[ ] reset works
[ ] scenario switching works
[ ] no mixed-unit Y-axis
[ ] no duplicate events
[ ] no NaN
[ ] no blank chart
[ ] no console errors
[ ] 1920x1080 looks correct
[ ] 1366x768 looks acceptable
[ ] record mode works
[ ] alert animation works
[ ] recovery animation works
[ ] reduced-motion does not break UI
```

---

# 28. ƯU TIÊN TRIỂN KHAI

## Phase 1

Shared:

```text
ChartBase
LineChart
MultiLineChart
AreaBandChart
BarChart
Gauge
Heatmap
```

## Phase 2

Simulator:

```text
SeededRandom
SmoothNoise
Ramp
Scenario
StateMachine
Threshold
Hysteresis
EventEngine
```

## Phase 3

VitalChain

Lý do:
- đơn giản nhất;
- kiểm chứng toàn bộ framework;
- dễ quay video;
- có clear story.

## Phase 4

PulseGuard

Kiểm chứng:
- multi-sensor correlation;
- offline/local alarm.

## Phase 5

FactSafe

Kiểm chứng:
- multi-metric normalization;
- zone aggregation.

## Phase 6

AquaSense

Kiểm chứng:
- learned band;
- day/night curve;
- sensor quality.

## Phase 7

Hirdop

Kiểm chứng:
- derived metrics;
- energy accumulation;
- machine anomaly.

## Phase 8

DataCool

Kiểm chứng:
- spatial heatmap;
- AI recommendation;
- human approval.

## Phase 9

STEMLab / FireScout / PAM

Không ép vào dashboard template.

---

# 29. KẾT LUẬN

Điểm quan trọng nhất không phải tạo càng nhiều random data càng tốt.

Một simulator tốt phải khiến người xem tin rằng:

```text
sensor → signal → pattern → anomaly → decision → action → recovery
```

đang thật sự xảy ra.

Vì vậy:

```text
LESS RANDOM
MORE CAUSALITY
```

và:

```text
LESS CHART
MORE STORY
```

Mỗi project chỉ cần một câu chuyện visual chính:

```text
VitalChain  = temperature excursion
PulseGuard  = multi-sensor hazard agreement
FactSafe    = localized industrial hazard
AquaSense   = biological rhythm deviation
Hirdop      = infrastructure anomaly
DataCool    = spatial thermal hotspot + AI recommendation
STEMLab     = learning error → correction
FireScout   = detection → command
PAM         = gas level → physical alarm
```

Nếu agent giữ đúng các nguyên tắc trên, simulator có thể dùng cho:
- quay video;
- screenshot;
- slide;
- live demo;
- regression testing;

mà không cần backend production.

---

# 30. WEB RESEARCH / DOMAIN REFERENCES

Các nguồn dưới đây chỉ dùng để kiểm tra domain plausibility. Không được lấy một con số từ đây rồi tự động biến thành threshold cho mọi deployment.

1. WHO — Controlled Temperature Chain / vaccine cold chain.
2. PAHO/WHO — vaccine storage temperature.
3. CDC — Storage and Handling of Immunobiologics.
4. ASHRAE Handbook — Data Center environmental guidelines.
5. US EPA — Aquatic Life Criteria / ammonia.
6. OSHA / NIOSH — occupational gas exposure limits.

Các giá trị trong phần `DEMO-DEFAULT` vẫn phải được xem là dữ liệu mô phỏng cho pitch/demo nếu chưa có hồ sơ thiết bị, địa điểm, tiêu chuẩn áp dụng và calibration data tương ứng.