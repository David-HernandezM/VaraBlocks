use gstd::{collections::{BTreeMap, HashMap}, exec, msg, prelude::*, ActorId, ReservationId};

use main_contract_io::{contracts_io_types::{ContractEvent, ContractStateQuery}, varablocks_types::*, virtual_contract_format::VirtualContractData};
use main_contract_io::virtual_contract_utils::*;
use main_contract_io::virtual_contract_types::*;
use main_contract_io::virtual_contract_struct::*;
use main_contract_io::virtual_contract_enum::*;
use main_contract_io::virtual_contract_messages::*;
use main_contract_io::virtual_contract_state_handlers::{
    StateAttributeToModify,
    StringActionsToModify
};
use main_contract_io::{
    contract_state::ContractState,
    contract_types::*,
    contracts_io_types::*
};

macro_rules! send_reply {
    ($event:expr) => {
        msg::reply($event, 0).expect("Error sending reply");
    }
}

static mut CONTRACT: Option<ContractState> = None;

#[no_mangle]
extern "C" fn intit() {
    let mut contract_state = ContractState::default();
    contract_state.owner = msg::source();
    unsafe {
        CONTRACT = Some(contract_state);
    }
}

#[no_mangle]
extern "C" fn handle() {
    let message = msg::load()
        .expect("Error loading message");
    let state = state_mut();
    

    match message {
        ContractAction::AddVirtualContractToAdress { 
            user_account, 
            virtual_contract ,
            virtual_contract_id
        } => {
            let caller = match state.get_user_address(user_account) {
                Ok(address) => address,
                Err(error) => {
                    send_reply!(error);
                    return;
                }
            };

            if let Err(error_message) = state.check_signless_address_account(caller) {
                send_reply!(error_message);
                return;
            }

            if let Err(error_message) = state.add_vc_to_address(caller, virtual_contract_id, virtual_contract.into()) {
                send_reply!(error_message);
                return;
            }
            
            send_reply!(ContractEvent::VirtualContractAdded);
        },
        ContractAction::AddVirtualContractToNoWalletAccount { 
            no_wallet_account, 
            virtual_contract,
            virtual_contract_id
        } => {
            if let Err(error_message) = state.check_signles_no_wallet_account(no_wallet_account.clone()) {
                send_reply!(error_message);
                return;
            }

            if let Err(error_message) = state.add_vc_to_no_wallet_account(no_wallet_account, virtual_contract_id, virtual_contract.into()) {
                send_reply!(error_message);
                return;
            }

            send_reply!(ContractEvent::VirtualContractAdded);
        },
        ContractAction::SendMessageToVirtualContractWithAddress { 
            user_account, 
            message ,
            virtual_contract_id
        } => {
            let caller = match state.get_user_address(user_account) {
                Ok(address) => address,
                Err(error) => {
                    send_reply!(error);
                    return;
                }
            };

            if let Err(error_message) = state.check_signless_address_account(caller) {
                send_reply!(error_message);
                return;
            }

            if let Err(error_message) = state.virtual_contract_exists_for_address(caller, virtual_contract_id.clone()) {
                send_reply!(error_message);
                return;
            }

            let contract_process_result = state.virtual_contracts
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
                            state.messages_of_virtual_contracts
                                .entry(message.to)
                                .and_modify(|messages| messages.push(MessageFromVirtualContract::Message(message.message.clone())))
                                .or_insert(vec![MessageFromVirtualContract::Message(message.message)]);
                        });

                    message_of_contract
                },
                Err(message_error) => {
                    if let InterpreterMessage::Error(ref error) = message_error {
                        state.messages_of_virtual_contracts
                            .entry(caller)
                            .and_modify(|messages| messages.push(MessageFromVirtualContract::Error(error.clone())))
                            .or_insert(vec![MessageFromVirtualContract::Error(error.clone())]);
                    };

                    message_error
                }
            };
    
        },
        ContractAction::SendMessageToVirtualContractWithNoWalletAccount { 
            no_wallet_account, 
            message ,
            virtual_contract_id
        } => {
            let signless_address = msg::source();

            if let Err(error_message) = state.check_signles_no_wallet_account(no_wallet_account.clone()) {
                send_reply!(error_message);
                return;
            }

            if let Err(error_message) = state.virtual_contract_exists_for_no_wallet_account(no_wallet_account, virtual_contract_id.clone()) {
                send_reply!(error_message);
                return;
            }

            let contract_process_result = state.virtual_contracts
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
                            state.messages_of_virtual_contracts
                                .entry(message.to)
                                .and_modify(|messages| messages.push(MessageFromVirtualContract::Message(message.message.clone())))
                                .or_insert(vec![MessageFromVirtualContract::Message(message.message)]);
                        });

                    message_of_contract
                },
                Err(message_error) => {
                    if let InterpreterMessage::Error(ref error) = message_error {
                        state.messages_of_virtual_contracts
                            .entry(signless_address)
                            .and_modify(|messages| messages.push(MessageFromVirtualContract::Error(error.clone())))
                            .or_insert(vec![MessageFromVirtualContract::Error(error.clone())]);
                    };

                    message_error
                }
            };
        },
        ContractAction::BindSignlessAddressToAddress { 
            user_account, 
            signless_data 
        } => {
            state.set_signless_account_to_address(user_account, signless_data);

            send_reply!(ContractEvent::SignlessAccountSet);
        },
        ContractAction::BindSignlessAddressToNoWalletAccount { 
            no_wallet_account, 
            signless_data 
        } => {
            state.set_signless_account_to_no_wallet_account(no_wallet_account, signless_data);

            send_reply!(ContractEvent::SignlessAccountSet);
        },
        _ => {}
    }
}

#[no_mangle]
extern "C" fn state() {
    let message = msg::load()
        .expect("Error loading message state");
    let state = state_ref();

    match message {
        ContractStateQuery::LastVirtualContractSavedFromAddress(address) => {
            let Some(virtual_contracts_ids) = state
                .virtual_contracts_by_actor_id
                .get(&address) else {
                send_reply!(ContractStateReply::UserIsNotRegistered);
                return;
            };

            let Some(virtual_contract_id) = virtual_contracts_ids.last() else {
                send_reply!(ContractStateReply::LastVirtualContractFromUser(None));
                return;
            };

            let virtual_contract = state
                .virtual_contracts
                .get(virtual_contract_id)
                .unwrap();

            send_reply!(ContractStateReply::LastVirtualContractFromUser(Some(virtual_contract.into())));
        },
        ContractStateQuery::LastVirtualContractSavedFromNoWalletAccount(no_wallet_account) => {
            let Some(virtual_contracts_ids) = state
                .virtual_contracts_by_no_wallet_account
                .get(&no_wallet_account) else {
                    send_reply!(ContractStateReply::UserIsNotRegistered);
                    return;
                };

            let Some(virtual_contract_id) = virtual_contracts_ids.last() else {
                send_reply!(ContractStateReply::LastVirtualContractFromUser(None));
                return;
            };

            let virtual_contract = state
                .virtual_contracts
                .get(virtual_contract_id)
                .unwrap();

            send_reply!(ContractStateReply::LastVirtualContractFromUser(Some(virtual_contract.into())));
        },
        ContractStateQuery::AllVirtualContractsDataFromAddress(address) => {
            let Some(virtual_contracts_ids) = state
                .virtual_contracts_by_actor_id
                .get(&address) else {
                send_reply!(ContractStateReply::UserIsNotRegistered);
                return;
            };

            let mut virtual_contracts: Vec<VirtualContractData> = vec![];

            for virtual_contract_id in virtual_contracts_ids.iter() {
                if let Some(virtual_contract_data) = state.virtual_contracts.get(virtual_contract_id) {
                    virtual_contracts.push(virtual_contract_data.into());   
                }
            }

            send_reply!(ContractStateReply::AllVirtualContractsDataFromUser(virtual_contracts));
        },
        ContractStateQuery::AllVirtualContractsDataFromNoWalletAccount(no_wallet_account) => {
            let Some(virtual_contracts_ids) = state
                .virtual_contracts_by_no_wallet_account
                .get(&no_wallet_account) else {
                    send_reply!(ContractStateReply::UserIsNotRegistered);
                    return;
                };

            let mut virtual_contracts: Vec<VirtualContractData> = vec![];

            for virtual_contract_id in virtual_contracts_ids.iter() {
                if let Some(virtual_contract_data) = state.virtual_contracts.get(virtual_contract_id) {
                    virtual_contracts.push(virtual_contract_data.into());   
                }
            }

            send_reply!(ContractStateReply::AllVirtualContractsDataFromUser(virtual_contracts));
        },
        ContractStateQuery::VirtualContract(virtual_contract_id) => {
            if !state.virtual_contracts.contains_key(&virtual_contract_id) {
                send_reply!(ContractStateReply::VirtualContractIdDoesNotExists(virtual_contract_id));
                return;
            }

            let virtual_contract = state.virtual_contracts
                .get(&virtual_contract_id)
                .unwrap();

            send_reply!(ContractStateReply::VirtualContract(virtual_contract.into()));
        },
        ContractStateQuery::VirtualContractData(virtual_contract_id) => {
            if !state.virtual_contracts.contains_key(&virtual_contract_id) {
                send_reply!(ContractStateReply::VirtualContractIdDoesNotExists(virtual_contract_id));
                return;
            }

            let virtual_contract = state.virtual_contracts
                .get(&virtual_contract_id)
                .unwrap();
        
            send_reply!(ContractStateReply::VirtualContractData(virtual_contract.into()));
        },
        ContractStateQuery::VirtualContractMetadata(virtual_contract_id) => {
            if !state.virtual_contracts.contains_key(&virtual_contract_id) {
                send_reply!(ContractStateReply::VirtualContractIdDoesNotExists(virtual_contract_id));
                return;
            }

            let virtual_contract = state.virtual_contracts
                .get(&virtual_contract_id)
                .unwrap();

            send_reply!(ContractStateReply::VirtualContractMetadata(virtual_contract.metadata.clone()));
        },
        ContractStateQuery::VirtualContractState(virtual_contract_id) => {
            if !state.virtual_contracts.contains_key(&virtual_contract_id) {
                send_reply!(ContractStateReply::VirtualContractIdDoesNotExists(virtual_contract_id));
                return;
            }

            let virtual_contract = state.virtual_contracts
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

            send_reply!(ContractStateReply::VirtualContractState(contract_state));
        },
        ContractStateQuery::MessagesFromVirtualContract(address) => {
            let messages = state.messages_of_virtual_contracts
                .get(&address);

            let to_send = match messages {
                Some(messages) => {
                    messages.clone()
                },
                _ => vec![]
            };

            send_reply!(ContractStateReply::MessagesFromVirtualContract(to_send));
        },
        ContractStateQuery::SignlessAccountAddressForAddress(user_address) => {
            let signless_address = state
                .signless_accounts_by_actor_id
                .get(&user_address);

            send_reply!(ContractStateReply::SignlessAccountAddressForAddress(signless_address.copied()));
        },
        ContractStateQuery::SignlessAccountAddressForNoWalletAccount(no_wallet_account) => {
            let signless_address = state
                .signless_accounts_by_no_wallet_account
                .get(&no_wallet_account);

            send_reply!(ContractStateReply::SignlessAccountAddressForNoWalletAccount(signless_address.copied()));
        },
        ContractStateQuery::SignlessAccountData(signless_address) => {
            // let current_signless_address = state
            //     .signless_accounts
            //     .get(&signless_address);

            // let signless_data = if current_signless_address.is_some() {
            //     state
            //         .signless_accounts
            //         .get(&current_signless_address.unwrap())
            // } else {
            //     None
            // };

            let signless_data = state.signless_accounts
                .get(&signless_address);

            send_reply!(ContractStateReply::SignlessAccountData(signless_data.cloned()));
        }
    }
}

fn state_mut() -> &'static mut ContractState {
    let state = unsafe { CONTRACT.as_mut() };
    debug_assert!(state.is_some(), "State isn't initialized");
    unsafe { state.unwrap_unchecked() }
}

fn state_ref() -> &'static ContractState {
    let state = unsafe { CONTRACT.as_ref() };
    debug_assert!(state.is_some(), "State isn't initialized");
    unsafe { state.unwrap_unchecked() }
}








fn basic_contract_test_correct() -> VirtualContract {
   
   
   
   
    VirtualContract {
        // Controlar este aspecto y no tenga enum de inicio en el init
        initialized: false,
        metadata: VirtualContractMetadata {
            init: MetadataTypes::NoValue,
            handle: MetadataTypes::InOut(
                String::from("ContractActions"), 
                String::from("ContractEvent")
            )   
        },
        init_code: vec![
            CodeBlock::Variable(
                Variable {
                    variable_name: "message".to_string(),
                    is_mutable: false,
                    var_type: VirtualContractTypes::Enum,
                    var_value: VirtualContractTypesVal::EnumVal(
                        EnumVal {
                            enum_from: "ContractEvent".to_string(),
                            val: "Ping".to_string()
                        }
                    ),
                    is_parameter: false
                }
            )
        ],
        handle_code: vec![
            CodeBlock::LoadMessage(
                Variable {
                    variable_name: "message".to_string(),
                    is_mutable: false,
                    var_type: VirtualContractTypes::Enum,
                    var_value: VirtualContractTypesVal::EnumVal(
                        EnumVal {
                            enum_from: "".to_string(),
                            val: "".to_string()
                        }
                    ),
                    is_parameter: false
                }
            ),
            CodeBlock::ControlFlow(
                ControlFlow::Match {
                    variable_to_match: String::from("message"),
                    enum_to_match: String::from("ContractActions"),
                    code_block: vec![
                        vec![
                            CodeBlock::SendReply { 
                                message: EnumVal {
                                    enum_from: "ContractEvent".to_string(),
                                    val: "Pong".to_string()
                                } 
                            },
                            CodeBlock::ModifyState(
                                StateAttributeToModify::String { 
                                    attribute_name: "name".to_string(), 
                                    action: StringActionsToModify::ChangeTo(
                                        String::from("test")
                                    )
                                }
                            )
                        ],
                        vec![
                            CodeBlock::SendMessage { 
                                to: msg::source(),
                                message: EnumVal {
                                    enum_from: "ContractEvent".to_string(),
                                    val: "Ping".to_string()
                                } 
                            },
                            CodeBlock::SendReply { 
                                message: EnumVal {
                                    enum_from: "ContractEvent".to_string(),
                                    val: "Ping".to_string()
                                } 
                            },
                            CodeBlock::ModifyState(
                                StateAttributeToModify::String { 
                                    attribute_name: "name".to_string(), 
                                    action: StringActionsToModify::ConcatString(
                                        " prueba".to_string()
                                    )
                                }
                            )
                        ],
                        vec![
                            CodeBlock::ModifyState(
                                StateAttributeToModify::String { 
                                    attribute_name: "name".to_string(), 
                                    action: StringActionsToModify::ClearString
                                }
                            )
                        ]
                    ]
                }
            ),
            CodeBlock::SendMessage { 
                to: msg::source(),
                message: EnumVal {
                    enum_from: "ContractEvent".to_string(),
                    val: "Pong".to_string()
                } 
            },
        ],
        state: Some((String::from("ContractState"), None)),
        enums: HashMap::from([
            (String::from("ContractActions"), ContractEnum {
                enum_name: "ContractActions".to_string(),
                enum_type: ContractEnumType::ContractActions,
                variants: vec!["Ping".to_string(), "Pong".to_string(), "Pang".to_string()]
            }),
            (String::from("ContractEvent"), ContractEnum {
                enum_name: "ContractEvent".to_string(),
                enum_type: ContractEnumType::ContractEvents,
                variants: vec!["Ping".to_string(), "Pong".to_string()]
            })
        ]),
        // Los structs tienen que estar previamente inicializados.
        // Buscar una forma de que en los contratos se tenga algo
        // parecido, lo mas probable es que estos datos se introduciran
        // al momento de crear la instancia del contrato virtual
        // donde en el mensaje ya vienen los tipos de datos creados
        // de esta forma podriamos crear los structs ya por default.
        structs: HashMap::from([
            (String::from("ContractState"), ContractStruct {
                struct_name: "ContractState".to_string(),
                attributes: HashMap::from([
                    (
                        String::from("last_calls"), 
                        StructAttribute {
                            attribute_name: "last_calls".to_string(),
                            attribute_type: VirtualContractTypes::Vec,
                            attribute_val: VirtualContractTypesVal::VecVal(
                                VirtualContractVecTypes::VecString(vec![])
                            )
                        }
                    ),
                    (
                        String::from("name"),
                        StructAttribute {
                            attribute_name: "name".to_string(),
                            attribute_type: VirtualContractTypes::String,
                            attribute_val: VirtualContractTypesVal::StringVal(String::new())
                        }
                    )
                ])
            }),
        ]),
        menssages_send: HashMap::new()
    }
}





