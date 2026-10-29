import { LoadingState } from "@/components/shared"

export default function RootLoading() {
  return (
    <div className="flex flex-1 items-center justify-center bg-[var(--rx-mist)] px-6 py-16">
      <div className="w-full max-w-3xl">
        <LoadingState variant="page" label="Loading FlowPay" />
      </div>
    </div>
  )
}
