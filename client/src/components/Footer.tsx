import { Link } from "react-router-dom"
import { Flower2, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 text-primary">
              <Flower2 className="size-6" strokeWidth={1.8} />
              <span className="text-lg font-bold">BloomShop</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Mang đến những bó hoa tươi đẹp nhất, gửi gắm yêu thương trong từng cánh hoa.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
              Danh mục
            </h3>
            <ul className="space-y-2">
              {["Hoa hồng", "Hoa tulip", "Bó hoa", "Hoa lan", "Hoa hướng dương"].map((item) => (
                <li key={item}>
                  <Link
                    to="/products"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
              Hỗ trợ
            </h3>
            <ul className="space-y-2">
              {["Chính sách giao hàng", "Đổi trả & hoàn tiền", "Câu hỏi thường gặp", "Liên hệ"].map((item) => (
                <li key={item}>
                  <Link
                    to="/"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
              Liên hệ
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                123 Nguyễn Huệ, Q.1, TP. Hồ Chí Minh
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="size-4 shrink-0 text-primary" />
                0900 123 456
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4 shrink-0 text-primary" />
                hello@bloomshop.vn
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border/60 pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} BloomShop. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  )
}
