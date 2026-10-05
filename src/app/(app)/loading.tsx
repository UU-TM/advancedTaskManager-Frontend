import { PageSkeletonList } from "@/components/ui/page-skeleton";

export default function AppLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6">
      <PageSkeletonList />
    </div>
  );
}
