export type RefetchState = "TIMEOUT" | "ERROR" | "IGNORED";

export interface WebActions {
  refetchElement: (
    id: string,
    queryParams: Record<string, string | number | boolean>,
  ) => Promise<boolean | RefetchState>;
  update: <T extends keyof JSX.IntrinsicElements>(
    id: string,
    params: JSX.IntrinsicElements[T],
  ) => void;
  replaceWith(
    replacedId: string,
    replacementId: string,
    queryParams?: Record<string, string | number | boolean>,
    options?: {
      onlyReplaceContent?: boolean;
      noCache?: boolean;
    },
  ): Promise<boolean | RefetchState>;
  updateContentWithResponse(
    replacedId: string,
    response: Response,
    options?: { onlyReplaceContent?: boolean },
  ): void;
  urlForComponent(componentId: string): URL;
}

export interface WebContext<Data = Record<string, unknown>> {
  data: Data;
  actions: WebActions;
}

type EventHandlerWithData<EventType, WebData> = {
  handler: (ev: EventType, webContext: WebContext<WebData>) => unknown;
  data: WebData;
};

type EventHandlerWithoutData<EventType> = (
  ev: EventType,
  webContext: WebContext<void>,
) => unknown;

/**
 * A web handler.
 *
 * This is the type we expect for event handlers (e.g. onclick).
 */
export type IWebHandler<EventType, WebData> =
  | EventHandlerWithData<EventType, WebData>
  | EventHandlerWithoutData<EventType>;

/**
 * Mapped types for converting HTMLElement default event handler function types
 * into the event handlers expected by LeanJSX
 */
export type EventHandler<T, WebContext> = T extends (
  this: GlobalEventHandlers,
  ev: infer E,
) => unknown
  ? IWebHandler<E, WebContext>
  : T;
