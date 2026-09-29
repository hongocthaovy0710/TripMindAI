"""
TripMind AI — cấu hình ứng dụng.
Đọc biến môi trường, cung cấp giá trị mặc định an toàn cho môi trường phát triển.
"""
import os

# Khóa bí mật ký JWT. Trong production PHẢI đặt qua biến môi trường.
SECRET_KEY = os.getenv("TRIPMIND_SECRET", "dev-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 giờ

# Đường dẫn file cơ sở dữ liệu SQLite (nhẹ, không cần cài server).
DB_PATH = os.getenv("TRIPMIND_DB", os.path.join(os.path.dirname(__file__), "tripmind.db"))
