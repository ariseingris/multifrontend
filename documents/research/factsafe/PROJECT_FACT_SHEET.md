# FactSafe — hồ sơ thực trạng dự án

Rà soát 27/10/2026. [Kiểm kê/xung đột](../shared/2026-10-27_PROJECT_KNOWLEDGE_AUDIT.md). Không có bản `USTH_Inn 2026_FactSafe.docx`; các nội dung proposal dưới đây là dẫn lại từ đặc tả.

| Chủ đề | Kết quả trích xuất | Phân loại | Nguồn cụ thể |
| --- | --- | --- | --- |
| Vấn đề | Cần quan sát khí, bụi, vi khí hậu và vị trí vùng có dấu hiệu nguy cơ trong nhà máy | PROJECT_PROPOSAL | [Master plan](../../specifications/DEMO_FRONTEND_MASTER_PLAN.md) §10; [scenarios v1.0](../../specifications/MULTIFRONTEND_SCENARIOS_CODEX_SPEC.md) §3 |
| Sản phẩm định hướng | Hệ thống cảnh báo môi trường công nghiệp; tổng hợp rủi ro theo vùng | PROJECT_PROPOSAL | Đặc tả dẫn hồ sơ FactSafe trang 4, 6–8 |
| Hiện vật | Metric NH3, CO, H2S, CH4, PM2.5, PM10, nhiệt độ/độ ẩm; risk score demo; normal/gas_leak/dust_event | PROJECT_VERIFIED | [Config](../../../frontend/src/projects/factsafe/config.ts), [FactSafeSimulator](../../../simulator/scenario_models.py) dòng 322–387 |
| Giá trị risk score | Hàm chuẩn hóa lấy mức lớn nhất của NH3 và PM2.5 so với hằng demo, giới hạn 0–100 | PROJECT_VERIFIED về phép tính demo | `FactSafeSimulator.risk`, dòng 346; không phải xác suất tai nạn, liều phơi nhiễm hoặc thang pháp lý |
| Khách hàng | Quản lý nhà máy, EHS, bộ phận an toàn, doanh nghiệp sản xuất, đối tác IIoT | PROJECT_PROPOSAL | Định hướng người dùng 27/10/2026; chưa xác nhận nhu cầu qua nghiên cứu khách hàng |
| USP dự kiến | Đưa khí, bụi và ngữ cảnh theo vùng vào một câu chuyện xử lý sự kiện | PROJECT_PROPOSAL | Master plan §10; chưa có benchmark chứng minh tốt hơn hệ thống hiện hành |
| SMS/Zalo, báo cáo QCVN | Có trong master plan; chưa có bằng chứng tích hợp thật hoặc báo cáo đáp ứng yêu cầu pháp lý | PROJECT_PROPOSAL | K06 trong sổ xung đột |
| Mô hình doanh thu | Thiết bị, tích hợp và dịch vụ duy trì là phương án nghiên cứu; chưa có giá/gói được duyệt | PROJECT_ASSUMPTION | Hồ sơ gốc vắng mặt; không sao chép gói thuê bao đối thủ |
| Tài chính/traction | Không có doanh thu, số khách hàng, BOM, kết quả hoàn vốn đáng tin trong tài liệu được kiểm tra | NEEDS_VERIFICATION | Kiểm kê tài liệu; không coi số zone/sensor demo là khách hàng thực |
| Giai đoạn | Dashboard + simulator; thông báo và lịch sử phục vụ trình diễn | PROJECT_VERIFIED | [README](../../../README.md); [delivery telemetry](../../development/AQUASENSE_FACTSAFE_TELEMETRY_FIX.md) |
| Giới hạn | Không hệ thống đo công nghiệp được chứng nhận; không thay đánh giá EHS, phép đo đúng phương pháp hoặc quy trình ứng cứu | PROJECT_VERIFIED về phạm vi demo | README; scenarios §0 và §3 |

## Hướng phát triển, chưa phải cam kết

PROJECT_ASSUMPTION: chọn ngành/nhà máy mục tiêu → xác định chất và kiểu đo phù hợp → làm việc với EHS/đơn vị đủ điều kiện → kiểm chuẩn, thử nghiệm cảnh báo và tích hợp → đánh giá độ tin cậy và trách nhiệm vận hành → mới xem xét gói dịch vụ và tuyên bố tuân thủ. Không có ngân sách/mốc lịch được xác nhận.

Thông điệp định hướng: nâng cao khả năng quan sát môi trường công nghiệp và nhận biết dấu hiệu nguy cơ. Chưa được viết “đảm bảo an toàn”, “ngăn ngừa mọi tai nạn” hay “đạt QCVN”.
