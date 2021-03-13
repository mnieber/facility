export function getOrCreate(obj, key, fn) {
  if (!obj[key]) {
    obj[key] = fn();
  }
  return obj[key];
}

export const zip = (arr: any, ...arrs: any) => {
  return arr.map((val: any, i: any) =>
    arrs.reduce((a: any, arr: any) => [...a, arr[i]], [val])
  );
};
