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
