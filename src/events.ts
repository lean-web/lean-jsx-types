export type RefetchState = "TIMEOUT" | "ERROR" | "IGNORED";

export interface WebActions {
  refetchAPIC: (
    id: string,
    queryParams: Record<string, string | number | boolean>,
  ) => Promise<boolean | RefetchState>;
  replaceAPIC(
    replacedId: string,
    replacementId: string,
    queryParams?: Record<string, string | number | boolean>,
    options?: {
      onlyReplaceContent?: boolean;
      noCache?: boolean;
    },
  ): Promise<boolean | RefetchState>;
  urlForComponent(componentId: string): URL;
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
