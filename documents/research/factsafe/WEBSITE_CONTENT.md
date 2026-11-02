# FactSafe — nội dung website đề xuất

Bản thảo 27/10/2026, giới thiệu nguyên mẫu và thảo luận bài toán B2B. Mã FS-Cxx nối tới [registry](CLAIM_REGISTRY.md); chú giải biên tập không phải nội dung giao diện. Chưa tạo frontend, form hoặc kênh liên hệ.

## 1. Hero

**Nhãn:** Nguyên mẫu giám sát môi trường công nghiệp

**H1:** Thêm ngữ cảnh cho dữ liệu khí, bụi và môi trường nhà máy.

**Subheadline:** FactSafe hướng tới giúp đội an toàn nhận biết dấu hiệu thay đổi và trao đổi về nguy cơ theo từng khu vực làm việc.

**Đoạn hỗ trợ:** Khám phá dashboard mô phỏng khí, bụi và diễn tiến sự kiện. Cùng đội EHS xác định thông tin cần theo dõi, cách đánh giá và điều kiện tích hợp trước một pilot thực tế.

**CTA chính:** Đề nghị xem demo  
**CTA phụ:** Trao đổi bài toán nhà máy

Claim: FS-C01, FS-C02, FS-C13, FS-C14.

## 2. Vấn đề

**H2:** Dữ liệu chỉ hữu ích khi đội ngũ hiểu được bối cảnh

Chất gì đang được theo dõi? Thay đổi xuất hiện ở đâu? Dữ liệu còn mới và đáng tin không? Ai cần kiểm tra tiếp? Đây là những câu hỏi cần làm rõ khi thiết kế workflow giám sát môi trường công nghiệp.

Thông tin rời rạc có thể làm việc phối hợp và tổng hợp sự kiện khó hơn. Một giao diện chung có thể hỗ trợ trao đổi, nhưng không thay thế thiết bị phù hợp, bảo trì, quy trình và chuyên môn an toàn.

**Bối cảnh:** ILO công bố năm **2023** ước tính **gần 3 triệu ca tử vong liên quan công việc mỗi năm trên toàn cầu**, bao gồm tai nạn và bệnh nghề nghiệp. Đây không phải số ca do khí độc hoặc số ca FactSafe có thể ngăn chặn. [ILO, 26/11/2023](https://www.ilo.org/resource/news/nearly-3-million-people-die-work-related-accidents-and-diseases).

Claim: FS-C07, FS-C08, FS-C12.

## 3. Giải pháp

**H2:** Quan sát diễn tiến môi trường theo vùng

FactSafe là nguyên mẫu phần mềm minh họa cách tổng hợp thông tin môi trường trong các tình huống nhà máy. Demo hiện có:

- Dữ liệu tổng hợp cho NH3, CO, H2S, CH4, PM2.5, PM10, nhiệt độ và độ ẩm.
- Tình huống vận hành bình thường, rò rỉ ammonia mô phỏng và sự kiện bụi mô phỏng.
- Biểu đồ, sự kiện và chỉ số tổng hợp theo vùng để người xem tìm hiểu diễn tiến.
- Trạng thái dữ liệu và lịch sử phục vụ xem lại tình huống trong phiên demo.

Chỉ số rủi ro trong demo chưa được hiệu chuẩn cho đánh giá an toàn hoặc tuân thủ. [FS-C02, FS-C03, FS-C04, FS-C05]

## 4. Vì sao nên tìm hiểu FactSafe?

**H2:** Thiết kế từ câu hỏi của đội an toàn và vận hành

**Cùng một diễn tiến:** đặt khí, bụi và vị trí vùng vào ngữ cảnh để đội ngũ trao đổi.

**Phạm vi minh bạch:** làm rõ đâu là chỉ số đo được đề xuất, đâu là phép tính tổng hợp và đâu là dữ liệu mô phỏng.

**Đánh giá trước tích hợp:** cùng EHS và đối tác IIoT xác định chất cần đo, phương pháp, vị trí, trách nhiệm và tiêu chí pilot.

Đây là cách tiếp cận đề xuất; chưa có benchmark chứng minh FactSafe chính xác hơn, rẻ hơn hoặc bảo vệ tốt hơn sản phẩm khác. [FS-C04, FS-C07, FS-C12, FS-C14]

## 5. Business value

**H2:** Bắt đầu bằng tiêu chí có thể đo

Giá trị tiềm năng cần được đánh giá qua khả năng theo dõi sự kiện, thời gian tổng hợp thông tin, công bảo trì và mức phù hợp với workflow của nhà máy. Chưa có kết quả tiết kiệm, giảm tai nạn hoặc hoàn vốn của FactSafe được kiểm chứng.

Một phương án triển khai tương lai cần làm rõ thiết bị, khảo sát, tích hợp, calibration, đào tạo và dịch vụ duy trì. Giá, thuê bao và SLA chưa được xác nhận trong hồ sơ hiện có; không nên dùng giá demo làm báo giá thương mại.

Claim: FS-C06, FS-C07, FS-C11, FS-C12.

## 6. Evidence và bối cảnh chuyên môn

**H2:** Độ tin cậy của phép đo cần được đánh giá riêng

Hướng dẫn NIOSH về thiết bị direct-reading nhấn mạnh các yếu tố như thời gian đáp ứng, calibration, độ ổn định và ảnh hưởng môi trường. Đây là căn cứ để đặt câu hỏi kiểm chứng, không phải chứng nhận cho FactSafe. [NIOSH, 01/07/2012](https://stacks.cdc.gov/view/cdc/11956).

Yêu cầu môi trường lao động cần được đối chiếu theo chất đo, phương pháp và văn bản đang áp dụng. Bản demo hiện tại không xác nhận đáp ứng quy chuẩn hoặc thay thế quan trắc do đơn vị phù hợp thực hiện.

Chú giải biên tập: số tai nạn Việt Nam năm 2024 có trong [MARKET_EVIDENCE](MARKET_EVIDENCE.md) nhưng chưa đưa vào khối số liệu chính vì chưa đối chiếu được bản ký gốc đầy đủ. Không dùng các thống kê đó để suy ra hiệu quả sản phẩm.

Claim: FS-C09, FS-C10, FS-C12, FS-C15.

## 7. Product demo

**H2:** Theo dõi một sự kiện từ thay đổi ban đầu đến diễn tiến tiếp theo

Người xem có thể chạy tình huống khí hoặc bụi, xem vùng liên quan, biểu đồ và các mốc sự kiện. Demo phục vụ trao đổi về cách trình bày thông tin, chưa phải một cuộc thử nghiệm an toàn công nghiệp.

**Nhãn cạnh demo:** “Dữ liệu và cảnh báo mô phỏng — không dùng để quyết định an toàn thực tế.”

**CTA:** Xem demo có hướng dẫn

Claim: FS-C03, FS-C04, FS-C05, FS-C06.

## 8. FAQ

**1. FactSafe đang ở giai đoạn nào?**  
Kho mã xác nhận dashboard và simulator. Chưa có bằng chứng hệ thống đo ngoài nhà máy hoặc sản phẩm thương mại được chứng nhận trong bộ hồ sơ hiện có. [FS-C01, FS-C06]

**2. Những loại khí và thông số nào có trong demo?**  
NH3, CO, H2S, CH4, PM2.5, PM10, nhiệt độ và độ ẩm được mô phỏng. Cấu hình cảm biến thật phải được xác định theo hazard và điều kiện nhà máy. [FS-C02, FS-C12]

**3. Risk score có phải mức an toàn được chứng nhận không?**  
Không. Đây là chỉ số tổng hợp demo, chưa được hiệu chuẩn như xác suất sự cố hoặc thang phơi nhiễm nghề nghiệp. [FS-C04]

**4. FactSafe đã đáp ứng QCVN chưa?**  
Chưa có bằng chứng đủ để tuyên bố điều đó. Cần đối chiếu thiết bị, phương pháp, thời gian đo, điều kiện sử dụng và văn bản áp dụng. [FS-C10, FS-C12]

**5. Có thể thay hệ thống báo động hoặc quy trình ứng cứu đang dùng không?**  
Không nên diễn giải demo như phương án thay thế. Mọi tích hợp thực tế cần được EHS và đơn vị kỹ thuật đánh giá trong tổng thể lớp bảo vệ của cơ sở. [FS-C06, FS-C12]

**6. Có gửi SMS/Zalo hoặc tích hợp sẵn với mọi hệ thống IIoT không?**  
Các hướng tích hợp cần được xác định và kiểm chứng. Hồ sơ hiện có chưa xác nhận gửi tin thật hoặc tương thích mọi hệ thống. [FS-C06]

**7. Giá và phí dịch vụ là bao nhiêu?**  
Chưa có mức giá, thuê bao hoặc SLA được xác nhận. Phạm vi thiết bị, tích hợp, calibration và hỗ trợ cần làm rõ trước báo giá. [FS-C11]

**8. Nhà máy cần chuẩn bị gì để trao đổi pilot?**  
Có thể bắt đầu từ ngành sản xuất, khu vực cần theo dõi, hazard quan tâm và quy trình hiện có. Phạm vi, trách nhiệm và điều kiện thực hiện sẽ cần thống nhất riêng; chưa có cam kết triển khai tự động. [FS-C12, FS-C13, FS-C14]

## 9. Contact / conversion

**H2:** Trao đổi về bài toán giám sát của nhà máy bạn

Bạn phụ trách vận hành, EHS hoặc tích hợp IIoT? Hãy đề nghị xem demo và cùng xác định dữ liệu, quy trình và điều kiện cần kiểm chứng cho một pilot phù hợp.

**Hành động đề xuất:** Đề nghị xem demo · Liên hệ nhóm dự án · Thảo luận pilot · Trao đổi tích hợp.

Chú giải biên tập: chỉ gắn email/điện thoại/địa chỉ và form khi có thông tin thật được xác nhận. Không gán đối thủ, đơn vị EHS hoặc nhà máy nào là partner/customer của FactSafe. [FS-C13, FS-C14]

## 10. SEO

Các keyword là **giả thuyết nội dung**, chưa có dữ liệu volume, độ cạnh tranh hay thứ hạng.

- **Page title:** FactSafe | Demo giám sát khí, bụi và môi trường công nghiệp
- **Meta description:** Khám phá nguyên mẫu FactSafe qua tình huống khí và bụi mô phỏng. Trao đổi nhu cầu giám sát môi trường công nghiệp cùng đội EHS và đối tác kỹ thuật.
- **Primary keyword:** giám sát môi trường công nghiệp
- **Related Vietnamese:** giám sát khí trong nhà máy; theo dõi bụi công nghiệp; giám sát theo vùng; dashboard EHS; Industrial IoT Việt Nam.
- **Related English:** industrial environmental monitoring; connected safety; gas detection monitoring; industrial IoT; EHS dashboard.
- **H1:** Thêm ngữ cảnh cho dữ liệu khí, bụi và môi trường nhà máy.
- **H2:** Vấn đề → Giải pháp → Vì sao tìm hiểu → Business value → Evidence → Demo → FAQ → Liên hệ.
- **H3:** Khí và bụi; Diễn tiến theo vùng; Chất lượng phép đo; Phạm vi pilot.

Không dùng “đạt chuẩn QCVN”, “chống tai nạn tuyệt đối” hoặc “bảo đảm an toàn” như keyword gắn claim sản phẩm. SEO không được mở rộng khả năng vượt FS-C01–FS-C15.
