use gstd::{prelude::*, msg, exec, collections::{BTreeMap, HashMap}, ReservationId};

use main_contract_io::varablocks_types::*;
use main_contract_io::virtual_contract_utils::*;
use main_contract_io::virtual_contract_types::*;
use main_contract_io::virtual_contract_struct::*;
use main_contract_io::virtual_contract_enum::*;
use main_contract_io::virtual_contract_messages::*;
use main_contract_io::{ContractAction, ContractEvent};
use main_contract_io::virtual_contract_state_handlers::{
    StateAttributeToModify,
    StringActionsToModify
};
use main_contract_io::*;

static mut CONTRACT: Option<ContractState> = None;

#[no_mangle]
extern "C" fn intit() {
    unsafe {
        CONTRACT = Some(
            ContractState {
                owner: msg::source(),
                virtual_contracts: BTreeMap::new(),
                messages_of_virtual_contracts: BTreeMap::new(),
                reservations: Vec::new(),
                signless_accounts: BTreeMap::new(),
                signless_accounts_by_owner: BTreeMap::new()
            }
        );
    }
}

#[no_mangle]
extern "C" fn handle() {
    let message = msg::load()
        .expect("Error loading message");
    // let caller = msg::source();
    let state = state_mut();
    

    match message {
        ContractAction::SetVirtualContract { virtual_contract, user_account } => {
            let caller = match state.get_user_address(user_account) {
                Ok(address) => address,
                Err(error) => {
                    msg::reply(error, 0).expect("Error sending reply");
                    return;
                }
            };

            if state.virtual_contracts.contains_key(&caller) {
                state.virtual_contracts
                    .entry(caller)
                    .and_modify(|actual_virtual_contract| *actual_virtual_contract = virtual_contract.into());
            } else {
                state.virtual_contracts
                    .insert(caller, virtual_contract.into());
            }

            msg::reply(ContractEvent::VirtualContractSet, 0)
                .expect("Error sending reply");
        },
        ContractAction::SetDefaultVirtualContract { user_account } => {
            let caller = match state.get_user_address(user_account) {
                Ok(address) => address,
                Err(error) => {
                    msg::reply(error, 0).expect("Error sending reply");
                    return;
                }
            };

            if state.virtual_contracts.contains_key(&caller) {
                state.virtual_contracts
                    .entry(caller)
                    .and_modify(|actual_virtual_contract| *actual_virtual_contract = basic_contract_test_correct());
            } else {
                state.virtual_contracts
                    .insert(caller, basic_contract_test_correct());
            }

            msg::reply(ContractEvent::VirtualContractSet, 0)
                .expect("Error sending reply");
        },
        ContractAction::SendMessageToVirtualContract { message, user_account } => {
            let caller = match state.get_user_address(user_account) {
                Ok(address) => address,
                Err(error) => {
                    msg::reply(error, 0).expect("Error sending reply");
                    return;
                }
            };
            
            if !state.virtual_contracts.contains_key(&caller) {
                msg::reply(ContractEvent::NoVirtualContractStored, 0)
                    .expect("Error sending reply");
                return;
            }

            let contract_process_result = state.virtual_contracts
                .get_mut(&caller)
                .unwrap()
                .handle_message(message, caller);
                
            
            let message_to_send = match contract_process_result {
                Ok(message_of_vb) => {
                    let (message_of_contract, sent_messages) = message_of_vb;

                    sent_messages
                        .into_iter()
                        .for_each(|message| {
                            state.messages_of_virtual_contracts
                                .entry(message.to)
                                .and_modify(|messages| messages.push(VirtualContractMesssage::Message(message.message.clone())))
                                .or_insert(vec![VirtualContractMesssage::Message(message.message)]);
                        });

                    message_of_contract
                },
                Err(message_error) => {
                    if let VirtualContractMessage::Error(ref error) = message_error {
                        state.messages_of_virtual_contracts
                            .entry(caller)
                            .and_modify(|messages| messages.push(VirtualContractMesssage::Error(error.clone())))
                            .or_insert(vec![VirtualContractMesssage::Error(error.clone())]);
                    };

                    message_error
                }
            };

            msg::reply(ContractEvent::MessageOfInterpreter(message_to_send), 0)
                .expect("Error sending reply");
        },
        ContractAction::MakeReservation => {
            let reservation_id = ReservationId::reserve(
                9_000_000_000,
                400
            ).expect("resercation across executions");
            state.reservations.push(reservation_id);

            msg::reply(ContractEvent::ReservationMade, 0)
                .expect("Error sending reply");
        },
        ContractAction::BindSignlessAddressToAddress { user_account, signless_data } => {
            state.set_signless_account_to_address(user_account, signless_data);  

            msg::reply(ContractEvent::SignlessAccountSet, 0) 
                .expect("Error sending reply");
        },
        ContractAction::deleteAllSignlessAccounts => {
            state.signless_accounts.clear();
            state.signless_accounts_by_owner.clear();

            msg::reply(ContractEvent::AllSignlessAccountDeleted, 0) 
                .expect("Error sending reply");
        }
    }
}

#[no_mangle]
extern "C" fn state() {
    let message = msg::load()
        .expect("Error loading message state");
    let state = state_ref();

    match message {
        ContractStateQuery::VirtualContract(user_id) => {
            if !state.virtual_contracts.contains_key(&user_id) {
                msg::reply(ContractStateReply::AddresDoesNotHaveVirtualContract(user_id), 0)
                    .expect("Error sending reply state");
                return;
            }

            let virtual_contract = state.virtual_contracts
                .get(&user_id)
                .unwrap();

            msg::reply(ContractStateReply::VirtualContract(virtual_contract.into()), 0)
                .expect("Error sending reply state");
        },
        ContractStateQuery::VirtualContractMetadata(user_id) => {
            if !state.virtual_contracts.contains_key(&user_id) {
                msg::reply(ContractStateReply::AddresDoesNotHaveVirtualContract(user_id), 0)
                    .expect("Error sending reply state");
                return;
            }

            let virtual_contract = state.virtual_contracts
                .get(&user_id)
                .unwrap();

            msg::reply(ContractStateReply::VirtualContractMetadata(virtual_contract.metadata.clone()), 0)
                .expect("Error sending reply state");
        },
        ContractStateQuery::VirtualContractState(user_id) => {
            if !state.virtual_contracts.contains_key(&user_id) {
                msg::reply(ContractStateReply::AddresDoesNotHaveVirtualContract(user_id), 0)
                    .expect("Error sending reply state");
                return;
            }

            let virtual_contract = state.virtual_contracts
                .get(&user_id)
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

            msg::reply(ContractStateReply::VirtualContractState(contract_state), 0)
                .expect("Error sending reply state");
        },
        ContractStateQuery::MessagesFromVirtualContract(user_id) => {
            let messages = state.messages_of_virtual_contracts
                .get(&user_id);

            let to_send = match messages {
                Some(messages) => {
                    messages.clone()
                },
                _ => vec![]
            };

            msg::reply(ContractStateReply::MessagesFromVirtualContract(to_send), 0)
                .expect("error sending reply state");
        },
        ContractStateQuery::AddressSignlessAccountForAddress(user_address) => {
            let signless_address = state
                .signless_accounts_by_owner
                .get(&user_address);

            msg::reply(ContractStateReply::AddressSignlessAccountForAddress(signless_address.copied()), 0)
                .expect("Error sending state");
        },
        ContractStateQuery::SignlessAccountData(user_address) => {
            let signless_address = state
                .signless_accounts_by_owner
                .get(&user_address);

            let signless_data = if signless_address.is_some() {
                state
                    .signless_accounts
                    .get(&signless_address.unwrap())
            } else {
                None
            };

            msg::reply(ContractStateReply::SignlessAccountData(signless_data.cloned()), 0)
                .expect("Error sending state");
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





