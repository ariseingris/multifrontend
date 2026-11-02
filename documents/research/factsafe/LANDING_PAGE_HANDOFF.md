# FactSafe — bản bàn giao nội dung landing page

Ngày 27/10/2026. **ĐỀ XUẤT — chưa triển khai hoặc phê duyệt xuất bản.** Tài liệu này nối nội dung đã soạn với cấu trúc trang, không thay bản copy nguồn. [WEBSITE_CONTENT.md](WEBSITE_CONTENT.md) là nguồn câu chữ; [CONTENT_MAP.json](CONTENT_MAP.json) là bản đồ section/claim/source. Không chép cả bản copy vào một nguồn thứ hai.

## 1. Mục tiêu trang và hành trình người mua

**Người đọc ưu tiên:** EHS manager và quản lý vận hành nhà máy; đối tác IIoT tham gia đánh giá tích hợp.

**Hành trình:** Đội EHS nhận ra câu hỏi về chất, vùng và dữ liệu → xem diễn tiến khí/bụi trong demo → trao đổi yêu cầu phép đo và workflow.

**Conversion chính:** Đề nghị xem demo. Conversion phụ: Trao đổi bài toán nhà máy. Đây là lời mời trao đổi; chưa là lịch demo, hợp đồng hoặc khả năng thực hiện pilot được xác nhận.

Điều hướng đề xuất: Bài toán nhà máy · Giải pháp · Demo · Trao đổi. Dùng landing page giải thích bài toán và giá trị trước phần demo; không mở trang bằng một màn hình dashboard đầy đủ.

## 2. Bản đồ nội dung

Tên section là đề xuất anchor cho giai đoạn triển khai; chưa phải route hoặc UI tồn tại. Phần SEO là metadata, không tạo thành một khối hiển thị ở cuối trang. Cả mười mục giữ wording từ bản copy nguồn. Mọi claim trong bảng vẫn PENDING; trạng thái chỉ thay khi có quyết định thực.

| Thứ tự | Anchor đề xuất | Mục trong copy nguồn | Vai trò và giới hạn | Claim ID |
| --- | --- | --- | --- | --- |
| 1 | gioi-thieu | 1. Hero | Nêu nguyên mẫu và người đọc EHS/vận hành | FS-C01, FS-C02, FS-C13, FS-C14 |
| 2 | van-de | 2. Vấn đề | Đặt câu hỏi theo chất/vùng; bối cảnh ILO có năm và phạm vi | FS-C07, FS-C08, FS-C12 |
| 3 | giai-phap | 3. Giải pháp | Giới thiệu tín hiệu tổng hợp, tình huống và diễn tiến | FS-C02, FS-C03, FS-C04, FS-C05 |
| 4 | cach-tiep-can | 4. Vì sao nên tìm hiểu FactSafe? | Nêu cách trao đổi/phạm vi, tránh hiệu năng vượt trội | FS-C04, FS-C07, FS-C12, FS-C14 |
| 5 | gia-tri | 5. Business value | Đề xuất đo công việc và lifecycle; không hứa tiết kiệm | FS-C06, FS-C07, FS-C11, FS-C12 |
| 6 | bang-chung | 6. Evidence và bối cảnh chuyên môn | Nêu chất lượng phép đo; legal applicability vẫn cần đối chiếu | FS-C09, FS-C10, FS-C12, FS-C15 |
| 7 | demo | 7. Product demo | Minh họa khí và bụi theo vùng; giải thích giới hạn score | FS-C03, FS-C04, FS-C05, FS-C06 |
| 8 | cau-hoi | 8. FAQ | Giải đáp tám câu hỏi, nhất là QCVN và tích hợp | FS-C01, FS-C02, FS-C04, FS-C06, FS-C10, FS-C11, FS-C12, FS-C13, FS-C14 |
| 9 | lien-he | 9. Contact / conversion | Mời demo hoặc trao đổi yêu cầu thực tế | FS-C13, FS-C14 |
| 10 | seo | 10. SEO | Metadata và outline theo ngành; keywords là giả thuyết | FS-C01, FS-C02, FS-C03, FS-C04, FS-C05, FS-C06, FS-C07, FS-C08, FS-C09, FS-C10, FS-C11, FS-C12, FS-C13, FS-C14, FS-C15 |

Không xóa năm, đơn vị, phạm vi hoặc qualifiers để rút ngắn thẻ số liệu. Không biến nguồn ngành thành chứng cứ hiệu năng dự án. Giữ link nguồn sát khối evidence khi dàn trang.

## 3. Hướng trình bày và media

Ưu tiên bố cục theo khu vực làm việc, sơ đồ dữ liệu và vai trò EHS. Nền trung tính, nhấn màu có chọn lọc là đề xuất thiết kế; không trình bày mọi phần như bảng cảnh báo đỏ.

**Danh sách media cần chuẩn bị:** Sơ đồ vùng nhà máy minh họa, sơ đồ luồng kiểm tra và ảnh demo khí/bụi có chú thích. Không dùng hình nhà máy khác như khách hàng hiện hữu.

Media dự kiến lưu theo [quy tắc tài nguyên](../../../AGENTS.md): project images ở `assets/factsafe/images/`; bản dùng chung chỉ một nguồn ở `assets/shared/`. Chưa có media được tạo, tải hoặc di chuyển trong bản bàn giao này. Khi chọn media cần ghi nguồn/quyền sử dụng; không dùng nhãn/logos đối thủ như endorsement.

Mobile đi theo cùng thứ tự nội dung. Ảnh demo cần caption, đồ thị cần giải thích ngắn và đơn vị đọc được. FAQ phải đọc được bằng bàn phím khi triển khai. Hướng màu/ảnh là đề xuất sáng tạo, không phải kết quả so sánh hiệu năng.

## 4. Demo có hướng dẫn

So sánh điều kiện bình thường, sự kiện ammonia tại vùng B và bụi tại vùng D; chỉ cách đọc diễn tiến và trạng thái dữ liệu. Giải thích risk score là phép tổng hợp demo, không là xác suất tai nạn.

**Nhãn phải đi cùng demo và ảnh demo:** “Dữ liệu và cảnh báo mô phỏng — không dùng để quyết định an toàn thực tế.”

Các scenario IDs trong JSON được đối chiếu [config hiện có](../../../frontend/src/projects/factsafe/config.ts). Selector `?project=factsafe` có trong [bộ chọn dự án](../../../frontend/src/core/projects.ts); đây là quy tắc chọn demo tại app hiện có, **không xác nhận URL triển khai công khai hoặc đã kiểm thử runtime trong phiên này**. Chưa gán link public, embed, autoplay hoặc route landing mới.

Nếu demo chưa chạy được ở môi trường xuất bản sau này, dùng ảnh demo đúng phiên bản có nhãn hoặc mời xem có hướng dẫn qua kênh thật. Không hiển thị nút “Xem trực tiếp” dẫn tới URL chưa xác minh.

## 5. CTA và tiếp nhận nhu cầu

CTA Hero và CTA cuối trang đề xuất cuộn tới `#lien-he`. Chưa có email, số điện thoại, endpoint hoặc lịch hẹn được xác nhận. Sau khi có kênh thật, nhãn và đích phải nhất quán; form chỉ báo thành công khi thực sự tiếp nhận được yêu cầu. Khi chưa có kênh, bản preview có thể ghi “Kênh liên hệ đang được nhóm xác nhận”; không giả thông báo đã gửi.

Thông tin trao đổi đề xuất: Ngành sản xuất, vai trò người trao đổi, nhóm hazard quan tâm và workflow hiện tại; không yêu cầu bản đồ chi tiết cơ sở trong lượt đầu.

Nếu chọn form ở giai đoạn sau: tên, tổ chức, một kênh liên hệ do người dùng chọn, nhu cầu và lời nhắn là tập tối thiểu đề xuất. Cần xác định đơn vị tiếp nhận, mục đích sử dụng và cách xử lý dữ liệu trước khi mở nhận thông tin; chưa tạo chính sách, tài khoản hoặc dịch vụ bên ngoài.

## 6. Phạm vi cần giữ khi triển khai sau này

Chưa tạo bảng đạt QCVN, huy hiệu chứng nhận, cam kết giảm tai nạn, ngưỡng pháp lý từ config, SMS/Zalo thương mại hoặc SLA.

Không chuyển claim registry thành nội dung hiển thị công khai nguyên trạng. Bỏ chú giải “Claim: …” khỏi phần trình bày khách hàng nhưng giữ việc truy vết trong hồ sơ biên tập. Các lời mô tả giới hạn sản phẩm và nhãn mô phỏng vẫn là nội dung khách hàng cần thấy.

Không đổi dashboard, scenario IDs hoặc simulator để làm khớp một lời hứa marketing. Nếu copy vượt hiện vật, sửa copy và registry. Tham khảo [kế hoạch kiểm chứng](../shared/PILOT_VALIDATION_PLAN.md) trước khi thêm hiệu quả định lượng.

## 7. Tiêu chí nghiệm thu nội dung và dữ liệu còn thiếu

- Người đọc phân biệt gas, dust và score demo; hiểu cần thiết bị/phương pháp phù hợp và trách nhiệm EHS trước tích hợp.
- Đủ nội dung từ hero đến FAQ/contact; một H1; SEO không thêm claim mới; tám FAQ có nội dung trả lời.
- Mỗi claim có nguồn và phạm vi; không dùng claim NO; PENDING giữ nguyên trong giai đoạn nghiên cứu, không tự tạo phê duyệt.
- Nguồn ngành được ghi năm/phạm vi; hình demo không được hiểu là kết quả hiện trường.
- CTA có đích thật trước khi mở nhận nhu cầu; chưa thể nghiệm thu conversion hoạt động từ bản tài liệu này.

Thiếu hồ sơ gốc và xác nhận chi phí, field evidence, contact channel, quyền media và quyết định xuất bản. Các thiếu hụt đã có trong [fact sheet](PROJECT_FACT_SHEET.md), [evidence](MARKET_EVIDENCE.md) và [registry](CLAIM_REGISTRY.md); không cần bổ sung số liệu giả để lấp khối trang.
