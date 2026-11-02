# FireScout AI — bằng chứng thị trường, ứng cứu và giới hạn vận hành

Truy cập 27/10/2026. Tách thống kê cháy, ca ứng cứu độc lập, thông số vendor và khả năng của FireScout. Chưa có field results của dự án. Không dùng một ca rescue để suy ra tỷ lệ thành công chung.

## 1. Số liệu và phạm vi

| Evidence ID | Giá trị / đơn vị | Phạm vi và kỳ | Tổ chức, ngày công bố, URL | Phân loại / xác minh | Cách dùng |
| --- | --- | --- | --- | --- | --- |
| FC-E01 | **3.151 vụ cháy**; thiệt hại tài sản **912,39 tỷ đồng**, sơ bộ ước tính | Việt Nam; kỳ thống kê mang nhãn 2025: **15/12/2024–14/12/2025**; không riêng cháy công nghiệp | Bộ Công an, **27/03/2026**, [thống kê](https://www.bocongan.gov.vn/bai-viet/tinh-hinh-tai-nan-giao-thong-chay-no-va-xu-ly-hanh-chinh-ve-trat-tu-an-toan-giao-thong-nam-2025-1774612854) | VERIFIED_OFFICIAL_SOURCE / HIGH cho báo cáo; đã đọc mục 3 | Dùng đầy đủ kỳ và từ “sơ bộ”; không là thiệt hại có thể tránh bằng UAV |
| FC-E02 | **3.060 vụ cháy**; tài sản **khoảng 786,78 tỷ đồng** | Bài tổng kết ghi “năm 2025”, **không nêu cùng cửa sổ thống kê** như FC-E01 | Bộ Công an, hội nghị **17/12/2025**, [bài tổng kết](https://www.bocongan.gov.vn/bai-viet/luc-luong-canh-sat-phong-chay-chua-chay-va-cuu-nan-cuu-ho-tong-ket-cong-tac-nam-2025-1765961546); ngày đăng chính xác chưa ghi nhận | VERIFIED_OFFICIAL_SOURCE / MEDIUM về comparability; đã đọc số gốc | **Không cộng/ghép với FC-E01.** Lý do khác biệt chưa được giải thích; không tự khẳng định do cập nhật hoặc phạm vi |
| FC-E03 | **77.850 vụ**, **5.131.474 acres** | Hoa Kỳ, wildland fires, **2025**; không phải đô thị/công nghiệp Việt Nam | NIFC/NICC, ngày cập nhật bảng không xác định, [annual table](https://www.nifc.gov/fire-information/statistics/wildfires) | VERIFIED_OFFICIAL_SOURCE / HIGH; đọc pilot cùng ngày | Chỉ tham khảo quốc tế; không tự đổi acre/ha hay suy ra thị trường Việt Nam |
| FC-E04 | Thermal still **640 × 512 pixels** | DJI Mavic 3T/3TA; snapshot cấu hình, năm model không suy đoán | DJI, ngày xuất bản không nêu, [specifications](https://enterprise.dji.com/mavic-3-enterprise/specs) | COMPANY_CLAIM / MEDIUM; đã đọc spec | Không phải AI accuracy, phát hiện người hoặc thông số FireScout |
| FC-E05 | Dừng bán SIRAS **31/08/2025**; hỗ trợ đến **30/09/2027** | Chính sách Teledyne FLIR OEM cho SIRAS; điều kiện hỗ trợ cụ thể theo hãng | FLIR OEM, ngày xuất bản product page không nêu, [notice](https://oem.flir.com/products/siras/) | COMPANY_CLAIM / HIGH cho chính sách hãng; đọc trực tiếp | Không liệt kê như UAV hãng đang bán mới tại thời điểm nghiên cứu |

**Giải quyết khác biệt FC-E01/E02:** bản copy đề xuất dùng FC-E01 vì nguồn công bố sau và nêu rõ kỳ/độ sơ bộ; đây là lựa chọn biên tập minh bạch, không kết luận FC-E02 sai. Nếu cần headline số liệu ngắn không đủ chỗ ghi scope, bỏ con số thay vì bỏ qualifier.

## 2. Ca ứng cứu độc lập và ứng dụng nhiệt

**FC-E06:** [Cheshire Constabulary](https://www.cheshire.police.uk/news/cheshire/news/articles/2025/12/constabularys-drone-unit-assist-in-rescuing-man-from-river-weaver/), đăng **18/12/2025**, mô tả nhiệm vụ **16/12/2025** tại River Weaver, Winsford, Anh. Camera nhiệt UAV hỗ trợ xác định vị trí người dưới sông; thông tin chuyển cho lực lượng chữa cháy thực hiện cứu hộ. VERIFIED_OFFICIAL_SOURCE / HIGH cho nội dung cơ quan thực hiện công bố. Không thu thời gian tìm kiếm đối chứng; không bằng chứng về AI tự động, chữa cháy công nghiệp hoặc FireScout. Không đưa thông tin nhận dạng người được cứu vào marketing dự án.

**FC-E07:** [NIST Thermal Imaging](https://www.nist.gov/el/fire-research-division-73300/firegov-fire-service/thermal-imaging), tạo 21/10/2010, cập nhật **09/09/2025**, giải thích hiệu quả camera nhiệt phụ thuộc nhiệm vụ và điều kiện; có giới hạn bão hòa cảm biến, dải nhiệt và signal-to-noise. VERIFIED_OFFICIAL_SOURCE / HIGH. Không khẳng định nhiệt luôn nhìn xuyên khói hoặc nhìn qua mọi vật cản.

**FC-E08:** [AAIB record-only incidents](https://www.gov.uk/government/publications/aaib-record-only-uas-investigations-reviewed-december-2025-january-2026/aaib-record-only-uas-investigations-reviewed-december-2025-january-2026), đăng **12/03/2026**, ghi sự cố tìm người ban đêm tại Durham ngày **01/12/2025** liên quan pin và va chạm đường dây. AAIB nêu phần này chủ yếu dựa trên báo cáo người điều khiển, độ chính xác không được bảo đảm. THIRD_PARTY_REPORT / MEDIUM; dùng để nhắc giới hạn hệ thống, không suy ra tần suất tai nạn của model.

## 3. Bối cảnh thương mại và quy định Việt Nam

**FC-E09 — commercial drone context:** [FAA Aerospace Forecasts](https://www.faa.gov/data_research/aviation/aerospace_forecasts) có bộ forecast/compendium FY2026–2046 và survey. Chưa trích được một bảng mới nhất có đầy đủ định nghĩa để sử dụng số đội bay trong copy. Không lấy dự báo 2025–2029 từ kết quả tìm kiếm cũ làm số thực hiện 2026. Chưa có market size UAV ứng cứu công nghiệp Việt Nam; không mượn market toàn cầu của drone nói chung.

**FC-E10 — pháp lý UAV:** [Báo Chính phủ ngày 08/11/2025](https://xaydungchinhsach.chinhphu.vn/chinh-phu-quy-dinh-dieu-kien-dang-ky-phuong-tien-bay-khong-nguoi-lai-119251108125349673.htm) giải thích **Nghị định 288/2025/NĐ-CP, ban hành 05/11/2025**, về quản lý tàu bay không người lái/phương tiện bay khác, đăng ký và điều kiện khai thác. [Bản ký](https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/11/288nd.signed.pdf) mở được PDF nhưng không trích được text trong công cụ; nội dung phân tích dựa bài giải thích chính thức. VERIFIED_OFFICIAL_SOURCE / HIGH cho sự tồn tại/nội dung bài; NEEDS_VERIFICATION cho điều kiện áp dụng từng hoạt động và toàn bộ sửa đổi đến ngày pilot.

Trước một pilot bay thật cần đối chiếu hồ sơ phương tiện, đơn vị/người điều khiển, khu vực và chấp thuận hoạt động với cơ quan có thẩm quyền. Không nói “tự do bay”, “không cần giấy phép” hoặc áp dụng exemption của Mỹ cho Việt Nam. Chưa xác nhận FireScout đã có giấy phép, phần cứng hoặc cấu hình đủ điều kiện.

## 4. Khoảng trống quyết định đầu tư/pilot

Chưa có giá bundle đầy đủ ở Việt Nam, chi phí đào tạo/bảo trì/bảo hiểm, measured mission success, latency thực địa, AI false-positive/false-negative, hiệu quả môi trường khói/nhiệt hoặc lợi ích kinh tế FireScout. Cần thử nghiệm có ground truth độc lập và mô tả điều kiện. Không suy ra khả năng bay, độ chính xác hoặc ROI từ dashboard mô phỏng. Mọi wording được kiểm soát trong [claim registry](CLAIM_REGISTRY.md).
