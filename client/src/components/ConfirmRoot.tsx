import { useConfirm } from "../stores/useConfirm";
import { ConfirmDialog } from "./ConfirmDialog";

export function ConfirmRoot() {
  const request = useConfirm((s) => s.request);
  const resolve = useConfirm((s) => s.resolve);
  return (
    <ConfirmDialog
      open={request !== null}
      title={request?.title ?? ""}
      message={request?.message}
      confirmLabel={request?.confirmLabel}
      cancelLabel={request?.cancelLabel}
      tone={request?.tone}
      onConfirm={() => resolve(true)}
      onCancel={() => resolve(false)}
    />
  );
}
