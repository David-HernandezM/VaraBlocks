export { 
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
} from "./VaraBlocksData/varaBlocksDataSlice";

export {
    setSignlessAccount,
    removeSignlessAccount
} from "./SignlessAccountData/signlessAccountDataSlice";

export type { 
    VaraBlockEnum,
    VaraBlockCodeBlock
} from "./VaraBlocksData/varaBlocksDataSlice";