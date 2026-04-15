import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Our Farms – QualiFresh" },
};

export default function OurFarmsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
