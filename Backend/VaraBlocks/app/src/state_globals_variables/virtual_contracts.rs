use sails_rtl::{
    prelude::*,
    collections::BTreeMap,
    ActorId
};

use crate::{
    state_globals_variables::signless_accounts::NoWalletSessionId, varablocks_files::{
        contract_types::MessageFromVirtualContract, 
        contracts_io_types::ContractEvent, 
        virtual_contract_utils::VirtualContract
    }
};

pub type VirtualContractId = String;


pub static mut VIRTUAL_CONTRACTS: Option<VirtualContractsState> = None;

pub struct VirtualContractsState {
    pub virtual_contracts_by_actor_id: BTreeMap<ActorId, Vec<VirtualContractId>>,
    pub virtual_contracts_by_no_wallet_account: BTreeMap<NoWalletSessionId, Vec<VirtualContractId>>,
    pub virtual_contracts: BTreeMap<VirtualContractId, VirtualContract>,
    pub messages_of_virtual_contracts: BTreeMap<ActorId, Vec<MessageFromVirtualContract>>
}

impl VirtualContractsState {
    pub fn add_vc_to_address(&mut self, address: ActorId, virtual_contract_id: VirtualContractId, virtual_contract: VirtualContract) -> Result<(), ContractEvent> {
        self.virtual_contracts_by_actor_id
                .entry(address)
                .and_modify(|virtual_contracts_id| virtual_contracts_id.push(virtual_contract_id.clone()))
                .or_insert(vec![virtual_contract_id.clone()]);

        self.virtual_contracts
            .insert(virtual_contract_id, virtual_contract);

        Ok(())
    }

    pub fn modify_virtual_contract_for_address(&mut self, address: ActorId, virtual_contract_id: VirtualContractId, virtual_contract: VirtualContract) -> Result<(), ContractEvent> {
        let address_virtual_contract_ids =  match self.virtual_contracts_by_actor_id.get(&address) {
            Some(virtula_contracts_ids) => {
                let has_virtual_contract_id = virtula_contracts_ids
                    .iter()
                    .find(|&current_virtual_contract_id| *current_virtual_contract_id == virtual_contract_id);

                let Some(actual_virtual_contract_id) = has_virtual_contract_id else {
                    return Err(ContractEvent::VirtualContractIdDoesNotExists(virtual_contract_id));
                };

                actual_virtual_contract_id.clone()
            },
            None => {
                if let Err(error_message) = self.add_vc_to_address(address, virtual_contract_id, virtual_contract) {
                    return Err(error_message);
                }
                return Ok(());
            }
        };

        self.virtual_contracts
            .entry(address_virtual_contract_ids)
            .and_modify(|current_virtual_contract| *current_virtual_contract = virtual_contract);

        Ok(())
    }

    pub fn add_vc_to_no_wallet_account(&mut self, no_wallet_account: String, virtual_contract_id: VirtualContractId, virtual_contract: VirtualContract) -> Result<(), ContractEvent> {
        self.virtual_contracts_by_no_wallet_account
            .entry(no_wallet_account)
            .and_modify(|virtual_contracts_id| virtual_contracts_id.push(virtual_contract_id.clone()))
            .or_insert(vec![virtual_contract_id.clone()]);

        self.virtual_contracts
            .insert(virtual_contract_id, virtual_contract);

        Ok(())
    }

    pub fn modify_virtual_contract_for_no_wallet_account(&mut self, no_wallet_account: String, virtual_contract_id: VirtualContractId, virtual_contract: VirtualContract) -> Result<(), ContractEvent> {
        let no_wallet_virtual_contract_id = match self.virtual_contracts_by_no_wallet_account.get(&no_wallet_account) {
            Some(virtual_contracts_id) => {
                let has_virtual_contract_id = virtual_contracts_id
                    .iter()
                    .find(|&current_virtual_contract_id| *current_virtual_contract_id == virtual_contract_id);

                let Some(actual_virtual_contract_id) = has_virtual_contract_id else {
                    return Err(ContractEvent::VirtualContractIdDoesNotExists(virtual_contract_id));
                };

                actual_virtual_contract_id.clone()
            },
            None => {
                if let Err(error_message) = self.add_vc_to_no_wallet_account(no_wallet_account.clone(), virtual_contract_id.clone(), virtual_contract) {
                    return Err(error_message);
                }
                
                return Ok(());
            }
        };

        self.virtual_contracts
            .entry(no_wallet_virtual_contract_id)
            .and_modify(|current_virtual_contract| *current_virtual_contract = virtual_contract);

        Ok(())
    }


    pub fn virtual_contract_exists_for_address(&self, address: ActorId, virtual_contract_id: VirtualContractId) -> Result<(), ContractEvent> {
        match self.virtual_contracts_by_actor_id.get(&address) {
            Some(virtual_contracts_ids) => {
                let has_virtual_contract_id = virtual_contracts_ids
                    .iter()
                    .find(|&actual_virtual_contract_id| *actual_virtual_contract_id == virtual_contract_id);

                let Some(actual_virtual_contract_id) = has_virtual_contract_id else {
                    return Err(
                        ContractEvent::AddressDoesNotHasVirtualContractId {
                            address,
                            virtual_contract_id
                        }
                    );
                };

                match self.virtual_contracts.get(actual_virtual_contract_id) {
                    Some(_) => {
                        Ok(())
                    },
                    None => {
                        Err(
                            ContractEvent::VirtualContractIdDoesNotExists(
                                virtual_contract_id
                            )
                        )
                    }
                }
            },
            None => Err(ContractEvent::AccountAddressIsNotRegistered(address))
        }
    }

    pub fn virtual_contract_exists_for_no_wallet_account(&self, no_wallet_account: String, virtual_contract_id: VirtualContractId) -> Result<(), ContractEvent> {
        match self.virtual_contracts_by_no_wallet_account.get(&no_wallet_account) {
            Some(virtual_contracts_ids) => {
                let has_virtual_contract_id = virtual_contracts_ids
                    .iter()
                    .find(|&actual_virtual_contract_id| *actual_virtual_contract_id == virtual_contract_id);

                let Some(actual_virtual_contract_id) = has_virtual_contract_id else {
                    return Err(
                        ContractEvent::NoWalletAccountDoesNotHasVirtualContractId {
                            no_wallet_account,
                            virtual_contract_id
                        }
                    );
                };

                match self.virtual_contracts.get(actual_virtual_contract_id) {
                    Some(_) => {
                        Ok(())
                    },
                    None => {
                        Err(
                            ContractEvent::VirtualContractIdDoesNotExists(
                                virtual_contract_id
                            )
                        )
                    }
                }
            },
            None => Err(ContractEvent::NoWalletAccountIsNotRegister)
        }
    }
    
}

pub fn virtual_contracts_state_mut() -> &'static mut VirtualContractsState {
    let state = unsafe { VIRTUAL_CONTRACTS.as_mut() };
    debug_assert!(state.is_some(), "State isn't initialized");
    unsafe { state.unwrap_unchecked() }
}

pub fn virtual_contracts_state_ref() -> &'static VirtualContractsState {
    let state = unsafe { VIRTUAL_CONTRACTS.as_ref() };
    debug_assert!(state.is_some(), "State isn't initialized");
    unsafe { state.unwrap_unchecked() }
}