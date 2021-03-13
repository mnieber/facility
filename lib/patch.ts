import { symbols } from "../internal/symbols";
import { get } from "./facet";
import { facetName } from "../internal/logging";
import { isDataMember } from "./data";
import { ClassMemberT } from "..";
import { getOrCreate, zip } from "../internal/utils";

export function getPatchedMemberNames(facet) {
  return Object.keys(facet[symbols.patches] ?? {});
}

export function patchFacet(facet: any, members: any) {
  const facetClass = facet.constructor;
  const patches = getOrCreate(facet, symbols.patches, () => ({}));

  for (const prop in members) {
    if (!prop.startsWith("_")) {
      if (!isDataMember(facetClass, prop)) {
        console.error(
          `Patching a property ${prop} that wasn't decorated with ` +
            `@data, @input or @output in ${facetName(facet)}`
        );
      }
    }

    patches[prop] = true;
    delete facet[prop];
    Object.defineProperty(facet, prop, {
      ...members[prop],
      enumerable: true,
      configurable: true,
    });
  }
}

function createPatch(
  patchedFacetClass: any,
  otherFacetClasses: Array<any>,
  callback: (...x: any) => any
) {
  return (ctr: any) => {
    const otherFacets = otherFacetClasses.map((facetClass) =>
      facetClass ? get(facetClass, ctr) : ctr
    );
    // @ts-ignore
    const patch = callback.bind(this)(...otherFacets);

    if (patch && patchedFacetClass) {
      patchFacet(get(patchedFacetClass, ctr), patch);
    }
  };
}

export const mapData = (
  [fromFacetClass, fromMember]: ClassMemberT,
  [toFacetClass, toMember]: ClassMemberT,
  transform?: Function
) => {
  return createPatch(toFacetClass, [fromFacetClass], (fromFacet: any) => ({
    [toMember]: {
      get: () => {
        // TODO: check that fromMember is found
        const data = fromMember === "" ? fromFacet : fromFacet[fromMember];
        return transform ? transform(data) : data;
      },
    },
  }));
};

export const mapDatas = (
  sources: Array<ClassMemberT>,
  [toFacetClass, toMember]: ClassMemberT,
  transform: Function
) => {
  const fromFacetClasses = sources.map((x) => x[0]);
  const fromMembers = sources.map((x) => x[1]);

  return createPatch(
    toFacetClass,
    fromFacetClasses,
    (...fromFacets: Array<any>) => ({
      [toMember]: {
        get: () => {
          const datas = zip(fromFacets, fromMembers).map(
            ([facet, member]: any) => {
              return member === "" ? facet : facet[member];
            }
          );
          return transform(...datas);
        },
      },
    })
  );
};
