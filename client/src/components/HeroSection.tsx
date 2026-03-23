import { Link } from "react-router-dom"
import { ArrowRight, Truck, ShieldCheck, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-background to-accent">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Miễn phí giao hàng cho đơn từ 500K
          </span>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Gửi yêu thương
            <span className="block text-primary">qua từng cánh hoa</span>
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Khám phá bộ sưu tập hoa tươi được tuyển chọn kỹ lưỡng, mang đến sự hoàn hảo cho mọi dịp đặc biệt.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link to="/products">
                Khám phá ngay
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/products?category=bouquets">Bó hoa đặc biệt</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              icon: Truck,
              title: "Giao hàng nhanh",
              desc: "Giao trong 2h nội thành",
            },
            {
              icon: ShieldCheck,
              title: "Cam kết tươi",
              desc: "Đổi trả nếu hoa héo",
            },
            {
              icon: Clock,
              title: "Hỗ trợ 24/7",
              desc: "Luôn sẵn sàng phục vụ",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center gap-2 rounded-xl border border-border/40 bg-card/50 p-5 text-center backdrop-blur-sm"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <feature.icon className="size-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
