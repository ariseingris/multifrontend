# AquaSense — hồ sơ thực trạng dự án

Rà soát 27/10/2026. [Kiểm kê và xung đột nguồn](../shared/2026-10-27_PROJECT_KNOWLEDGE_AUDIT.md). PROJECT_VERIFIED ở đây chỉ xác nhận hiện vật demo trong kho.

| Chủ đề | Thông tin có thể rút ra | Phân loại | Nguồn cụ thể |
| --- | --- | --- | --- |
| Vấn đề | Biến động chất lượng nước ao tôm, nhất là oxy gần sáng; cần phân biệt sự cố ao và chất lượng đầu dò | PROJECT_PROPOSAL | Đặc tả scenarios v1.0 §2; master plan §11 |
| Sản phẩm định hướng | Theo dõi DO, pH, ORP, độ mặn, nhiệt độ và nhận biết thay đổi theo nhịp ngày/đêm | PROJECT_PROPOSAL | Đặc tả scenarios §0 và §2 dẫn proposal/pitch gốc chưa có |
| Hiện vật | Config năm đại lượng, ba kịch bản; simulator liên tục, biểu đồ, sự kiện và trạng thái chất lượng dữ liệu | PROJECT_VERIFIED | [Config](../../../frontend/src/projects/aquasense/config.ts), [simulator](../../../simulator/scenario_models.py), lớp AquaSenseSimulator dòng 226; [delivery](../../development/AQUASENSE_CONTINUOUS_SIMULATION.md) |
| Chất lượng đầu dò | Kịch bản sensor_fouling tạo đầu dò suy giảm, không tự coi là ao thiếu oxy | PROJECT_VERIFIED | Lớp AquaSenseSimulator và delivery “Model and lifecycle” |
| Điểm khác biệt dự kiến | Giải thích biến động sinh học và chất lượng đầu dò bằng ngôn ngữ vận hành | PROJECT_PROPOSAL | Master plan §11.2; cần so sánh hiệu quả thực địa, chưa phải ưu thế độc quyền |
| Khách hàng | Chủ trại tôm, hợp tác xã, doanh nghiệp thủy sản, nhà phân phối nông nghiệp, đối tác pilot | PROJECT_PROPOSAL | Định hướng marketing người dùng cung cấp ngày 27/10/2026; chưa có bằng chứng phỏng vấn hoặc hợp đồng |
| Mô hình thương mại | Thiết bị + triển khai + phí phần mềm/bảo trì là phương án để nghiên cứu | PROJECT_ASSUMPTION | Không tìm thấy mô hình đã duyệt trong hồ sơ gốc; không chuyển mô hình đối thủ thành mô hình AquaSense |
| Tài chính | Giá thiết bị, BOM, doanh thu, biên lợi nhuận và hoàn vốn chưa xác nhận | NEEDS_VERIFICATION | K01; hai giá trị xung đột không được lưu lại trong đặc tả |
| AI | Kalman/LSTM được đề xuất; chưa có bằng chứng mô hình dự báo được huấn luyện/đánh giá độc lập | PROJECT_PROPOSAL | Đặc tả scenarios §0; `aiEngine: false` trong config |
| Giai đoạn | Software demonstrator; chưa xác nhận phần cứng/khách hàng trả tiền/pilot ngoài ao | PROJECT_VERIFIED đối với demo; NEEDS_VERIFICATION đối với triển khai | [README](../../../README.md), “All current scenario readings … SIMULATED” |
| Giới hạn | Không dữ liệu cảm biến thật, không điều khiển quạt thực, không xác nhận tăng tỷ lệ sống hoặc tiết kiệm điện | PROJECT_VERIFIED về giới hạn demo | README; delivery liên tục; source tạo dữ liệu tổng hợp |

## Mốc tiếp theo được đề xuất

PROJECT_ASSUMPTION: thu thập bản proposal/pitch đúng phiên bản → chốt cấu hình cảm biến và chi phí → thiết kế pilot ao có đối chứng/nhật ký vận hành → đo uptime, độ trễ, sai lệch và công bảo trì → xác nhận lợi ích kinh tế → mới lập gói thương mại. Chưa có lịch hoàn thành, ngân sách hay cam kết triển khai được phê duyệt.

Thông điệp nền: “Theo dõi môi trường liên tục để hỗ trợ nhận biết rủi ro sớm hơn” là định hướng sản phẩm. Bản công bố hiện tại phải bổ sung “nguyên mẫu” hoặc “bản trình diễn mô phỏng”, không hứa bảo vệ mùa vụ bằng kết quả đã đạt.
