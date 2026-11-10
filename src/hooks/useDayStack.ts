import { useContext } from "react";
import { DayStackContext, type DayStackContextValue } from "../storage/context";

export function useDayStack(): DayStackContextValue {
  const ctx = useContext(DayStackContext);
  if (!ctx) {
    throw new Error("useDayStack must be used inside <DayStackProvider>");
  }
  return ctx;
}
