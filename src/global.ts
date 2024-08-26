/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
import { SXLGlobalContext } from "./context";
import { IWebActions, EventHandler, IWebHandler } from "./events";
import { SVGElements } from "./svg";

export type { IWebActions };

type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <
  T,
>() => T extends Y ? 1 : 2
  ? A
  : B;

type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    P
  >;
}[keyof T];

type SkippedProps = "outerHTML";

type FilterNonHTMLAttributes<T extends HTMLElement> = {
  [K in keyof T]-?: NonNullable<T[K]> extends
    | Node
    | Element
    | HTMLElement
    | NodeList
    | HTMLCollectionBase
    ? never
    : K extends SkippedProps
    ? never
    : T[K] extends (...args: any[]) => any
    ? never
    : K extends keyof Node
    ? never
    : K;
}[keyof T] &
  WritableKeys<T>;

type HTMLCSSKeys = {
  [K in keyof CSSStyleDeclaration]: NonNullable<CSSStyleDeclaration[K]> extends
    | string
    | number
    ? K
    : never;
}[keyof CSSStyleDeclaration];

/**
 * A utility type for shaping {@link HTMLElement} properties in the way
 * LeanJSX expects.
 */
type HTMLAttributes<T extends HTMLElement> = Pick<
  {
    [K in keyof T]?: K extends "children"
      ? SXL.Children
      : T[K] extends CSSStyleDeclaration
      ? Partial<Pick<T[K], HTMLCSSKeys>>
      : T[K] extends number
      ? number | string
      : T[K] extends object
      ? Partial<T[K]>
      : EventHandler<K, T[K], any>;
  },
  FilterNonHTMLAttributes<T> | "style"
> & { ref?: string; dangerouslySetInnerHTML?: { __html: string } };

export type ButtonProps = HTMLAttributes<HTMLButtonElement>;
export type OnClickType = ButtonProps["onclick"];

interface CustomEventMap {
  refetch: CustomEvent<
    {
      id: string;
      eventId: string;
      queryParams: Record<string, string | number | boolean>;
    } & Record<string, string | number | boolean>
  >;
  update: CustomEvent<
    {
      id: string;
      eventId: string;
      queryParams: Record<string, string | number | boolean>;
    } & Record<string, string | number | boolean>
  >;
  [key: string]: CustomEvent<{
    id: string;
    [key: string]: string | number | boolean;
  }>;
}

/**
 * Global namespace
 */
declare global {
  export interface LeanJSXDocument
    extends Omit<Document, "addEventListener" | "removeEventListener"> {
    //adds definition to Document, but you can do the same with HTMLElement
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (
        this: Document,
        ev: CustomEventMap[K],
      ) => boolean | Promise<void> | void,
      options?: boolean | AddEventListenerOptions,
    ): void;
    dispatchEvent<K extends keyof CustomEventMap>(
      ev: CustomEventMap[K],
    ): boolean;

    removeEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (
        this: Document,
        ev: CustomEventMap[K],
      ) => boolean | Promise<void>,
      options?: boolean | EventListenerOptions,
    ): void;
  }
  /**
   * The namespaces for all JSX components.
   *
   * By default, TypeScript will asume that these types are provided by React.
   *
   * However, we are providing our own implementation here, so we need to expose these
   * types to the global interface for all common tooling (like IDEs) to work as they would
   * with a React project.
   */
  export namespace SXL {
    export type WebHandler<EventType extends Event, WebContext> = IWebHandler<
      EventType,
      WebContext
    >;
    /**
     * Represents a set of data create for each JSX component.
     */
    export type Context<Ctx extends Record<string, unknown>> = Ctx;

    export type Child =
      | string
      | number
      | boolean
      | StaticElement
      | StaticElement[];
    /**
     * The children elements of a JSX component.
     */
    export type Children = Array<
      string | number | boolean | StaticElement | StaticElement[]
    >;

    /**
     * The base properties that a JSX component can receive.
     */
    export type Props<P extends object = object> = Omit<
      HTMLAttributes<HTMLElement>,
      "children"
    > & {
      children?: Children;
      dataset?: DOMStringMap;
      globalContext?: SXLGlobalContext;
    } & P & { id?: string };

    /**
     * An override of {@link SXL.Props} that allows us to set a custom type for {@link SXLGlobalContext}.
     * This is mostly used during testing.
     */
    export interface ComponentProps extends Omit<Props, "globalContext"> {
      globalContext?: SXLGlobalContext;
    }

    export type AsyncGenElement = AsyncGenerator<
      SXL.StaticElement,
      SXL.StaticElement,
      never
    >;

    /**
     * A function that returns a JSX node (usually "jsxDEV" or "jsx")
     */
    export type NodeFactory<P extends SXL.Props> = (
      args: P,
    ) => StaticElement | AsyncElement | AsyncGenElement;

    /**
     * The types for a Class Component.
     */
    export interface ClassComponent<P extends SXL.Props> {
      props: P;
      /**
       * Render a temporary placeholder that will be replaced by the
       * return value of "renderLazy"
       */
      onLoading?(): StaticElement;
      /**
       * Render a JSX component.
       */
      render(): StaticElement | AsyncElement;
    }

    /**
     * A reference to the {@link ClassComponent} constructor.
     */
    export interface ClassFactory<P extends SXL.Props> {
      new (props: P): ClassComponent<P>;
    }

    export type AsyncGenFactory = <P>(props: P & SXL.Props) => AsyncGenElement;

    export type ComponentType =
      | "string"
      | "function"
      | "async-function"
      | "class"
      | "async-gen";

    interface BaseElement {
      componentType: ComponentType;
      props: Props;
      children: Children;
      isDynamic?: boolean;
      ctx?: Context<Record<string, unknown>>;
      refs?: unknown[];
    }

    export type IntrinsicElement = BaseElement & {
      type: string;
    };

    export type IntrinsicDynamicComponent<T> = Partial<HTMLElement> & T;

    /**
     * A narrowed-down type of {@link SXL.StaticElement}.
     * Used for class components.
     */
    export type ClassElement = BaseElement & {
      type: ClassFactory<SXL.Props>;
    };

    /**
     * A narrowed-down type of {@link SXL.StaticElement}.
     * Used for function components.
     */
    export type FunctionElement = BaseElement & {
      type: (props: SXL.Props) => StaticElement | AsyncElement;
      props: Props;
    };

    export type FunctionAsyncGenElement = BaseElement & {
      type: (args: SXL.Props) => AsyncGenElement;
    };

    /**
     * The union of the types of supported components.
     * This is used to narrow elements of type {@link SXL.Element} into
     * specific component types.
     */
    export type ComponentElementUnion =
      | IntrinsicElement
      | FunctionElement
      | ClassElement
      | FunctionAsyncGenElement;

    /**
     * The properties of a JSX component.
     */
    export type StaticElement = BaseElement & {
      type:
        | string
        | NodeFactory<SXL.Props>
        | ClassFactory<SXL.Props>
        | ((args: SXL.Props) => AsyncGenElement);
    };

    /**
     * An async component.
     */
    export type AsyncElement = Promise<StaticElement>;

    /**
     * Base type for a JSX element.
     * A JSX component can returned by a regular, syncronous function as {@link SXL.StaticElement}
     * of by an async function (an async component) as {@link SXL.AsyncElement}
     */
    export type Element =
      | StaticElement
      | AsyncElement
      | AsyncGenElement
      | ClassElement;

    // interface SVGProps<T> extends SVGAttributes<T>

    export interface IntrinsicElements extends SVGElements {
      a: HTMLAttributes<HTMLAnchorElement>;
      abbr: HTMLAttributes<HTMLElement>;
      address: HTMLAttributes<HTMLElement>;
      area: HTMLAttributes<HTMLAreaElement>;
      article: HTMLAttributes<HTMLElement>;
      aside: HTMLAttributes<HTMLElement>;
      audio: HTMLAttributes<HTMLAudioElement>;
      b: HTMLAttributes<HTMLElement>;
      base: HTMLAttributes<HTMLBaseElement>;
      bdi: HTMLAttributes<HTMLElement>;
      bdo: HTMLAttributes<HTMLElement>;
      big: HTMLAttributes<HTMLElement>;
      blockquote: HTMLAttributes<HTMLQuoteElement>;
      body: HTMLAttributes<HTMLBodyElement>;
      br: HTMLAttributes<HTMLBRElement>;
      button: HTMLAttributes<HTMLButtonElement>;
      canvas: HTMLAttributes<HTMLCanvasElement>;
      caption: HTMLAttributes<HTMLElement>;
      center: HTMLAttributes<HTMLElement>;
      cite: HTMLAttributes<HTMLElement>;
      code: HTMLAttributes<HTMLElement>;
      col: HTMLAttributes<HTMLTableColElement>;
      colgroup: HTMLAttributes<HTMLTableColElement>;
      data: HTMLAttributes<HTMLDataElement>;
      datalist: HTMLAttributes<HTMLDataListElement>;
      dd: HTMLAttributes<HTMLElement>;
      del: HTMLAttributes<HTMLModElement>;
      details: HTMLAttributes<HTMLDetailsElement>;
      dfn: HTMLAttributes<HTMLElement>;
      dialog: HTMLAttributes<HTMLDialogElement>;
      div: HTMLAttributes<HTMLDivElement>;
      dl: HTMLAttributes<HTMLDListElement>;
      dt: HTMLAttributes<HTMLElement>;
      em: HTMLAttributes<HTMLElement>;
      embed: HTMLAttributes<HTMLEmbedElement>;
      fieldset: HTMLAttributes<HTMLFieldSetElement>;
      figcaption: HTMLAttributes<HTMLElement>;
      figure: HTMLAttributes<HTMLElement>;
      footer: HTMLAttributes<HTMLElement>;
      form: HTMLAttributes<HTMLFormElement> & {
        onsubmit?: ((this: GlobalEventHandlers, ev: SubmitEvent) => any) | null;
      };
      h1: HTMLAttributes<HTMLHeadingElement>;
      h2: HTMLAttributes<HTMLHeadingElement>;
      h3: HTMLAttributes<HTMLHeadingElement>;
      h4: HTMLAttributes<HTMLHeadingElement>;
      h5: HTMLAttributes<HTMLHeadingElement>;
      h6: HTMLAttributes<HTMLHeadingElement>;
      head: HTMLAttributes<HTMLHeadElement>;
      header: HTMLAttributes<HTMLElement>;
      hgroup: HTMLAttributes<HTMLElement>;
      hr: HTMLAttributes<HTMLHRElement>;
      html: HTMLAttributes<HTMLHtmlElement>;
      i: HTMLAttributes<HTMLElement>;
      iframe: HTMLAttributes<HTMLIFrameElement>;
      img: HTMLAttributes<HTMLImageElement>;
      input: HTMLAttributes<HTMLInputElement>;
      ins: HTMLAttributes<HTMLModElement>;
      kbd: HTMLAttributes<HTMLElement>;
      keygen: HTMLAttributes<HTMLElement>;
      label: HTMLAttributes<HTMLLabelElement>;
      legend: HTMLAttributes<HTMLLegendElement>;
      li: HTMLAttributes<HTMLLIElement>;
      link: HTMLAttributes<HTMLLinkElement>;
      main: HTMLAttributes<HTMLElement>;
      map: HTMLAttributes<HTMLMapElement>;
      mark: HTMLAttributes<HTMLElement>;
      menu: HTMLAttributes<HTMLElement>;
      menuitem: HTMLAttributes<HTMLElement>;
      meta: HTMLAttributes<HTMLMetaElement>;
      meter: HTMLAttributes<HTMLMeterElement>;
      nav: HTMLAttributes<HTMLElement>;
      noindex: HTMLAttributes<HTMLElement>;
      noscript: HTMLAttributes<HTMLElement>;
      object: HTMLAttributes<HTMLObjectElement>;
      ol: HTMLAttributes<HTMLOListElement>;
      optgroup: HTMLAttributes<HTMLOptGroupElement>;
      option: HTMLAttributes<HTMLOptionElement>;
      output: HTMLAttributes<HTMLOutputElement>;
      p: HTMLAttributes<HTMLParagraphElement>;
      param: HTMLAttributes<HTMLParamElement>;
      picture: HTMLAttributes<HTMLElement>;
      pre: HTMLAttributes<HTMLPreElement>;
      progress: HTMLAttributes<HTMLProgressElement>;
      q: HTMLAttributes<HTMLQuoteElement>;
      rp: HTMLAttributes<HTMLElement>;
      rt: HTMLAttributes<HTMLElement>;
      ruby: HTMLAttributes<HTMLElement>;
      s: HTMLAttributes<HTMLElement>;
      samp: HTMLAttributes<HTMLElement>;
      search: HTMLAttributes<HTMLElement>;
      slot: HTMLAttributes<HTMLSlotElement>;
      script: HTMLAttributes<HTMLScriptElement>;
      section: HTMLAttributes<HTMLElement>;
      select: HTMLAttributes<HTMLSelectElement>;
      small: HTMLAttributes<HTMLElement>;
      source: HTMLAttributes<HTMLSourceElement>;
      span: HTMLAttributes<HTMLSpanElement>;
      strong: HTMLAttributes<HTMLElement>;
      style: HTMLAttributes<HTMLStyleElement>;
      sub: HTMLAttributes<HTMLElement>;
      summary: HTMLAttributes<HTMLElement>;
      sup: HTMLAttributes<HTMLElement>;
      table: HTMLAttributes<HTMLTableElement>;
      template: HTMLAttributes<HTMLTemplateElement>;
      tbody: HTMLAttributes<HTMLTableSectionElement>;
      td: HTMLAttributes<HTMLTableDataCellElement>;
      textarea: HTMLAttributes<HTMLTextAreaElement>;
      tfoot: HTMLAttributes<HTMLTableSectionElement>;
      th: HTMLAttributes<HTMLTableHeaderCellElement>;
      thead: HTMLAttributes<HTMLTableSectionElement>;
      time: HTMLAttributes<HTMLTimeElement>;
      title: HTMLAttributes<HTMLTitleElement>;
      tr: HTMLAttributes<HTMLTableRowElement>;
      track: HTMLAttributes<HTMLTrackElement>;
      u: HTMLAttributes<HTMLElement>;
      ul: HTMLAttributes<HTMLUListElement>;
      var: HTMLAttributes<HTMLElement>;
      video: HTMLAttributes<HTMLVideoElement>;
      wbr: HTMLAttributes<HTMLElement>;

      jsxScript: HTMLAttributes<HTMLScriptElement>;
    }
  }

  export namespace JSX {
    export type ElementType =
      | keyof IntrinsicElements
      | SXL.NodeFactory<any>
      | SXL.AsyncGenFactory
      | SXL.ClassFactory<any>;
    type Element = SXL.StaticElement;

    interface IntrinsicClassAttributes<_T> {
      //   props;
    }
    interface ElementClass<Props extends SXL.Props = SXL.Props>
      extends SXL.ClassComponent<Props> {}
    // type IntrinsicClassAttributes<T> = T extends SXL.ClassComponent<infer Props>
    //   ? Props
    //   : SXL.Props;
    interface ElementAttributesProperty {
      props; // specifying 'props' as the property to use
    }
    interface IntrinsicElements extends SXL.IntrinsicElements {}
  }
}

export {};

type D = NonNullable<SXL.IntrinsicElements["button"]["onclick"]>;

export const d: D = (ev) => {
  console.log(ev.target);
};

export const m: D = (ev, a) => {
  console.log(ev.target);
};
