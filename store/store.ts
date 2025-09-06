import {configureStore} from "@reduxjs/toolkit";
import { pdfApi } from "../services/pdfApi";

export const store = configureStore({
  reducer: {
    [pdfApi.reducerPath]: pdfApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(pdfApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;