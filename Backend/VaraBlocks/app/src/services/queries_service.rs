use sails_rtl::{
    gstd::gservice,
    prelude::*
};

use crate::{
    state_globals_variables::{
        signless_accounts::contract_signless_account_state_ref,
        virtual_contracts::virtual_contracts_state_ref
    },
    varablocks_files::{
        contracts_io_types::ContractStateReply, 
        virtual_contract_format::VirtualContractData,
        virtual_contract_struct::ContractStructFormat
    }
};

#[derive(Default)]
pub struct QueriesService;

#[gservice]
impl QueriesService {
    pub fn new() -> Self {
        Self
    }

    pub fn last_virtual_contract_saved_from_address(&self, address: ActorId) -> ContractStateReply {
        let virtual_contracts_state = virtual_contracts_state_ref();

        let Some(virtual_contracts_ids) = virtual_contracts_state
            .virtual_contracts_by_actor_id
            .get(&address) else {
            return ContractStateReply::UserIsNotRegistered;
        };

        let Some(virtual_contract_id) = virtual_contracts_ids.last() else {
            return ContractStateReply::LastVirtualContractFromUser(None);
        };

        let virtual_contract = virtual_contracts_state
            .virtual_contracts
            .get(virtual_contract_id)
            .unwrap();

        ContractStateReply::LastVirtualContractFromUser(Some(virtual_contract.into()))
    }

    pub fn last_virtual_contract_saved_from_no_wallet_account(&self, no_wallet_account: String) -> ContractStateReply {
        let virtual_contracts_state = virtual_contracts_state_ref();

        let Some(virtual_contracts_ids) = virtual_contracts_state
            .virtual_contracts_by_no_wallet_account
            .get(&no_wallet_account) else {
                return ContractStateReply::UserIsNotRegistered;
            };

        let Some(virtual_contract_id) = virtual_contracts_ids.last() else {
            return ContractStateReply::LastVirtualContractFromUser(None);
        };

        let virtual_contract = virtual_contracts_state
            .virtual_contracts
            .get(virtual_contract_id)
            .unwrap();

        ContractStateReply::LastVirtualContractFromUser(Some(virtual_contract.into()))
    }

    pub fn all_virtual_contracts_data_from_address(&self, address: ActorId) -> ContractStateReply {
        let virtual_contracts_state = virtual_contracts_state_ref();

        let Some(virtual_contracts_ids) = virtual_contracts_state
            .virtual_contracts_by_actor_id
            .get(&address) else {
            return ContractStateReply::UserIsNotRegistered;
        };

        let mut virtual_contracts: Vec<VirtualContractData> = vec![];

        for virtual_contract_id in virtual_contracts_ids.iter() {
            if let Some(virtual_contract_data) = virtual_contracts_state.virtual_contracts.get(virtual_contract_id) {
                virtual_contracts.push(virtual_contract_data.into());   
            }
        }

        ContractStateReply::AllVirtualContractsDataFromUser(virtual_contracts)
    }

    pub fn all_virtual_contracts_data_from_no_wallet_account(&self, no_wallet_account: String) -> ContractStateReply {
        let virtual_contracts_state = virtual_contracts_state_ref();

        let Some(virtual_contracts_ids) = virtual_contracts_state
            .virtual_contracts_by_no_wallet_account
            .get(&no_wallet_account) else {
                return ContractStateReply::UserIsNotRegistered;
            };

        let mut virtual_contracts: Vec<VirtualContractData> = vec![];

        for virtual_contract_id in virtual_contracts_ids.iter() {
            if let Some(virtual_contract_data) = virtual_contracts_state.virtual_contracts.get(virtual_contract_id) {
                virtual_contracts.push(virtual_contract_data.into());   
            }
        }

        ContractStateReply::AllVirtualContractsDataFromUser(virtual_contracts)
    }

    pub fn virtual_contract_from_id(&self, virtual_contract_id: String) -> ContractStateReply {
        let virtual_contracts_state = virtual_contracts_state_ref();

        if !virtual_contracts_state.virtual_contracts.contains_key(&virtual_contract_id) {
            return ContractStateReply::VirtualContractIdDoesNotExists(virtual_contract_id);
        }

        let virtual_contract = virtual_contracts_state.virtual_contracts
            .get(&virtual_contract_id)
            .unwrap();

        ContractStateReply::VirtualContract(virtual_contract.into())
    }

    pub fn virtual_contract_data_from_id(&self, virtual_contract_id: String) -> ContractStateReply {
        let virtual_contracts_state = virtual_contracts_state_ref();

        if !virtual_contracts_state.virtual_contracts.contains_key(&virtual_contract_id) {
            return ContractStateReply::VirtualContractIdDoesNotExists(virtual_contract_id);
        }

        let virtual_contract = virtual_contracts_state.virtual_contracts
            .get(&virtual_contract_id)
            .unwrap();
    
        ContractStateReply::VirtualContractData(virtual_contract.into())
    }

    pub fn virtual_contract_metadata_from_id(&self, virtual_contract_id: String) -> ContractStateReply {
        let virtual_contracts_state = virtual_contracts_state_ref();

        if !virtual_contracts_state.virtual_contracts.contains_key(&virtual_contract_id) {
            return ContractStateReply::VirtualContractIdDoesNotExists(virtual_contract_id);
        }

        let virtual_contract = virtual_contracts_state.virtual_contracts
            .get(&virtual_contract_id)
            .unwrap();

        ContractStateReply::VirtualContractMetadata(virtual_contract.metadata.clone())
    }

    pub fn virtual_contract_state_from_id(&self, virtual_contract_id: String) -> ContractStateReply {
        let virtual_contracts_state = virtual_contracts_state_ref();

        if !virtual_contracts_state.virtual_contracts.contains_key(&virtual_contract_id) {
            return ContractStateReply::VirtualContractIdDoesNotExists(virtual_contract_id);
        }

        let virtual_contract = virtual_contracts_state.virtual_contracts
            .get(&virtual_contract_id)
            .unwrap();

        let contract_state: Option<ContractStructFormat> = match &virtual_contract.state {
            Some(state_data) => {
                let (_, state) = state_data;
                if let Some(contract_struct) = state {
                    Some(contract_struct.into())
                } else {
                    None
                }
            },
            None => None
        };

        ContractStateReply::VirtualContractState(contract_state)
    }

    pub fn messages_from_virtual_contract(&self, address: ActorId) -> ContractStateReply {
        let virtual_contracts_state = virtual_contracts_state_ref();

        let messages = virtual_contracts_state
            .messages_of_virtual_contracts
            .get(&address);

        let to_send = match messages {
            Some(messages) => {
                messages.clone()
            },
            _ => vec![]
        };

        ContractStateReply::MessagesFromVirtualContract(to_send)
    }

    pub fn signless_account_address_for_address(&self, user_address: ActorId) -> ContractStateReply {
        let signless_state = contract_signless_account_state_ref();

        let signless_address = signless_state
            .signless_accounts_by_actor_id
            .get(&user_address);

        ContractStateReply::SignlessAccountAddressForAddress(signless_address.copied())
    }

    pub fn signless_account_address_for_no_wallet_account(&self, no_wallet_account: String) -> ContractStateReply {
        let signless_state = contract_signless_account_state_ref();

        let signless_address = signless_state
            .signless_accounts_by_no_wallet_account
            .get(&no_wallet_account);

        ContractStateReply::SignlessAccountAddressForNoWalletAccount(signless_address.copied())
    }

    pub fn signless_account_data(&self, signless_address: ActorId) -> ContractStateReply {
        let signless_state = contract_signless_account_state_ref();

        let signless_data = signless_state
            .signless_accounts
            .get(&signless_address);

        ContractStateReply::SignlessAccountData(signless_data.cloned())
    }

}