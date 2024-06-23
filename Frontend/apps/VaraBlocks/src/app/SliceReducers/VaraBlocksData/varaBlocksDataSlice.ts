import { TreeItems, TreeItem } from "@/components/DndLibrary/Tree/types";
import { createSlice } from "@reduxjs/toolkit";
import { 
    MetadataTypes,
    VirtualContractStateType,
    CodeBlock,
    BlockType,
    ContractEnumInterface, 
    ContractStructInterface, 
    StructAttributeI,
    VirtualContractTypes,
    EnumVariantI,
    Variable,
    SendReply,
    SendMessage,
    EnumVal
} from "@/app/app_types/types";
import { generatePassword } from "@/app/utils";
import { 
    HexString 
} from "@gear-js/api";


// [TODO]: Add extra verification for repited titiles, etc.
// [TODO]: Check default value for ActorId, to put on value.

export interface VaraBlockEnum {
    [key: string]: ContractEnumInterface
}

export interface VaraBlockStruct {
    [key: string]: ContractStructInterface
}

export interface VaraBlockCodeBlock {
    [key: string]: CodeBlock
}

interface VaraBlocksData {
    initMetadata: MetadataTypes,
    handleMetadata: MetadataTypes,
    state: VirtualContractStateType,
    structs: VaraBlockStruct
    enums: VaraBlockEnum,
    initBlocks: TreeItems;
    handleBlocks: TreeItems;
    loadMessagesBlocks: VaraBlockCodeBlock;
    sendMessageBlocks: VaraBlockCodeBlock;
    sendReplyBlocks: VaraBlockCodeBlock;
    variablesBlocks: VaraBlockCodeBlock;
    matchBlocks: VaraBlockCodeBlock;
}

const initialState: VaraBlocksData = {
    initMetadata: { noValue: null },
    handleMetadata: { noValue: null },
    state: null,
    structs: {},
    enums: {},
    initBlocks: [],
    handleBlocks: [],
    loadMessagesBlocks: {},
    sendMessageBlocks: {},
    sendReplyBlocks: {},
    variablesBlocks: {},
    matchBlocks: {}
};

export const varaBlocksSlice = createSlice({
    name: "VaraBlocksData",
    initialState,
    reducers: {
        // Action to modify contract state
        setVirtualContractState: (state, newState: {
            payload: VirtualContractStateType,
            type: string
        }) => {
            state.state = newState.payload;
        },



        // Action too modify contract metadata.
        modifyMetadata: (state, metadata: {
            payload: {
                metadataType: MetadataTypes,
                modifyInitMetadata: boolean
            },
            type: string
        }) => {
            const { metadataType, modifyInitMetadata } = metadata.payload;

            if (modifyInitMetadata) state.initMetadata = metadataType;
            else state.handleMetadata = metadataType;
        },




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
                    ActorIdVal: '0x0000000000000000000000000000000000000000000000000000000000000000'
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
                    (structAttributeId) => structAttributeId === attributeId)) {
                    state.structs[attributeStructId].attributes[attributeId].attributeType = newType;

                    // [TODO]: Agregar los mas datos para mandarlos al contrato virtual

                    switch(Object.keys(newType)[0]) {
                        case 'ActorId':
                            state.structs[attributeStructId].attributes[attributeId].attributeVal = {
                                ActorIdVal: '0x0000000000000000000000000000000000000000000000000000000000000000'
                            };
                            break;
                        case 'Text':
                            state.structs[attributeStructId].attributes[attributeId].attributeVal = {
                                TextVal: ''
                            };
                            break;
                        case 'INum':
                            state.structs[attributeStructId].attributes[attributeId].attributeVal = {
                                INumVal: 0
                            };
                            break;
                        case 'UNum':
                            state.structs[attributeStructId].attributes[attributeId].attributeVal = {
                                UNumVal: 0
                            };
                            break;
                        case 'Boolean':
                            state.structs[attributeStructId].attributes[attributeId].attributeVal = {
                                BooleanVal: false
                            }
                    }
                } else
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
            const newEnumVariant: EnumVariantI = {};
            newEnumVariant[generatePassword()] = '';

            state.enums[newEnum.payload.newEnumId] = {
                enumName: "",
                enumType: {
                    ContractEnum: null
                },
                variants: {
                    ...newEnumVariant
                }
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
            if (Object.keys(state.enums).find((enumId) => enumId === variantEnumId)) {
                if (Object.keys(state.enums[variantEnumId].variants).length === 1) {
                    console.log('Enum cant be with zero variants');
                    return;
                }
                if (Object.keys(state.enums[variantEnumId].variants).find((enumVariantId) => enumVariantId === variantId))
                    delete state.enums[variantEnumId].variants[variantId];
                else
                    console.log("Enum variant does  not exists!");
            } else
                console.log("Enum does not exists!");
        },





        
        



        // Actions to add or delete blocks
        addBlock: (state, blockData: {
            payload: {
                treeBlock: TreeItem;
                block: CodeBlock;
                blockType: BlockType;
                blockId: string,
                saveOnInitBlocks: boolean;
            },
            type: string
        }) => {
            const { treeBlock, block, blockType, blockId, saveOnInitBlocks } = blockData.payload;

            if (saveOnInitBlocks) state.initBlocks = [treeBlock, ...state.initBlocks];
            else state.handleBlocks = [treeBlock, ...state.handleBlocks];

            switch (blockType) {
                case 'loadmessage':
                    state.loadMessagesBlocks[blockId] = block;
                    console.log(state.loadMessagesBlocks);
                    break;
                case 'sendmessage':
                    state.sendMessageBlocks[blockId] = block;
                    console.log(state.sendMessageBlocks);
                    break;
                case 'replymessage':
                    state.sendReplyBlocks[blockId] = block;
                    console.log(state.sendReplyBlocks);
                    break;
                case 'variable':
                    state.variablesBlocks[blockId] = block;
                    console.log(state.variablesBlocks);
                    break;
                case 'match':
                    state.matchBlocks[blockId] = block;
                    console.log(state.matchBlocks);
                    break;
                default:
                    console.log('Sin cambios!!!');
            }
        },
        removeBlock: (state, blockData: {
            payload: {
                blockId: string,
                blockType: BlockType
            },
            type: string
        }) => {
            const { blockId, blockType } = blockData.payload;
            const keysToCheck = blockType === 'loadmessage'
                ? state.loadMessagesBlocks
                : blockType === 'variable'
                ? state.variablesBlocks
                : blockType === 'replymessage'
                ? state.sendReplyBlocks
                : blockType === 'sendmessage'
                ? state.sendMessageBlocks
                : blockType === 'match'
                ? state.matchBlocks
                : {};

            if (Object.keys(keysToCheck).find((currentBlockId) => currentBlockId === blockId)) 
                switch (blockType) {
                    case 'loadmessage':
                        delete state.loadMessagesBlocks[blockId];
                        break;
                    case 'sendmessage':
                        delete state.sendMessageBlocks[blockId];
                        break;
                    case 'replymessage':
                        delete state.sendReplyBlocks[blockId];
                        break;
                    case 'variable':
                        delete state.variablesBlocks[blockId];
                        break;
                    case 'match':
                        delete state.matchBlocks[blockId];
                        break;
                    default:
                        console.log('No se encontro nada!!!');
                        break;
                }
            else
                console.log(`Variable ID (${blockId}) does not exists!`);
        },
        setBlocksTo: (state, blocksToRemove: {
            payload: {
                blockType: BlockType,
                blocks: VaraBlockCodeBlock
            },
            type: string
        }) => {
            const { blockType, blocks } = blocksToRemove.payload;
            switch (blockType) {
                case 'loadmessage':
                    state.loadMessagesBlocks = blocks;
                    break;
                case 'sendmessage':
                    state.sendMessageBlocks = blocks;
                    break;
                case 'replymessage':
                    state.sendReplyBlocks = blocks;
                    break;
                case 'variable':
                    state.variablesBlocks = blocks;
                    break;
                default:
                    console.log('NO HAY NADA QUE BORRAR');
                    break;
            }
        },


        

        // Actions to modify load messages blocks
        modifyLoadMessageVariableName: (state, loadMessageData: {
            payload: {
                blockId: string,
                newName: string
            },
            type: string
        }) => {
            const { blockId, newName } = loadMessageData.payload;

            if (Object.keys(state.loadMessagesBlocks).find((loadMessageId) => loadMessageId === blockId)) {
                (state.loadMessagesBlocks[blockId] as { LoadMessageI: { data: Variable, loadInInit: boolean } }).LoadMessageI.data.variableName = newName;
            } else 
                console.log(`Load message block with id: '${blockId} does not exists!'`);
        },
        modifyLoadMessageVariableEnumName: (state, loadMessageData: {
            payload: {
                blockId: string,
                newEnumName: string
            },
            type: string
        }) => {
            const { blockId, newEnumName } = loadMessageData.payload;

            if (Object.keys(state.loadMessagesBlocks).find((loadMessageId) => loadMessageId === blockId)) {
                (((state.loadMessagesBlocks[blockId] as { LoadMessageI: { data: Variable, loadInInit: boolean } }).
                LoadMessageI.data.varValue) as { EnumVal: EnumVal }).EnumVal.enumFrom = newEnumName
            } else 
                console.log(`Load message block with id: '${blockId} does not exists!'`);
        },






        // Actions to modify send message blocks
        setSendMessageActorId: (state, sendMessageBlockData: {
            payload: {
                blockId: string,
                newActorId: string
            },
            type: string
        }) => {
            // [TODO]: implement checker to ActorId
            const { blockId, newActorId } = sendMessageBlockData.payload;
            (state.sendMessageBlocks[blockId] as { SendMessageI: { data: SendMessage, sendMessageInInit: boolean } }).SendMessageI.data.to = newActorId;
        },
        modifySendMessageEnumName: (state, sendMessageBlockData: {
            payload: {
                blockId: string,
                newEnumName: string
            },
            type: string
        }) => {
            const { blockId, newEnumName } = sendMessageBlockData.payload;
            (state.sendReplyBlocks[blockId] as { SendMessageI: { data: SendMessage, sendMessageInInit: boolean } }).SendMessageI.data.message.enumFrom = newEnumName;
        },
        modifySendMessageEnumVariantName: (state, sendMessageBlockData: {
            payload: {
                blockId: string,
                newEnumVariantName: string
            },
            type: string
        }) => {
            const { blockId, newEnumVariantName } = sendMessageBlockData.payload;
            (state.sendMessageBlocks[blockId] as { SendMessageI: { data: SendMessage, sendMessageInInit: boolean } }).SendMessageI.data.message.val = newEnumVariantName;
        },






        // Action to modify send reply blocks
        modifySendReplyEnumName: (state, sendReplyBlockData: {
            payload: {
                blockId: string,
                newEnumName: string
            },
            type: string
        }) => {
            const { blockId, newEnumName } = sendReplyBlockData.payload;
            (state.sendReplyBlocks[blockId] as { SendReplyI: { data: SendReply, sendReplyInInit: boolean } }).SendReplyI.data.message.enumFrom = newEnumName;
        },
        modifySendReplyEnumVariantName: (state, sendReplyBlockData: {
            payload: {
                blockId: string,
                newEnumVariantName: string
            },
            type: string
        }) => {
            const { blockId, newEnumVariantName } = sendReplyBlockData.payload;
            (state.sendReplyBlocks[blockId] as { SendReplyI: { data: SendReply, sendReplyInInit: boolean } }).SendReplyI.data.message.val = newEnumVariantName;
        },





    }
});


export const { 
    setVirtualContractState,

    modifyMetadata,

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
    removeAttributeFromStruct,

    addBlock,
    removeBlock,
    setBlocksTo,

    modifyLoadMessageVariableName,
    modifyLoadMessageVariableEnumName,

    setSendMessageActorId,
    modifySendMessageEnumName,
    modifySendMessageEnumVariantName,

    modifySendReplyEnumName,
    modifySendReplyEnumVariantName
} = varaBlocksSlice.actions;

export default varaBlocksSlice.reducer;



/*
[
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
*/