type SVGElementMap = Omit<
  SVGElementTagNameMap,
  "a" | "script" | "style" | "title" | "symbol"
>;

// TODO: Re-evaluate SVG types
type SVGShapesMap = Pick<
  SVGElementMap,
  {
    [K in keyof SVGElementMap]: SVGElementMap[K] extends
      | SVGGeometryElement
      | SVGGraphicsElement
      ? K
      : never;
  }[keyof SVGElementMap]
>;

type MaybeSVG<K, V> = K extends "svg"
  ? Partial<V> & {
      xmlns?: "http://www.w3.org/2000/svg";
      "xmlns:xlink": "http://www.w3.org/1999/xlink";
    }
  : never;

type MaybePath<K, V> = K extends "path"
  ? Partial<V> & {
      d: string;
    }
  : never;

type SVGAttributes<K extends keyof SVGShapesMap> = Partial<{
  [K2 in keyof SVGShapesMap[K]]: K2 extends keyof CSSStyleDeclaration
    ? CSSStyleDeclaration[K2]
    : K2 extends "children"
    ? SXL.Children
    : SVGShapesMap[K][K2] extends
        | SVGAnimatedLength
        | SVGAnimatedLengthList
        | number
        | string
    ? string
    : string;
}>;

export type SVGElements = {
  [K in keyof SVGShapesMap]:
    | MaybeSVG<K, SVGShapesMap[K]>
    | MaybePath<K, SVGShapesMap[K]>
    | (SVGAttributes<K> & Partial<CSSStyleDeclaration>);
};
