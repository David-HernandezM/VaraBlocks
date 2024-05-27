import { configureStore } from "@reduxjs/toolkit";
import VaraBlocksDataReducer from "../SliceReducers/VaraBlocksData/varaBlocksDataSlice";
import SignlessDataReducer from '../SliceReducers/SignlessAccountData/signlessAccountDataSlice';

export const store = configureStore({
    reducer: {
        VaraBlocksData: VaraBlocksDataReducer,
        SignlessData: SignlessDataReducer
    }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {counter: counterState}
export type AppDispatch = typeof store.dispatch;
