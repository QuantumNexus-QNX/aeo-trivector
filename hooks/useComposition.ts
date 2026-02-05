export function useComposition<T = HTMLElement>(props?: any) {
  return {
    isComposing: false,
    onCompositionStart: () => {},
    onCompositionEnd: () => {},
    onKeyDown: () => {},
  }
}
