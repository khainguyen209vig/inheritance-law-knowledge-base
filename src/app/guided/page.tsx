import Link from "next/link";
import { GuidedIntake } from "@/components/guided/guided-intake";
import { Button } from "@/components/ui/button";

export default function GuidedPage() {
  return <main><div className="absolute right-4 top-4 z-10 flex gap-2"><Button asChild variant="ghost" size="sm"><Link href="/cases">Hồ sơ</Link></Button><Button asChild variant="ghost" size="sm"><Link href="/modules">Chế độ kỹ thuật</Link></Button></div><GuidedIntake /></main>;
}

