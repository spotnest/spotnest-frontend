import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
  useStore,
} from "react-redux";

import type { AppDispatch, RootState } from "./store";

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * The store itself, for reading the latest state synchronously inside async
 * callbacks (where a selector value captured at render time would be stale).
 */
export const useAppStore = () => useStore<RootState>();
