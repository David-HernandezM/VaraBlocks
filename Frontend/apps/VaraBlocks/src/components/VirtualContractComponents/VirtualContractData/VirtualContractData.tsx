import { useEffect, useState } from 'react';
import { useContractUtils } from '@/app/hooks';
import { MAIN_CONTRACT } from '@/app/consts';
import { useAccount } from '@gear-js/react-hooks';
import { ContractStruct, VirtualContractMetadata, MetadataTypes } from '@/app/app_types/types';
import './VirtualContractData.scss';


interface VirtualContractDataProps {
    accountHasVirtualContract: boolean,
    virtualContractData: {
        virtualContractMetadata: VirtualContractMetadata | undefined,
        virtualContractState: ContractStruct | null
    },
}

export function VirtualContractData({ 
    accountHasVirtualContract, 
    virtualContractData 
}: VirtualContractDataProps) {
    const metadataToString = (contractMetadata: any) => {
        const typesString = Object.keys(contractMetadata)[0];

        console.log(virtualContractData.virtualContractState);
        

        switch (typesString) {
            case 'in':
                return (
                    <>
                        <div className='virtual-contract-data__metadata'>
                            <p>In: {contractMetadata.in}</p>
                            <p>Out: No value</p>
                        </div>
                    </>
                );
            case 'out':
                return (
                    <>
                        <div className='virtual-contract-data__metadata'>
                            <p>In: No value</p>
                            <p>Out: {contractMetadata.out}</p>
                        </div>
                    </>
                );
            case 'inOut':
                return (
                    <>
                        <div className='virtual-contract-data__metadata'>
                            <p>In: {contractMetadata.inOut[0]}</p>
                            <p>Out: {contractMetadata.inOut[1]}</p>
                        </div>
                    </>
                );
            default:
                return (
                    <>
                        <div className='virtual-contract-data__metadata'>
                            <p>In: No value</p>
                            <p>Out: No value</p>
                        </div>
                    </>
                );
        }
    };

    const stateFormat = (virtualContractState: any) => {
        console.log(virtualContractState);
        return 'hola';
        
    };

    return (
        <div className='virtual-contract-data'>
            <h2 className='virtual-contract-data__title'>Virtual Contract Data</h2>
            {
                accountHasVirtualContract ? (
                    <div className='virtual-contract-data__information'>
                        <p className='virtual-contract-data__title'>
                            Metadata - Init
                        </p>
                        {metadataToString(virtualContractData.virtualContractMetadata?.init ?? { NoValue: null })}
                        <p className='virtual-contract-data__title'>
                            Metadata - handle
                        </p>
                        {metadataToString(virtualContractData.virtualContractMetadata?.handle ?? { NoValue: null })}
                        <p className='virtual-contract-data__title'>
                            State
                        </p>
                        {
                            virtualContractData.virtualContractState ? (
                                <p>
                                    Account has state
                                </p>
                            ) : (
                                <p>
                                    Account does not has state
                                </p>
                            )
                        }
                    </div>
                ) : (
                    <div className='virtual-contract-data__no-state'>
                        <p>
                            No Virtual Contract
                        </p>
                    </div>
                )
            }
        </div>
    )
}
