import { redirect } from "next/navigation";

export default function GoalsPage() {
  redirect("/planning?tab=goals");
}
