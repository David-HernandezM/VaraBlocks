#![no_std]

use sails_rtl::{
    gstd::{
        gprogram,
        groute
    },
    prelude::*,
    collections::BTreeMap,
    gstd::msg
};

pub mod state_globals_variables;
pub mod varablocks_files;
pub mod services;

use state_globals_variables::{
    contract_general_data::{
        CONTRACT_GENERAL_DATA,
        ContractGeneralData
    },
    virtual_contracts::{
        VIRTUAL_CONTRACTS,
        VirtualContractsState
    },
    signless_accounts::{
        CONTRACT_SIGNLESS_ACCOUNTS,
        ContractSignlessAccounts
    }
};

use services::{
    contract_general_data_service::ContractGeneralDataService,
    virtual_contract_service::VirtualContractService,
    signless_service::SignlessService,
    queries_service::QueriesService
};

#[derive(Default)]
pub struct VaraBlocksProgram;

#[gprogram]
impl VaraBlocksProgram {
    pub fn new() -> Self {
        unsafe {
            CONTRACT_GENERAL_DATA = Some(
                ContractGeneralData {
                    owner: msg::source().into()
                }
            );
            VIRTUAL_CONTRACTS = Some(
                VirtualContractsState {
                    virtual_contracts_by_no_wallet_account: BTreeMap::new(),
                    virtual_contracts_by_actor_id: BTreeMap::new(),
                    virtual_contracts: BTreeMap::new(),
                    messages_of_virtual_contracts: BTreeMap::new()
                }
            );
            CONTRACT_SIGNLESS_ACCOUNTS = Some(
                ContractSignlessAccounts {
                    signless_accounts_by_no_wallet_account: BTreeMap::new(),
                    signless_accounts_by_actor_id: BTreeMap::new(),
                    signless_accounts: BTreeMap::new()
                }
            )
        }
        Self        
    }

    #[groute("VirtualContracts")] 
    pub fn virtual_contracts_svc(&self) -> VirtualContractService {
        VirtualContractService::new()
    }

    #[groute("Signless")] 
    pub fn signless_svc(&self) -> SignlessService {
        SignlessService::new()
    }

    #[groute("Query")] 
    pub fn queries_svc(&self) -> QueriesService {
        QueriesService::new()
    }
}
