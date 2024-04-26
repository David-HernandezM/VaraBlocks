import { TreeItems, TreeItem } from "@/components/DndLibrary/Tree/types";
import { createSlice } from "@reduxjs/toolkit";
import { ContractEnum, ContractStruct } from "@/app/app_types/types";

interface VaraBlocksEnums {
    [key: string]: ContractEnum
}

interface VaraBlocksData {
    structs: ContractStruct[];
    enums: VaraBlocksEnums,
    initBlocks: TreeItems;
    handleBlocks: TreeItems;
}

const initialState: VaraBlocksData = {
    structs: [],
    enums: {},
    initBlocks: [],
    handleBlocks: []
};

export const varaBlocksSlice = createSlice({
    name: "VaraBlocksData",
    initialState,
    reducers: {
        addBlockToInit: (state, block) => {
            state.initBlocks = [block.payload, ...state.initBlocks];
        },
        setBlocksOnInit: (state, blocks) => {
            state.initBlocks = blocks.payload;
        },
        addBlockToHandle: (state, block) => {
            state.handleBlocks = [block.payload, ...state.handleBlocks];
        },
        setBlocksOnHandle: (state, blocks) => {
            state.handleBlocks = blocks.payload;
        },
        addEnumToContract: (state, newEnum: {
            payload: {
                newEnumId: string,
            };
            type: string;
        }) => {
            state.enums[newEnum.payload.newEnumId] = {
                enumName: "",
                enumType: {
                    ContractEnum: null
                },
                variants: {}
            };            
        },
        addVariantToEnum: (state, variant: {
            payload: {
                enumId: string,
                variantId: string,
            };
            type: string;
        }) => {
                if (Object.keys(state.enums).find((enumId) => enumId === variant.payload.enumId))
                // state.enums[variant.payload.enumId].variants = enumData.payload.newTitle;
                state.enums[variant.payload.enumId].variants[variant.payload.variantId] = "";
            else
                console.log("Enum does not exists!");
        },
        editEnumTitle: (state, enumData: {
            payload: {
                enumId: string,
                newTitle: string
            };
            type: string;
        }) => {
            if (Object.keys(state.enums).find((enumId) => enumId === enumData.payload.enumId))
                state.enums[enumData.payload.enumId].enumName = enumData.payload.newTitle;
            else
                console.log("Enum does not exists!");
        },
        editVariantToEnum: (state, variant: {
            payload: {
                enumId: string,
                variantId: string,
                variantVal: string
            };
            type: string;
        }) => {
            const variantEnumId = variant.payload.enumId;
            const variantId = variant.payload.variantId;
            if (Object.keys(state.enums).find((enumId) => enumId === variantEnumId))
                if (Object.keys(state.enums[variantEnumId].variants).find((enumVariantId) => enumVariantId === variantId))
                    state.enums[variantEnumId].variants[variantId] = variant.payload.variantVal;
                else
                    console.log("Enum variant does  not exists!");
            else
                console.log("Enum does not exists!");
        },
        removeEnumOfContract: (state, enumIdToDelete: {
            payload: string;
            type: string;
        }) => {
            delete state.enums[enumIdToDelete.payload];
        },
        removeVariantInEnum: (state, variant: {
            payload: {
                enumId: string,
                variantId: string,
            };
            type: string;
        }) => {
            const variantEnumId = variant.payload.enumId;
            const variantId = variant.payload.variantId;
            if (Object.keys(state.enums).find((enumId) => enumId === variantEnumId))
                if (Object.keys(state.enums[variantEnumId].variants).find((enumVariantId) => enumVariantId === variantId))
                    delete state.enums[variantEnumId].variants[variantId];
                else
                    console.log("Enum variant does  not exists!");
            else
                console.log("Enum does not exists!");
        }
    }
});


export const { 
    addBlockToInit,
    addBlockToHandle,
    setBlocksOnInit,
    setBlocksOnHandle,
    addEnumToContract,
    addVariantToEnum,
    editEnumTitle,
    editVariantToEnum,
    removeEnumOfContract,
    removeVariantInEnum
} = varaBlocksSlice.actions;

export default varaBlocksSlice.reducer;