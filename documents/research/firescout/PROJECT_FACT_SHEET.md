# FireScout AI — hồ sơ thực trạng dự án

Rà soát 27/10/2026. [Sổ nguồn/xung đột](../shared/2026-10-27_PROJECT_KNOWLEDGE_AUDIT.md). Không có proposal/pitch gốc trong kho.

| Chủ đề | Kết quả trích xuất | Phân loại | Nguồn cụ thể |
| --- | --- | --- | --- |
| Vấn đề | Thiếu thông tin hiện trường khi trinh sát cháy, khó quan sát và phối hợp trong điều kiện khói/liên lạc hạn chế | PROJECT_PROPOSAL | [Đặc tả UAV](../../specifications/FIRESCOUT_UAV_DASHBOARD_CODEX_SPEC.md) “Project context”; scenarios v1.0 §4 |
| Hệ thống định hướng | UAV + camera thường/nhiệt + phát hiện hỗ trợ AI + dashboard chỉ huy | PROJECT_PROPOSAL | Đặc tả scenarios §0 dẫn proposal trang 3–6, 8–9 và pitch slide 3–4 |
| Hiện vật | Bản đồ nhiệm vụ giả lập, hướng/tốc độ gió, nhiệt độ ROI tổng hợp, candidate track và score chưa hiệu chuẩn | PROJECT_VERIFIED | [Config](../../../frontend/src/projects/firescout/config.ts); [delivery](../../development/FIRESCOUT_UAV_DELIVERY.md) “Delivered behavior”; [FireScoutSimulator](../../../simulator/scenario_models.py) dòng 390 trở đi |
| Tình huống | Routine reconnaissance, hotspot/candidate, smoke/link degradation; kịch bản tiếp tục giám sát sau pha script | PROJECT_VERIFIED | Delivery “Scenarios”; alias cũ được ghi tại K03 |
| Local analyst | Có code proxy local Ollama để hỏi về telemetry mô phỏng; model phải có sẵn, đầu ra có thể sai | PROJECT_VERIFIED về code demo | [firescout_chat.py](../../../simulator/firescout_chat.py), `create_chat_app`; delivery “Local Ollama chat” |
| Nhận diện thực | Không video thật, radiometric stream, vision inference đã kiểm chứng, calibrated confidence hoặc flight logs thực | PROJECT_VERIFIED về giới hạn | README; delivery “Remaining limitations”; không coi LLM chat là AI phát hiện người |
| Khách hàng | Đội PCCC công nghiệp, quản lý ứng cứu nhà máy, khu công nghiệp, doanh nghiệp dịch vụ PCCC, đối tác công nghệ/pilot | PROJECT_PROPOSAL | Định hướng người dùng 27/10/2026; chưa có hợp đồng/endorsement |
| USP dự kiến | Gắn thông tin nhiệt, vị trí và độ tin cậy dữ liệu với quyết định của người vận hành | PROJECT_PROPOSAL | Đặc tả/dashboard hiện có; chưa benchmark hệ thống thực |
| Kinh doanh | Đồng phát triển, tích hợp và dịch vụ pilot là phương án nghiên cứu | PROJECT_ASSUMPTION | Không tìm thấy mô hình thương mại được duyệt |
| Tài chính | Hai mức chi phí nguyên mẫu được tài liệu trung gian báo là khác nhau; không có số tiền hoặc phiên bản gốc | NEEDS_VERIFICATION | K02; không suy ra giá bán, BOM hoặc vốn gọi |
| Giai đoạn/giới hạn | Software demonstrator; không điều khiển UAV, không tự chữa cháy, không xác nhận phát hiện xuyên khói/định vị nạn nhân ngoài thực địa | PROJECT_VERIFIED về giới hạn demo | README, delivery; K08 |

## Mốc tiếp theo đề xuất

PROJECT_ASSUMPTION: xác định nhiệm vụ và điều kiện khai thác → rà soát pháp lý UAV/địa điểm/người điều khiển → chọn phần cứng/camera → thu dữ liệu có nhãn độc lập → thử nghiệm dưới giám sát, ghi lỗi/bỏ sót và giới hạn → đánh giá với đơn vị ứng cứu → mới xác nhận hiệu quả và mô hình dịch vụ. Không có lịch pilot hoặc giấy phép đã được chứng minh.

Định hướng “hỗ trợ trinh sát nhanh hơn và có thêm thông tin” cần dùng như mục tiêu phát triển. Không chuyển thành cam kết tốc độ ứng cứu, số người được cứu hoặc hoạt động tự động đã hoàn thiện.
