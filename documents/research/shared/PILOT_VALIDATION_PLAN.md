# Kế hoạch kiểm chứng nhu cầu và giá trị cho ba dự án

Soạn 27/10/2026. **PROJECT_PROPOSAL / PROJECT_ASSUMPTION**: đây là thiết kế nghiên cứu tiếp theo, chưa có người tham gia, đơn vị pilot, ngân sách, lịch triển khai hoặc kết quả đo. Không phải quy trình thao tác an toàn, quy trình bay hay chỉ dẫn tạo sự cố.

## 1. Hai lớp nghiên cứu

Trước hết, phỏng vấn người mua để kiểm tra vấn đề và cách đánh giá giải pháp. Sau đó mới xây protocol kỹ thuật cùng người phụ trách hiện trường, nếu có thiết bị và điều kiện phù hợp. Kết quả software demo chỉ hỗ trợ trao đổi; không dùng làm ground truth cho hiệu năng ngoài thực địa.

Không đặt một mức accuracy, uptime, thời gian hoàn vốn hoặc cỡ mẫu giả làm cam kết. Các giá trị nghiệm thu, khoảng thời gian theo dõi và quy mô thử phải được xác định trước thu thập dữ liệu, có lý do theo ứng dụng. Ghi lại thay đổi protocol; tách phân tích đã định trước khỏi phân tích phát sinh.

## 2. Phỏng vấn người mua

| Dự án | Người nên trao đổi, chưa phải khách hàng hiện hữu | Câu hỏi cần kiểm tra | Quyết định nội dung có thể thay đổi |
| --- | --- | --- | --- |
| AquaSense | Chủ trại, người trực ao, hợp tác xã, nhà phân phối | Lần gần nhất gặp biến động nước? Đo lúc nào, ai đọc? Phân biệt lỗi đầu dò ra sao? Mất mạng ảnh hưởng gì? Ai quyết định mua và bảo trì? | Ưu tiên thông số, ngôn ngữ pain point, điều kiện kết nối, phạm vi dịch vụ |
| FactSafe | EHS, vận hành, bảo trì/đo lường, người mua, đối tác IIoT | Hazard nào và ở khu vực nào? Quy trình hiện có? Ai xác minh cảnh báo? Thiết bị/phương pháp đang dùng? Quy trình mua và trách nhiệm tích hợp? | Phạm vi solution, cách nói về cảnh báo, lifecycle/service và CTA phù hợp |
| FireScout | Chỉ huy/đội PCCC công nghiệp, quản lý ứng cứu, người vận hành UAV, đối tác payload | Thông tin thiếu ở nhiệm vụ nào? Ai xác nhận dấu hiệu? Điều kiện nhìn, link, pin? Workflow UAV đang có? Điều kiện tiếp nhận một thử nghiệm? | Mission phù hợp, vai trò con người, giới hạn thermal/AI, phạm vi pilot |

Ghi vai trò, ngành, thời điểm phỏng vấn, cách tuyển, câu hỏi và ghi chép đã được người tham gia đồng ý. Tách lời người tham gia khỏi diễn giải nhóm. Không suy rộng tỷ lệ nhu cầu toàn thị trường từ mẫu thuận tiện; không gán tên/logo làm endorsement. Chưa có chương trình liên hệ hoặc gửi lời mời nào được thực hiện.

## 3. Hồ sơ tối thiểu của một phép đánh giá

Mỗi protocol cần có câu hỏi, version phần mềm/firmware/model, cấu hình thiết bị, bối cảnh và thời gian, đơn vị, chuẩn đối chiếu, cách đồng bộ đồng hồ, dữ liệu thiếu, người chịu trách nhiệm, cách ghi lỗi và tiêu chí nghiệm thu thống nhất trước. Lưu điều kiện hiệu chuẩn/kiểm tra tham chiếu và người xác minh ground truth. Dùng ID đã ẩn danh khi có thông tin của cá nhân/cơ sở.

**Mẫu bản ghi đề xuất:** `study_id`, `project`, `protocol_version`, `measurement_id`, `timestamp_with_timezone`, `device_id`, `software_version`, `model_version_or_not_applicable`, `condition`, `observed_value`, `unit`, `reference_value`, `reference_method`, `reference_timestamp`, `missing_reason`, `operator_role`, `verification_status`, `limitations`.

Chưa có dataset thử nghiệm được điền. Không ghi một giá trị thay cho missing. Các screenshot có thể minh họa giao diện nhưng không thay log đo, reference và protocol.

## 4. AquaSense — phép đo cần chuẩn bị

| Câu hỏi | Phép đo / đơn vị | Baseline hoặc đối chiếu | Giới hạn để diễn giải |
| --- | --- | --- | --- |
| Dữ liệu có phản ánh điều kiện ao? | Sai lệch DO (mg/L), pH (không thứ nguyên), ORP (mV), độ mặn (ppt), nhiệt độ (°C) | Phương pháp/thiết bị tham chiếu phù hợp, cùng điểm và thời gian; ghi điều kiện hiệu chuẩn | Không lấy thông số demo làm thông số sensor thật; độ lệch phụ thuộc vị trí và điều kiện |
| Nhận biết thay đổi mất bao lâu? | Các mốc sensor → nhận dữ liệu → người đọc xác nhận; giây/phút, phân bố và số quan sát | Mốc tham chiếu độc lập; đồng hồ đồng bộ; cách kiểm tra hiện hành | Phân biệt độ trễ hệ thống với thời gian phản ứng con người; chưa là dự báo sớm |
| Có phân biệt đầu dò và ao không? | Số trường hợp đúng/sai/không xác định theo từng loại; thời gian kiểm tra | Ground truth xác nhận bởi người/phương pháp độc lập | Tình huống fouling mô phỏng không chứng minh phát hiện fouling thật |
| Vận hành có bền vững? | Mẫu hợp lệ/mẫu kỳ vọng; thời gian mất dữ liệu; giờ bảo trì; chi phí mỗi kỳ | Nhật ký kết nối, vệ sinh/hiệu chuẩn và công theo dõi hiện hành | Tách sensor, mạng, điện và software; không quy mọi lỗi vào một lớp |

Theo dõi sản lượng, tỷ lệ sống hoặc điện sục khí chỉ khi protocol thu được bối cảnh vụ nuôi, mật độ, thời tiết, can thiệp và đối chứng phù hợp. Không diễn giải chênh lệch giữa hai ao khác điều kiện thành tác động nhân quả của AquaSense.

## 5. FactSafe — phép đo cần chuẩn bị

| Câu hỏi | Phép đo / đơn vị | Baseline hoặc đối chiếu | Giới hạn để diễn giải |
| --- | --- | --- | --- |
| Theo dõi đúng hazard và phương pháp? | Chất đo, dải đo, thời gian trung bình, đơn vị theo phương pháp; nhãn đơn vị giữ nguyên | Hồ sơ hazard và thiết bị/phương pháp do người phụ trách EHS/đo lường xác định | Không dùng PM2.5 tức thời thay mọi phép quan trắc bụi; không tự đổi % CH4 thành %LEL |
| Dữ liệu/cảnh báo có đáng tin? | Sai lệch phép đo; response time; sự kiện đúng/sai/bỏ sót và mẫu số theo loại | Kiểm tra thiết bị theo hướng dẫn phù hợp và reference độc lập | Không tạo rò rỉ nguy hiểm để làm demo; việc kiểm tra thực do người có trách nhiệm thiết kế |
| Workflow có hữu ích? | Thời gian nhận biết, xác minh, tổng hợp báo cáo; phút/case và số case | Cùng nhiệm vụ có/không giao diện hoặc workflow hiện có; ghi độ phức tạp | Không coi risk score là xác suất tai nạn hoặc mức phơi nhiễm |
| Chi phí vòng đời ra sao? | Giờ bảo trì/hiệu chuẩn; downtime; phần cứng, tích hợp, đào tạo và phí kỳ | Chứng từ/ước tính có ngày, tiền tệ, cấu phần và phạm vi | Không tính “tai nạn đã tránh được” từ cảnh báo hoặc dùng giá hãng khác làm quote FactSafe |

[NIOSH 2012-162](https://stacks.cdc.gov/view/cdc/11956) là nguồn hướng dẫn lịch sử về đánh giá thiết bị direct-reading, không chứng nhận cho dự án. Khung pháp lý và phương pháp áp dụng cần đối chiếu riêng; không thay hệ thống bảo vệ hiện hữu bằng software demo.

## 6. FireScout AI — phép đo cần chuẩn bị

| Câu hỏi | Phép đo / đơn vị | Baseline hoặc đối chiếu | Giới hạn để diễn giải |
| --- | --- | --- | --- |
| Hình ảnh hỗ trợ nhiệm vụ nào? | Tỷ lệ nhiệm vụ quan sát được, điều kiện camera/ống kính, khoảng cách, góc, ánh sáng và vật cản | Nhiệm vụ kiểm chứng được thống nhất; quan sát đối chiếu độc lập | Thermal contrast không luôn là nhiệt độ bề mặt đúng; cần cấu hình radiometric nếu đo nhiệt |
| AI có phát hiện được đối tượng? | TP/FP/FN theo lớp, precision, recall; confidence calibration nếu có | Nhãn độc lập, quy tắc đánh giá định trước; tách cảnh/địa điểm giữa train và test | Không lấy các frame gần nhau ở cả train/test làm bằng chứng khái quát; score demo không có ý nghĩa xác suất |
| Thông tin tới người vận hành thế nào? | Độ trễ end-to-end (ms/s), dữ liệu thiếu, gián đoạn link, thời gian hoàn thành nhiệm vụ | Log đồng bộ camera/link/UI và người đánh giá | Không quy mọi độ trễ thành “thời gian cứu người”; pin và link cần đánh giá riêng |
| Có phù hợp workflow ứng cứu? | Người dùng hiểu đúng candidate/unknown, xác định bước kiểm tra tiếp, thời gian và lỗi diễn giải | Nhiệm vụ đánh giá có hướng dẫn; so với workflow phù hợp | Phân biệt usability test, thử thiết bị kiểm soát và nhiệm vụ thực; không dùng software demo làm giấy phép bay |

Bắt đầu bằng dữ liệu/môi trường kiểm soát khi phù hợp; hoạt động bay thật chỉ xem xét sau khi có người phụ trách, thiết bị và điều kiện áp dụng. Protocol này không xác nhận các điều kiện đó. Nguồn về thermal và UAV nằm trong [FireScout evidence](../firescout/MARKET_EVIDENCE.md).

## 7. Đánh giá kinh tế có điều kiện

Nếu có dữ liệu chi phí, thống nhất một kỳ so sánh và tiền tệ. Tổng chi phí kỳ gồm các cấu phần được khai báo: thiết bị phân bổ, lắp đặt/tích hợp, kết nối, phần mềm, công vận hành, hiệu chuẩn/bảo trì, đào tạo và thay thế. Tránh cộng trùng CAPEX và khấu hao trong cùng phép so sánh.

Lợi ích vận hành có thể ước tính từ chênh lệch thời gian cho cùng công việc nhân đơn giá công có nguồn, trừ chi phí tăng thêm. Đây là mô hình ước tính theo giả định, không phải doanh thu, lợi nhuận hoặc tiền tiết kiệm đã thực nhận. Chưa điền giá trị hoặc tính payback/ROI vì chưa có baseline và cấu phần được xác nhận. Tách phân tích nhạy cảm khỏi kết quả đo; không quy doanh thu toàn ngành thành thị trường có thể bán được.

## 8. Chuyển bằng chứng thành nội dung

Một kết quả mới cần bản mô tả có phương pháp, phiên bản, số quan sát, đơn vị, thời gian, điều kiện và sai số/giới hạn phù hợp. Gắn source gốc, ghi người rà soát thực tế và ngày, cập nhật claim ID tương ứng. Phát hiện không đủ bằng chứng có thể dẫn đến sửa câu chữ hoặc bỏ claim.

Kết quả nhỏ ở một nơi nên ghi “trong thử nghiệm … với điều kiện …”; không đổi thành “bảo đảm cho mọi khách hàng”. Company claim của đối thủ tiếp tục là company claim. Quyết định xuất bản là bước biên tập riêng; chưa có phê duyệt nào được ghi nhận trong kế hoạch này.
