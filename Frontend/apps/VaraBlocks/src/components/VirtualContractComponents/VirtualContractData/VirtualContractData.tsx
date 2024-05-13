import { ContractStruct, VirtualContractMetadata, MetadataTypes, VirtualContractStateType, ContractEnumInterface, SendReply, SendMessage } from '@/app/app_types/types';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { 
    modifyMetadata, 
    setVirtualContractState, 
    setBlocksOnInit, 
    setBlocksOnHandle,
    setBlocksTo,
    VaraBlockCodeBlock,
    modifyLoadMessageVariableEnumName
} from '@/app/SliceReducers';
import { 
    firstVariantFromEnumI ,
    separateInitAndHandleBlocks,
    formatStateType,
    formatMetadata,
    metadataHasOut,
    enumDataByName
} from '@/app/utils';
import { removeItem } from '@/components/DndLibrary/Tree/utilities';
import './VirtualContractData.scss';
import { TreeItems } from '@/components/DndLibrary/Tree/types';
import { useAlert } from '@gear-js/react-hooks';


// [TODO]: if the name of enum is changing, but not deleted, change variant, and not put 'NoValue'


export function VirtualContractData() {
    const initMetadata = useAppSelector((state) => state.VaraBlocksData.initMetadata);
    const handleMetadata = useAppSelector((state) => state.VaraBlocksData.handleMetadata);
    const sendMessageBlocks = useAppSelector((state) => state.VaraBlocksData.sendMessageBlocks);
    const sendReplyMessagesBlocks = useAppSelector((state) => state.VaraBlocksData.sendReplyBlocks);
    const loadMessagesBlocks = useAppSelector((state) => state.VaraBlocksData.loadMessagesBlocks);
    const initBlocks = useAppSelector((state) => state.VaraBlocksData.initBlocks);
    const handleBlocks = useAppSelector((state) => state.VaraBlocksData.handleBlocks);
    const virtualContractState = useAppSelector((state) => state.VaraBlocksData.state);
    const enums = useAppSelector((state) => state.VaraBlocksData.enums);
    const structs = useAppSelector((state) => state.VaraBlocksData.structs);
    const varaBlocksDispatch = useAppDispatch();
    const alert = useAlert();

    const changeMetadata = (metadata: [string, string], modifyInitMetadata: boolean) => {
        if (metadata[0] !== 'NoValue' && metadata[1] !== 'NoValue') {
            varaBlocksDispatch(modifyMetadata({
                metadataType: {
                    InOut: metadata,
                },
                modifyInitMetadata
            }));
        } else if (metadata[0] !== 'NoValue' && metadata[1] === 'NoValue') {
            varaBlocksDispatch(modifyMetadata({
                metadataType: {
                    In: [metadata[0]],
                },
                modifyInitMetadata
            }));
        } else if (metadata[0] === 'NoValue' && metadata[1] !== 'NoValue') {
            varaBlocksDispatch(modifyMetadata({
                metadataType: {
                    Out: [metadata[1]],
                },
                modifyInitMetadata
            }));
        } else {
            varaBlocksDispatch(modifyMetadata({
                metadataType: {
                    NoValue: null,
                },
                modifyInitMetadata
            }));
        }
    }

    return (
        <div className='virtual-contract-data'>
            <h2 className='virtual-contract-data__title'>Virtual Contract Metadata</h2>
            <div className='virtual-contract-data__information'>
                <p className='virtual-contract-data__title virtual-contract-data__title--subtitle'>
                    Metadata - Init
                </p>
                <div className='virtual-contract-data__metadata'>
                    <div>
                        <label htmlFor="inMetadataInit">In: </label>
                        <select 
                            name="inMetadataInit" 
                            id="inMetadataInit" 
                            className='virtual-contract-data__selection'
                            value={formatMetadata(initMetadata)[0]} 
                            onChange={(e) => {
                                if (e.target.value !== 'NoValue') {
                                    const enumData = enumDataByName(e.target.value, enums) as ContractEnumInterface;

                                    const selectedVariant = firstVariantFromEnumI(enumData);

                                    if (!selectedVariant) {
                                        alert.error(`Virtual contract enum '${e.target.value}' does not have valid variants!`);
                                        return;
                                    }
                                }

                                changeMetadata([e.target.value, formatMetadata(initMetadata)[1]], true);

                                const [initLoadMessageBlocks, handleLoadMessageBlocks] = separateInitAndHandleBlocks(loadMessagesBlocks, 'loadmessage');

                                if (e.target.value === 'NoValue') {
                                    console.log('YA NO TIENE VALOR EL IN EN INIT');
                                    let newInitBlocks = [...initBlocks];
                                    Object.keys(initLoadMessageBlocks).forEach((blockIdToRemove) => {
                                        newInitBlocks = removeItem(newInitBlocks, blockIdToRemove);
                                    });
                                    varaBlocksDispatch(setBlocksTo({blockType: 'loadmessage', blocks: handleLoadMessageBlocks}));
                                    varaBlocksDispatch(setBlocksOnInit(newInitBlocks));
                                } else {
                                    Object.keys(initLoadMessageBlocks).forEach((loadMessageBlockId) => {
                                        varaBlocksDispatch(modifyLoadMessageVariableEnumName({
                                            blockId: loadMessageBlockId,
                                            newEnumName: e.target.value
                                        }))
                                    });
                                }
                            }}
                        >
                            <option value="NoValue">NoValue</option>
                            {
                                Object.keys(enums).map((enumId) => {
                                    if (enums[enumId].enumName.trim() !== '') {
                                        return <option key={enumId} value={enums[enumId].enumName}>{enums[enumId].enumName}</option>
                                    }
                                    return null;
                                })
                            }
                        </select>
                    </div>
                    <div>
                        <label htmlFor="outMetadataInit">Out: </label>
                        <select 
                            name="outMetadataInit" 
                            id="outMetadataInit" 
                            className='virtual-contract-data__selection'
                            value={formatMetadata(initMetadata)[1]} 
                            onChange={(e) => {
                                let selectedVariant: string | null;
                                if (e.target.value !== 'NoValue') {
                                    const enumData = enumDataByName(e.target.value, enums) as ContractEnumInterface;

                                    selectedVariant = firstVariantFromEnumI(enumData);

                                    if (!selectedVariant) {
                                        alert.error(`Virtual contract enum '${e.target.value}' does not have valid variants!`);
                                        return;
                                    }
                                }
                                
                                changeMetadata([formatMetadata(initMetadata)[0], e.target.value], true);

                                const [initReplyMessageBlocks, handleReplyMessageBlocks] = separateInitAndHandleBlocks(sendReplyMessagesBlocks, 'replymessage');
                                const [initSendMessageBlocks, handleSendMessageBlocks] = separateInitAndHandleBlocks(sendMessageBlocks, 'sendmessage');

                                if (e.target.value === 'NoValue') {
                                    console.log('YA NO TIENE VALOR EL OUT EN INIT');
                                    
                                    let newInitBlocks = [...initBlocks];

                                    Object.keys(initReplyMessageBlocks).forEach((blockIdToRemove) => {
                                        newInitBlocks = removeItem(newInitBlocks, blockIdToRemove);
                                    });

                                    Object.keys(initSendMessageBlocks).forEach((blockIdToRemove) => {
                                        newInitBlocks = removeItem(newInitBlocks, blockIdToRemove);
                                    });

                                    varaBlocksDispatch(setBlocksTo({blockType: 'replymessage', blocks: handleReplyMessageBlocks}));
                                    varaBlocksDispatch(setBlocksTo({blockType: 'sendmessage', blocks: handleSendMessageBlocks}))
                                    varaBlocksDispatch(setBlocksOnInit(newInitBlocks));
                                } else {
                                    const updatedReplyMessageBlocks: VaraBlockCodeBlock = {};
                                    const updatedSendMessageBlocks: VaraBlockCodeBlock = {};

                                    Object.entries(initReplyMessageBlocks).forEach(([blockId, block]) => {
                                        const updatedBlock = JSON.parse(JSON.stringify(block)) as { SendReplyI: { data: SendReply, sendReplyInInit: boolean } };
                                        updatedBlock.SendReplyI.data.message.enumFrom = e.target.value;
                                        updatedBlock.SendReplyI.data.message.val = selectedVariant as string;
                                        updatedReplyMessageBlocks[blockId] = updatedBlock;
                                    });

                                    Object.entries(initSendMessageBlocks).forEach(([blockId, block]) => {
                                        const updatedBlock = JSON.parse(JSON.stringify(block)) as { SendMessageI: { data: SendMessage, sendMessageInInit: boolean } };
                                        updatedBlock.SendMessageI.data.message.enumFrom = e.target.value;
                                        updatedBlock.SendMessageI.data.message.val = selectedVariant as string;
                                        updatedSendMessageBlocks[blockId] = updatedBlock;
                                    });

                                    varaBlocksDispatch(setBlocksTo({blockType: 'replymessage', blocks: {
                                        ...updatedReplyMessageBlocks,
                                        ...handleReplyMessageBlocks
                                    }}));

                                    varaBlocksDispatch(setBlocksTo({blockType: 'sendmessage', blocks: {
                                        ...updatedSendMessageBlocks,
                                        ...handleSendMessageBlocks
                                    }}));
                                }
                            }}
                        >
                            <option value="NoValue">NoValue</option>
                            {
                                Object.keys(enums).map((enumId) => {
                                    if (enums[enumId].enumName.trim() !== '') {
                                        return <option key={enumId} value={enums[enumId].enumName}>{enums[enumId].enumName}</option>
                                    }
                                    return null;
                                })
                            }
                        </select>
                    </div>
                </div>
                <p className='virtual-contract-data__title virtual-contract-data__title--subtitle'>
                    Metadata - handle
                </p>
                <div className='virtual-contract-data__metadata'>
                    <div>
                        <label htmlFor="inMetadataHandle">In: </label>
                        <select 
                            name="inMetadataHandle" 
                            id="inMetadataHandle" 
                            className='virtual-contract-data__selection'
                            value={formatMetadata(handleMetadata)[0]} 
                            onChange={(e) => {
                                if (e.target.value !== 'NoValue') {
                                    const enumData = enumDataByName(e.target.value, enums) as ContractEnumInterface;

                                    const selectedVariant = firstVariantFromEnumI(enumData);

                                    if (!selectedVariant) {
                                        alert.error(`Virtual contract enum '${e.target.value}' does not have valid variants!`);
                                        return;
                                    }
                                }

                                changeMetadata([e.target.value, formatMetadata(handleMetadata)[1]], false);

                                const [initLoadMessageBlocks, handleLoadMessageBlocks] = separateInitAndHandleBlocks(loadMessagesBlocks, 'loadmessage');

                                if (e.target.value === 'NoValue') {
                                    console.log('YA NO TIENE VALOR EL In EN HANDLE');
                                    
                                    let newHandleBlocks = [...handleBlocks];
                                    
                                    Object.keys(handleLoadMessageBlocks).forEach((blockIdToRemove) => {
                                        newHandleBlocks = removeItem(newHandleBlocks, blockIdToRemove);
                                    });

                                    varaBlocksDispatch(setBlocksTo({blockType: 'loadmessage', blocks: initLoadMessageBlocks}));
                                    varaBlocksDispatch(setBlocksOnHandle(newHandleBlocks));
                                } else {
                                    Object.keys(handleLoadMessageBlocks).forEach((loadMessageBlockId) => {
                                        varaBlocksDispatch(modifyLoadMessageVariableEnumName({
                                            blockId: loadMessageBlockId,
                                            newEnumName: e.target.value
                                        }))
                                    });
                                }
                            }}
                        >
                            <option value="NoValue">NoValue</option>
                            {
                                Object.keys(enums).map((enumId) => {
                                    if (enums[enumId].enumName.trim() !== '') {
                                        return <option key={enumId} value={enums[enumId].enumName}>{enums[enumId].enumName}</option>
                                    }
                                    return null;
                                })
                            }
                        </select>
                    </div>
                    <div>
                        <label htmlFor="outMetadataHandle">Out: </label>
                        <select 
                            name="outMetadataHandle" 
                            id="outMetadataHandle" 
                            className='virtual-contract-data__selection'
                            value={formatMetadata(handleMetadata)[1]} 
                            onChange={(e) => {
                                let selectedVariant: string | null;
                                if (e.target.value !== 'NoValue') {
                                    const enumData = enumDataByName(e.target.value, enums) as ContractEnumInterface;

                                    selectedVariant = firstVariantFromEnumI(enumData);

                                    if (!selectedVariant) {
                                        alert.error(`Virtual contract enum '${e.target.value}' does not have valid variants!`);
                                        return;
                                    }
                                }
                                
                                changeMetadata([formatMetadata(handleMetadata)[0], e.target.value], false);

                                const [initReplyMessageBlocks, handleReplyMessageBlocks] = separateInitAndHandleBlocks(sendReplyMessagesBlocks, 'replymessage');
                                const [initSendMessageBlocks, handleSendMessageBlocks] = separateInitAndHandleBlocks(sendMessageBlocks, 'sendmessage');

                                if (e.target.value === 'NoValue') {
                                    console.log('YA NO TIENE VALOR EL OUT EN HANDLE');
                                    
                                    let newHandleBlocks = [...handleBlocks];

                                    Object.keys(handleReplyMessageBlocks).forEach((blockIdToRemove) => {
                                        newHandleBlocks = removeItem(newHandleBlocks, blockIdToRemove);
                                    });

                                    Object.keys(handleSendMessageBlocks).forEach((blockIdToRemove) => {
                                        newHandleBlocks = removeItem(newHandleBlocks, blockIdToRemove);
                                    });

                                    varaBlocksDispatch(setBlocksTo({blockType: 'replymessage', blocks: initReplyMessageBlocks}));
                                    varaBlocksDispatch(setBlocksTo({blockType: 'sendmessage', blocks: initSendMessageBlocks}));
                                    varaBlocksDispatch(setBlocksOnHandle(newHandleBlocks));
                                } else {
                                    const updatedReplyMessageBlocks: VaraBlockCodeBlock = {};
                                    const updatedSendMessageBlocks: VaraBlockCodeBlock = {};

                                    Object.entries(handleReplyMessageBlocks).forEach(([blockId, block]) => {
                                        const updatedBlock = JSON.parse(JSON.stringify(block)) as { SendReplyI: { data: SendReply, sendReplyInInit: boolean } };
                                        updatedBlock.SendReplyI.data.message.enumFrom = e.target.value;
                                        updatedBlock.SendReplyI.data.message.val = selectedVariant as string;
                                        updatedReplyMessageBlocks[blockId] = updatedBlock;
                                    });

                                    Object.entries(handleSendMessageBlocks).forEach(([blockId, block]) => {
                                        const updatedBlock = JSON.parse(JSON.stringify(block)) as { SendMessageI: { data: SendMessage, sendMessageInInit: boolean } };
                                        updatedBlock.SendMessageI.data.message.enumFrom = e.target.value;
                                        updatedBlock.SendMessageI.data.message.val = selectedVariant as string;
                                        updatedSendMessageBlocks[blockId] = updatedBlock;
                                    });

                                    varaBlocksDispatch(setBlocksTo({blockType: 'replymessage', blocks: {
                                        ...updatedReplyMessageBlocks,
                                        ...initReplyMessageBlocks
                                    }}));

                                    varaBlocksDispatch(setBlocksTo({blockType: 'sendmessage', blocks: {
                                        ...updatedSendMessageBlocks,
                                        ...initSendMessageBlocks
                                    }}));
                                }
                            }}
                        >
                            <option value="NoValue">NoValue</option>
                            {
                                Object.keys(enums).map((enumId) => {
                                    if (enums[enumId].enumName.trim() !== '') {
                                        return <option key={enumId} value={enums[enumId].enumName}>{enums[enumId].enumName}</option>
                                    }
                                    return null;
                                })
                            }
                        </select>
                    </div>
                </div>
                
                <div 
                    className='virtual-contract-data__state'
                >
                    <label 
                        className='virtual-contract-data__title virtual-contract-data__title--subtitle'
                        htmlFor="virtualcontract-state-data"
                    >
                        State:
                    </label>
                    <select 
                        name="virtualcontract-state-data" 
                        id="virtualcontract-state-data"
                        className='virtual-contract-data__selection'
                        value={formatStateType(virtualContractState)}
                        onChange={(e) => {
                            console.log(`Seleccionado: ${e.target.value}`);
                            varaBlocksDispatch(setVirtualContractState([e.target.value, null]));
                        }}
                    >
                        <option value="NoState">No state</option>
                        {
                            Object.keys(structs).map((structId) => {
                                if (structs[structId].structName.trim() !== '') {
                                    return <option key={structId} value={structs[structId].structName}>{structs[structId].structName}</option>
                                }

                                return null;
                            })
                        }
                    </select>
                </div>


                {/* {metadataToString(virtualContractData.virtualContractMetadata?.handle ?? { NoValue: null })} */}

                {/* <p className='virtual-contract-data__title virtual-contract-data__title--subtitle'>
                    State: {
                        virtualContractData.virtualContractState
                        ? virtualContractData.virtualContractState.structName
                        : "No state"
                    }
                </p>
                {
                    virtualContractData.virtualContractState &&
                    <div>
                            <p style={{textAlign: "center"}}>
                                {
                                    virtualContractData.virtualContractState.structName
                                }
                            </p>
                            {
                                virtualContractData.virtualContractState.attributes.map((attribute) => {
                                    return (
                                        <p key={attribute.attributeName}>
                                            {attribute.attributeName}
                                            {attribute.attributeType}
                                            {attribute.attributeVal}
                                        </p>
                                    );
                                })
                            }
                        </div>
                } */}
            </div>

            {/* {
                accountHasVirtualContract ? (
                    
                ) : (
                    <div className='virtual-contract-data__no-state'>
                        <p>
                            No Virtual Contract
                        </p>
                    </div>
                )
            } */}
        </div>
    )
}
