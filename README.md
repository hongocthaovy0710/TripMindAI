# TripMind AI 🧠✈️

> **Ứng dụng lập kế hoạch du lịch thông minh bằng AI**

TripMind AI là ứng dụng web sử dụng trí tuệ nhân tạo giúp người dùng tạo lịch trình
du lịch **cá nhân hóa, tối ưu chi phí** chỉ trong vài phút. Người dùng chỉ cần nhập
điểm đến, số ngày, ngân sách và sở thích — AI sẽ sinh ra một lịch trình chi tiết
theo từng ngày kèm ước tính chi phí.

---

## 📋 Giới thiệu dự án

| Thông tin | Chi tiết |
|-----------|----------|
| **Tên dự án** | TripMind AI |
| **Môn học** | Chuyên đề 4: AI Product Development |
| **Loại sản phẩm** | Ứng dụng web (responsive) |
| **Lĩnh vực** | Du lịch + Trí tuệ nhân tạo (AI) |
| **Giai đoạn hiện tại** | Phân tích & Đặc tả yêu cầu (Discovery & Specification) |
| **Ngày cập nhật** | 08/09/2026 |

---

## 🎯 Vấn đề & Giải pháp

**Vấn đề:** Lập kế hoạch du lịch tốn nhiều thời gian, thông tin phân mảnh, khó tối ưu
chi phí và thiếu cá nhân hóa.

**Giải pháp:** TripMind AI dùng AI để tự động tạo lịch trình cá nhân hóa, ước tính
chi phí và cho phép quản lý các chuyến đi — tất cả trong một ứng dụng web duy nhất.

---

## 📚 Danh mục tài liệu

Toàn bộ tài liệu phân tích và đặc tả sản phẩm nằm trong thư mục [`docs/`](./docs):

### Chương 3 — Phân tích & Đặc tả yêu cầu

| # | Tài liệu | Mô tả | Liên kết |
|---|----------|-------|----------|
| 3.1 | **Khám phá Sản phẩm** (Product Discovery) | Tầm nhìn, vấn đề, người dùng mục tiêu, phân tích đối thủ | [📄 Xem](./docs/3.1-product-discovery.md) |
| 3.2 | **Tài liệu Yêu cầu Sản phẩm** (PRD) | Mục tiêu, yêu cầu chức năng & phi chức năng, luồng người dùng | [📄 Xem](./docs/3.2-prd.md) |
| 3.3 | **Phân tích Yêu cầu** (Requirements Analysis) | Use case, mô hình dữ liệu, quy tắc nghiệp vụ | [📄 Xem](./docs/3.3-requirements-analysis.md) |
| 3.4 | **User Stories & Tiêu chí Chấp nhận** | Câu chuyện người dùng theo Agile + Given-When-Then | [📄 Xem](./docs/3.4-user-stories-acceptance-criteria.md) |
| 3.5 | **Đặc tả Tính năng** (Feature Specification) | Đặc tả chi tiết từng tính năng, luồng xử lý, kiến trúc | [📄 Xem](./docs/3.5-feature-specification.md) |
| 3.6 | **Kiến trúc & Công nghệ** (Technical Architecture) | Tech stack, phân tầng kiến trúc, API, tích hợp AI, mô hình dữ liệu | [📄 Xem](./docs/3.6-technical-architecture.md) |

### Chương 4 — AI trong Thiết kế Sản phẩm

| # | Tài liệu | Mô tả | Liên kết |
|---|----------|-------|----------|
| 4.1 | **Luồng Người dùng** (User Flow) | Sơ đồ luồng người dùng qua các màn hình (Mermaid) | [📄 Xem](./docs/4.1-user-flow.md) |
| 4.2 | **Bố cục Khung** (Wireframing) | Wireframe low-fidelity các màn hình chính | [📄 Xem](./docs/4.2-wireframing.md) |
| 4.3 | **Tạo Bản mẫu** (Prototyping) | Liên kết màn hình, kịch bản demo, trạng thái tương tác | [📄 Xem](./docs/4.3-prototyping.md) |
| 4.4 | **AI Đánh giá Thiết kế** (AI Design Review) | Dùng AI đánh giá thiết kế + đề xuất cải thiện | [📄 Xem](./docs/4.4-ai-design-review.md) |

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

| Tầng | Công nghệ |
|------|-----------|
| **Frontend** | React + Next.js, TypeScript, Tailwind CSS |
| **Backend** | Node.js + Express (REST API) |
| **Cơ sở dữ liệu** | PostgreSQL (dữ liệu quan hệ) + Redis (cache) |
| **AI / LLM** | OpenAI GPT-4 API / Anthropic Claude API (sinh lịch trình) |
| **Xác thực** | JWT (JSON Web Token) + bcrypt |
| **API bên thứ ba** | Google Maps API, OpenWeather API, Unsplash API |
| **Triển khai** | Vercel (frontend) + Render/Railway (backend), Docker |

> Chi tiết đầy đủ về kiến trúc, luồng gọi API và tích hợp AI xem tại
> [3.6 - Kiến trúc & Công nghệ](./docs/3.6-technical-architecture.md).

---

## ✨ Tính năng chính (MVP)

- 🔐 **Quản lý tài khoản** — Đăng ký, đăng nhập, khôi phục mật khẩu.
- 🤖 **Tạo lịch trình bằng AI** — Sinh lịch trình chi tiết theo ngày từ thông tin người dùng.
- 💰 **Ước tính chi phí** — Tính tổng chi phí và cảnh báo khi vượt ngân sách.
- 📂 **Quản lý chuyến đi** — Lưu, xem, chỉnh sửa, xóa các chuyến đi.
- 📤 **Xuất & chia sẻ** — Xuất PDF hoặc chia sẻ liên kết lịch trình.

---

## 👥 Đối tượng người dùng

- Người đi làm bận rộn muốn lên kế hoạch nhanh.
- Sinh viên / người du lịch tiết kiệm cần tối ưu ngân sách.
- Gia đình, nhóm bạn du lịch tự túc.

---

## 🗂️ Cấu trúc thư mục

```
TripMindAI/
├── README.md                                    # Tài liệu tổng quan (file này)
└── docs/
    ├── 3.1-product-discovery.md                 # Khám phá sản phẩm
    ├── 3.2-prd.md                               # Tài liệu yêu cầu sản phẩm
    ├── 3.3-requirements-analysis.md             # Phân tích yêu cầu
    ├── 3.4-user-stories-acceptance-criteria.md  # User stories & tiêu chí chấp nhận
    ├── 3.5-feature-specification.md             # Đặc tả tính năng
    ├── 3.6-technical-architecture.md            # Kiến trúc & công nghệ
    ├── 4.1-user-flow.md                         # Luồng người dùng
    ├── 4.2-wireframing.md                       # Bố cục khung (wireframe)
    ├── 4.3-prototyping.md                       # Tạo bản mẫu (prototype)
    └── 4.4-ai-design-review.md                  # AI đánh giá thiết kế
```

---

## 🚀 Lộ trình phát triển

| Giai đoạn | Nội dung | Trạng thái |
|-----------|----------|------------|
| **Ch.3 – Discovery & Specification** | Tài liệu 3.1 → 3.6 | ✅ Hoàn thành |
| **Ch.4 – AI trong Thiết kế** | User Flow, Wireframe, Prototype, AI Review (4.1 → 4.4) | ✅ Hoàn thành |
| **Phát triển MVP** | Tài khoản + Tạo lịch trình AI + Quản lý chuyến đi | ⏳ Kế hoạch |
| **Kiểm thử & Phát hành** | Kiểm thử, triển khai | ⏳ Kế hoạch |

---

## 👤 Tác giả

- **Sinh viên thực hiện:** Hồ Ngọc Thảo Vy
- **Môn học:** Chuyên đề 4: AI Product Development

---

> 📌 *Tài liệu này thuộc giai đoạn Khám phá & Đặc tả yêu cầu của dự án TripMind AI.*
