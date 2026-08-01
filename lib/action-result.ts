export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

export function actionOk(): ActionResult {
  return { ok: true };
}

export function actionFail(error: string): ActionResult {
  return { ok: false, error };
}

export function isActionResult(value: unknown): value is ActionResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    typeof (value as { ok: unknown }).ok === "boolean"
  );
}
