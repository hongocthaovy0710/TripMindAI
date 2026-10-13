"""
8.4 Tự động hóa Kiểm thử (Test Automation)
Script điều phối thực thi bộ kiểm thử tự động toàn diện:
- Hỗ trợ chạy theo từng tầng kiểm thử (unit, integration, system, design_matrix).
- Xuất báo cáo kết quả kiểm thử định dạng Markdown và Console.
- Đo thời gian thực thi, tỷ lệ thành công (Pass Rate), và cổng chất lượng (Quality Gate).
"""
import sys
import time
import subprocess
from datetime import datetime


def run_test_suite(suite_name: str, marker: str | None = None) -> dict:
    """Chạy một bộ test cụ thể và thu thập số liệu."""
    print(f"\n==================================================")
    print(f"  Đang chạy: {suite_name}")
    print(f"==================================================")

    cmd = [sys.executable, "-m", "pytest", "-v"]
    if marker:
        cmd.extend(["-m", marker])

    start_time = time.perf_counter()
    result = subprocess.run(cmd, capture_output=True, text=True)
    duration = time.perf_counter() - start_time

    output = result.stdout + "\n" + result.stderr
    passed = "passed" in output.lower() and result.returncode == 0

    return {
        "suite": suite_name,
        "marker": marker or "all",
        "passed": passed,
        "exit_code": result.returncode,
        "duration_seconds": round(duration, 2),
        "output_summary": output.splitlines()[-1] if output.strip() else "",
    }


def main():
    print(f"TripMind AI - Automated Test Runner")
    print(f"Thời gian bắt đầu: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 50)

    suites = [
        ("8.1 Kiểm thử Đơn vị (Unit Testing)", "unit"),
        ("8.2 Kiểm thử Tích hợp (Integration Testing)", "integration"),
        ("8.3 Kiểm thử Hệ thống (System Testing)", "system"),
        ("8.5 Ma trận Thiết kế Kiểm thử (BVA & EP)", "design_matrix"),
    ]

    results = []
    for name, marker in suites:
        res = run_test_suite(name, marker)
        results.append(res)
        status = "PASSED" if res["passed"] else "FAILED"
        print(f"[{status}] {name} ({res['duration_seconds']}s)")

    print("\n" + "=" * 50)
    print("BẢNG TỔNG KẾT KẾT QUẢ KIỂM THỬ TỰ ĐỘNG")
    print("=" * 50)
    all_passed = True
    total_duration = 0.0

    print(f"| {'Bộ kiểm thử':<42} | {'Trạng thái':<10} | {'Thời gian':<10} |")
    print(f"|{'-'*44}|{'-'*12}|{'-'*12}|")
    for r in results:
        status_str = "PASS" if r["passed"] else "FAIL"
        if not r["passed"]:
            all_passed = False
        total_duration += r["duration_seconds"]
        print(f"| {r['suite']:<42} | {status_str:<10} | {r['duration_seconds']:>8.2f}s |")

    print(f"|{'-'*44}|{'-'*12}|{'-'*12}|")
    print(f"| {'TỔNG CỘNG':<42} | {'PASS' if all_passed else 'FAIL':<10} | {total_duration:>8.2f}s |")
    print("=" * 50)

    if all_passed:
        print("TẤT CẢ CÁC BÀI KIỂM THỬ ĐÃ VƯỢT QUA (QUALITY GATE: PASSED)")
        sys.exit(0)
    else:
        print("CÓ BÀI KIỂM THỬ THẤT BẠI (QUALITY GATE: FAILED)")
        sys.exit(1)


if __name__ == "__main__":
    main()
