export type RefetchState = "TIMEOUT" | "ERROR" | "IGNORED";

export type APICRequest = Partial<Omit<Request, "url">> & {
  onlyReplaceContent?: boolean;
  streamResponse?: boolean;
  noCache?: boolean;
};

export interface WebActions {
  refetchAPIC: (
    id: string,
    queryParams: Record<string, string | number | boolean>,
    options?: APICRequest,
  ) => Promise<boolean | RefetchState>;
  replaceAPIC(
    replacedId: string,
    replacementId: string,
    queryParams?: Record<string, string | number | boolean>,
    options?: APICRequest,
  ): Promise<boolean | RefetchState>;
  urlForComponent(componentId: string): URL;
  getElementByAPICId(id: string): Element | null;
}

type EventHandlerWithData<EventType, WebData> = {
  handler: (ev: EventType, actions: WebActions, webContext: WebData) => unknown;
  data: WebData;
};

type EventHandlerWithoutData<EventType> = (
  ev: EventType,
  actions: WebActions,
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
export type EventHandler<K, T, WebContext> = T extends (
  this: GlobalEventHandlers,
  ev: infer E extends Event,
) => unknown
  ? IWebHandler<
      K extends keyof GlobalEventHandlers
        ? Parameters<NonNullable<GlobalEventHandlers[K]>>[0]
        : E,
      WebContext
    >
  : T;
