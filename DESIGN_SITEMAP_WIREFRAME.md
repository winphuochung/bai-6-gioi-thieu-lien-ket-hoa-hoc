# BẢN THIẾT KẾ HỌC LIỆU SỐ TƯƠNG TÁC (SITEMAP & WIREFRAME NỘI DUNG)
**Môn học:** Khoa học Tự nhiên 7 (Bộ sách Kết nối tri thức với cuộc sống)  
**Tên bài học:** Bài 6: Giới thiệu về liên kết hóa học  
**Đơn vị:** Giáo viên Hóa học Lê Văn Thắng – Trường TH & THCS Phước Hưng  

---

## 🎨 Tuyên ngôn Thiết kế (Design Commitment & User-Centered Design)
- **Tông màu chủ đạo (60-30-10 Rule - Tuân thủ Purple Ban):**
  - **60% Nền sáng khoa học:** Trắng tinh khiết (`#FFFFFF`) & Xanh băng nhạt (`#F0F9FF`) giúp chữ rõ nét, chống mỏi mắt cho học sinh lớp 7.
  - **30% Xanh dương Nguyên tử (`#0284C7` / `#0369A1`):** Đại diện cho chiều sâu khoa học, hạt nhân và quỹ đạo electron.
  - **10% Vàng Năng lượng (`#F59E0B` / `#FBBF24`) & Xanh Ngọc Phản hồi (`#10B981`):** Tạo điểm nhấn cho các nút tương tác, electron lớp ngoài cùng và huy hiệu khen thưởng.
- **Khả năng đọc (Readability & Chunking):** Cỡ chữ cơ sở `17px–18px`, chia nhỏ kiến thức thành các thẻ lật (Flip Cards), mô phỏng SVG trực quan và bảng so sánh ngắn gọn.

---

## 0. Cổng Đăng nhập Học sinh (Authentication Gate)
- **Trạng thái truy cập:** Khoá giao diện bài học cho đến khi học sinh đăng nhập thành công.
- **Trường thông tin bắt buộc:**
  1. `Tên đăng nhập (Họ và tên học sinh)`: Ví dụ *"Nguyễn Minh An"*.
  2. `Lớp`: Ví dụ *"7A1"* (có nút chọn nhanh 7A1, 7A2, 7A3, 7A4 hoặc tự nhập).
- **Sau khi đăng nhập:** Mở khóa toàn bộ không gian bài học, hiển thị lời chào cá nhân hóa trên Header kèm **Nút Đăng xuất (Logout)** để đổi tài khoản học sinh khác.

---

## 1. Header: Tên bài học & Thanh tiến trình học tập (Progress Bar)
- **Cấu trúc hiển thị cố định (Sticky Header):**
  - **Cụm trái:** Logo Giáo viên Hóa học Lê Văn Thắng (TH & THCS Phước Hưng) + Tên bài học: **BÀI 6: GIỚI THIỆU VỀ LIÊN KẾT HÓA HỌC**.
  - **Cụm giữa (Progress Bar):** Thanh tiến trình từ `0%` đến `100%` tự động tăng khi học sinh khám phá các thẻ kiến thức, hoàn thành mô phỏng nguyên tử và nộp bài kiểm tra.
  - **Cụm phải:** Hiển thị thẻ `👨‍🎓 [Tên Học Sinh] - Lớp [Lớp]`, nút `⚙️ Google Sheet` và nút `🚪 Đăng xuất`.

---

## 2. Section 1: Khởi động (Warm-up)
- **Câu hỏi dẫn nhập gây tò mò:** *"Tại sao nguyên tử lại muốn 'kết bạn' với nhau?"*
- **Hoạt động tương tác mở màn – "Thí nghiệm Khinh khí cầu & Bữa tiệc Nguyên tử":**
  - **Tình huống 1 (Khinh khí cầu):** Cho học sinh chọn bơm khí **Hydrogen ($\text{H}_2$)** hay khí **Helium ($\text{He}$)** vào khinh khí cầu lễ hội.
    - Chọn $\text{H}_2$: Cảnh báo hiệu ứng tia lửa *"Nguy hiểm! Hydrogen rất dễ cháy nổ!"*
    - Chọn $\text{He}$: Khinh khí cầu bay lên an toàn *"Chính xác! Helium là khí hiếm trơ, rất khó cháy nổ nên được dùng bơm khinh khí cầu!"*
  - **Tình huống 2 (Câu hỏi khởi động SGK):** Tại sao chỉ có khí hiếm ($\text{He}, \text{Ne}, \text{Ar}$) đứng một mình bền vững, còn $\text{Na}, \text{Cl}, \text{H}, \text{O}$ luôn tìm cách kết hợp với nhau?

---

## 3. Section 2: Cấu trúc electron bền vững của khí hiếm (Khám phá)
- **Trình bày Hình 6.1 dưới dạng Mô hình Nguyên tử Động + Thẻ lật 3D (Flip Cards):**
  - Học sinh nhấp vào từng thẻ **Helium ($\text{He}$)**, **Neon ($\text{Ne}$)**, **Argon ($\text{Ar}$)** để lật xem chi tiết hoặc bật chế độ **"Chỉ hiển thị lớp electron ngoài cùng"**:
    1. **Helium ($\text{He}$, $+2$):** Có 1 lớp electron, lớp ngoài cùng chứa **2 electron** (bền vững đặc biệt).
    2. **Neon ($\text{Ne}$, $+10$):** Có 2 lớp electron ($2, 8$), lớp ngoài cùng chứa **8 electron** bền vững.
    3. **Argon ($\text{Ar}$, $+18$):** Có 3 lớp electron ($2, 8, 8$), lớp ngoài cùng chứa **8 electron** bền vững.
- **Câu hỏi tương tác SGK (Hình 6.1):** *"Quan sát Hình 6.1, so sánh số electron lớp ngoài cùng của He, Ne và Ar."* (Phản hồi tức thì khi chọn đáp án).

---

## 4. Section 3: Liên kết Ion & Liên kết Cộng hóa trị (Khám phá & Thực hành)

### 4.1. Khám phá Mô phỏng Động (Interactive Simulators)
1. **Mô phỏng Liên kết Ion (Hình 6.2 - $\text{NaCl}$ & Hình 6.3 - $\text{MgO}$):**
   - **Phân tử muối ăn ($\text{NaCl}$):** Học sinh nhấn nút **"Nhường 1 electron từ Na sang Cl"**:
     - Nguyên tử $\text{Na}$ ($2,8,1$) nhường $1\text{e} \rightarrow$ ion dương $\text{Na}^+$ ($2,8$ - giống khí hiếm $\text{Ne}$).
     - Nguyên tử $\text{Cl}$ ($2,8,7$) nhận $1\text{e} \rightarrow$ ion âm $\text{Cl}^-$ ($2,8,8$ - giống khí hiếm $\text{Ar}$).
     - Hai ion ngược dấu $\text{Na}^+$ và $\text{Cl}^-$ hút nhau tạo liên kết ion trong $\text{NaCl}$.
   - **Phân tử magnesium oxide ($\text{MgO}$):** Học sinh nhấn nút **"Nhường 2 electron từ Mg sang O"**:
     - Nguyên tử $\text{Mg}$ ($2,8,2$) nhường $2\text{e} \rightarrow$ ion dương $\text{Mg}^{2+}$ ($2,8$ - giống $\text{Ne}$).
     - Nguyên tử $\text{O}$ ($2,6$) nhận $2\text{e} \rightarrow$ ion âm $\text{O}^{2-}$ ($2,8$ - giống $\text{Ne}$).
2. **Mô phỏng Liên kết Cộng hóa trị (Hình 6.4 - $\text{H}_2$, Hình 6.5 - $\text{O}_2$, Hình 6.6 - $\text{H}_2\text{O}$ & Mở rộng $\text{Cl}_2, \text{N}_2, \text{CO}_2, \text{NH}_3$):**
   - **Phân tử $\text{H}_2$:** Mỗi nguyên tử $\text{H}$ góp chung $1\text{e} \rightarrow 1$ cặp electron dùng chung (giống $\text{He}$ - $2\text{e}$).
   - **Phân tử $\text{O}_2$:** Mỗi nguyên tử $\text{O}$ góp chung $2\text{e} \rightarrow 2$ cặp electron dùng chung (giống $\text{Ne}$ - $8\text{e}$).
   - **Phân tử $\text{H}_2\text{O}$:** Nguyên tử $\text{O}$ góp chung với mỗi nguyên tử $\text{H}$ $1\text{e} \rightarrow 2$ cặp electron dùng chung ($\text{O}$ giống $\text{Ne}$, $\text{H}$ giống $\text{He}$).

### 4.2. Ba Hoạt động Thực hành Tương tác (Interactive Activities)
- **Hoạt động 1: Xưởng Lắp Ghép Electron (Chuyển / Góp Electron):**
  - Học sinh điều khiển trực tiếp quá trình cho-nhận hoặc góp chung electron của 5 phân tử điển hình ($\text{NaCl}, \text{MgO}, \text{H}_2, \text{O}_2, \text{H}_2\text{O}$).
  - *Logic phản hồi:* Đúng $\rightarrow$ *"Tuyệt vời! Chính xác! Nguyên tử đã đạt cấu hình bền vững của khí hiếm!"*; Sai $\rightarrow$ *"Thử lại nhé! Gợi ý: Đếm số electron lớp ngoài cùng hiện tại xem thiếu hay thừa mấy electron để đạt 8e (hoặc 2e với H)."*
- **Hoạt động 2: Phân loại Tính chất Hợp chất Ion & Chất Cộng hóa trị:**
  - Học sinh phân loại 8 thẻ tính chất/đặc điểm vào 2 nhóm **Hợp chất Ion** và **Chất Cộng hóa trị**.
- **Hoạt động 3: Ghép Cặp Nguyên Tử & Bản Chất Liên Kết:**
  - Ghép cặp nhanh các phân tử trong SGK ($\text{NaCl}, \text{MgO}, \text{H}_2, \text{O}_2, \text{H}_2\text{O}, \text{CO}_2, \text{NH}_3, \text{Cl}_2, \text{N}_2$) với cơ chế hình thành liên kết tương ứng.

---

## 5. Section 4: Hệ thống Kiểm tra Đánh giá (Thang điểm 100 - 45 Câu hỏi)
- **Cấu trúc điểm số chuẩn 100 điểm:**
  1. **Phần I - Trắc nghiệm nhiều lựa chọn:** 10 câu × 2 điểm = **20 điểm**.
  2. **Phần II - Trắc nghiệm Đúng / Sai:** 10 câu × 2 điểm = **20 điểm**.
  3. **Phần III - Trắc nghiệm Ghép cột:** 10 câu × 2 điểm = **20 điểm**.
  4. **Phần IV - Trắc nghiệm Trả lời ngắn:** 10 câu × 2 điểm = **20 điểm**.
  5. **Phần V - Tự luận:** 5 câu × 4 điểm = **20 điểm** (Chấm tự động theo từ khóa chuẩn + gửi nguyên văn bài làm về Google Sheet).
- **Tính năng Nộp bài & Phản hồi:**
  - Nút **"NỘP BÀI & CHẤM ĐIỂM"** tổng hợp điểm số tức thì trên thang 100, trao Huy hiệu Danh hiệu Khoa học, hiển thị giải thích chi tiết từng câu và tự động đẩy dữ liệu qua `fetch()` POST về **Google Apps Script Web App**.

---

## 6. Footer: Tổng kết & Thông báo kết quả
- **Sơ đồ tư duy "Em đã học" & Góc vận dụng "Em có thể":**
  - Giải thích hiện tượng thực tế: Vì sao muối ăn ($\text{NaCl}$) ở thể rắn, khó nóng chảy, khó bay hơi, còn đường ăn, nước đá dễ nóng chảy và nước lỏng ($\text{H}_2\text{O}$) dễ bay hơi.
- **Nút "Hoàn thành bài học":** Tổng kết tiến độ 100% và xuất Chứng nhận hoàn thành bài học cho học sinh.

---

## 7. Prompt Tạo Hình Ảnh Minh Họa 3D (Dành cho AI Image Generator khi mở rộng)
1. **Prompt 1 (Mô hình 3D phân tử nước $\text{H}_2\text{O}$):**
   > *"3D educational scientific illustration of a water molecule (H2O) showing covalent bonding for 7th grade students, one glowing blue oxygen atom in the center sharing two pairs of golden glowing electrons with two smaller white hydrogen atoms, translucent orbital rings, bright clean laboratory background, vibrant yellow and sky blue color palette, Pixar-style 3D render, ultra-sharp, high resolution."*
2. **Prompt 2 (Mô hình 3D sự hình thành liên kết ion $\text{NaCl}$):**
   > *"3D educational chemistry infographic showing ionic bond formation in sodium chloride (NaCl), a friendly metallic sodium atom transferring one bright golden outer electron to a green chlorine atom, transforming into Na+ cation and Cl- anion with electrostatic attraction sparks, clean bright background, vibrant educational colors, high detail."*
3. **Prompt 3 (Bữa tiệc Khí hiếm $\text{He}, \text{Ne}, \text{Ar}$):**
   > *"Cute 3D mascot characters of Helium, Neon, and Argon noble gas atoms wearing golden crowns representing stable 2 and 8 outer shell electrons, floating safely inside colorful hot air balloons and neon signs, bright cheerful lighting, K-12 science textbook illustration."*
