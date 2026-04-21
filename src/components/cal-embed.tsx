"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export function CalEmbed({ link }: { link: string }) {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: "consultation" });
      cal("ui", {
        theme: "light",
        cssVarsPerTheme: {
          light: {
            "cal-brand": "#ae3e09",
            "cal-text-emphasis": "#151414",
          },
          dark: {
            "cal-brand": "#e07a3e",
            "cal-text-emphasis": "#f7f4ed",
          },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <div className="overflow-hidden border border-line bg-paper">
      <Cal
        namespace="consultation"
        calLink={link}
        style={{ width: "100%", height: "100%", minHeight: 680 }}
        config={{ layout: "month_view" }}
      />
    </div>
  );
}
