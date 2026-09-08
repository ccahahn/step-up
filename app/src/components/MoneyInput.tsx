"use client";

import { forwardRef } from "react";
import { maskMoney } from "@/lib/format";

type Props = {
  value: string;
  onValueChange: (v: string) => void;
  id?: string;
  placeholder?: string;
  required?: boolean;
  "aria-label"?: string;
};

/** Reformats to "$12.50" as you type, so the column always reads as money. */
const MoneyInput = forwardRef<HTMLInputElement, Props>(function MoneyInput(
  { value, onValueChange, ...rest },
  ref,
) {
  return (
    <input
      {...rest}
      ref={ref}
      type="text"
      inputMode="decimal"
      value={value}
      onChange={(e) => onValueChange(maskMoney(e.target.value))}
    />
  );
});

export default MoneyInput;
