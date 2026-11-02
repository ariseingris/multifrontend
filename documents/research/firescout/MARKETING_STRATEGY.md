# FireScout AI — chiến lược nội dung B2B

Bản đề xuất 27/10/2026. Cơ sở: [thực trạng](PROJECT_FACT_SHEET.md), [tám doanh nghiệp](COMPETITOR_RESEARCH.md), [market/operational evidence](MARKET_EVIDENCE.md). Không coi định hướng marketing là ưu thế đã kiểm chứng.

## 1. Định vị theo giai đoạn

**Hướng phát triển:** hỗ trợ trinh sát cháy nhanh hơn, có thêm thông tin từ UAV, cảm biến nhiệt và AI-assisted detection. **Hiện tại:** nguyên mẫu software demonstrator mô phỏng thông tin nhiệm vụ để thảo luận cách người vận hành hiểu và sử dụng dữ liệu.

Value proposition đề xuất: đưa vị trí, nhiệt, dấu hiệu mục tiêu và trạng thái liên lạc vào cùng ngữ cảnh nhiệm vụ, giữ quyết định xác minh ở con người. Không dùng “chữa cháy tự động”, “tự tìm nạn nhân” hoặc “AI đã được kiểm chứng” để giới thiệu trạng thái hiện có.

## 2. Personas và hành trình

| Persona dự kiến | Nhu cầu đánh giá | Nội dung cần thấy |
| --- | --- | --- |
| Chỉ huy/đội PCCC công nghiệp | Có thông tin gì, đáng tin đến đâu, dùng lúc nào? | Mission scenario, dữ liệu thiếu/không chắc chắn, quyền quyết định |
| Quản lý ứng cứu nhà máy/khu công nghiệp | Fit với kế hoạch ứng cứu và phối hợp đội hiện trường | Quy trình pilot, điều kiện địa điểm, vai trò và giới hạn |
| UAV/payload integrator, đối tác công nghệ | Phần cứng, camera, telemetry, dữ liệu đánh giá | Ranh giới demo/tích hợp thật, phương pháp kiểm chứng và điều kiện pháp lý |
| Doanh nghiệp dịch vụ PCCC/procurement | Tổng chi phí, đào tạo, trách nhiệm và support | Hạng mục cần xác lập; không hứa gói dịch vụ chưa có |

Chưa có bằng chứng khách hàng đã mua, agency endorsement hoặc giấy phép pilot. Với nhà đầu tư/giám khảo, cần nêu rủi ro kỹ thuật/pháp lý, kế hoạch dataset và tiêu chí field test, không chỉ video demo.

## 3. Ba thông điệp chính

1. **Thêm ngữ cảnh cho trinh sát hiện trường.** Vị trí, nhiệt và trạng thái liên lạc được minh họa cùng diễn tiến nhiệm vụ.
2. **Đọc tín hiệu cùng độ không chắc chắn.** Candidate score chưa hiệu chuẩn không được diễn giải thành người đã được xác nhận.
3. **Kiểm chứng từng nhiệm vụ trước triển khai.** Bắt đầu từ phạm vi quan sát/hỗ trợ quyết định; hardware, AI và điều kiện bay cần đánh giá riêng.

## 4. Pain points, benefits và differentiators

| Pain point giả thuyết | Giá trị mục tiêu | Bằng chứng cần |
| --- | --- | --- |
| Thông tin rời rạc giữa quan sát và người chỉ huy | Dễ trao đổi cùng ngữ cảnh nhiệm vụ | User testing về hiểu tình huống; integration thực |
| Tín hiệu nhiệt/AI dễ bị diễn giải quá mức | Giữ lại độ tin cậy và trạng thái thiếu dữ liệu | Ground truth, calibration và kiểm tra human factors |
| Demo đẹp nhưng không rõ khả năng vận hành | Minh bạch điều đã có và điều cần thử | Hồ sơ phần cứng, field logs và thử nghiệm có điều kiện |

Theo đối thủ, thermal imaging và aerial awareness đã phổ biến. Hướng khác biệt cần kiểm chứng là minh bạch candidate/quality/link và phù hợp workflow công nghiệp Việt Nam; chưa gọi là độc quyền hoặc hơn DJI/Skydio.

## 5. Trust, thương mại và CTA

Trust hiện tại: mô phỏng gắn nhãn, citations độc lập, phân biệt camera/AI/LLM, giới hạn rõ. Trust cần xây: đối tác ứng cứu thật có phép nêu tên, dữ liệu nhiệm vụ có ground truth, kết quả theo điều kiện và rà soát pháp lý. Không trưng chứng nhận, customer logos hoặc số người cứu chưa có bằng chứng.

CTA chính: **Đề nghị xem demo nhiệm vụ**. CTA phụ: **Trao đổi kịch bản pilot**. CTA đối tác: **Thảo luận tích hợp công nghệ**. Pilot là nội dung trao đổi, không phải dịch vụ bay đã sẵn sàng hoặc đã được cấp phép. Chưa có form/đầu mối liên hệ được triển khai.

Mô hình đồng phát triển/tích hợp/dịch vụ đánh giá là PROJECT_ASSUMPTION. Phải xác lập phần cứng, nhân sự, đào tạo, bảo trì, trách nhiệm và chi phí trước khi gọi là package. Không suy ra endurance, chi phí nguyên mẫu hoặc ROI từ phần mềm mô phỏng.

## 6. Tone, FAQ và kiến trúc

Tone: rõ nhiệm vụ, có trách nhiệm, cụ thể; dùng “hỗ trợ”, “định hướng”, “mô phỏng” đúng phạm vi. Không giật gân về nạn nhân. FAQ giải thích stage, thermal versus AI, candidate confidence, quyền điều khiển, liên lạc, điều kiện bay, giá và pilot.

Cấu trúc: hero → vấn đề thông tin hiện trường → hướng giải pháp → mission workflow → demo → giá trị cần kiểm chứng → evidence/giới hạn → FAQ → contact. Tách reconnaissance, inspection, delivery và suppression; chỉ nêu use case trong phạm vi dự án hoặc đánh dấu định hướng.

## 7. Claims chưa đủ chứng cứ

Nhanh hơn bao nhiêu, chính xác bao nhiêu, xuyên khói mọi điều kiện, tự xác định nạn nhân, số người cứu, bay tự động/chữa cháy, camera thật/AI vision đã chạy, giấy phép và doanh thu đều chưa được chứng minh. Xem [claim registry](CLAIM_REGISTRY.md). Thống kê cháy là bối cảnh, không bằng chứng về các kết quả này.
