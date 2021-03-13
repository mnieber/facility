export const symbols = {
  dataMembers: Symbol("facilityDataMembers"),
  facetMembers: Symbol("facilityFacetMembers"),
  parentContainer: Symbol("facilityParentContainer"),
  facetByFacetClassName: Symbol("facilityFacetByFacetClassName"),
  patches: Symbol("facilityPatches"),
};

export function symbolName(symbol) {
  const prefix = "Symbol(";
  const chop = (x) =>
    x.startsWith(prefix) ? x.substring(prefix.length, x.length - 1) : x;
  return chop(symbol.toString());
}
