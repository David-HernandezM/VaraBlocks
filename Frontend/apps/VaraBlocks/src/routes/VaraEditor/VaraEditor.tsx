import { useEffect, useState } from "react";
import { 
    VirtualContractEnum, 
    VirtualContractStruct, 
    VirtualContractData,
    VirtualContractMessageHandler
} from "@/components";
import { 
    generatePassword, 
    metadataHasIn, 
    metadataHasOut,
    firstVariantFromEnumI,
    enumDataByName
} from "@/app/utils"; 
import { useAppDispatch, useAppSelector, useContractUtils } from "@/app/hooks";
import { 
    addEnumToContract, 
    addStructToContract,
    setBlocksOnInit,
    setBlocksOnHandle,
    addBlock,
    removeBlock,
    VaraBlockEnum,
    
} from "@/app/SliceReducers";
import {  
    ContractEnumInterface, 
    Variable,
    EnumVal,
    VirtualContractDataToSend,
    VirtualContractMetadata, 
    VirtualContractStateType,
    CodeBlock, 
    ContractEnum,
    ContractStruct,
    Result,
    SendMessage,
    SendReply,
    BlockType,
    Match,
    EnumName,
    StructName,
    StructAttribute
} from '@/app/app_types/types';



import { Button } from "@/components/ui/button";
import { TreeItem, TreeItems } from "@/components/DndLibrary/Tree/types";
import { SortableTree } from "@/components/DndLibrary";
import { useAccount, useAlert } from "@gear-js/react-hooks";
import "./VaraEditor.scss";
import { VaraBlockStruct } from "@/app/SliceReducers/VaraBlocksData/varaBlocksDataSlice";
import { MAIN_CONTRACT } from "@/app/consts";
import { ProgramMetadata } from "@gear-js/api";
// import { MAIN_CONTRACT } from "@/app/consts";


export default function VaraEditor() {
    const account = useAccount()
    const alert = useAlert();
    const {
        sendMessage
    } = useContractUtils();
    // const contractState = useAppSelector((state) => )


    const initBlocks = useAppSelector((state) => state.VaraBlocksData.initBlocks);
    const handleBlocks = useAppSelector((state) => state.VaraBlocksData.handleBlocks);

    const loadMessageBlocks = useAppSelector((state) => state.VaraBlocksData.loadMessagesBlocks);
    const sendMessagesBlocks = useAppSelector((state) => state.VaraBlocksData.sendMessageBlocks);
    const replymessageBlocks = useAppSelector((state) => state.VaraBlocksData.sendReplyBlocks);
    const variableBlocks = useAppSelector((state) => state.VaraBlocksData.variablesBlocks);
    const matchBlocks = useAppSelector((state) => state.VaraBlocksData.matchBlocks);






    const initMetadata = useAppSelector((state) => state.VaraBlocksData.initMetadata);
    const handleMetadata = useAppSelector((state) => state.VaraBlocksData.handleMetadata);

    const virtualContractStateData = useAppSelector((state) => state.VaraBlocksData.state);
    const enumsData = useAppSelector((state) => state.VaraBlocksData.enums);
    const structsData = useAppSelector((state) => state.VaraBlocksData.structs);
    const dispatch = useAppDispatch();
    const [structsEditorOpen, setStructsEditorOpen] = useState(false);
    const [enumsEditorOpen, setEnumsEditorOpen] = useState(false);
    const [contractEditorOpen, setContractEditorOpen] = useState(true);
    const [virtualContractDataOpen, setVirtualContractDataOpen] = useState(false);
    const [initCodeEditionOpen, setInitCodeEditionOpen] = useState(true);
    const [handleCodeEditionOpen, setHandleCodeEditionOpen] = useState(false);
    // const [accountHasVirtualContract, setAccountHasVirtualContract] = useState(false);
    // const [virtualContractState, setVirtualContractState] = useState<ContractStruct | null>(null);
    // const [virtualContractMetadata, setVirtualContractMetadata] = useState<VirtualContractMetadata>();
    const {
        readState
    } = useContractUtils();

    const configEditionButtonsPressed = (btn1: boolean, btn2: boolean, btn3: boolean, btn4: boolean) => {
        setContractEditorOpen(btn1);
        setStructsEditorOpen(btn2);
        setEnumsEditorOpen(btn3);
        setVirtualContractDataOpen(btn4);
    }

    const configEditionBlocksButtonsPressed = (initButton: boolean, handleButton: boolean) => {
        setInitCodeEditionOpen(initButton);
        setHandleCodeEditionOpen(handleButton);
    }


    const treeItemsToCodeBlocks = (treeItems: TreeItems, parent: BlockType): Result<CodeBlock[], string >=> {
        const codeBlocks: CodeBlock[] = [];

        // treeItems.forEach((treeItem) => {
        for (const treeItem of treeItems) {
            switch (treeItem.blockType) {
                case 'loadmessage':
                    if (parent === 'match') {
                        return { ok: false, error: 'Load message block cant be direct child of match' };
                    }

                    if (treeItem.children.length > 0) {
                        return { ok: false, error: 'Load message block cant save childrens' };
                    }

                    const loadMessageBlockData =(loadMessageBlocks[treeItem.id] as { LoadMessageI: { data: Variable, loadInInit: boolean } }).LoadMessageI;

                    if (loadMessageBlockData.data.variableName.trim() === '') {
                        console.log("ENTRROOOOOO");
                        
                        return { ok: false, error: 'Load message block variable cant be empty' };
                    }

                    console.log("SALIOOOOOOOOO");
                    

                    const loadMessageBlockFormat: CodeBlock = { 
                        LoadMessage: loadMessageBlockData.data
                    };

                    codeBlocks.push(loadMessageBlockFormat);

                    break;
                case 'sendmessage':
                    if (parent === 'match') {
                        return { ok: false, error: 'send message block cant be direct child of match' };
                    }

                    if (treeItem.children.length > 0) {
                        return { ok: false, error: 'send message block cant save childrens' };
                    }

                    const sendMessageBlockData = (sendMessagesBlocks[treeItem.id] as { SendMessageI: { data: SendMessage, sendMessageInInit: boolean } }).SendMessageI;
                    const sendMessageBlockFormat: CodeBlock = { 
                        SendMessage: sendMessageBlockData.data 
                    };

                    codeBlocks.push(sendMessageBlockFormat);
                    break;
                case 'replymessage':
                    if (parent === 'match') {
                        return { ok: false, error: 'reply message block cant be direct child of match' };
                    }

                    if (treeItem.children.length > 0) {
                        return { ok: false, error: 'reply message block cant save childrens' };
                    }

                    const replyMessageBlockData = (replymessageBlocks[treeItem.id] as { SendReplyI: { data: SendReply, sendReplyInInit: boolean } }).SendReplyI;
                    const replyMessageBlockFormat: CodeBlock = { 
                        SendReply: replyMessageBlockData.data
                    };

                    codeBlocks.push(replyMessageBlockFormat);

                    break;
                case 'match':
                    console.log(treeItem);

                    const matchBlocksData = (matchBlocks[treeItem.id] as { ControlFlow: { Match: { data: Match, matchArmsIds: string[], matchInInit: boolean } }}).ControlFlow.Match;
                    const matchBlocksFormat: { Match: Match } = {
                        Match: JSON.parse(JSON.stringify(matchBlocksData.data))
                    };

                    const matchBlocksBody: CodeBlock[][] = [];

                    for (const matchArm of treeItem.children) {
                        if (matchArm.blockType !== 'matcharm') {
                            return { ok: false, error: `${matchArm.blockType} block cant be direct child of match` };
                        }

                        const matchArmBlocks = treeItemsToCodeBlocks(matchArm.children, 'matcharm');

                        if (!matchArmBlocks.ok) {
                            return matchArmBlocks;
                        }

                        matchBlocksBody.push(matchArmBlocks.value);
                    }

                    matchBlocksFormat.Match.codeBlock = matchBlocksBody;

                    const matchBlockToSave: CodeBlock = {
                        ControlFlow: {
                            Match: matchBlocksFormat.Match
                        }
                    }

                    codeBlocks.push(matchBlockToSave);
                    
                    break;
            }
        };

        return { ok: true, value: codeBlocks };
    }

    // [TODO]: revisar que los enums y structs esten bien, ya que el usuario no puede meterlos a la metadata
    // y aun asi mandarlos al contrato, ocasionando bugs como nombres vacios, etc.
    // igual checar el comportamiento del interprete ante esto.

    const enumsDataToEnumsBlock = (enumsData: VaraBlockEnum): [EnumName, ContractEnum][] => {
        let enumsFormated: [EnumName, ContractEnum][] = [];

        for (const [_, contractEnumData] of Object.entries(enumsData)) {
            const contractEnumName = contractEnumData.enumName.trim();

            if (contractEnumName === '') continue;
            
            let enumVariants: string[] = [];

            Object.values(contractEnumData.variants).forEach((variantName) => {
                const enumVariantName = variantName.trim();
                if (enumVariantName !== ''){
                    enumVariants.push(enumVariantName);
                }
            });

            const enumFormat: ContractEnum = {
                enumName: contractEnumName,
                enumType: contractEnumData.enumType,
                variants: enumVariants
            }

            enumsFormated.push([contractEnumData.enumName, enumFormat]);
        }

        return enumsFormated;
    }

    const structsDataToStructBlocks = (structsData: VaraBlockStruct): [StructName, ContractStruct][] => {
        let structsFormated: [StructName, ContractStruct][] = [];

        for (const contractStructData of Object.values(structsData)) {
            const contractStructName = contractStructData.structName.trim();

            if (contractStructName === '') continue;

            let structAttributes: StructAttribute[] = [];

            Object.values(contractStructData.attributes).forEach((contractStructAttributeData) => {
                structAttributes.push(contractStructAttributeData);
            });

            const structFormat: ContractStruct = {
                structName: contractStructName,
                attributes: structAttributes
            };

            structsFormated.push([contractStructName, structFormat]);
        }

        return structsFormated;
    }


    return (
        <div className="varaeditor">
            <div className="varaeditor__edition-buttons">
                <ul className="varaeditor__edition-options">
                    <li 
                        className={contractEditorOpen ? "varaeditor__edition-options--selected" : ""}
                        onClick={() => configEditionButtonsPressed(true, false, false, false)}
                    >
                        Contract editor
                    </li>
                    <li 
                        className={structsEditorOpen ? "varaeditor__edition-options--selected" : ""}
                        onClick={() => configEditionButtonsPressed(false, true, false, false)}
                    > 
                        Structs editor
                    </li>
                    <li 
                        className={enumsEditorOpen ? "varaeditor__edition-options--selected" : ""}
                        onClick={() => configEditionButtonsPressed(false, false, true, false)}
                    >
                        Enums editor
                    </li>
                    <li 
                        className={virtualContractDataOpen ? "varaeditor__edition-options--selected" : ""}
                        onClick={() => configEditionButtonsPressed(false, false, false, true)}
                    >
                        Virtual Contract Data
                    </li>
                </ul>
                <Button size={"small"} textSize={"medium"} textWeight={"weight2"} rounded={"rounded4"} width={"normal"} onClick={async () => {
                    if (!account.account) {
                        console.log("Account isnt initialized");
                        return;
                      }

                    const virtualContractMetadata: VirtualContractMetadata = {
                        init: initMetadata,
                        handle: handleMetadata
                    };

                    const initCode = treeItemsToCodeBlocks(initBlocks, 'empty');
                    const handleCode = treeItemsToCodeBlocks(handleBlocks, 'empty');

                    if (!initCode.ok) {
                        alert.error(initCode.error);
                        return;
                    }

                    if (!handleCode.ok) {
                        alert.error(handleCode.error);
                        return;
                    }

                    const enums = enumsDataToEnumsBlock(enumsData);
                    const structs = structsDataToStructBlocks(structsData);

                    const virtualContract: VirtualContractDataToSend = {
                        metadata: virtualContractMetadata,
                        state: virtualContractStateData,
                        initCode: initCode.value,
                        handleCode: handleCode.value,
                        enums,
                        structs
                    };
                    
                    

                    console.log(virtualContract);
                    
                    await sendMessage(
                        account.account.decodedAddress,
                        account.account.meta.source,
                        MAIN_CONTRACT.programId,
                        ProgramMetadata.from(MAIN_CONTRACT.programMetadata),
                        {
                          SetVirtualContract: virtualContract
                        },
                        0,
                        "Virtual Contract set!",
                        "Erron while sending virtual contract",
                        "Sending virtual contract...",
                        "VaraBlocks action:"
                    );
                    
                }}>
                    Send Virtual Contract
                </Button>
            </div>
            <div className="varaeditor__container">
                {
                    contractEditorOpen && 
                    <div className="varaeditor__contract-editor">
                        <div className="varaeditor__contract-editor-logic">
                            <ul className="varaeditor__edition-options varaeditor__edition-options--codeblock-options">
                                <li 
                                    className={initCodeEditionOpen ? "varaeditor__edition-options--selected" : ""}
                                    onClick={() => {configEditionBlocksButtonsPressed(true, false)}}
                                >
                                    init blocks
                                </li>
                                <li
                                    className={handleCodeEditionOpen ? "varaeditor__edition-options--selected" : ""}
                                    onClick={() => {configEditionBlocksButtonsPressed(false, true)}}
                                >
                                    handle blocks
                                </li>
                            </ul>
                            <div className="varaeditor__contract-editor-logic__container">
                                <div className="varaeditor__contract-editor-logic__container__buttons-block">
                                    <p className="">Actions</p>
                                    <Button size={"small"} textSize={"medium"} textWeight={"weight2"} rounded={"rounded4"} width={"normal"} onClick={() => {
                                        // console.log(metadataHasIn(initMetadata));
                                        // console.log(metadataHasIn(handleMetadata));

                                        const initMetadataIn = metadataHasIn(initMetadata);
                                        const handleMetadataIn = metadataHasIn(handleMetadata);
                                        
                                        if (initCodeEditionOpen && !initMetadataIn) {
                                            alert.error('No "In" metadata in: init');
                                            return;
                                        } 
                                        

                                        if (handleCodeEditionOpen && !handleMetadataIn) {
                                            alert.error('No "In" metadata in: handle');
                                            return;
                                        } 

                                        const metadataEnumName = initCodeEditionOpen
                                            ? initMetadataIn as string
                                            : handleMetadataIn as string;

                                        const enumData = enumDataByName(metadataEnumName, enumsData) as ContractEnumInterface;

                                        const hasVariants = firstVariantFromEnumI(enumData);

                                        if (!hasVariants) {
                                            alert.error(`Cant read message from '${enumData.enumName}', need at least one variant!`);
                                            return;
                                        }

                                        const blockId = generatePassword();

                                        const blockToSave: TreeItem = {
                                            id: blockId,
                                            blockType: 'loadmessage',
                                            children: []
                                        };

                                        const varaBlock: CodeBlock = {
                                            LoadMessageI: {
                                                data: {
                                                    variableName: '',
                                                    isMutable: false,
                                                    varType: {
                                                      Enum: null
                                                    },
                                                    varValue: {
                                                      EnumVal: {
                                                        enumFrom: enumData.enumName,
                                                        val: ''
                                                      }
                                                    },
                                                    isParameter: false
                                                },
                                                loadInInit: initCodeEditionOpen
                                            }
                                        }

                                        dispatch(addBlock({
                                            treeBlock: blockToSave,
                                            block: varaBlock,
                                            blockType: 'loadmessage',
                                            blockId,
                                            saveOnInitBlocks: initCodeEditionOpen
                                        }));
                                        
                                        console.log("Agregar Load messaage");
                                    }}>
                                        Load message
                                    </Button>
                                    <Button size={"small"} textSize={"medium"} textWeight={"weight2"} rounded={"rounded4"} width={"normal"} onClick={() => {
                                        const initMetadataOut = metadataHasOut(initMetadata);
                                        const handleMetadataOut = metadataHasOut(handleMetadata);

                                        if (initCodeEditionOpen && !initMetadataOut) {
                                            alert.error('No "Out" metadata in: init');
                                            return;
                                        } 
                                        
                                        if (handleCodeEditionOpen && !handleMetadataOut) {
                                            alert.error('No "Out" metadata in: handle');
                                            return;
                                        } 

                                        const metadataEnumName = initCodeEditionOpen
                                            ? initMetadataOut as string
                                            : handleMetadataOut as string;

                                        const enumData = enumDataByName(metadataEnumName, enumsData) as ContractEnumInterface;

                                        console.log('Enum get:');
                                        console.log(enumData);

                                        const selectedVariant = firstVariantFromEnumI(enumData);

                                        console.log('first variant from enum');
                                        console.log(selectedVariant);

                                        if (!selectedVariant) {
                                            alert.error(`Virtual contract enum '${metadataEnumName}' does not have valid variants!`);
                                            return;
                                        }

                                        const blockId = generatePassword();

                                        const blockToSave: TreeItem = {
                                            id: blockId,
                                            blockType: 'sendmessage',
                                            children: []
                                        };

                                        const varaBlock: CodeBlock = {
                                            SendMessageI: {
                                                data: {
                                                    message: {
                                                        enumFrom: initCodeEditionOpen
                                                            ? initMetadataOut as string
                                                            : handleMetadataOut as string,
                                                        val: selectedVariant,
                                                    },
                                                    to: '0x00000000000000000000000000000000'
                                                },
                                                sendMessageInInit: initCodeEditionOpen
                                            }
                                        };

                                        dispatch(addBlock({
                                            treeBlock: blockToSave,
                                            block: varaBlock,
                                            blockType: 'sendmessage',
                                            blockId,
                                            saveOnInitBlocks: initCodeEditionOpen
                                        }));
                                    }}>

                                        Send Message
                                    </Button>
                                    <Button size={"small"} textSize={"medium"} textWeight={"weight2"} rounded={"rounded4"} width={"normal"} onClick={() => {
                                        const initMetadataOut = metadataHasOut(initMetadata);
                                        const handleMetadataOut = metadataHasOut(handleMetadata);

                                        if (initCodeEditionOpen && !initMetadataOut) {
                                            alert.error('No "Out" metadata in: init');
                                            return;
                                        } 
                                        
                                        if (handleCodeEditionOpen && !handleMetadataOut) {
                                            alert.error('No "Out" metadata in: handle');
                                            return;
                                        } 

                                        const metadataEnumName = initCodeEditionOpen
                                            ? initMetadataOut as string
                                            : handleMetadataOut as string;

                                        const enumData = enumDataByName(metadataEnumName, enumsData) as ContractEnumInterface;

                                        console.log('Enum get:');
                                        console.log(enumData);

                                        const selectedVariant = firstVariantFromEnumI(enumData);

                                        console.log('first variant from enum');
                                        console.log(selectedVariant);

                                        if (!selectedVariant) {
                                            alert.error(`Virtual contract enum '${metadataEnumName}' does not have valid variants!`);
                                            return;
                                        }

                                        const blockId = generatePassword();

                                        const blockToSave: TreeItem = {
                                            id: blockId,
                                            blockType: 'replymessage',
                                            children: []
                                        };

                                        const varaBlock: CodeBlock = {
                                            SendReplyI: {
                                                data: {
                                                    message: {
                                                        enumFrom: initCodeEditionOpen
                                                            ? initMetadataOut as string
                                                            : handleMetadataOut as string,
                                                        val: selectedVariant,
                                                    }
                                                },
                                                sendReplyInInit: initCodeEditionOpen
                                            }
                                        };

                                        dispatch(addBlock({
                                            treeBlock: blockToSave,
                                            block: varaBlock,
                                            blockType: 'replymessage',
                                            blockId,
                                            saveOnInitBlocks: initCodeEditionOpen
                                        }));
                                    }}>
                                        Send Reply
                                    </Button>
                                    {/* <Button size={"small"} textSize={"medium"} textWeight={"weight2"} rounded={"rounded4"} width={"normal"} onClick={() => {
                                        console.log("Agregar variable");
                                    }}>
                                        Change state
                                    </Button> */}
                                    {/* <Button size={"small"} textSize={"medium"} textWeight={"weight2"} rounded={"rounded4"} width={"normal"} onClick={() => {
                                        const blockId = generatePassword();

                                        const blockToSave: TreeItem = {
                                            id: blockId,
                                            blockType: 'loadmessage',
                                            children: []
                                        };

                                        const varaBlock: CodeBlock = {
                                            LoadMessage: {
                                              variableName: 'message',
                                              isMutable: false,
                                              varType: {
                                                Enum: null
                                              },
                                              varValue: {
                                                EnumVal: {
                                                  enumFrom: 'ContractEvent',
                                                  val: 'Ping'
                                                }
                                              },
                                              isParameter: false
                                            }
                                        }

                                        dispatch(addBlock({
                                            treeBlock: blockToSave,
                                            block: varaBlock,
                                            blockType: 'loadmessage',
                                            blockId,
                                            saveOnInitBlocks: initCodeEditionOpen
                                        }));
                                        console.log("Agregar variable");
                                    }}>
                                        Add variable
                                    </Button> */}
                                    <Button size={"small"} textSize={"medium"} textWeight={"weight2"} rounded={"rounded4"} width={"normal"} onClick={() => {
                                        const loadMessagesBlocksData = Object.entries(loadMessageBlocks);
                                        const variablesBlocksData = Object.entries(variableBlocks);

                                        // It can take variable value because we check all state with load messages before.

                                        let variableNameToMatch: string = '';
                                        let variableEnumNameToMatch: string = '';
                                        if (loadMessagesBlocksData.length === 0 && variablesBlocksData.length === 0) {
                                            alert.error('No variables to match!');
                                            return;
                                        } else if (loadMessagesBlocksData.length !== 0) {
                                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                            const [_, temp] = loadMessagesBlocksData[0];
                                            const loadMessageData = temp as { LoadMessageI: { data: Variable, loadInInit: boolean } };
                                            
                                            variableNameToMatch = loadMessageData.LoadMessageI.data.variableName;
                                            variableEnumNameToMatch = (loadMessageData.LoadMessageI.data.varValue  as { EnumVal: EnumVal }).EnumVal.enumFrom ;
                                        } else {
                                            const variableData = (variablesBlocksData[0][1] as { VariableI: { data: Variable, variableInInit: boolean } }).VariableI.data;
                                            variableNameToMatch = variableData.variableName;
                                            variableEnumNameToMatch = (variableData.varValue  as { EnumVal: EnumVal }).EnumVal.enumFrom ;
                                        }

                                        if (variableNameToMatch.trim() === '') {
                                            alert.error('No variables to match!');
                                            return;
                                        }

                                        const enumData = enumDataByName(variableEnumNameToMatch, enumsData);

                                        if (!enumData) {
                                            alert.error(`Enum '${variableEnumNameToMatch} does not exists!`);
                                            return;
                                        }

                                        

                                        const blockId = generatePassword();

                                        const matchArmsIds: string[] = [];

                                        const blockToSave: TreeItem = {
                                            id: blockId,
                                            blockType: 'match',
                                            children: Object.entries(enumData.variants).map((([_, enumVariantName]) => {
                                                const matchArmId = `${generatePassword()} ${blockId} ${enumData.enumName} ${enumVariantName}`;
                                                matchArmsIds.push(matchArmId)
                                                return {
                                                    id: matchArmId,
                                                    blockType: 'matcharm',
                                                    isDisabled: true,
                                                    children: []
                                                };
                                            }))
                                        };

                                        const varaBlock: CodeBlock = {
                                            ControlFlow: {
                                                Match: { 
                                                    data: {
                                                        variableToMatch: variableNameToMatch,
                                                        enumToMatch: variableEnumNameToMatch,
                                                        codeBlock: []
                                                    },
                                                    matchArmsIds: matchArmsIds, 
                                                    matchInInit: initCodeEditionOpen 
                                                }
                                            }
                                        }

                                        dispatch(addBlock({
                                            treeBlock: blockToSave,
                                            block: varaBlock,
                                            blockType: 'match',
                                            blockId,
                                            saveOnInitBlocks: initCodeEditionOpen
                                        }));
                                    }}>
                                        Add match
                                    </Button>
                                    {/* <Button size={"small"} textSize={"medium"} textWeight={"weight2"} rounded={"rounded4"} width={"normal"} onClick={() => {
                                        console.log("Checando state");
                                        console.log('Load Message Block');
                                        console.log(loadMessageBlocks);
                                        console.log('Send message block');
                                        console.log(sendMessagesBlocks);
                                        console.log('Send reply message block');
                                        console.log(replymessageBlocks);
                                        console.log('Match blocks');
                                        console.log(matchBlocks);
                                        console.log('Init blocks');
                                        console.log(initBlocks);
                                        console.log('Handle Blocks');
                                        console.log(handleBlocks);
                                    }}>
                                        Check state
                                    </Button> */}
                                </div>
                                {
                                    initCodeEditionOpen && <div className="varaeditor__contract-editor-logic--sketch">
                                        <div>
                                            <SortableTree setBlocks={setBlocksOnInit} varaBlocksState={initBlocks} />
                                        </div>
                                    </div>
                                }
                                {
                                    handleCodeEditionOpen && <div className="varaeditor__contract-editor-logic--sketch">
                                        <div>
                                            <SortableTree setBlocks={setBlocksOnHandle} varaBlocksState={handleBlocks} />
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                }
                {
                    structsEditorOpen && 
                    <div className="varaeditor__structs-editor">
                        {
                            Object.keys(structsData).map((structId, index) => {
                                return <VirtualContractStruct structId={structId} key={structId}/>
                            })
                        }
                        <Button size={"small"} textSize={"large"} rounded={"rounded4"} width={"normal"} onClick={() => {
                            const newId = generatePassword();
                            console.log("Id generated: ", newId);
                            dispatch(addStructToContract({ newStructId: newId }));
                        }}>
                            Add Struct
                        </Button>
                    </div>
                }
                {
                    enumsEditorOpen && 
                    <div className="varaeditor__enums-editor">
                        {
                            Object.keys(enumsData).map((enumId, index) => {
                                return <VirtualContractEnum enumId={enumId} key={enumId}/>
                            })
                        }
                        <Button size={"small"} textSize={"large"} rounded={"rounded4"} width={"normal"} onClick={() => {
                            const newId = generatePassword();
                            console.log("Id generated: ", newId);
                            dispatch(addEnumToContract({ newEnumId: newId }));
                        }}>
                            Add Enum
                        </Button>
                    </div>
                }
                {
                    virtualContractDataOpen &&
                    <div className="varaeditor__virtual-contract-data">
                        <VirtualContractData />
                        <VirtualContractMessageHandler />
                    </div>
                }
            </div>
        </div>
    );
}





    /*
    useEffect(() => {
        (
            async function() {
                if (!account) return;

                const contractVirtualState = await readState(
                    MAIN_CONTRACT.programId,
                    MAIN_CONTRACT.programMetadata,
                    {
                        VirtualContractState: account.account?.decodedAddress
                    }
                );
    
                if (Object.keys(contractVirtualState as {})[0] !== "addresDoesNotHaveVirtualContract") {
                    // const { attributes, structName } = virtualContractState;
                    const { virtualContractState }: any = contractVirtualState;
                    console.log(virtualContractState);
    
                    if (virtualContractState) {
                        const virtualContractStateStruct = virtualContractState as ContractStruct;
    
                        setVirtualContractState(virtualContractStateStruct);
                        setAccountHasVirtualContract(true);
                    } else {
                        setVirtualContractState(null);
                    }
    
                    
                } else {
                    setAccountHasVirtualContract(false);
                    console.log('La cuenta no tiene un contrato virtual!');
                    return;
                }    

                const contractVirtualMetadata = await readState(
                    MAIN_CONTRACT.programId,
                    MAIN_CONTRACT.programMetadata,
                    {
                        VirtualContractMetadata: account.account?.decodedAddress
                    }
                );

                const { virtualContractMetadata }: any = contractVirtualMetadata;

                console.log(virtualContractMetadata);

                setVirtualContractMetadata(virtualContractMetadata as VirtualContractMetadata);
            }
        )();
    }, [account]);
    */

    