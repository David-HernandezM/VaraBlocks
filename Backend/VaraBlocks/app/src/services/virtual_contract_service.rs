use sails_rtl::{
    gstd::{
        gservice,
        msg
    },
    prelude::*
};

use crate::{
    varablocks_files::{
        contracts_io_types::ContractEvent,
        virtual_contract_format::VirtualContractDataFromFrontend,
        virtual_contract_enum::EnumVal,
        virtual_contract_messages::InterpreterMessage,
        contract_types::MessageFromVirtualContract
    },
    state_globals_variables::{
        virtual_contracts::{
            VirtualContractId,
            virtual_contracts_state_mut
        },
        signless_accounts::contract_signless_account_state_ref
    },
};

#[derive(Default)]
pub struct VirtualContractService;

#[gservice]
impl VirtualContractService {
    pub fn new() -> Self {
        Self
    }

    pub fn add_virtual_contract_to_address(
        &mut self,
        user_account: Option<ActorId>,
        virtual_contract: VirtualContractDataFromFrontend,
        virtual_contract_id: VirtualContractId
    ) -> ContractEvent {
        let signless_state = contract_signless_account_state_ref();
        let virtual_contracts = virtual_contracts_state_mut();

        let address_that_call_contract = msg::source().into();

        let caller = match signless_state.get_user_address(address_that_call_contract, user_account) {
            Ok(address) => address,
            Err(error) => return error
        };

        if let Err(error_message) = signless_state.check_signless_address_account(address_that_call_contract, caller) {
            return error_message;
        }

        if let Err(error_message) = virtual_contracts.add_vc_to_address(caller, virtual_contract_id, virtual_contract.into()) {
            return error_message;
        }

        ContractEvent::VirtualContractAdded
    }

    pub fn add_virtual_contract_to_no_wallet_account(
        &mut self,
        no_wallet_account: String, 
        virtual_contract: VirtualContractDataFromFrontend,
        virtual_contract_id: String
    ) -> ContractEvent {
        let signless_state = contract_signless_account_state_ref();
        let virtual_contracts = virtual_contracts_state_mut();

        let address_that_call_contract = msg::source().into();

        if let Err(error_message) = signless_state.check_signles_no_wallet_account(address_that_call_contract, no_wallet_account.clone()) {
            return error_message;
        }

        if let Err(error_message) = virtual_contracts.add_vc_to_no_wallet_account(no_wallet_account, virtual_contract_id, virtual_contract.into()) {
            return error_message;
        }

        ContractEvent::VirtualContractAdded
    }

    pub fn send_message_to_virtual_contract_with_address(
        &mut self,
        user_account: Option<ActorId>,
        message: EnumVal,
        virtual_contract_id: String
    ) -> ContractEvent {
        let signless_state = contract_signless_account_state_ref();
        let virtual_contracts_state = virtual_contracts_state_mut();

        let address_that_call_contract = msg::source().into();

        let caller = match signless_state.get_user_address(address_that_call_contract, user_account) {
            Ok(address) => address,
            Err(error) => return error
        };

        if let Err(error_message) = signless_state.check_signless_address_account(address_that_call_contract, caller) {
            return error_message;
        }

        if let Err(error_message) = virtual_contracts_state.virtual_contract_exists_for_address(caller, virtual_contract_id.clone()) {
            return error_message;
        }

        let contract_process_result = virtual_contracts_state.virtual_contracts
            .get_mut(&virtual_contract_id)
            .unwrap()
            .handle_message(message, caller);

        let message_to_send = match contract_process_result {
            Ok(message_of_vb) => {
                let (
                    message_of_contract, 
                    sent_messages
                ) = message_of_vb;

                sent_messages
                    .into_iter()
                    .for_each(|message| {
                        virtual_contracts_state.messages_of_virtual_contracts
                            .entry(message.to)
                            .and_modify(|messages| messages.push(MessageFromVirtualContract::Message(message.message.clone())))
                            .or_insert(vec![MessageFromVirtualContract::Message(message.message)]);
                    });

                message_of_contract
            },
            Err(message_error) => {
                if let InterpreterMessage::Error(ref error) = message_error {
                    virtual_contracts_state.messages_of_virtual_contracts
                        .entry(caller)
                        .and_modify(|messages| messages.push(MessageFromVirtualContract::Error(error.clone())))
                        .or_insert(vec![MessageFromVirtualContract::Error(error.clone())]);
                };

                message_error
            }
        };

        ContractEvent::MessageOfInterpreter(message_to_send)
    }

    pub fn send_message_to_virtual_contract_with_no_wallet_account(
        &mut self,
        no_wallet_account: String,
        message: EnumVal,
        virtual_contract_id: String
    ) -> ContractEvent {
        let signless_state = contract_signless_account_state_ref();
        let virtual_contracts_state = virtual_contracts_state_mut();

        let signless_address = msg::source().into();

        if let Err(error_message) = signless_state.check_signles_no_wallet_account(signless_address, no_wallet_account.clone()) {
            return error_message;
        }

        if let Err(error_message) = virtual_contracts_state.virtual_contract_exists_for_no_wallet_account(no_wallet_account, virtual_contract_id.clone()) {
            return error_message;
        }

        let contract_process_result = virtual_contracts_state.virtual_contracts
                .get_mut(&virtual_contract_id)
                .unwrap()
                .handle_message(message, signless_address);

        let message_to_send = match contract_process_result {
            Ok(message_of_vb) => {
                let (
                    message_of_contract, 
                    sent_messages
                ) = message_of_vb;

                sent_messages
                    .into_iter()
                    .for_each(|message| {
                        virtual_contracts_state.messages_of_virtual_contracts
                            .entry(message.to)
                            .and_modify(|messages| messages.push(MessageFromVirtualContract::Message(message.message.clone())))
                            .or_insert(vec![MessageFromVirtualContract::Message(message.message)]);
                    });

                message_of_contract
            },
            Err(message_error) => {
                if let InterpreterMessage::Error(ref error) = message_error {
                    virtual_contracts_state.messages_of_virtual_contracts
                        .entry(signless_address)
                        .and_modify(|messages| messages.push(MessageFromVirtualContract::Error(error.clone())))
                        .or_insert(vec![MessageFromVirtualContract::Error(error.clone())]);
                };

                message_error
            }
        };

        ContractEvent::MessageOfInterpreter(message_to_send)
    }

}