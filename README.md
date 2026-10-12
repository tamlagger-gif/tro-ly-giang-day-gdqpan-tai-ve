# Trợ lý Giảng dạy GDQP&AN — Tải bộ cài

Phần mềm hỗ trợ giáo viên Giáo dục Quốc phòng và An ninh: hồ sơ, bài giảng, trình chiếu và lớp học số.
Miễn phí, không cần kích hoạt. Kho này chỉ chứa bộ cài; dữ liệu của thầy cô luôn lưu trên máy của mình.

## 👉 [Bấm vào đây để tải bản mới nhất](../../releases/latest)

| Máy | Tệp cần tải |
|-----|-------------|
| Windows 10/11 (64-bit) | `...-Windows-Setup.exe` |
| MacBook / iMac chip Apple (M1, M2, M3, M4…) | `...-Mac-chip-Apple.dmg` |
| MacBook / iMac chip Intel | `...-Mac-chip-Intel.dmg` |

Xem máy Mac dùng chip gì: bấm menu quả táo → **Giới thiệu máy Mac** → dòng **Chip** hoặc **Bộ xử lý**.

## Cài trên Windows

1. Tải tệp `...-Windows-Setup.exe` rồi mở.
2. Nếu hiện **"Windows đã bảo vệ máy tính của bạn"**: bấm **Thông tin thêm** → **Vẫn chạy**
   (bộ cài chưa mua chứng thư ký số nên Windows cảnh báo, đây là bình thường).
3. Chọn thư mục cài hoặc giữ mặc định → **Cài đặt** → mở phần mềm từ Desktop hoặc menu Start.

Yêu cầu: Windows 10 64-bit trở lên, RAM 4 GB, còn trống 1 GB.

## Cài trên máy Mac

1. Tải đúng tệp `.dmg` theo chip của máy rồi nháy đúp để mở.
2. Kéo biểu tượng **Tro Ly Giang Day GDQPAN** vào thư mục **Applications**.
3. Mở ứng dụng từ Launchpad. Lần đầu macOS báo không mở được: vào
   **Cài đặt hệ thống → Quyền riêng tư & Bảo mật**, kéo xuống bấm **Vẫn mở** (Open Anyway), nhập mật khẩu máy.
4. Nếu macOS báo ứng dụng "đã bị hỏng", mở **Terminal** và chạy:

   ```
   xattr -dr com.apple.quarantine "/Applications/Tro Ly Giang Day GDQPAN.app"
   ```

Yêu cầu: macOS 12 Monterey trở lên, còn trống 2 GB.

## Cập nhật lên bản mới

Phần mềm không tự cập nhật. Khi có bản mới, tải bộ cài mới ở trang trên và cài đè; dữ liệu cũ được giữ nguyên.
Nên sao lưu dữ liệu trong phần mềm trước khi cài đè.

## Ủng hộ tác giả

Phần mềm miễn phí, không cần kích hoạt. Nếu thấy hữu ích, thầy cô có thể ủng hộ tác giả tùy tâm —
hoàn toàn tự nguyện và không ảnh hưởng đến bất kỳ chức năng nào.

<img src="ung-ho-mb-bank.png" alt="Mã QR ủng hộ tác giả qua MB Bank, số tài khoản 0906138215" width="377">

**MB Bank · 0906138215** — tác giả Võ Hồng Tâm.

## Nguồn nội dung

Phần mềm dùng cho mục đích giảng dạy, không kinh doanh. Nội dung bài giảng trích từ giáo trình và sách giáo khoa;
bản quyền thuộc cơ quan, nhà xuất bản phát hành:

- Tài liệu dạy và học Giáo dục quốc phòng và an ninh trình độ trung cấp, trình độ cao đẳng.
- SGK Giáo dục quốc phòng và an ninh 10, 11, 12 (bộ Kết nối tri thức với cuộc sống), NXB Giáo dục Việt Nam.

Khi giảng, mỗi trang chiếu đều ghi nguồn ở chân trang. Chữ của SGK lớp 11, 12 được máy đọc từ bản scan nên
có thể còn lỗi: thầy cô đối chiếu với sách in khi cần.

## An toàn

Chỉ tải bộ cài từ trang này. Không cài bản do người lạ gửi qua tin nhắn hoặc mạng xã hội.
Mỗi bản phát hành có tệp `SHA256SUMS.txt` để đối chiếu nếu cần.
