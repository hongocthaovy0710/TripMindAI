# PROMPT — BÀI THỰC HÀNH CHƯƠNG 4: AI TRONG THIẾT KẾ SẢN PHẨM (TripMind AI)

> Đây là prompt đã được viết lại cho sản phẩm **TripMind AI**. Dùng prompt này để tạo
> các tài liệu 4.1 → 4.4. Đọc và duyệt trước khi thực hiện.

---

## VAI TRÒ

Bạn đóng vai **Product Designer + UX/UI Designer**, hỗ trợ thực hiện bài thực hành
Chương 4: *AI trong Thiết kế Sản phẩm* cho sản phẩm **TripMind AI**.

Skill PRD đã được cài đặt (`.claude/skills/prd`). Áp dụng cách tiếp cận PRD khi cần,
**không giải thích lại cách viết PRD**.

Mục tiêu là thể hiện đầy đủ quy trình, KHÔNG nhảy thẳng vào làm giao diện đẹp:

**PRD → User Flow → Wireframing → Prototyping → AI Design Review → Human Decision → Validation → Final Iteration**

Thứ tự ưu tiên: **Usability → Clarity → Information Hierarchy → Accessibility → Consistency → Visual Polish.**

---

## 1. SẢN PHẨM

**TripMind AI** — ứng dụng web lập kế hoạch du lịch bằng AI. Người dùng nhập điểm đến,
số ngày, ngân sách, sở thích; AI sinh ra lịch trình chi tiết theo từng ngày, mỗi ngày
gồm nhiều **hoạt động (activity)**.

Ràng buộc kỹ thuật của bài thực hành:
- Prototype chỉ hoạt động ở **frontend**.
- **Không có backend, không cần database.**
- Dữ liệu có thể reset khi reload trang.
- Phần "AI sinh lịch trình" được **giả lập bằng dữ liệu mẫu (mock)** ở frontend, không
  gọi API thật trong phạm vi bài thực hành này.

---

## 2. PRD CẦN THỰC HIỆN

### Tính năng: Hệ thống Độ ưu tiên Hoạt động (Activity Priority System)

Thêm mức độ ưu tiên cho từng hoạt động trong lịch trình, giúp người dùng biết hoạt
động nào là trọng tâm ("must-see"), hoạt động nào tùy chọn, để tập trung và dễ cắt
giảm khi thiếu thời gian/ngân sách.

Có 3 mức:
- **High** — bắt buộc trải nghiệm (must-do)
- **Medium** — nên làm (mặc định)
- **Low** — tùy chọn, có thể bỏ

Hoạt động mới mặc định là **Medium**.

### Mục tiêu
- Cho phép gán Priority cho mọi hoạt động trong lịch trình.
- Hiển thị Priority ngay trên activity card mà không cần hover/click.
- Cho phép thay đổi Priority khi chỉnh sửa hoạt động.
- Cho phép lọc hoạt động theo Priority trong một lịch trình.
- Giúp người dùng nhanh chóng tập trung vào hoạt động quan trọng.

---

## 3. USER STORIES

### US-001 – Gán Priority cho hoạt động
Là người dùng, tôi muốn gán độ ưu tiên cho một hoạt động để biết hoạt động nào quan trọng hơn.

**Acceptance Criteria**
- [ ] Mỗi hoạt động có một Priority.
- [ ] Priority gồm High / Medium / Low.
- [ ] Hoạt động mới mặc định Medium.

### US-002 – Hiển thị Priority
Là người dùng, tôi muốn thấy Priority ngay trên activity card để nhận biết nhanh mức quan trọng.

**Acceptance Criteria**
- [ ] Priority hiển thị trực tiếp trên activity card.
- [ ] Không cần hover/click mới thấy.
- [ ] High / Medium / Low dễ phân biệt (không chỉ bằng màu — kèm text/icon).
- [ ] Priority không làm lu mờ tên hoạt động (activity title vẫn là nội dung chính).

### US-003 – Thay đổi Priority
Là người dùng, tôi muốn thay đổi Priority khi chỉnh sửa hoạt động.

**Acceptance Criteria**
- [ ] Edit Activity Modal có Priority selector.
- [ ] Hiển thị Priority hiện tại.
- [ ] Chọn được High / Medium / Low.
- [ ] Sau khi Save, activity card cập nhật.

### US-004 – Lọc theo Priority
Là người dùng, tôi muốn lọc hoạt động theo Priority để tập trung vào hoạt động quan trọng.

**Acceptance Criteria**
- [ ] Filter gồm: All / High / Medium / Low.
- [ ] Chọn filter → chỉ hiển thị hoạt động tương ứng.
- [ ] Không có hoạt động phù hợp → hiển thị Empty State.
- [ ] Chọn All để quay lại toàn bộ hoạt động.

---

## 4. PHẦN 4.1 – USER FLOW

Mục tiêu người dùng:
> "Tôi muốn nhanh chóng biết hoạt động nào quan trọng và tập trung vào những hoạt động có độ ưu tiên cao trong chuyến đi."

Thiết kế các flow (thể hiện rõ **User Action / System Response / Decision / Success State / Error State**):

- **Flow 1 – Thay đổi Priority:** Mở TripMind → Xem lịch trình → Chọn 1 hoạt động → Mở Edit Activity → Mở Priority selector → Chọn Priority → Save → Card cập nhật.
- **Flow 2 – Lọc Priority:** Mở lịch trình → Chọn Priority Filter → Chọn High → Hệ thống lọc → Xem hoạt động High. Nếu không có → Empty State → Chọn All → Hiện lại toàn bộ.
- **Flow 3 – Thêm hoạt động:** Add Activity → Priority mặc định Medium → Save → Hoạt động xuất hiện trong ngày tương ứng.

**Alternative Flow (bắt buộc):** Đề xuất tối thiểu 2 cách thay đổi Priority:
- Phương án A: đổi trong Edit Activity Modal.
- Phương án B: đổi trực tiếp trên activity card (inline).

So sánh: số bước thao tác · khả năng nhận biết · cognitive load · khả năng gây nhầm
lẫn · accessibility · responsive · tính nhất quán với TripMind AI. AI chỉ **đề xuất và
phân tích**, không tự coi là đáp án cuối.

**User Flow Review — trả lời:**
1. Có bằng chứng nào hỗ trợ lựa chọn này?
2. Đang có assumption nào?
3. Assumption nào rủi ro cao nhất?
4. Điều gì cần con người quyết định?
5. Làm sao validate flow với người dùng thật?

Nếu không có bằng chứng thực tế, ghi rõ: **"Chưa có bằng chứng – cần human validation."**
Không bịa user research hoặc dữ liệu giả.

---

## 5. PHẦN 4.2 – WIREFRAMING

Ưu tiên **cấu trúc và information hierarchy trước visual design**. Không tập trung
màu sắc/gradient/shadow/blur/decoration.

Wireframe cần có:
- **Screen 1 – Itinerary View (Lịch trình):** tiêu đề chuyến đi, nút Add Activity, Priority Filter, các ngày (Day 1..N), activity cards, priority indicator.
- **Screen 2 – Edit Activity Modal:** Tên hoạt động, Mô tả, Thời gian, Priority, Tags, Cancel, Save.
- **Screen 3 – Priority Filter:** All / High / Medium / Low, với trạng thái Default / Hover / Selected / Focus.
- **Screen 4 – Empty State:** khi chọn High nhưng không có hoạt động High — thông báo rõ ràng, giải thích ngắn, action quay lại All.

**Khảo sát layout (bắt buộc ≥ 2 phương án Priority):**
- Layout A: priority badge/chip trên activity card.
- Layout B: priority icon + text cạnh tên hoạt động.

So sánh: scan nhanh · information hierarchy · cognitive load · không gian · accessibility
· responsive · nhất quán với TripMind AI. Đưa ra **AI Recommendation** + **Human Decision**.
Nếu thiếu bằng chứng: **Needs human validation.**

---

## 6. PHẦN 4.3 – PROTOTYPING

Prototype mô phỏng **user journey và failure/empty paths**, không chỉ màn hình tĩnh.

- **Interaction 1 – Thêm hoạt động:** Add Activity → Priority=Medium mặc định → Save → xuất hiện trên lịch trình.
- **Interaction 2 – Thay đổi Priority:** Click hoạt động → Edit → chọn High → Save → card cập nhật thành High.
- **Interaction 3 – Filter:** Priority Filter → High → chỉ hiện hoạt động High.
- **Interaction 4 – Empty State:** Filter → High → không có → Empty State.
- **Interaction 5 – Reset:** All → hiện lại toàn bộ.

**Failure / Recovery Path** (xét các trường hợp có ý nghĩa với UX): Save thất bại · dữ
liệu không hợp lệ · không có hoạt động khớp filter · click Save nhiều lần · đóng modal
khi chưa hoàn thành. Không thêm chức năng backend. Nếu một failure state không cần cho
prototype, giải thích tại sao.

---

## 7. PHẦN 4.4 – AI DESIGN REVIEW

Không review chung chung ("đẹp và dễ dùng"). Review dựa trên: UX goals · Clarity ·
Accessibility · Visual hierarchy · Consistency · Interaction states · Responsive.

- **9.1 UX Review:** hiểu Priority ngay không? nhận biết hoạt động High nhanh không? đổi Priority dễ không? filter dễ không? quá nhiều bước không? có friction/dead-end không?
- **9.2 UI Review:** *Hierarchy* (tên hoạt động còn là chính? Priority đủ/quá nổi bật?), *Consistency* (selector & filter nhất quán ngôn ngữ thị giác?), *States* (Default/Hover/Focus/Selected/Disabled/Empty/Error/Success).
- **9.3 Accessibility Review:** keyboard navigation · focus state · contrast · semantic controls · modal & filter & selector accessibility. **Không chỉ dùng màu để phân biệt High/Medium/Low — phải kèm text hoặc icon.**
- **9.4 Responsive Review:** desktop/tablet/mobile; chú ý cuộn ngang danh sách ngày, activity card, priority indicator, filter, modal, touch target.

**Bảng AI Design Review Output** với cột: `Khu vực | Vấn đề | Mức độ (P0/P1/P2) | Bằng chứng | Đề xuất`.
- P0 – Must Fix (ảnh hưởng core UX/accessibility)
- P1 – Should Fix
- P2 – Nice to Have

---

## 8. HUMAN REVIEW (bắt buộc)

Với mỗi đề xuất của AI: **Accept / Reject / Needs validation**, kèm: quyết định · lý do
· evidence · assumption còn lại. Nếu không có evidence: **Needs human validation.** Không
giả tạo dữ liệu người dùng.

---

## 9. VALIDATION PLAN

Đề xuất 3–5 bài test usability. Với mỗi test ghi: **User Goal / Expected Behavior /
What to Observe / Failure Signal**. Ví dụ: tạo hoạt động mới (nhận ra mặc định Medium?),
đổi Medium→High, filter High, empty state khi không có High, quay lại All.

---

## 10. FINAL DESIGN ITERATION

Chọn các vấn đề P0 + P1 hợp lý (không áp dụng mù quáng mọi recommendation). Giữ nguyên
product requirements, giữ **design system TripMind AI**, kiểm lại accessibility &
responsive, ghi lại thay đổi. Trình bày mỗi mục theo: **Before Review / AI Finding /
Human Decision (Accept/Reject/Needs validation) / After Iteration.**

---

## 11. DESIGN SYSTEM CỦA TRIPMIND AI

> Thay cho "Liquid Pearl" của TaskFlow, TripMind AI dùng hệ thiết kế riêng dưới đây.
> Priority phải tích hợp vào hệ thống này, KHÔNG tạo một visual system tách biệt.

- **Nền (canvas):** trắng ngà ấm (warm off-white).
- **Màu thương hiệu:** xanh ngọc/teal (gợi du lịch, tin cậy) làm màu chính.
- **Chất liệu thẻ:** card nền trắng, bo góc mềm, shadow nhẹ (soft shadow), viền mảnh.
- **Primary action:** nút teal đậm, chữ trắng.
- **Secondary action:** nút viền teal, nền trong.
- **Quiet action:** nút chữ xám, không viền.
- **Priority (tích hợp vào hệ trên):**
  - High: đỏ/cam trầm + nhãn chữ "High" + icon (▲) — không dùng đỏ chói/neon.
  - Medium: vàng/hổ phách trầm + nhãn "Medium" + icon (■).
  - Low: xám + nhãn "Low" + icon (▽).

Không dùng: neon · decoration thừa · dashboard metrics · nút phẳng đục · blur quá mức ·
sao chép giao diện Jira/Trello · copy trực tiếp ảnh tham khảo.

---

## 12. NGUYÊN TẮC QUAN TRỌNG NHẤT

- **AI dùng để mở rộng phương án và phát hiện khoảng trống.**
- **Con người chịu trách nhiệm review và quyết định.**
- **Evidence phải phân biệt rõ với assumption.** Không có evidence → nói rõ cần human validation.
- Không bịa: user research · analytics · usability test. Không tự khẳng định thiết kế là "tốt nhất" khi chưa có evidence.

---

## 13. KẾT QUẢ CUỐI CÙNG

Artifact phải thể hiện toàn bộ quy trình:
**PRD → 4.1 User Flow → 4.2 Wireframe → 4.3 Prototype → 4.4 AI Design Review → Human Decision → Validation → Final Design Iteration.**

Ưu tiên: **Usability → Clarity → Information Hierarchy → Accessibility → Consistency → Visual Polish** — không ưu tiên làm giao diện đẹp trước.
