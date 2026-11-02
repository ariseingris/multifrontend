# Tổng hợp nghiên cứu và chuẩn bị nội dung ba website

Hoàn thành nội dung nghiên cứu ngày 27/10/2026. Phạm vi: nghiên cứu, chiến lược và copy tiếng Việt; **không triển khai website, chỉnh React hoặc simulator**. Bộ pilot cùng ngày được giữ nguyên, không ghi đè. Branch được quan sát: `feat/firescout-uav-dashboard`; HEAD `798915b86f79810c667fc661667aa1727f7a4e5a`; working tree có thay đổi chưa commit từ trước.

## 1. Bộ bàn giao

| Dự án | Thực trạng | Đối thủ | Evidence | Chiến lược | Copy website | Claim registry |
| --- | --- | --- | --- | --- | --- | --- |
| AquaSense | [Fact sheet](aquasense/PROJECT_FACT_SHEET.md) | [8 doanh nghiệp](aquasense/COMPETITOR_RESEARCH.md) | [Nguồn/thị trường](aquasense/MARKET_EVIDENCE.md) | [Strategy](aquasense/MARKETING_STRATEGY.md) | [10 phần + 8 FAQ + SEO](aquasense/WEBSITE_CONTENT.md) | [Markdown](aquasense/CLAIM_REGISTRY.md) / [JSON](aquasense/CLAIM_REGISTRY.json) |
| FactSafe | [Fact sheet](factsafe/PROJECT_FACT_SHEET.md) | [8 doanh nghiệp](factsafe/COMPETITOR_RESEARCH.md) | [Nguồn/thị trường](factsafe/MARKET_EVIDENCE.md) | [Strategy](factsafe/MARKETING_STRATEGY.md) | [10 phần + 8 FAQ + SEO](factsafe/WEBSITE_CONTENT.md) | [Markdown](factsafe/CLAIM_REGISTRY.md) / [JSON](factsafe/CLAIM_REGISTRY.json) |
| FireScout AI | [Fact sheet](firescout/PROJECT_FACT_SHEET.md) | [8 doanh nghiệp](firescout/COMPETITOR_RESEARCH.md) | [Nguồn/thị trường](firescout/MARKET_EVIDENCE.md) | [Strategy](firescout/MARKETING_STRATEGY.md) | [10 phần + 8 FAQ + SEO](firescout/WEBSITE_CONTENT.md) | [Markdown](firescout/CLAIM_REGISTRY.md) / [JSON](firescout/CLAIM_REGISTRY.json) |

Bổ sung: [kiểm kê và xung đột](shared/2026-10-27_PROJECT_KNOWLEDGE_AUDIT.md), [access ledger](shared/2026-10-27_ACCESS_LEDGER.json), [mẫu DOM/style](shared/2026-10-27_VISUAL_OBSERVATIONS.json), [editorial review](shared/2026-10-27_EDITORIAL_REVIEW.md). Tất cả output mới ở `documents/research/`; chỉ root development log được append theo AGENTS.md.

## 2. Phạm vi nghiên cứu thực tế

**24 doanh nghiệp, tám mỗi dự án**, gồm ví dụ Việt Nam và quốc tế:

- AquaSense: RYNAN, Innovasea, AKVA group, Farmext/Tép Bạc, JALA, OxyGuard, CageEye (Bluegrove chuyển hướng), Hanna Instruments.
- FactSafe: Blackline Safety, Dräger, Honeywell, Daviteq, Industrial Scientific, MSA Safety, RKI Instruments, Việt An Enviro.
- FireScout: DJI Enterprise, Flyability, Teledyne FLIR OEM, CT UAV, Skydio, Parrot, Fotokite, Gremsy.

Không phải cả 24 đều là đối thủ trực tiếp. Có nhà cung cấp thiết bị/payload, nền tảng liền kề và sản phẩm đã dừng bán. Mỗi dossier có phạm vi homepage/product/use case/case/about/pricing/contact/customer evidence và ghi phần thiếu. **Không tuyên bố đã đọc đủ tám loại trang của mọi công ty.** Honeywell được xem từ solution page; một số about/product chỉ trả navigation/footer; một số giá, case hoặc tài liệu chưa truy xuất được.

Deep-research ledger ghi **119 observations trên 96 URL string khác nhau**, gồm cả lỗi và những lần kiểm tra lại, không phải 96 nhà xuất bản hoặc 96 nguồn đầy đủ. Có **24 lần lấy mẫu browser/DOM**, trong đó **18 DOM samples** và **6 limited/unavailable**; không dùng style trang challenge/lỗi làm brand evidence. Các nguồn pilot có 22 records riêng, không cộng cơ học thành số nguồn mới vì có URL trùng giữa hai đợt.

Nguồn ngoài doanh nghiệp gồm FAO, VASEP, ILO, Bộ Công an, Báo Chính phủ, NIOSH, NIST, Cheshire Constabulary, AAIB và FAA; nghiên cứu tôm thẻ đăng Frontiers; VOV/bản chép thông báo dùng như nguồn thứ cấp. Các báo cáo evidence có URL, năm/kỳ, đơn vị và giới hạn trực tiếp cạnh claim.

## 3. Phát hiện quan trọng và định hướng thông điệp

| Dự án | Phát hiện | Ba thông điệp đề xuất | Cấu trúc ưu tiên |
| --- | --- | --- | --- |
| AquaSense | Monitoring cần gắn quyết định vận hành, bảo trì và điều kiện ao; proposal/pitch gốc chưa có | Hiểu diễn tiến ao; chú ý chất lượng đầu dò; kiểm chứng giá trị cùng người nuôi | Problem → environmental context → demo → pilot/evidence → FAQ/contact |
| FactSafe | Các hãng nhấn mạnh lifecycle/service/calibration; ambient/occupational/gas-alarm là phạm vi khác nhau | Quan sát theo vùng; đặt cảnh báo trong ngữ cảnh; thiết kế pilot với EHS | Hazard/workflow → scope → demo → đo lường/service → evidence/FAQ/contact |
| FireScout | Mission và giới hạn quan trọng hơn claim AI chung; SIRAS đã có end-of-sales notice | Thêm ngữ cảnh nhiệm vụ; giữ độ không chắc chắn; kiểm chứng từng năng lực | Mission problem → concept → demo → limits/pilot → evidence/FAQ/contact |

Các điểm khác biệt đều là **đề xuất cần kiểm chứng**. Không có bằng chứng để gọi ba dự án tốt hơn, rẻ hơn hoặc chính xác hơn các hãng tham chiếu. Website hiện tại nên giới thiệu nguyên mẫu và mời trao đổi/demo; chưa nên trình bày như nhà cung cấp triển khai thương mại đã có thành tích.

## 4. Số liệu có thể sử dụng theo phạm vi

- AquaSense: FAO ghi nhận **94,4 triệu tấn động vật thủy sản nuôi toàn cầu năm 2022**, công bố 07/06/2024; VASEP báo cáo **4,6 tỷ USD xuất khẩu tôm Việt Nam năm 2025**, bài 19/01/2026. Không là TAM IoT. URL và qualifiers trong [AQ evidence](aquasense/MARKET_EVIDENCE.md).
- FactSafe: ILO release **26/11/2023** nêu ước tính **gần 3 triệu ca tử vong/năm liên quan công việc toàn cầu**, gồm bệnh và tai nạn. Số Việt Nam 2024 đã có đối chiếu thứ cấp nhưng chưa kiểm tra signed original đầy đủ, nên giữ ngoài khối số liệu chính. Xem [FS evidence](factsafe/MARKET_EVIDENCE.md).
- FireScout: Bộ Công an, bài **27/03/2026**, nêu **3.151 vụ cháy**, tài sản sơ bộ ước tính **912,39 tỷ đồng**, kỳ **15/12/2024–14/12/2025**. Bài tổng kết 17/12/2025 nêu bộ số khác; đã giữ cả hai và giải thích lựa chọn nguồn dùng trong copy. Không suy ra thiệt hại UAV tránh được. Xem [FC evidence](firescout/MARKET_EVIDENCE.md).

Không thực hiện phép tính CAGR, market share, currency conversion hoặc dự báo doanh thu. Không đưa statistics của ngành thành traction của sản phẩm.

## 5. Những claim chưa được phép khẳng định

Ba registry có **48 claim entries**: **45 PENDING**, **3 NO**, chưa có YES. PENDING phản ánh chưa có phê duyệt xuất bản thực, không có nghĩa mọi claim thiếu bằng chứng. NO chặn các tuyên bố bảo đảm tránh thiệt hại/tai nạn, chứng nhận tự động hoặc thành tích nhận diện/cứu nạn chưa có.

Cần kiểm chứng thêm: chi phí/BOM xung đột; mô hình doanh thu và pricing; actual sensor/UAV integration; AI/vision accuracy; khách hàng, partners, field pilot; hiệu quả kinh tế; chứng nhận/pháp lý; thời gian nhận biết và độ tin cậy dữ liệu. Contact details và endpoint chưa được cung cấp; copy chỉ đề xuất nhãn CTA. Keyword Việt/Anh là giả thuyết, không có số volume/ranking.

## 6. Giới hạn và bước tiếp theo

Không có PDF/DOCX/PPTX proposal/pitch originals trong workspace. Không thay bản thiếu bằng nội dung tưởng tượng; đã ghi nguồn trung gian và vị trí được dẫn. Legal retrieval có lỗi 403, timeout và Website Disabled; chưa đưa kết luận hiệu lực toàn bộ hoặc product compliance. Browser không phải tất cả site đều tải đầy đủ; visual audit chỉ là DOM/style samples. Không vượt login, paywall hoặc CAPTCHA; không chạy crawl đệ quy, paid API hoặc gửi form.

**Giai đoạn triển khai kế tiếp:** chủ dự án đối chiếu hồ sơ gốc và duyệt wording → xác nhận kênh liên hệ và mục tiêu conversion → chốt architecture/content modules từ ba bản copy → tạo thiết kế riêng và media được phép dùng → sau đó mới triển khai landing pages. Phần pilot, giá và kết quả thực địa chỉ bổ sung khi có bằng chứng. Chưa có frontend hoặc lịch triển khai được tạo trong nhiệm vụ này.


## 7. Bản bàn giao bổ sung sau nghiên cứu

Phiên tiếp tục ngày 27/10/2026 đã chuẩn bị cấu trúc nội dung để chuyển sang thiết kế sau này, vẫn không sửa frontend/simulator:

| Dự án | Brief bàn giao | Bản đồ section / claim / nguồn |
| --- | --- | --- |
| AquaSense | [LANDING_PAGE_HANDOFF](aquasense/LANDING_PAGE_HANDOFF.md) | [CONTENT_MAP.json](aquasense/CONTENT_MAP.json) |
| FactSafe | [LANDING_PAGE_HANDOFF](factsafe/LANDING_PAGE_HANDOFF.md) | [CONTENT_MAP.json](factsafe/CONTENT_MAP.json) |
| FireScout AI | [LANDING_PAGE_HANDOFF](firescout/LANDING_PAGE_HANDOFF.md) | [CONTENT_MAP.json](firescout/CONTENT_MAP.json) |

Bản copy nguồn vẫn là WEBSITE_CONTENT.md. Các brief xác định thứ tự section, persona, CTA, media cần có, demo có hướng dẫn, cách xử lý khi demo/contact chưa sẵn sàng và tiêu chí nghiệm thu nội dung. JSON là bản đồ biên tập, chưa được nối vào runtime; public URL và người duyệt để null khi chưa xác nhận. Mọi claim giữ nguyên PENDING/NO.

Bổ sung [kế hoạch kiểm chứng](shared/PILOT_VALIDATION_PLAN.md): câu hỏi phỏng vấn, ground truth, đơn vị, baseline, mẫu dữ liệu và cách đo giá trị theo từng dự án. Đây là protocol đề xuất, chưa có pilot thực hiện hoặc chỉ tiêu hiệu năng được cam kết.

[Đợt xác minh bổ sung](shared/2026-10-27_FOLLOWUP_SOURCES.json) gồm sáu URL pháp lý/thống kê: đọc được PDF Thông tư 10/2019/TT-BYT và metadata Thông tư 02; PDF bụi timeout, VBPL vẫn 403, PDF tai nạn quá lớn. [FactSafe evidence, mục 5](factsafe/MARKET_EVIDENCE.md) ghi tình trạng mới. Chưa kết luận hiệu lực hiện hành, chưa nâng số tai nạn Việt Nam thành đã kiểm tra bản ký. Số doanh nghiệp/claim của đợt trước không tăng; ledger lịch sử được giữ nguyên.
