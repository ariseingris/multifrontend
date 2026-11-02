# Kiểm kê tri thức dự án và xung đột nguồn

Ngày rà soát: 27/10/2026. Phạm vi: kho mã cục bộ, gồm cả tài liệu bị Git ignore, loại trừ thư viện, build, cache và thư mục thông tin xác thực. Không truy cập tài khoản riêng hoặc giả định tài liệu trên GitHub đã có trong workspace.

## Tài liệu thực sự có

- [README hiện hành](../../../README.md), [DEVELOPMENT_LOG](../../../DEVELOPMENT_LOG.md), [AGENTS](../../../AGENTS.md).
- [Đặc tả scenarios v1.0, 23/10/2026](../../specifications/MULTIFRONTEND_SCENARIOS_CODEX_SPEC.md); phần “Nguồn đã tham chiếu” dẫn hồ sơ gốc nhưng không chứa toàn văn.
- [Master plan lịch sử](../../specifications/DEMO_FRONTEND_MASTER_PLAN.md), các phần FactSafe, AquaSense, FireScout và giới hạn claim.
- [Sửa telemetry](../../development/AQUASENSE_FACTSAFE_TELEMETRY_FIX.md), [AquaSense liên tục](../../development/AQUASENSE_CONTINUOUS_SIMULATION.md), [FireScout đã bàn giao](../../development/FIRESCOUT_UAV_DELIVERY.md), [dọn còn ba dự án](../../development/KEEP_THREE_PROJECTS.md).
- Báo cáo marketing/evidence và bộ nguồn pilot 27/10/2026 trong từng thư mục dự án. Đây là nghiên cứu đối thủ, không phải xác nhận thành tích sản phẩm.
- Source config của ba dự án và các lớp simulator; đã kiểm tra tĩnh. Không chạy lại demo hay lấy kết quả test cũ làm kết quả kiểm thử phiên này.

## Hồ sơ gốc không tìm thấy

| Hồ sơ được đặc tả dẫn lại | Vị trí gốc được nhắc | Trạng thái và hệ quả |
| --- | --- | --- |
| `AquaSense_Ban_De_Xuat_Dau_Tu.docx.pdf` | Trang 6–7, 9, 14 | Không có bản gốc; Kalman/LSTM và ý tưởng sản phẩm chỉ là trích dẫn gián tiếp |
| `AquaSense_Pitch.pptx` | Slide 4 | Không có bản gốc; không xác nhận giá/BOM hoặc phiên bản kinh doanh |
| `USTH_Inn 2026_FactSafe.docx` | Trang 4, 6–8 | Không có bản gốc; khách hàng, mô hình doanh thu và dự toán chưa được xác lập |
| `USTH_Inn 2026_FireScout AI.docx` | Trang 3–6, 8–9 | Không có bản gốc; chưa xác nhận ngân sách, lộ trình hay thử nghiệm bay |
| `firescout-của-khánh.pptx` | Slide 3–4 | Không có bản gốc; không dùng nội dung được dẫn lại như kết quả thực nghiệm |

Không tìm thấy PDF/DOCX/PPTX/XLSX trong phạm vi kiểm kê. Không tự tạo lại số tiền hoặc tên khách hàng từ trí nhớ. Cần cung cấp hồ sơ gốc đúng phiên bản trước khi hoàn thiện trang tài chính/đầu tư; việc thiếu chúng không ngăn soạn nội dung mô tả demo một cách trung thực.

## Quy ước phân loại

- **PROJECT_VERIFIED:** có hiện vật/source trong kho chứng minh chức năng demo tồn tại. Không đồng nghĩa thiết bị đã hoạt động ngoài hiện trường hoặc đã được chứng nhận.
- **PROJECT_PROPOSAL:** ý tưởng trong đặc tả, hồ sơ được dẫn lại hoặc định hướng người dùng cung cấp; chưa xác nhận hoàn thành.
- **PROJECT_ASSUMPTION:** giả thuyết khách hàng, định vị hoặc mô hình thương mại do nghiên cứu đề xuất.
- **NEEDS_VERIFICATION:** thiếu bản gốc, bằng chứng, phương pháp đo, phê duyệt hoặc còn xung đột.

## Sổ xung đột và khác biệt phiên bản

| ID | Nguồn / phiên bản / vị trí | Các giá trị hoặc phát biểu khác nhau | Xử lý cho nội dung marketing |
| --- | --- | --- | --- |
| K01 | Đặc tả scenarios v1.0 §7, dòng 274; pitch và đề xuất AquaSense được dẫn | Có hai bộ giá thiết bị/BOM khác nhau; **cả hai giá trị không được chép lại**, ngày/phiên bản hồ sơ gốc không có | NEEDS_VERIFICATION; không chọn một giá, không lập ROI định lượng |
| K02 | Cùng đặc tả §7, dòng 275; pitch sơ bộ và đề án FireScout | Hai mức chi phí nguyên mẫu; **cả hai số tiền không có trong kho**, phiên bản gốc chưa xác định | NEEDS_VERIFICATION; không công bố chi phí nguyên mẫu/giá bán |
| K03 | README bảng đầu: `victim_hotspot`, `smoke_link_loss`; config FireScout hiện tại và delivery “Scenarios” | Tên cũ so với `hotspot_detection`, `smoke_link_degradation`; delivery xác nhận tên cũ là aliases | Công bố tên tình huống bằng ngôn ngữ người dùng; không coi alias là tính năng mới |
| K04 | Báo cáo AquaSense liên tục “Model and lifecycle” nói FireScout vẫn kết thúc; delivery FireScout sau đó nói tiếp tục sau 120 giây | Hai trạng thái ở hai lần bàn giao; source FireScout hiện hành có chế độ liên tục | Ghi diễn tiến phiên bản; không xóa lịch sử. Chỉ mô tả hiện trạng demo, không suy ra endurance UAV |
| K05 | Executive summary lịch sử “production-ready” so với chính mục “Not ready for production” và README hiện hành | Thuật ngữ readiness không nhất quán; số dự án lịch sử cũng vượt ba dự án hiện hành | Không dùng “production-ready”; ghi rõ prototype/demo mô phỏng |
| K06 | Master plan FactSafe §10.1: SMS/Zalo, QCVN report; README/source hiện hành | Đặc tả mong muốn so với dashboard mô phỏng và risk score chưa hiệu chuẩn | PROJECT_PROPOSAL; chưa có bằng chứng gửi tin thật, báo cáo pháp lý hợp lệ hoặc chứng nhận |
| K07 | Đặc tả scenarios §0: Kalman + LSTM; config AquaSense `aiEngine: false`, pond model synthetic | Thuật toán được đề xuất so với mô hình demo hiện có | Không quảng cáo AI dự báo đã kiểm chứng hoặc lọc bám bẩn thực địa |
| K08 | Master plan FireScout §15.1: phát hiện qua khói; delivery hiện hành: không camera/inference thật | Đề xuất nhận diện so với synthetic candidate và local LLM giải thích telemetry | Không viết “phát hiện nạn nhân xuyên khói”; cần dữ liệu độc lập và thử nghiệm điều kiện cụ thể |

Xung đột đã phát hiện là giới hạn tri thức/tài liệu, không phải lỗi triển khai được sửa trong nhiệm vụ này. Không chỉnh source, không cập nhật BUGBOOK. Các fact sheet liên kết lại đây để tránh lặp phân tích dài.
