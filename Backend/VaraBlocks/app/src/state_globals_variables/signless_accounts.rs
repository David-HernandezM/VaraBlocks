use sails_rtl::{
    prelude::*,
    collections::BTreeMap,
};

use crate::varablocks_files::{
    contract_types::SignlessAccount,
    contracts_io_types::ContractEvent
};

pub type NoWalletSessionId = String;

pub static mut CONTRACT_SIGNLESS_ACCOUNTS: Option<ContractSignlessAccounts> = None;

pub struct ContractSignlessAccounts {
    pub signless_accounts_by_actor_id: BTreeMap<ActorId, ActorId>,
    pub signless_accounts_by_no_wallet_account: BTreeMap<NoWalletSessionId, ActorId>,
    pub signless_accounts: BTreeMap<ActorId, SignlessAccount>,
}

impl ContractSignlessAccounts {
    pub fn get_user_address(&self, caller: ActorId, user_address: Option<ActorId>) -> Result<ActorId, ContractEvent> {
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

    pub fn set_signless_account_to_address(&mut self, caller: ActorId, user_address: ActorId, signless_account: SignlessAccount) {
        self.add_signless_account(caller, signless_account);
    
        self.signless_accounts_by_actor_id
            .entry(user_address)
            .and_modify(|current_signless_address| *current_signless_address = caller)
            .or_insert(caller); 
    }

    pub fn set_signless_account_to_no_wallet_account(&mut self, caller: ActorId, no_wallet_account: String, signless_account: SignlessAccount) {
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

    pub fn check_signless_address_account(&self, caller: ActorId, address: ActorId) -> Result<(), ContractEvent> {
        let addres_signless_session = self.signless_accounts_by_actor_id.get(&address);

        let Some(signless_address) = addres_signless_session else {
            return Err(ContractEvent::UserDoesNotHasSignlessAccount);
        };

        if caller != *signless_address {
            return Err(ContractEvent::SessionHasInvalidSignlessAccount);
        }

        return Ok(());
    }

    pub fn check_signles_no_wallet_account(&self, caller: ActorId, no_wallet_account: String) -> Result<(), ContractEvent> {
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

pub fn contract_signless_account_state_mut() -> &'static mut ContractSignlessAccounts {
    let state = unsafe { CONTRACT_SIGNLESS_ACCOUNTS.as_mut() };
    debug_assert!(state.is_some(), "State isn't initialized");
    unsafe { state.unwrap_unchecked() }
}

pub fn contract_signless_account_state_ref() -> &'static ContractSignlessAccounts {
    let state = unsafe { CONTRACT_SIGNLESS_ACCOUNTS.as_ref() };
    debug_assert!(state.is_some(), "State isn't initialized");
    unsafe { state.unwrap_unchecked() }
}