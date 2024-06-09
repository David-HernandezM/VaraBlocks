import { useEffect, useState, useContext } from "react";
import { 
    VirtualContractEnum, 
    VirtualContractStruct, 
    VirtualContractMetadataFields,
    VirtualContractMessageHandler,
    ButtonActionsForBlocks
} from "@/components";
import { 
    generatePassword,
    generateRandomString
} from "@/app/utils"; 
import { useAppDispatch, useAppSelector, useContractUtils } from "@/app/hooks";
import { 
    addEnumToContract, 
    addStructToContract,
    setBlocksOnInit,
    setBlocksOnHandle,
    VaraBlockEnum,
    apiIsBusy
} from "@/app/SliceReducers";
import {  
    Variable,
    VirtualContractDataToSend,
    VirtualContractMetadata, 
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
import { KeyringPair } from '@polkadot/keyring/types';
import { Button } from "@/components/ui/button";
import { TreeItems } from "@/components/DndLibrary/Tree/types";
import { SortableTree } from "@/components/DndLibrary";
import { useAccount, useAlert } from "@gear-js/react-hooks";
import { VaraBlockStruct } from "@/app/SliceReducers/VaraBlocksData/varaBlocksDataSlice";
import { MAIN_CONTRACT } from "@/app/consts";
import { HexString, ProgramMetadata, decodeAddress } from "@gear-js/api";
import { signlessDataContext } from "@/app/Context";

import "./VaraEditor.scss";
import { SignlessForm } from "@/components";



export default function VaraEditor() {
    const account = useAccount();
    const alert = useAlert();
    const { 
        signlessData, 
        noWalletAccountName,
    } = useContext(signlessDataContext);
    const {
        sendMessageWithSignlessAccount,
    } = useContractUtils();

    const polkadotAccountEnable = useAppSelector((state) => state.AccountsSettings.polkadotEnable);
    const apiIsCurrentlyBusy = useAppSelector((state) => state.AccountsSettings.apiIsBusy);
    const apiIsReady = useAppSelector((state) => state.AccountsSettings.apiStarted);
    const apiIsDisconnected = useAppSelector((state) => state.AccountsSettings.apiIsDisconnected);

    const initBlocks = useAppSelector((state) => state.VaraBlocksData.initBlocks);
    const handleBlocks = useAppSelector((state) => state.VaraBlocksData.handleBlocks);
    const loadMessageBlocks = useAppSelector((state) => state.VaraBlocksData.loadMessagesBlocks);
    const sendMessagesBlocks = useAppSelector((state) => state.VaraBlocksData.sendMessageBlocks);
    const replymessageBlocks = useAppSelector((state) => state.VaraBlocksData.sendReplyBlocks);
    // const variableBlocks = useAppSelector((state) => state.VaraBlocksData.variablesBlocks);
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
    const [signlessAccountModalOpen, setSignlessAccountModalOpen] = useState(false);

    const [addressToReceiveMessages, setAddressToReceiveMessages] = useState<HexString | null>(signlessData ? decodeAddress(signlessData.address) : null);
    const [virtualContractAddress, setVirtualContractAddress] = useState<string | null>(null);

    const closeSignlessModal = () => {
        setSignlessAccountModalOpen(false);
    };

    const configEditionButtonsPressed = (btn1: boolean, btn2: boolean, btn3: boolean, btn4: boolean) => {
        setContractEditorOpen(btn1);
        setStructsEditorOpen(btn2);
        setEnumsEditorOpen(btn3);
        setVirtualContractDataOpen(btn4);
    };

    const configEditionBlocksButtonsPressed = (initButton: boolean, handleButton: boolean) => {
        setInitCodeEditionOpen(initButton);
        setHandleCodeEditionOpen(handleButton);
    };

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
                        return { ok: false, error: 'Load message block variable cant be empty' };
                    }

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
    };

    useEffect(() => {
        if (polkadotAccountEnable) {
            if (!account.account) {
                setAddressToReceiveMessages(null);
            } else {
                setAddressToReceiveMessages(account.account.decodedAddress);
            }
            return;
        }

        if (signlessData) {
            setAddressToReceiveMessages(decodeAddress(signlessData.address));
        }

        setAddressToReceiveMessages(null);
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account]);

    // [TODO]: revisar que los enums y structs esten bien, ya que el usuario no puede meterlos a la metadata
    // y aun asi mandarlos al contrato, ocasionando bugs como nombres vacios, etc.
    // igual checar el comportamiento del interprete ante esto.

    const enumsDataToEnumsBlock = (enumsData: VaraBlockEnum): [EnumName, ContractEnum][] => {
        let enumsFormated: [EnumName, ContractEnum][] = [];

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    };

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
    };

    const handleCreateVirtualContract = async (signlessAccountData: KeyringPair, encryptedAccount: string | null): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            dispatch(apiIsBusy(true));

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

            console.log("sending message!");

            const virtualContractId = generateRandomString(40);

            console.log('Vitual contract id que se creo:');
            console.log(virtualContractId);

            if (polkadotAccountEnable) {
                if (!account.account) {
                    alert.error("Account is not already!");
                    reject("Account is not already!");
                    return;
                }

                

                await sendMessageWithSignlessAccount(
                    signlessAccountData,
                    MAIN_CONTRACT.programId,
                    ProgramMetadata.from(MAIN_CONTRACT.programMetadata),
                    {
                        AddVirtualContractToAdress: {
                            userAccount: account.account.decodedAddress,
                            virtualContract,
                            virtualContractId: virtualContractId
                        }
                    },
                    0,
                    "Virtual Contract set!",
                    "Erron while sending virtual contract",
                    "Sending virtual contract...",
                    "VaraBlocks action:"
                );

                dispatch(apiIsBusy(false));

                setAddressToReceiveMessages(account.account.decodedAddress);
                setVirtualContractAddress(virtualContractId);
                return;
            }

            await sendMessageWithSignlessAccount(
                signlessAccountData,
                MAIN_CONTRACT.programId,
                ProgramMetadata.from(MAIN_CONTRACT.programMetadata),
                {
                    AddVirtualContractToNoWalletAccount: {
                        noWalletAccount: encryptedAccount,
                        virtualContract,
                        virtualContractId: virtualContractId
                    }
                },
                0,
                "Virtual Contract set!",
                "Erron while sending virtual contract",
                "Sending virtual contract...",
                "VaraBlocks action:"
            );
            
            dispatch(apiIsBusy(false));
            setAddressToReceiveMessages(decodeAddress(signlessAccountData.address));
            setVirtualContractAddress(virtualContractId);
            resolve();
        });
    }

    return (
        <>
            { signlessAccountModalOpen && <SignlessForm close={closeSignlessModal} onDataCollected={handleCreateVirtualContract} /> }
            <div className="varaeditor">
                <div className="varaeditor__edition-buttons">
                    <ul className="varaeditor__edition-options">
                        <li 
                            className={contractEditorOpen ? "varaeditor__edition-options--selected" : "varaeditor__edition-options--unselected"}
                            onClick={() => configEditionButtonsPressed(true, false, false, false)}
                        >
                            Contract editor
                        </li>
                        <li 
                            className={structsEditorOpen ? "varaeditor__edition-options--selected" : "varaeditor__edition-options--unselected"}
                            onClick={() => configEditionButtonsPressed(false, true, false, false)}
                        > 
                            Structs editor
                        </li>
                        <li 
                            className={enumsEditorOpen ? "varaeditor__edition-options--selected" : "varaeditor__edition-options--unselected"}
                            onClick={() => configEditionButtonsPressed(false, false, true, false)}
                        >
                            Enums editor
                        </li>
                        <li 
                            className={virtualContractDataOpen ? "varaeditor__edition-options--selected" : "varaeditor__edition-options--unselected"}
                            onClick={() => configEditionButtonsPressed(false, false, false, true)}
                        >
                            Metadata editor
                        </li>
                    </ul>
                    <Button 
                        size={"small"} 
                        textSize={"medium"} 
                        textWeight={"weight2"} 
                        width={"normal"} 
                        onClick={async () => {
                            if (!signlessData) {
                                console.log('Cuenta signless no esta puesta!!!');
                                
                                setSignlessAccountModalOpen(true);
                                return;
                            }

                            handleCreateVirtualContract(signlessData, noWalletAccountName ?? "");
                        }}
                        isLoading={
                            !apiIsReady || apiIsCurrentlyBusy || apiIsDisconnected
                        }
                    >
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
                                        className={initCodeEditionOpen ? "varaeditor__edition-options--selected" : "varaeditor__edition-options--unselected"}
                                        onClick={() => {configEditionBlocksButtonsPressed(true, false)}}
                                    >
                                        init blocks
                                    </li>
                                    <li
                                        className={handleCodeEditionOpen ? "varaeditor__edition-options--selected" : "varaeditor__edition-options--unselected"}
                                        onClick={() => {configEditionBlocksButtonsPressed(false, true)}}
                                    >
                                        handle blocks
                                    </li>
                                </ul>
                                <div className="varaeditor__contract-editor-logic__container">
                                    <ButtonActionsForBlocks 
                                        initCodeEditionOpen={initCodeEditionOpen}
                                        handleCodeEditionOpen={handleCodeEditionOpen}
                                        signlessAccountData={signlessData}
                                    />
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
                            <VirtualContractMetadataFields />
                            <VirtualContractMessageHandler 
                                accountToReceiveMessages={addressToReceiveMessages}
                                virtualContractId={virtualContractAddress}
                            />
                        </div>
                    }
                </div>
            </div>
        </>
    );
}
