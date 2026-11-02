# Rà soát biên tập và chất lượng nghiên cứu

Rà soát ngày 27/10/2026. Phân biệt hoàn thành gói nội dung với phê duyệt xuất bản hoặc hoàn thành sản phẩm.

| Tiêu chí | AquaSense | FactSafe | FireScout AI |
| --- | --- | --- | --- |
| Commercial relevance | Owner/operator/pilot; công đo và quyết định theo dõi | EHS/operations/integration; lifecycle và trách nhiệm | Mission/industrial response/integrator; giới hạn triển khai |
| Nội dung không chuyên | Giải thích môi trường theo diễn tiến; không chỉ metric cards | Nêu câu hỏi vai trò, vùng và dữ liệu; không dùng score như chứng nhận | Phân biệt candidate, thermal, LLM và quyền điều khiển |
| Đúng giai đoạn | Nguyên mẫu, dữ liệu tổng hợp | Dashboard/simulator, chưa certified | Software demonstrator, chưa field UAV/vision |
| Fact traceability | Claim IDs nối registry và nguồn địa phương/ngoài | Claim IDs, nguồn ngành và scope pháp lý pending | Claim IDs, nguồn thống kê/ca rescue/NIST, scope rõ |
| Định lượng | Năm/đơn vị/phạm vi; không ROI tự tạo | ILO historical; VN report secondary được tách | Reporting window và sơ bộ; khác biệt nguồn BCA được giữ |
| CTA | Demo, trao đổi pilot/hợp tác | Demo, bài toán nhà máy/integration | Demo nhiệm vụ, pilot/integration |
| FAQ/SEO | 8 Q&A, title/meta, keywords giả thuyết | 8 Q&A, title/meta, keywords giả thuyết | 8 Q&A, title/meta, keywords giả thuyết |
| Không phóng đại | Không tăng tỷ lệ sống/tiết kiệm được bảo đảm | Không đảm bảo prevention/QCVN | Không cứu người/xuyên mọi khói/AI tuyệt đối |
| Sẵn sàng biên tập web | Có đủ 10 phần; cần chủ dự án duyệt và contact thật | Có đủ 10 phần; cần scope EHS, duyệt và contact | Có đủ 10 phần; cần scope nhiệm vụ/pháp lý, duyệt và contact |

## Kỳ vọng chung và khác biệt có thể xây

Tiêu chuẩn chung của nhóm tham chiếu là hero dễ hiểu, problem/benefit, giải pháp theo ứng dụng, trust có bối cảnh, giải thích triển khai/hỗ trợ và CTA. Các yếu tố đó giúp visitor đánh giá nhà cung cấp; không tạo khác biệt chỉ bằng thêm biểu đồ hoặc nhãn AI.

Khác biệt có thể xây là câu chuyện ngành cụ thể và sự minh bạch về dữ liệu: đầu dò/ao của AquaSense; gas/dust/zone của FactSafe; candidate/thermal/link của FireScout. Đây vẫn là giả thuyết định vị, không có benchmark ưu thế. Bản copy tránh dùng từ tuyệt đối và không biến công ty tham chiếu thành partner dự án.

## Khoảng trống biên tập phải giữ mở

1. Hồ sơ proposal/pitch gốc, ngày/phiên bản và số tiền xung đột chưa có. Không dùng financial block hoặc định giá từ bản đề xuất suy đoán.
2. Chưa có customer interview, willingness-to-pay hoặc adoption survey đại diện ở Việt Nam; không gọi giả thuyết pain point là thống kê toàn ngành.
3. Chưa có phép đo/pilot dự án. Demo chỉ là cách giải thích, không là bằng chứng causal, AI validation hoặc product readiness.
4. QCVN và khung luật cần đối chiếu bản hiện hành/đúng phạm vi. Website Disabled/403 không được coi là xác nhận nội dung pháp luật. Không xuất bản ngưỡng demo như giới hạn pháp lý.
5. Không đủ dữ liệu để xác lập ROI, market size khả dụng hoặc chi phí vòng đời. Các model kinh doanh đề xuất phải được nghiên cứu và duyệt riêng.
6. Không có contact details/endpoint được xác nhận; CTA chưa hoạt động. Không điền placeholder có thể bị hiểu là số/email thật.
7. Visual review còn thiếu ở các trang browser challenge, lỗi hoặc DOM rỗng. Không dùng hình ảnh đối thủ; khi thiết kế phải tự tạo/được cấp phép media phù hợp và gắn nhãn demo.
8. 45 claim PENDING là trạng thái chưa có approval xuất bản; không tự ghi YES. Ba claim NO chỉ xuất hiện như ví dụ bị cấm trong registry, không là lời hứa trong copy.

## Ghi nhận verification

Các kiểm tra cuối gồm: đầy đủ bộ file, cấu trúc 10 phần/8 FAQ, registry JSON hợp lệ, claim IDs không mồ côi, local source links tồn tại, dữ liệu ngày/scope và sự nhất quán với demo hiện tại. SHA-256 đối chiếu baseline dùng để bảo toàn dashboard/simulator và toàn bộ file có trước, trừ development log được append. Kết quả chạy thực tế được ghi tại DEVELOPMENT_LOG.md; không sử dụng kết quả test từ phiên trước như kiểm thử mới.

Không chạy lại frontend build, simulator tests hoặc Docker vì nhiệm vụ chỉ tạo tài liệu nghiên cứu. Không xác nhận hiệu quả sản phẩm bằng test cấu trúc tài liệu. Những thiếu hụt nguồn đã được ghi thành limitation thay vì sáng tác thêm nội dung.

### Kết quả kiểm tra đã chạy

- PASS: ba bộ, mỗi bộ đủ bảy file (sáu Markdown và một claim JSON), 10 phần website, 8 FAQ và 16 claim.
- PASS: 48 ID duy nhất; mọi claim ID trong copy tồn tại; ba claim NO không được dùng làm claim ID trong copy. 45 PENDING và ba NO khớp JSON/Markdown.
- PASS: 162 local Markdown targets tồn tại; source path nội bộ trong registry tồn tại; JSON mới parse được. Kiểm tra không tìm thấy email hoặc số +84 bị điền vào copy website.
- PASS: ledger 119 observations/96 URL strings; browser 24 mẫu, 18 DOM_SAMPLE và 6 limited/unavailable. Đây là số quan sát, không số nguồn độc lập có nội dung đầy đủ.
- PASS: `python3 scripts/research_dataset.py documents/research/*/2026-10-27_sources.json` giữ 22 records pilot hợp lệ, không thay source JSON cũ.
- PASS: `git diff --check`; đối chiếu SHA-256 cho 124 file baseline không có thay đổi trước khi append log. Không dùng các kiểm tra này để khẳng định source ngoài luôn online hoặc claim sản phẩm đã được kiểm định.
