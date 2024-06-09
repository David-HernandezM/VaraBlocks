use gstd::{
    prelude::*,
    ActorId,
    msg,
    collections::BTreeMap
};
use super::{
    VirtualContract,
    SignlessAccount,
    MessageFromVirtualContract,
    VirtualContractId,
    ReservationId,
    NoWalletSessionId,
    ContractEvent
};

#[derive(Default)]
pub struct ContractState {
    pub owner: ActorId,
    pub virtual_contracts_by_actor_id: BTreeMap<ActorId, Vec<VirtualContractId>>,
    pub virtual_contracts_by_no_wallet_account: BTreeMap<NoWalletSessionId, Vec<VirtualContractId>>,
    pub virtual_contracts: BTreeMap<VirtualContractId, VirtualContract>,

    pub signless_accounts_by_actor_id: BTreeMap<ActorId, ActorId>,
    pub signless_accounts_by_no_wallet_account: BTreeMap<String, ActorId>,
    pub signless_accounts: BTreeMap<ActorId, SignlessAccount>,


    pub messages_of_virtual_contracts: BTreeMap<ActorId, Vec<MessageFromVirtualContract>>,

    pub reservations: Vec<ReservationId>
}

impl ContractState {
    pub fn add_vc_to_address(&mut self, address: ActorId, virtual_contract_id: VirtualContractId, virtual_contract: VirtualContract) -> Result<(), ContractEvent> {
        // if !self.virtual_contracts_by_actor_id.contains_key(&address) {
        //     return Err(ContractEvent::AccountAddressIsNotRegistered(address));
        // }

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
        // if !self.virtual_contracts_by_no_wallet_account.contains_key(&no_wallet_account) {
        //     return Err(ContractEvent::NoWalletAccountIsNotRegister);
        // }

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

    pub fn set_signless_account_to_address(&mut self, user_address: ActorId, signless_account: SignlessAccount) {
        let caller = msg::source();

        self.add_signless_account(caller, signless_account);
    
        self.signless_accounts_by_actor_id
            .entry(user_address)
            .and_modify(|current_signless_address| *current_signless_address = caller)
            .or_insert(caller);

        
    }

    pub fn set_signless_account_to_no_wallet_account(&mut self, no_wallet_account: String, signless_account: SignlessAccount) {
        let caller = msg::source();

        self.add_signless_account(caller, signless_account);

        self.signless_accounts_by_no_wallet_account
            .entry(no_wallet_account)
            .and_modify(|current_signless_address| *current_signless_address = caller)
            .or_insert(caller);

    }

    fn add_signless_account(&mut self, signless_address: ActorId, signless_account: SignlessAccount) {
        self.signless_accounts
            .entry(signless_address)
            .and_modify(|current_signless_account| *current_signless_account = signless_account.clone())
            .or_insert(signless_account);
    }

    pub fn get_user_address(&self, user_address: Option<ActorId>) -> Result<ActorId, ContractEvent> {
        let caller = msg::source();

        let address = match user_address {
            Some(address) => {
                let signless_account = self
                    .signless_accounts_by_actor_id
                    .get(&address)
                    .ok_or(ContractEvent::SignlessAccountHasInvalidSession)?;

                if *signless_account != caller {
                    return Err(ContractEvent::SignlessAccountNotApproved);
                }

                address
            },
            None => caller
        };

        Ok(address)
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

    pub fn check_signless_address_account(&self, address: ActorId) -> Result<(), ContractEvent> {
        let caller = msg::source();

        let addres_signless_session = self.signless_accounts_by_actor_id.get(&address);

        let Some(signless_address) = addres_signless_session else {
            return Err(ContractEvent::UserDoesNotHasSignlessAccount);
        };

        if caller != *signless_address {
            return Err(ContractEvent::SessionHasInvalidSignlessAccount);
        }

        return Ok(());
    }

    pub fn check_signles_no_wallet_account(&self, no_wallet_account: String) -> Result<(), ContractEvent> {
        let caller = msg::source();

        let no_wallet_signless_session = self.signless_accounts_by_no_wallet_account.get(&no_wallet_account);

        let Some(signless_address) = no_wallet_signless_session else {
            return Err(ContractEvent::UserDoesNotHasSignlessAccount);
        };

        if caller != *signless_address {
            return Err(ContractEvent::SessionHasInvalidSignlessAccount);
        }

        Ok(())
    }

}


