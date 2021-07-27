export type DiffResult = Array<[string, unknown]>;

function eqArray<T extends string | number>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function eq<T>(a: T, b: T): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) throw new Error("type mismatched");
  if (typeof a === "object") {
    if (Array.isArray(a)) return eqArray(a, b as any);
    throw new Error("cannot use general object here");
  }
  return a === b;
}

export function diff<T extends object>(
  prev: T,
  curr: T
): DiffResult {
  const result: DiffResult = [];
  for (const key in curr) {
    if (key == "children") continue;
    if (!eq(curr[key], prev[key])) {
      result.push([key, curr[key]]);
    }
  }
  return result;
}

export function apply(
  diff: DiffResult,
  curr: object
) {
  for (const [key, value] of diff) {
    const path = key.split("-");
    const last = path.pop()!;
    let obj: any = curr;
    for (const p of path) {
      obj = obj[p];
    }
    obj[last] = value;
  }
}