# Knowledge base

Thư mục này chứa tri thức mà CLIPS có thể thực thi, tách biệt với mã Next.js.

## Vertical slice đầu tiên

Mô-đun `will-validity` hiện triển khai các rules cơ bản R-B01–R-B04 từ `doc/Loc_Rulebase.md` và sinh:

- `intermediate-conclusion`: kết luận trung gian;
- `module-result`: kết quả công khai của mô-đun;
- `inference-trace`: dấu vết áp dụng luật;
- kết quả `unknown` khi facts chưa đủ.

Ba fixtures bao phủ trường hợp hợp lệ, không hợp lệ và chưa đủ dữ kiện. Đây là bản nháp phục vụ kỹ thuật, chưa được kiểm chứng pháp lý.

## Cài đặt CLIPS

Trên Ubuntu/Pop!_OS:

```bash
sudo apt update
sudo apt install clips
```

Lệnh `sudo` yêu cầu thành viên dự án nhập mật khẩu máy của mình trực tiếp trong terminal.

## Chạy thử

Sau khi cài CLIPS:

```bash
clips -f2 knowledge-base/run-fixture.clp
clips -f2 knowledge-base/tests/will-validity.clp
```

Không đưa dữ liệu người dùng trực tiếp vào chuỗi lệnh CLIPS. Adapter TypeScript sau này phải kiểm tra schema và serialize facts bằng danh sách giá trị được phép.
