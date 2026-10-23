# BUGBOOK - Demo Frontend Platform

Tài liệu này ghi lại các lỗi đã gặp và quy tắc phòng tránh khi mở rộng các frontend/simulator khác.

## 1. WebSocket handler sai chữ ký

**Triệu chứng**

```text
TypeError: SimulatorServer.handle_client() missing 1 required positional argument: 'path'
connection handler failed
```

**Nguyên nhân**

`websockets` bản mới gọi handler với một argument (`websocket`), trong khi code cũ yêu cầu hai argument (`websocket, path`).

**Cách xử lý**

Dùng `path` tùy chọn:

```python
async def handle_client(websocket, path=None):
    ...
```

**Phòng tránh**

- Kiểm tra version `websockets` trong môi trường đang chạy, không chỉ trong `requirements.txt`.
- Sau khi đổi API WebSocket, phải chạy test client kết nối thật và nhận ít nhất một message telemetry.

## 2. Frontend chạy nhưng không thực sự dùng simulator

**Triệu chứng**

Chart vẫn thay đổi khi chỉ chạy `npm run dev`, hoặc dữ liệu trông random.

**Nguyên nhân**

`npm run dev` chỉ chạy Vite. Frontend có fallback `useLocalTelemetrySimulation()` khi WebSocket chưa kết nối. Fallback trước đây dùng `Math.random()` độc lập, nên có thể che giấu việc simulator không hoạt động.

**Phòng tránh**

- Chạy hai process riêng:

```bash
cd simulator
../.venv/bin/python vitalchain_simulator.py --scenario door_open --speed 1

cd frontend
npm run dev
```

- UI phải hiển thị rõ trạng thái WebSocket.
- Không dùng dữ liệu local random để xác nhận simulator hoạt động.
- Khi WebSocket mở, fallback local phải dừng ngay.

## 3. Trạng thái WebSocket bị stale

**Triệu chứng**

Hook đã kết nối nhưng `isConnected` vẫn là `false`, hoặc fallback chạy song song với simulator.

**Nguyên nhân**

Đọc trực tiếp `wsRef.current?.readyState` không làm React render lại.

**Phòng tránh**

Dùng state riêng và cập nhật trong `onopen`/`onclose`:

```ts
const [isConnected, setIsConnected] = useState(false);
```

Timer reconnect phải được cleanup khi component unmount.

## 4. Nút điều khiển không gửi lệnh tới simulator

**Triệu chứng**

Bấm Run/Pause/Reset/Speed chỉ thay đổi giao diện, simulator không đổi state.

**Nguyên nhân**

Control component chỉ cập nhật Zustand local, không gọi `send()` qua WebSocket.

**Phòng tránh**

Map rõ các lệnh:

```text
Run    -> start_scenario
Pause  -> pause
Resume -> resume
Reset  -> reset
Speed  -> set_speed
```

Resume phải gửi `resume`, không gọi lại `start_scenario` vì sẽ reset scenario.

## 5. Dữ liệu nhảy mạnh hoặc đổi xu hướng đột ngột

**Nguyên nhân đã xác minh**

- Nội suy tuyến tính đổi độ dốc tại biên step.
- `hash(... int(elapsed))` tạo nhiễu nhảy bậc mỗi giây.
- Broadcast mỗi `0.1s` làm chart có quá nhiều điểm.

**Quy tắc hiện tại**

- Dùng chuyển tiếp mượt giữa các step.
- Nhiễu phải deterministic, liên tục và biên độ nhỏ.
- Telemetry broadcast mặc định mỗi `1.0s`.
- Kiểm tra continuity tại `endAt - 0.1`, `endAt`, `endAt + 0.1`.

## 6. Build frontend thất bại vì cấu hình thiếu hoặc import sai

**Các lỗi đã gặp**

- `tsconfig.json` tham chiếu `tsconfig.node.json` nhưng file không tồn tại.
- Các component trong `core/components` import `../../store` thay vì `../store`.
- Hook `useLocalTelemetrySimulation` bị import từ `store` thay vì `hooks/useDataBridge`.
- `Charts.tsx` có duplicate JSX prop và component động không được TypeScript suy luận đúng.

**Phòng tránh**

Sau mọi thay đổi shared core, chạy:

```bash
cd frontend
npm run build
```

Không coi dev server khởi động được là đủ; phải chạy `tsc`/production build.

## 7. Port simulator bị chiếm

**Triệu chứng**

```text
OSError: [Errno 98] address already in use
```

**Phòng tránh**

- Chỉ chạy một simulator trên port `8765`.
- Dừng process cũ bằng `Ctrl+C` trước khi chạy lại.
- Kiểm tra port nếu cần:

```bash
ss -ltnp | grep ':8765'
```

- Có thể dùng port khác và cập nhật URL WebSocket frontend tương ứng.

## 8. Python environment không đồng nhất

**Triệu chứng**

Một môi trường báo đã cài `websockets`, nhưng interpreter chạy simulator lại báo `ModuleNotFoundError`.

**Nguyên nhân**

Package được cài vào environment khác với `.venv` đang chạy.

**Phòng tránh**

Luôn dùng cùng executable cho install và run:

```bash
.venv/bin/python -m pip install -r simulator/requirements.txt
.venv/bin/python simulator/vitalchain_simulator.py
```

## 9. Frontend freeze sau thời gian chạy dài

**Triệu chứng**

Sau khi chạy lâu, dashboard/chart bị chậm hoặc không còn generate/render dữ liệu.

**Nguyên nhân gốc đã xác minh**

- `timeline.events` tăng vô hạn; mỗi event tạo một mảng mới bằng spread.
- `alerts` cũng tăng vô hạn trong các scenario critical.
- Timer scenario phụ thuộc `elapsedSeconds`, nên interval bị hủy và tạo lại mỗi `100ms`.

**Cách xử lý**

- Giới hạn timeline ở `200` event gần nhất.
- Giới hạn alert history ở `100` alert gần nhất.
- Dùng action `advanceElapsed()` để một interval cố định cập nhật elapsed time.

**Phòng tránh**

- Mọi store nhận dữ liệu theo thời gian phải có giới hạn lịch sử.
- Không tạo interval phụ thuộc vào chính biến mà interval cập nhật.
- Chạy stress test dài và theo dõi số lượng telemetry/event/alert cũng như memory.

## 10. Checklist trước khi thêm project mới

- [ ] Chạy simulator bằng đúng Python environment.
- [ ] Kiểm tra callback WebSocket tương thích version đang dùng.
- [ ] Frontend hiển thị trạng thái kết nối thật.
- [ ] Không có fallback random chạy khi WebSocket đã mở.
- [ ] Run/Pause/Resume/Reset/Speed gửi đúng command.
- [ ] Simulator phát telemetry ở sampling rate đã định nghĩa.
- [ ] Metric deterministic, có quan hệ nhân quả và không jump tại phase boundary.
- [ ] Có test client nhận telemetry qua WebSocket.
- [ ] `npm run build` pass.
- [ ] `python -m py_compile simulator/vitalchain_simulator.py` pass.
- [ ] Kiểm tra port trước khi kết luận simulator hỏng.

## 11. Quy tắc cập nhật BUGBOOK

Khi gặp lỗi mới, ghi ngay:

1. Triệu chứng và log nguyên bản.
2. Điều kiện tái hiện.
3. Nguyên nhân gốc, không chỉ workaround.
4. File/code path đã sửa.
5. Lệnh kiểm tra xác nhận fix.
6. Quy tắc phòng tránh cho project tiếp theo.

## 12. PulseGuard dashboard không tiến triển đồng hồ và tạo alert trùng

**Triệu chứng**

- Bấm `RUN SCENARIO` nhưng `ScenarioControl` vẫn hiển thị thời gian `00:00` và phase không đổi.
- Một alert critical mới được tạo ở frontend cho mỗi telemetry, đồng thời simulator cũng phát alert theo cooldown.

**Nguyên nhân**

- Dashboard PulseGuard chưa có interval gọi `advanceElapsed()`, trong khi VitalChain đang tự quản lý interval này.
- `PulseGuardDashboard` gọi `addAlert()` trực tiếp từ mỗi telemetry critical; simulator đã là nơi sở hữu logic threshold và phát alert qua WebSocket.

**Cách xử lý**

- Thêm một interval cố định 100 ms trong dashboard để cập nhật scenario clock khi status là `running`, có cleanup khi unmount.
- Bỏ frontend-generated alert; chỉ nhận alert từ WebSocket simulator.

**Xác nhận**

```bash
cd frontend
npm run build

cd ..
python3 -m py_compile simulator/vitalchain_simulator.py
```

**Phòng tránh**

- Chỉ một lớp được sở hữu alert threshold cho mỗi project; frontend chỉ render alert từ simulator.
- Mọi dashboard có `ScenarioControl` phải có fixed interval cập nhật elapsed time và không đặt interval phụ thuộc vào chính giá trị elapsed.

## 13. PulseGuard fallback tạo trạng thái offline giả và spam console

**Triệu chứng**

- Khi simulator chưa chạy, PulseGuard vẫn nhận dữ liệu random nhưng thiếu các metric `*_index`, `network_online` và `local_alarm`.
- Header có thể hiển thị `INTERNET OFFLINE`/`LOCAL ALARM ACTIVE` dù chưa có scenario simulator nào chạy.
- Console lặp `WebSocket error` theo mỗi lần reconnect.

**Nguyên nhân**

- `useLocalTelemetrySimulation()` sinh random theo `ProjectConfig.metrics`, nhưng PulseGuard cần quan hệ causal và các metric trạng thái do simulator tạo.
- Hook log mỗi lỗi connection trong reconnect loop.

**Cách xử lý**

- Tắt random fallback riêng cho PulseGuard; các trạng thái offline chỉ được hiển thị từ telemetry simulator thật.
- Chỉ log lần đầu trong một chu kỳ mất kết nối; reset cờ log khi kết nối thành công.

**Xác nhận**

```bash
cd frontend
npm run build
```

Sau đó mở PulseGuard khi port `8765` không có listener: UI không sinh metric random PulseGuard và console không spam một lỗi cho mỗi reconnect.

**Phòng tránh**

- Không dùng fallback random cho project có metric derived/status hoặc yêu cầu causal story.
- Reconnect loop phải có logging throttling; trạng thái connection vẫn phải cập nhật bằng React state.

## 14. PulseGuard phase hiển thị critical trước khi sensor risk tăng

**Triệu chứng**

- Chọn `Landslide Risk` rồi bấm chạy: `ScenarioControl` hiển thị `Phase: CRITICAL` ngay lập tức nhưng metric vẫn ở baseline (`rain≈2`, `risk=15`).

**Nguyên nhân**

- Dashboard lấy `phase` từ step đầu tiên trong config. Các scenario PulseGuard dùng step mô tả toàn bộ câu chuyện và có phase `critical`, nên phase UI không phản ánh telemetry hiện tại.

**Cách xử lý**

- Khởi động scenario ở phase `normal`.
- Cập nhật phase từ `latest.status` và `local_alarm` của telemetry simulator trong mỗi tick.

**Xác nhận**

```bash
cd frontend
npm run build
```

Runtime: khi bắt đầu `landslide`, phase là `NORMAL` ở baseline và chỉ đổi `WARNING`/`CRITICAL`/`ALERT` khi sensor values vượt điều kiện.

**Phòng tránh**

- Không dùng phase tĩnh của config làm runtime state nếu simulator không gửi phase theo telemetry.
- Runtime state phải được dẫn xuất từ telemetry hoặc protocol event.

## 15. Dashboard rỗng trước khi chạy scenario

**Triệu chứng**

- Chart không có line và gauge hiển thị `0.0` trước khi bấm `RUN SCENARIO`.
- Frontend đã kết nối nhưng chưa có telemetry baseline để render.

**Nguyên nhân**

- `main()` chỉ tạo simulator khi scenario khác `normal` hoặc speed khác `1.0`.
- Khi khởi động với project/scenario mặc định, WebSocket server chạy nhưng `self.simulator` vẫn là `None`.

**Cách xử lý**

- Luôn tạo simulator lúc server khởi động, kể cả scenario `normal`, để phát baseline telemetry.
- Lệnh `start_scenario` vẫn thay thế simulator bằng scenario được chọn.

**Xác nhận**

```bash
python3 simulator/vitalchain_simulator.py --project pulseguard
```

Kết nối WebSocket phải nhận telemetry baseline trước khi gửi `start_scenario`; sau đó scenario mới làm risk/chart nổi bật.

**Phòng tránh**

- Server phải phát baseline stream ngay khi dashboard kết nối.
- Không dùng random fallback frontend làm thay thế cho simulator thật.

## 16. FactSafe chart lặp bar, giữ dữ liệu scenario cũ và thiếu timeline alert

**Triệu chứng**

- Dust chart hiển thị hàng trăm bar giống nhau theo từng timestamp, khó đọc và không thể hiện “giá trị hiện tại”.
- Khi đổi scenario, chart giữ spike của scenario trước rồi nối sang baseline mới, tạo cảm giác dữ liệu giả hoặc tụt bất thường.
- Alert popup xuất hiện nhưng Live Events không có dòng tương ứng.

**Nguyên nhân**

- `LiveChart` dùng toàn bộ telemetry history cho `BarChart`; mỗi sample trở thành một bar.
- `ScenarioControl.handleStart()` không xoá telemetry/alert/event history trước khi gửi `start_scenario`.
- `useDataBridge` chỉ đưa message `alert` vào AlertStore, không tạo TimelineEvent.

**Cách xử lý**

- Thêm `latestOnly` cho `LiveChart` và bật cho dust chart FactSafe.
- Xoá history khi bắt đầu scenario mới, giống reset semantics.
- Tạo timeline event từ alert WebSocket với severity/icon tương ứng.

**Xác nhận**

```bash
cd frontend
npm run build
```

Runtime FactSafe: dust chart chỉ có sample hiện tại, scenario mới không giữ spike cũ, alert xuất hiện cả ở popup và Live Events.

**Phòng tránh**

- Bar chart realtime phải hiển thị snapshot hoặc aggregate có chủ đích, không vẽ toàn bộ time series mặc định.
- Scenario transition phải reset history hiển thị trước khi nạp dữ liệu mới.
- Mọi alert từ simulator phải có representation trong timeline nếu UI có event feed.

## 17. FactSafe latest-sample dust chart trông như đứng yên

**Triệu chứng**

- Dust chart chỉ còn hai cột đúng như thiết kế snapshot, nhưng chiều cao gần như không đổi giữa các telemetry sample.
- Người xem có cảm giác dữ liệu bị hard-code hoặc không được simulator cập nhật.

**Nguyên nhân**

- Baseline deterministic noise của PM2.5/PM10 có biên độ quá nhỏ (`0.3`/`0.5`) so với thang đo chart.
- Việc giảm lịch sử xuống latest sample làm dao động nhỏ càng khó nhìn thấy.

**Cách xử lý**

- Tăng smooth deterministic noise lên `4.5` cho PM2.5 và `8.0` cho PM10.
- Giữ giá trị bounded theo domain range; không dùng random độc lập mỗi tick.

**Xác nhận**

```bash
python3 -m py_compile simulator/vitalchain_simulator.py
python3 - <<'PY'
import sys
sys.path.insert(0, 'simulator')
from vitalchain_simulator import FactSafeSimulator
sim = FactSafeSimulator('normal')
values = []
for elapsed in range(8):
    sim.elapsed = elapsed
    metrics = sim.get_metrics()
    values.append((metrics['pm25_ug_m3'], metrics['pm10_ug_m3']))
assert len(set(values)) > 1
PY
```

**Phòng tránh**

- Khi dùng snapshot chart, kiểm tra biên độ thay đổi trên thang đo thực tế, không chỉ kiểm tra rằng giá trị có khác nhau về mặt số học.
- Noise phải liên tục, deterministic và đủ rõ để demo quan sát được.
