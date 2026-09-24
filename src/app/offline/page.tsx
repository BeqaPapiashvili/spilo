import { redirect } from "next/navigation";
import { SiteOfflineScreen } from "@/components/SiteOfflineScreen";
import { getSiteStatus } from "@/lib/siteStatus";

export const dynamic = "force-dynamic";

export default async function OfflinePage() {
  const status = await getSiteStatus();
  if (status.mode === "online") {
    redirect("/");
  }
  return <SiteOfflineScreen status={status} />;
}
