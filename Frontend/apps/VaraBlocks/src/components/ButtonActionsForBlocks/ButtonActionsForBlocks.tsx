import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
    metadataHasIn, 
    metadataHasOut,
    enumDataByName, 
    firstVariantFromEnumI,
    generatePassword
} from "@/app/utils";
import { 
    ContractEnumInterface, 
    CodeBlock,
    EnumVal,
    Variable
} from '@/app/app_types/types';
import { useSignlessUtils, useContractUtils } from "@/app/hooks";
import { useAccount, useAlert } from "@gear-js/react-hooks";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { addBlock,  } from "@/app/SliceReducers";
import { TreeItem } from "@/components/DndLibrary/Tree/types";
import { KeyringPair } from '@polkadot/keyring/types';
import { MAIN_CONTRACT } from "@/app/consts";

import './ButtonActionsForBlocks.scss';

interface Props {
    initCodeEditionOpen: boolean,
    handleCodeEditionOpen: boolean,
    signlessAccountData: KeyringPair | null
}

export const ButtonActionsForBlocks = ({ initCodeEditionOpen, handleCodeEditionOpen, signlessAccountData }: Props) => {
    const initMetadata = useAppSelector((state) => state.VaraBlocksData.initMetadata);
    const handleMetadata = useAppSelector((state) => state.VaraBlocksData.handleMetadata);
    const enumsData = useAppSelector((state) => state.VaraBlocksData.enums);
    const loadMessageBlocks = useAppSelector((state) => state.VaraBlocksData.loadMessagesBlocks);
    const variableBlocks = useAppSelector((state) => state.VaraBlocksData.variablesBlocks);
    const {
        
    } = useSignlessUtils();
    const { sendMessage } = useContractUtils();
    const account = useAccount();
    const alert = useAlert();
    const dispatch = useAppDispatch();

    return (
        <div className="buttons-actions-for-blocks">
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
                // console.log("Checando state");
                // console.log('Load Message Block');
                // console.log(loadMessageBlocks);
                // console.log('Send message block');
                // console.log(sendMessagesBlocks);
                // console.log('Send reply message block');
                // console.log(replymessageBlocks);
                // console.log('Match blocks');
                // console.log(matchBlocks);
                // console.log('Init blocks');
                // console.log(initBlocks);
                // console.log('Handle Blocks');
                // console.log(handleBlocks);




                createAndSaveAccountNewPair(
                    "123123"
                );

                // saveAccountPairToLocalStorage(undefined);


                // const x = signlessActualAccountFromLocalStorage();

                // if (!x && x !== undefined) {
                //     console.log(x);
                //     deleteSignlessAcctountFromLocalStorage();
                //     console.log('Signless acctount deleted!');
                // } else {
                //     console.log('Cuenta no tiene signles account!!');
                //     console.log(signlessAccountsFromLocalStorage());
                // }
            }}>
                Check state
            </Button>  */}
            {/* <Button size={"small"} textSize={"medium"} textWeight={"weight2"} rounded={"rounded4"} width={"normal"} onClick={async () => {
                console.log('Signless account stored on page:');
                console.log(signlessAccountData);

                console.log('CUENTA signless de contrato:');
                await signlessDataFromContract();

                const signlessActualAccount = signlessActualAccountFromLocalStorage();
                console.log(signlessActualAccount);

                console.log(unlockActualPair("123123"));
                
                console.log('');
                
            }}>
                Info
            </Button> */}
            {/* <Button size={"small"} textSize={"medium"} textWeight={"weight2"} rounded={"rounded4"} width={"normal"} onClick={() => {
                setSignlessAccountData(null);
                console.log("DELETED!!!");
            }}>
                delete signless account from page
            </Button> */}
            {/* <Button size={"small"} textSize={"medium"} textWeight={"weight2"} rounded={"rounded4"} width={"normal"} onClick={ async () => {
                localStorage.setItem("signless", "{}");

                if (!account.account) {
                    console.log("Account not ready");
                    return;
                }

                await sendMessage(
                    account.account.decodedAddress,
                    account.account.meta.source,
                    MAIN_CONTRACT.programId,
                    MAIN_CONTRACT.programMetadata,
                    {
                        DeleteAllSignlessAccounts: null
                    },
                    0,
                    "All signless accounts deleted!",
                    "Erron while deleting all signless",
                    "Deleting all signless account",
                    "VaraBlocks:"
                );

                console.log('SE BORRARON TODAS LAS CUENTAS SIGNLESS!');
                
            }}>
                delete signless in local storage.
            </Button> */}
        </div>
    )
}

