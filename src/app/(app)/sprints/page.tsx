import { redirect } from "next/navigation";

export default function SprintsPage() {
  redirect("/planning?tab=sprints");
}
