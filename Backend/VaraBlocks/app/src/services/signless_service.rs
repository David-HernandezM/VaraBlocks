use sails_rtl::{
    gstd::{
        gservice,
        msg
    },
    prelude::*
};

use crate::{
    state_globals_variables::signless_accounts::contract_signless_account_state_mut,
    varablocks_files::{
        contracts_io_types::ContractEvent,
        contract_types::SignlessAccount,
        virtual_contract_format::VirtualContractData,
        virtual_contract_struct::ContractStructFormat
    }
};

#[derive(Default)]
pub struct SignlessService;

#[gservice]
impl SignlessService {
    pub fn new() -> Self {
        Self
    }

    pub fn bind_signless_data_to_address(
        &mut self,
        user_account: ActorId,
        signless_data: SignlessAccount
    ) -> ContractEvent {
        let signless_state = contract_signless_account_state_mut();

        let signless_address: ActorId = msg::source().into();

        signless_state.set_signless_account_to_address(signless_address, user_account, signless_data);

        ContractEvent::SignlessAccountSet
    }

    pub fn bind_signless_data_to_no_wallet_account(
        &mut self,
        no_wallet_account: String,
        signless_data: SignlessAccount
    ) -> ContractEvent {
        let signless_state = contract_signless_account_state_mut();
        
        let signless_address: ActorId = msg::source().into();

        ContractEvent::SignlessAccountSet
    }
}