"use client";
// Shared look for admin row action buttons. Purely presentational: every prop the caller passes
// (onClick, disabled, aria-disabled, aria-label, title, className, …) goes straight to <button>.
// No state, no logic, no confirmations here.
import type { ButtonHTMLAttributes, ReactNode } from "react";
import s from "./AdminActionButton.module.css";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "edit" | "neutral" | "danger";
  icon: ReactNode;
  label: ReactNode;
  compact?: boolean;   // icon only below 1280px (Orders table)
  compactMid?: boolean; // icon only between 1024px and 1279px
  block?: boolean;     // card views: fills the row, 44px tall
  fill?: boolean;      // cards shown at every width: fills the row, 44px tall below 1024px
}

export default function AdminActionButton({ variant, icon, label, compact, compactMid, block, fill, className, ...rest }: Props) {
  const cls = [s.btn, s[variant], compact ? s.compact : "", compactMid ? s.compactMid : "", block ? s.block : "", fill ? s.fill : "", className || ""].filter(Boolean).join(" ");
  return (
    <button className={cls} {...rest}>
      <span aria-hidden="true">{icon}</span><span className={s.label}>{label}</span>
    </button>
  );
}
