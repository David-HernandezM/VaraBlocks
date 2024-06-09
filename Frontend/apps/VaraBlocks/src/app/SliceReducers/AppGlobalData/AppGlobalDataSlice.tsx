import { createSlice } from "@reduxjs/toolkit";
import { SignlessSession } from "@/app/app_types/types";
import { Account } from "@gear-js/react-hooks";

interface AppGlobalDataI {
    apiStarted: boolean,
    apiIsBusy: boolean,
    apiIsDisconnected: boolean,
    polkadotEnable: boolean,
    polkadotAccountData: Account | null,
    polkadotSignlessPassword: string | null,
    signlessSession: SignlessSession | null
}

const initialState: AppGlobalDataI = {
    apiStarted: false, //
    apiIsBusy: false,
    apiIsDisconnected: true,
    polkadotEnable: false, //
    polkadotAccountData: null, //
    polkadotSignlessPassword: null, //
    signlessSession: null //
}

export const accountSettingsSlice = createSlice({
    name: 'accountSettings',
    initialState,
    reducers: {
        gearApiStarted: (state, apiStarted: {
            payload: boolean,
            type: string
        }) => {
            state.apiStarted = apiStarted.payload;
        },
        apiIsBusy: (state, apiIsBusy: {
            payload: boolean,
            type: string
        }) => {
            state.apiIsBusy = apiIsBusy.payload;
        },
        apiIsDisconnected: (state, apiIsDisconnected: {
            payload: boolean,
            type: string
        }) => {
            state.apiIsDisconnected = apiIsDisconnected.payload;
        },
        polkadotAccountIsEnable: (state, polkadotEnable: {
            payload: boolean,
            type: string
        }) => {
            state.polkadotEnable = polkadotEnable.payload;
        },
        setPolkadotAccount: (state, polkadotAccount: {
            payload: Account | null,
            type: string
        }) => {
            state.polkadotAccountData = polkadotAccount.payload;
        },
        setPolkadotPassword: (state, polkadotPassword: {
            payload: string | null,
            type: string
        }) => {
            state.polkadotSignlessPassword = polkadotPassword.payload;
        },
        setNormalAccount: (state, normalAccountData: {
            payload: SignlessSession,
            type: string
        }) => {
            state.signlessSession = normalAccountData.payload
        },
    }
});

export const {
    gearApiStarted,
    apiIsBusy,
    apiIsDisconnected,
    polkadotAccountIsEnable,
    setPolkadotAccount,
    setPolkadotPassword,
    setNormalAccount
} = accountSettingsSlice.actions;

export default accountSettingsSlice.reducer;