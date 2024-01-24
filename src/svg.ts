type SVGElementMap = Omit<
  SVGElementTagNameMap,
  "a" | "script" | "style" | "title" | "symbol"
>;

// type AnyFunction =
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   | ((...args: any) => any)
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   | (() => any);

// type SVGElementAttributesMap<T extends object> = T extends AnyFunction
//   ? never
//   : T;

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

export type SVGElements = {
  [K in keyof SVGShapesMap]: Partial<{
    [K2 in keyof SVGShapesMap[K]]: K2 extends "children"
      ? SXL.Children
      : SVGShapesMap[K][K2] extends
          | SVGAnimatedLength
          | SVGAnimatedLengthList
          | number
          | string
      ? string
      : never;
  }> &
    Partial<Pick<CSSStyleDeclaration, "fill">>;
};
