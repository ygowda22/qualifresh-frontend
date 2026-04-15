import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "About Us – QualiFresh" },
};

export default function AboutUsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
