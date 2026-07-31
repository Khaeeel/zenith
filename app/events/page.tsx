import { redirect } from "next/navigation";

/** Events live under the dashboard sidebar — not the marketing homepage. */
export default function EventsRedirectPage() {
  redirect("/dashboard/events");
}
