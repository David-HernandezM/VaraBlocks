import { useEffect, useState } from "react";
import { VirtualContractEnum, VirtualContractStruct, VirtualContractData } from "@/components";
import { generatePassword } from "@/app/utils"; 
import { useAppDispatch, useAppSelector, useContractUtils } from "@/app/hooks";
import { 
    addEnumToContract, 
    addStructToContract,
    setBlocksOnInit,
    setBlocksOnHandle,
    addBlockToHandle,
    addBlockToInit
} from "@/app/SliceReducers";
import { ContractStruct, VirtualContractMetadata } from '@/app/app_types/types';
import { Button } from "@/components/ui/button";
import { TreeItems } from "@/components/DndLibrary/Tree/types";
import { SortableTree } from "@/components/DndLibrary";
import { useAccount } from "@gear-js/react-hooks";
import "./VaraEditor.scss";
import { MAIN_CONTRACT } from "@/app/consts";


export default function VaraEditor() {
    const account = useAccount()
    const initBlocks = useAppSelector((state) => state.VaraBlocksData.initBlocks);
    const handleBlocks = useAppSelector((state) => state.VaraBlocksData.handleBlocks);
    const enumsData = useAppSelector((state) => state.VaraBlocksData.enums);
    const structsData = useAppSelector((state) => state.VaraBlocksData.structs);
    const dispatch = useAppDispatch();
    const [structsEditorOpen, setStructsEditorOpen] = useState(false);
    const [enumsEditorOpen, setEnumsEditorOpen] = useState(false);
    const [contractEditorOpen, setContractEditorOpen] = useState(true);
    const [initCodeEditionOpen, setInitCodeEditionOpen] = useState(true);
    const [handleCodeEditionOpen, setHandleCodeEditionOpen] = useState(false);
    const [accountHasVirtualContract, setAccountHasVirtualContract] = useState(false);
    const [virtualContractState, setVirtualContractState] = useState<ContractStruct | null>(null);
    const [virtualContractMetadata, setVirtualContractMetadata] = useState<VirtualContractMetadata>();
    const {
        readState
    } = useContractUtils();

    const configEditionButtonsPressed = (btn1: boolean, btn2: boolean, btn3: boolean) => {
        setContractEditorOpen(btn1);
        setStructsEditorOpen(btn2);
        setEnumsEditorOpen(btn3);
    }

    const configEditionBlocksButtonsPressed = (initButton: boolean, handleButton: boolean) => {
        setInitCodeEditionOpen(initButton);
        setHandleCodeEditionOpen(handleButton);
    }

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
    

    return (
        <div className="varaeditor">
            <ul className="varaeditor__edition-options">
                <li 
                    className={contractEditorOpen ? "varaeditor__edition-options--selected" : ""}
                    onClick={() => configEditionButtonsPressed(true, false, false)}
                >
                    Contract editor
                </li>
                <li 
                    className={structsEditorOpen ? "varaeditor__edition-options--selected" : ""}
                    onClick={() => configEditionButtonsPressed(false, true, false)}
                > 
                    Structs editor
                </li>
                <li 
                    className={enumsEditorOpen ? "varaeditor__edition-options--selected" : ""}
                    onClick={() => configEditionButtonsPressed(false, false, true)}
                >
                    Enums editor
                </li>
            </ul>
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
                                        console.log("Agregar variable");
                                    }}>
                                        Load message
                                    </Button>
                                    <Button size={"small"} textSize={"medium"} textWeight={"weight2"} rounded={"rounded4"} width={"normal"} onClick={() => {
                                        console.log("Agregar variable");
                                    }}>
                                        Send Message
                                    </Button>
                                    <Button size={"small"} textSize={"medium"} textWeight={"weight2"} rounded={"rounded4"} width={"normal"} onClick={() => {
                                        console.log("Agregar variable");
                                    }}>
                                        Send Reply
                                    </Button>
                                    <Button size={"small"} textSize={"medium"} textWeight={"weight2"} rounded={"rounded4"} width={"normal"} onClick={() => {
                                        console.log("Agregar variable");
                                    }}>
                                        Change state
                                    </Button>
                                    <Button size={"small"} textSize={"medium"} textWeight={"weight2"} rounded={"rounded4"} width={"normal"} onClick={() => {
                                        console.log("Agregar variable");
                                    }}>
                                        Add variable
                                    </Button>
                                    <Button size={"small"} textSize={"medium"} textWeight={"weight2"} rounded={"rounded4"} width={"normal"} onClick={() => {
                                        console.log("Agregar variable");
                                    }}>
                                        Add match
                                    </Button>
                                    <button onClick={() => {
                                        dispatch(addBlockToInit({
                                            id: generatePassword(),
                                            blockType: 'variable',
                                            children: [],
                                        }))
                                        dispatch(addBlockToHandle({
                                            id: generatePassword(),
                                            blockType: 'variable',
                                            children: [],
                                        }))
                                    }}>
                                        set blocks on both
                                    </button>
                                </div>
                                {
                                    initCodeEditionOpen && <div className="varaeditor__contract-editor-logic--sketch">
                                        <div>
                                            <SortableTree setBlocks={setBlocksOnHandle} varaBlocksState={handleBlocks} />
                                        </div>
                                    </div>
                                }
                                {
                                    handleCodeEditionOpen && <div className="varaeditor__contract-editor-logic--sketch">
                                        <div>
                                            <SortableTree setBlocks={setBlocksOnInit} varaBlocksState={initBlocks} />
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                        <div className="varaeditor__contract-editor-data">
                            <VirtualContractData 
                                accountHasVirtualContract={accountHasVirtualContract} 
                                virtualContractData={{
                                    virtualContractState,
                                    virtualContractMetadata
                                }}
                            />
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
            </div>
        </div>
    );
}