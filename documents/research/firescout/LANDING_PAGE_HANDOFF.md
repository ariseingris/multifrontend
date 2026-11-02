# FireScout AI — bản bàn giao nội dung landing page

Ngày 27/10/2026. **ĐỀ XUẤT — chưa triển khai hoặc phê duyệt xuất bản.** Tài liệu này nối nội dung đã soạn với cấu trúc trang, không thay bản copy nguồn. [WEBSITE_CONTENT.md](WEBSITE_CONTENT.md) là nguồn câu chữ; [CONTENT_MAP.json](CONTENT_MAP.json) là bản đồ section/claim/source. Không chép cả bản copy vào một nguồn thứ hai.

## 1. Mục tiêu trang và hành trình người mua

**Người đọc ưu tiên:** Đội PCCC công nghiệp, quản lý ứng cứu nhà máy và khu công nghiệp; đối tác UAV/payload là nhóm bổ sung.

**Hành trình:** Người phụ trách nhiệm vụ cần ngữ cảnh hiện trường → xem bản đồ/nhiệt/candidate/liên lạc giả lập → trao đổi yêu cầu và điều kiện kiểm chứng.

**Conversion chính:** Đề nghị xem demo nhiệm vụ. Conversion phụ: Trao đổi kịch bản pilot. Đây là lời mời trao đổi; chưa là lịch demo, hợp đồng hoặc khả năng thực hiện pilot được xác nhận.

Điều hướng đề xuất: Nhiệm vụ · Cách tiếp cận · Demo · Trao đổi. Dùng landing page giải thích bài toán và giá trị trước phần demo; không mở trang bằng một màn hình dashboard đầy đủ.

## 2. Bản đồ nội dung

Tên section là đề xuất anchor cho giai đoạn triển khai; chưa phải route hoặc UI tồn tại. Phần SEO là metadata, không tạo thành một khối hiển thị ở cuối trang. Cả mười mục giữ wording từ bản copy nguồn. Mọi claim trong bảng vẫn PENDING; trạng thái chỉ thay khi có quyết định thực.

| Thứ tự | Anchor đề xuất | Mục trong copy nguồn | Vai trò và giới hạn | Claim ID |
| --- | --- | --- | --- | --- |
| 1 | gioi-thieu | 1. Hero | Nêu định hướng trinh sát và giai đoạn software prototype | FC-C01, FC-C02, FC-C06, FC-C13 |
| 2 | van-de | 2. Vấn đề | Giải thích nhu cầu thông tin; giữ reporting window của Bộ Công an | FC-C05, FC-C07, FC-C15 |
| 3 | giai-phap | 3. Giải pháp | Giải thích bản đồ, nhiệt, candidate và liên lạc tổng hợp | FC-C02, FC-C04, FC-C05 |
| 4 | cach-tiep-can | 4. Vì sao nên trao đổi với FireScout AI? | Nêu minh bạch tín hiệu và cách kiểm chứng theo nhiệm vụ | FC-C05, FC-C06, FC-C12, FC-C15 |
| 5 | gia-tri | 5. Business value | Đề xuất đánh giá giá trị nhiệm vụ, không hứa ROI | FC-C11, FC-C13, FC-C15, FC-C16 |
| 6 | bang-chung | 6. Evidence và giới hạn | Nguồn cứu hộ độc lập, giới hạn nhiệt và bối cảnh UAV Việt Nam | FC-C08, FC-C09, FC-C10, FC-C16 |
| 7 | demo | 7. Product demo | Minh họa ba tình huống; LLM tùy chọn và có giới hạn | FC-C02, FC-C03, FC-C04, FC-C06 |
| 8 | cau-hoi | 8. FAQ | Giải đáp tám câu hỏi, nhất là phần cứng, AI và điều kiện bay | FC-C02, FC-C03, FC-C04, FC-C05, FC-C06, FC-C09, FC-C10, FC-C11, FC-C12, FC-C13, FC-C16 |
| 9 | lien-he | 9. Contact / conversion | Mời trao đổi nhiệm vụ/pilot qua kênh thật | FC-C12, FC-C13, FC-C16 |
| 10 | seo | 10. SEO | Metadata và outline; keywords là giả thuyết | FC-C01, FC-C02, FC-C03, FC-C04, FC-C05, FC-C06, FC-C07, FC-C08, FC-C09, FC-C10, FC-C11, FC-C12, FC-C13, FC-C15, FC-C16 |

Không xóa năm, đơn vị, phạm vi hoặc qualifiers để rút ngắn thẻ số liệu. Không biến nguồn ngành thành chứng cứ hiệu năng dự án. Giữ link nguồn sát khối evidence khi dàn trang.

## 3. Hướng trình bày và media

Ưu tiên câu chuyện nhiệm vụ và sơ đồ người vận hành; bản đồ/ảnh nhiệt chỉ là phần giải thích. Giữ chữ và nền tương phản; không tạo cảnh UAV FireScout bay thật hoặc cứu người nếu chưa có tư liệu xác thực.

**Danh sách media cần chuẩn bị:** Sơ đồ nhiệm vụ, ảnh dashboard mô phỏng, minh họa thermal/candidate có chú thích. Tư liệu hoạt động thực của bên khác chỉ có thể dùng như nguồn có attribution và quyền phù hợp, không gắn thành thành tích dự án.

Media dự kiến lưu theo [quy tắc tài nguyên](../../../AGENTS.md): project images ở `assets/firescout/images/`; bản dùng chung chỉ một nguồn ở `assets/shared/`. Chưa có media được tạo, tải hoặc di chuyển trong bản bàn giao này. Khi chọn media cần ghi nguồn/quyền sử dụng; không dùng nhãn/logos đối thủ như endorsement.

Mobile đi theo cùng thứ tự nội dung. Ảnh demo cần caption, đồ thị cần giải thích ngắn và đơn vị đọc được. FAQ phải đọc được bằng bàn phím khi triển khai. Hướng màu/ảnh là đề xuất sáng tạo, không phải kết quả so sánh hiệu năng.

## 4. Demo có hướng dẫn

Xem trinh sát thường lệ, điểm nóng/candidate và suy giảm liên lạc; phân biệt quan sát, score chưa hiệu chuẩn và dữ liệu thiếu. Phần hỏi đáp cục bộ là tùy chọn có điều kiện model, không là camera detector hoặc lệnh UAV.

**Nhãn phải đi cùng demo và ảnh demo:** “Nhiệm vụ và dữ liệu mô phỏng — không phải chuyến bay hoặc kết quả nhận diện thực địa.”

Các scenario IDs trong JSON được đối chiếu [config hiện có](../../../frontend/src/projects/firescout/config.ts). Selector `?project=firescout` có trong [bộ chọn dự án](../../../frontend/src/core/projects.ts); đây là quy tắc chọn demo tại app hiện có, **không xác nhận URL triển khai công khai hoặc đã kiểm thử runtime trong phiên này**. Chưa gán link public, embed, autoplay hoặc route landing mới.

Nếu demo chưa chạy được ở môi trường xuất bản sau này, dùng ảnh demo đúng phiên bản có nhãn hoặc mời xem có hướng dẫn qua kênh thật. Không hiển thị nút “Xem trực tiếp” dẫn tới URL chưa xác minh.

## 5. CTA và tiếp nhận nhu cầu

CTA Hero và CTA cuối trang đề xuất cuộn tới `#lien-he`. Chưa có email, số điện thoại, endpoint hoặc lịch hẹn được xác nhận. Sau khi có kênh thật, nhãn và đích phải nhất quán; form chỉ báo thành công khi thực sự tiếp nhận được yêu cầu. Khi chưa có kênh, bản preview có thể ghi “Kênh liên hệ đang được nhóm xác nhận”; không giả thông báo đã gửi.

Thông tin trao đổi đề xuất: Vai trò, loại nhiệm vụ dự kiến và nhu cầu thông tin; điều kiện địa điểm và hồ sơ vận hành được trao đổi riêng, không hứa lịch bay từ form.

Nếu chọn form ở giai đoạn sau: tên, tổ chức, một kênh liên hệ do người dùng chọn, nhu cầu và lời nhắn là tập tối thiểu đề xuất. Cần xác định đơn vị tiếp nhận, mục đích sử dụng và cách xử lý dữ liệu trước khi mở nhận thông tin; chưa tạo chính sách, tài khoản hoặc dịch vụ bên ngoài.

## 6. Phạm vi cần giữ khi triển khai sau này

Chưa tạo dịch vụ bay đặt ngay, bản đồ tác chiến thật, nhận diện nạn nhân đã xác thực, thông số độ chính xác AI hoặc chứng nhận/giấy phép dự án.

Không chuyển claim registry thành nội dung hiển thị công khai nguyên trạng. Bỏ chú giải “Claim: …” khỏi phần trình bày khách hàng nhưng giữ việc truy vết trong hồ sơ biên tập. Các lời mô tả giới hạn sản phẩm và nhãn mô phỏng vẫn là nội dung khách hàng cần thấy.

Không đổi dashboard, scenario IDs hoặc simulator để làm khớp một lời hứa marketing. Nếu copy vượt hiện vật, sửa copy và registry. Tham khảo [kế hoạch kiểm chứng](../shared/PILOT_VALIDATION_PLAN.md) trước khi thêm hiệu quả định lượng.

## 7. Tiêu chí nghiệm thu nội dung và dữ liệu còn thiếu

- Người đọc hiểu camera/vision còn là hướng tích hợp; candidate chưa xác nhận nạn nhân; mọi chuyến bay cần điều kiện riêng.
- Đủ nội dung từ hero đến FAQ/contact; một H1; SEO không thêm claim mới; tám FAQ có nội dung trả lời.
- Mỗi claim có nguồn và phạm vi; không dùng claim NO; PENDING giữ nguyên trong giai đoạn nghiên cứu, không tự tạo phê duyệt.
- Nguồn ngành được ghi năm/phạm vi; hình demo không được hiểu là kết quả hiện trường.
- CTA có đích thật trước khi mở nhận nhu cầu; chưa thể nghiệm thu conversion hoạt động từ bản tài liệu này.

Thiếu hồ sơ gốc và xác nhận chi phí, field evidence, contact channel, quyền media và quyết định xuất bản. Các thiếu hụt đã có trong [fact sheet](PROJECT_FACT_SHEET.md), [evidence](MARKET_EVIDENCE.md) và [registry](CLAIM_REGISTRY.md); không cần bổ sung số liệu giả để lấp khối trang.
