import { KeyringPair } from '@polkadot/keyring/types';
import { createSlice } from "@reduxjs/toolkit";

export interface signlessAccountData {
    data: KeyringPair | null
}

const initialState: signlessAccountData = {
    data: null
};

export const signlessAccountSlice = createSlice({
    name: 'signlessAccount',
    initialState,
    reducers: {
        setSignlessAccount: (state, signlesData: {
            payload: {
                data: KeyringPair
            },
            type: string
        }) => {
            const { data } = signlesData.payload;

            state.data = data;
        },
        removeSignlessAccount: (state) => {
            state.data = null;
        }
    }
});

export const {
    setSignlessAccount,
    removeSignlessAccount
} = signlessAccountSlice.actions;

export default signlessAccountSlice.reducer;