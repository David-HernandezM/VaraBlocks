import { TreeItems, TreeItem } from "@/components/DndLibrary/Tree/types";
import { createSlice } from "@reduxjs/toolkit";
import { 
    ContractEnumInterface, 
    ContractStructInterface, 
    StructAttributeI,
    VirtualContractTypes
} from "@/app/app_types/types";
import { generatePassword } from "@/app/utils";


// [TODO]: Add extra verification for repited titiles, etc.
// [TODO]: Check default value for ActorId, to put on value.

interface VaraBlockEnum {
    [key: string]: ContractEnumInterface
}

interface VaraBlockStruct {
    [key: string]: ContractStructInterface
}

interface VaraBlocksData {
    structs: VaraBlockStruct
    enums: VaraBlockEnum,
    initBlocks: TreeItems;
    handleBlocks: TreeItems;
}

const initialState: VaraBlocksData = {
    structs: {},
    enums: {},
    initBlocks: [
        {
          id: 'Home',
          blockType: 'variable',
          children: [],
        },
        {
            id: 'Nav',
            blockType: 'replymessage',
            children: [],
        },
        {
          id: 'Collections',
          blockType: 'match',
          children: [
            {
              id: 'Spring', 
              blockType: 'sendmessage',
              children: []
            },
            {
              id: 'Summer', 
              blockType: 'match',
              children: [
                {
                  id: 'Test1', 
                  blockType: 'match',
                  children: [
                  {
                    id: 'last', 
                    blockType: 'variable',
                    children: []
                  }
              ]}
            ]},
            {
              id: 'Fall', 
              blockType: 'loadmessage',
              children: []
            },
            {
              id: 'Winter', 
              blockType: 'replymessage',
              children: []
            },
          ],
        },
        {
          id: 'About Us',
          blockType: 'sendmessage',
          children: [],
        },
        {
          id: 'My Account',
          blockType: 'match',
          children: [
            {
              id: 'Addresses', 
              blockType: 'replymessage',
              children: []
            },
            {
              id: 'Order History', 
              blockType: 'sendmessage',
              children: []
            },
          ],
        },
    ],
    handleBlocks: [
        {
          id: 'Home',
          blockType: 'variable',
          children: [],
        },
        {
            id: 'Nav',
            blockType: 'replymessage',
            children: [],
        },
        {
          id: 'Collections',
          blockType: 'match',
          children: [
            {
              id: 'Spring', 
              blockType: 'sendmessage',
              children: []
            },
            {
              id: 'Summer', 
              blockType: 'match',
              children: [
                {
                  id: 'Test1', 
                  blockType: 'match',
                  children: [
                  {
                    id: 'last', 
                    blockType: 'variable',
                    children: []
                  }
              ]}
            ]},
            {
              id: 'Fall', 
              blockType: 'loadmessage',
              children: []
            },
            {
              id: 'Winter', 
              blockType: 'replymessage',
              children: []
            },
          ],
        },
        {
          id: 'About Us',
          blockType: 'sendmessage',
          children: [],
        },
        {
          id: 'My Account',
          blockType: 'match',
          children: [
            {
              id: 'Addresses', 
              blockType: 'replymessage',
              children: []
            },
            {
              id: 'Order History', 
              blockType: 'sendmessage',
              children: []
            },
          ],
        },
    ]
};

export const varaBlocksSlice = createSlice({
    name: "VaraBlocksData",
    initialState,
    reducers: {
        // actions to modify contract logic
        addBlockToInit: (state, block: {
            payload: TreeItem,
            type: string
        }) => {
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



        // Actions to modify structs
        addStructToContract: (state, newStruct: {
            payload: {
                newStructId: string,
            };
            type: string;
        }) => {
            const newAttribute: StructAttributeI = {};
            newAttribute[generatePassword()] = {
                attributeName: "",
                attributeType: {
                    ActorId: null
                },
                attributeVal: {
                    ActorIdVal: '0x00'
                }
            };

            state.structs[newStruct.payload.newStructId] = {
                structName: "",
                attributes: {
                    ...newAttribute
                }
            };
        },
        addAttributeToStruct: (state, attributeData: {
            payload: {
                structId: string,
                attributeId: string,
            };
            type: string;
        }) => {
            const structId = attributeData.payload.structId;
            const newAttributeId = attributeData.payload.attributeId;
            state.structs[structId].attributes[newAttributeId] = {
                attributeName: '',
                attributeType: {
                    ActorId: null
                },
                attributeVal: {
                    ActorIdVal: '0x00'
                }
            };
        },
        editStructTitle: (state, enumData: {
            payload: {
                structId: string,
                newTitle: string
            };
            type: string;
        }) => {
            if (Object.keys(state.structs).find((structId) => structId === enumData.payload.structId))
                state.structs[enumData.payload.structId].structName = enumData.payload.newTitle;
            else
                console.log("Struct does not exists!");
        },
        editStructAttributeName: (state, attributeData: {
            payload: {
                structId: string,
                attributeId: string,
                attributeName: string
            };
            type: string;
        }) => {
            const attributeStructId = attributeData.payload.structId;
            const attributeId = attributeData.payload.attributeId;
            const newName = attributeData.payload.attributeName;
            if (Object.keys(state.structs).find((structId) => structId === attributeStructId))
                if (Object.keys(state.structs[attributeStructId].attributes).find(
                    (structAttributeId) => structAttributeId === attributeId))
                    state.structs[attributeStructId].attributes[attributeId].attributeName = newName;
                else
                    console.log("Struct attribute does  not exists!");
            else
                console.log("Struct does not exists!");
        },
        editStructAttributeType: (state, attributeData: {
            payload: {
                structId: string,
                attributeId: string,
                newType: VirtualContractTypes
            };
            type: string;
        }) => {
            const attributeStructId = attributeData.payload.structId;
            const attributeId = attributeData.payload.attributeId;
            const newType = attributeData.payload.newType;
            if (Object.keys(state.structs).find((structId) => structId === attributeStructId))
                if (Object.keys(state.structs[attributeStructId].attributes).find(
                    (structAttributeId) => structAttributeId === attributeId))
                    state.structs[attributeStructId].attributes[attributeId].attributeType = newType;
                else
                    console.log("Struct attribute does  not exists!");
            else
                console.log("Struct does not exists!");
        },
        removeStructOfContract: (state, enumIdToDelete: {
            payload: string;
            type: string;
        }) => {
            delete state.structs[enumIdToDelete.payload];
        },
        removeAttributeFromStruct: (state, attribute: {
            payload: {
                structId: string,
                attributeId: string,
            };
            type: string;
        }) => {
            const attributeStructId = attribute.payload.structId;
            const attributeId = attribute.payload.attributeId;


            if (Object.keys(state.structs).find((structId) => structId === attributeStructId)) {
                const attributes = Object.keys(state.structs[attributeStructId].attributes);
                if (attributes.length === 1) {
                    console.log("Struct cant be with zero attributes!");
                    return;
                }
                if (attributes.find(
                    (structAttributeId) => structAttributeId === attributeId))
                    delete state.structs[attributeStructId].attributes[attributeId];
                else
                    console.log("Struct attribute does  not exists!");
            } else
                console.log("Struct does not exists!");
        },



        // Actions to modify esnums
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
    removeVariantInEnum,

    addStructToContract,
    addAttributeToStruct,
    editStructTitle,
    editStructAttributeName,
    editStructAttributeType,
    removeStructOfContract,
    removeAttributeFromStruct
} = varaBlocksSlice.actions;

export default varaBlocksSlice.reducer;