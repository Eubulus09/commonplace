export default function Loading() {
  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="route-progress-static h-[2px]" />
      <p className="type-stamp absolute right-4 top-4 bg-paper px-2 py-1">Turning the page</p>
    </div>
  );
}
