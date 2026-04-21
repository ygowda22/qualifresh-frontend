import type { Metadata } from "next";
import GlobalFooter from "../components/GlobalFooter";

export const metadata: Metadata = {
  title: { absolute: "My Account – QualiFresh" },
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <GlobalFooter />
    </>
  );
}
