# AquaSense — bằng chứng thị trường, khoa học và thương mại

Ngày truy cập tất cả nguồn: **27/10/2026**. Dữ liệu lịch sử giữ nguyên năm tham chiếu; không gọi là số liệu hiện tại năm 2026. VERIFIED_OFFICIAL_SOURCE xác nhận nguồn chính thức nêu nội dung đó, không xác nhận hiệu quả AquaSense. Claim IDs dùng trong bản copy: **AQ-C01…AQ-C16**, xem [registry](CLAIM_REGISTRY.md).

## 1. Số liệu có thể truy vết

| Evidence ID | Giá trị chính xác / đơn vị | Địa lý, năm hoặc kỳ | Tổ chức, ngày công bố, URL gốc | Phân loại / mức tin cậy / trạng thái | Cách dùng và giới hạn |
| --- | --- | --- | --- | --- | --- |
| AQ-E01 | **94,4 triệu tấn** động vật thủy sản nuôi | Toàn cầu, **2022**; không gồm toàn bộ algae | FAO, **07/06/2024**, [SOFIA release](https://www.fao.org/newsroom/detail/fao-report-global-fisheries-and-aquaculture-production-reaches-a-new-record-high/en) | VERIFIED_OFFICIAL_SOURCE / HIGH; đã đọc đoạn aquaculture | Quy mô sản xuất lịch sử; không phải thị trường IoT hoặc doanh thu có thể phục vụ |
| AQ-E02 | **4,6 tỷ USD** xuất khẩu tôm | Việt Nam, **2025**; giá trị xuất khẩu, không doanh thu trại | VASEP, **19/01/2026**, [bài tổng kết](https://vasep.com.vn/tieu-diem/vasep-to-chuc-le-tong-ket-xuat-khau-thuy-san-nam-2025-can-moc-11-3-ty-usd-thich-ung-doi-moi-huong-toi-phat-trien-ben-vung-35848.html) | VERIFIED_OFFICIAL_SOURCE ở cấp hiệp hội / HIGH cho nội dung; không kiểm toán dữ liệu hải quan gốc | Dùng “Theo VASEP…”; không suy ra TAM, số trại, ngân sách công nghệ hoặc lợi nhuận |
| AQ-E03 | **97%** biomass accuracy tại harvest; setup/data retrieval **dưới 15 phút** | Case New Zealand King Salmon; hợp tác đánh giá từ **2023**, thời kỳ đo cụ thể không nêu | Innovasea, ngày xuất bản không nêu, [case gốc](https://www.innovasea.com/case-studies/new-zealand-king-salmon-achieves-97-biomass-accuracy-with-innovaseas-biomasspro/) | COMPANY_CLAIM / MEDIUM; vendor case đọc trong pilot cùng ngày | Không phải water-quality accuracy, tôm nuôi, thời gian phát cảnh báo hay thành tích AquaSense; báo cáo đầy đủ có ngày hôm sau |
| AQ-E04 | Quảng bá **70% ít điện hơn** | TOMGOXY; so với phương pháp nuôi tôm thâm canh khác; địa điểm/kỳ thử không nêu | RYNAN, ngày xuất bản không nêu, [TOMGOXY](https://rynanaquaculture.com/tomgoxy) | COMPANY_CLAIM / MEDIUM về việc hãng nêu claim; chưa độc lập xác minh | Chỉ để phân tích marketing đối thủ; không đưa làm lợi ích AquaSense, thiếu baseline/điều kiện đo |
| AQ-E05 | Gói Free: **IDR 0/người dùng**, tối đa **10 ao**, **3 farm users** | Trang JALA khu vực Indonesia tại ngày truy cập; không có thời hạn cam kết miễn phí | JALA, ngày xuất bản không nêu, [Pricing](https://jala.tech/pricing) | COMPANY_CLAIM / MEDIUM; đã đọc trực tiếp | Không bao gồm quyền suy ra thiết bị miễn phí. Paid Plus có số giá và các kỳ Monthly/Cycle/Annual nhưng extraction chưa xác nhận kỳ đang chọn nên không dùng giá paid để tính TCO |

Không chuyển đổi tiền tệ hoặc tính CAGR. Số lượng kỹ thuật demo và màu/font lấy mẫu trong báo cáo đối thủ không phải thống kê ngành hay thông số AquaSense ngoài hiện trường.

## 2. Cơ sở khoa học và vấn đề vận hành

**AQ-E06 — hypoxia và tôm thẻ:** bài [He và cộng sự, Frontiers in Immunology, 27/11/2024](https://www.frontiersin.org/journals/immunology/articles/10.3389/fimmu.2024.1476309/full), DOI `10.3389/fimmu.2024.1476309`, nghiên cứu thực nghiệm trên *Litopenaeus vannamei*. Kết luận liên hệ stress thiếu oxy cấp với tổn thương mô và suy giảm miễn dịch kháng khuẩn trong điều kiện thí nghiệm. Phân loại PEER_REVIEWED_RESEARCH / HIGH cho phát biểu trong bài; chưa đánh giá toàn bộ khả năng tái lập. Không suy ra một ngưỡng DO chung cho mọi ao, tỷ lệ thiệt hại ở Việt Nam hoặc hiệu quả sản phẩm.

**AQ-E07 — quản lý ao tại Việt Nam:** [bài hướng dẫn trên cổng Bộ KH&CN](https://mst.gov.vn/tha-tom-giong-va-cach-cham-soc-quan-ly-moi-truong-ao-nuoi-197132462.htm) nhấn mạnh kiểm tra DO hằng ngày, đặc biệt gần sáng. Nguồn kỹ thuật lịch sử, không dùng các con số chăm sóc trong bài làm threshold thương mại. Ngày xuất bản chính xác chưa được ghi nhận đủ trong extraction; chỉ dùng nguyên tắc quan sát và yêu cầu kiểm chứng địa phương. VERIFIED_OFFICIAL_SOURCE / MEDIUM do độ cũ và giới hạn phạm vi.

**Ý nghĩa biên tập:** môi trường nước đáng được theo dõi; “phát hiện sớm hơn” là mục tiêu cần đo bằng thời gian thực, đối chiếu thiết bị và hành động của người nuôi. Cảm biến không tự chứng minh phòng bệnh, cứu tôm hoặc tăng sản lượng.

## 3. Kinh tế, adoption và khoảng trống

| Câu hỏi | Đã biết | Chưa có / bước nghiên cứu cần thiết |
| --- | --- | --- |
| Quy mô ngành | FAO/VASEP cung cấp bối cảnh sản xuất/xuất khẩu | Số trại mục tiêu, mức chi IoT và thị trường thực sự tiếp cận được |
| Thiệt hại do sự cố môi trường | Có căn cứ khoa học về tác động sinh học | Chưa thu ước tính tiền thiệt hại đại diện, có phương pháp, cho ao tôm Việt Nam; không lấy thiệt hại thiên tai tổng hợp thay thế |
| Adoption công nghệ | Có sản phẩm và case do vendor công bố | Không có khảo sát đại diện cho tỷ lệ ao Việt Nam dùng monitoring liên tục; bỏ các bộ đếm vendor khỏi headline |
| Giá/bảo trì | Có mô hình free/subscription và contact-for-quote của đối thủ | Chưa có cấu hình, BOM, giá hoặc phí bảo trì AquaSense được duyệt; K01 chưa giải quyết |
| ROI khách hàng | Có thể xác định nhóm lợi ích tiềm năng | Cần baseline công đo tay, điện, thời gian phản ứng, chi phí bảo trì và kỳ đo; không tự đặt phần trăm tiết kiệm |

Mô hình ROI chỉ là **PROJECT_ASSUMPTION**: lợi ích ròng trong một kỳ = phần giảm chi phí được đo và kiểm chứng trong cùng kỳ − chi phí thiết bị phân bổ, triển khai, thuê bao và bảo trì. Không đưa số minh họa có thể bị hiểu là dự báo thật; không cộng các lợi ích trùng nhau.

## 4. Quyết định biên tập

Có thể đề xuất dùng AQ-E01/E02 trong một khối bối cảnh ngành có năm và nguồn. AQ-E06 hỗ trợ lý do cần quan tâm DO, không hỗ trợ claim AquaSense. AQ-E03/E04/E05 dành cho nghiên cứu so sánh, không phải chứng minh sản phẩm mình. Mọi claim vẫn chờ duyệt trong registry; chưa có pilot thực địa, financial traction hoặc testimonial của AquaSense được xác minh.
