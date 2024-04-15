use gstd::{prelude::*, msg, exec, collections::{BTreeMap, HashMap}};

use main_contract_io::varablocks_types::*;
use main_contract_io::contract_utils::*;
use main_contract_io::contract_types::*;
use main_contract_io::contract_struct::*;
use main_contract_io::contract_enum::*;
use main_contract_io::contract_messages::*;
use main_contract_io::{ContractAction, ContractEvent};
use main_contract_io::*;

static mut CONTRACT: Option<Contract> = None;

#[no_mangle]
extern "C" fn intit() {
    unsafe {
        CONTRACT = Some(
            Contract {
                owner: msg::source(),
                virtual_contracts: basic_contract_test_correct()
            }
        );
    }
}

#[no_mangle]
extern "C" fn handle() {
    let message = msg::load()
        .expect("Error loading message");

    let state = state_mut();

    match message {
        ContractAction::SendMessageToVirtualContract(message_to_virtual_contract) => {
            // if state.virtual_contracts.len() == 0 {
            //     msg::reply(ContractEvent::NoVirtualContractStored, 0)
            //         .expect("Error sending reply");
            // }

            let response_of_virtual_contract = state
                .virtual_contracts
                .handle_message(message_to_virtual_contract);
                
            
            let message_to_send = match response_of_virtual_contract {
                Ok(message_get) => message_get,
                Err(message_error) => message_error
            };

            msg::reply(ContractEvent::MessageOfInterpreter(message_to_send), 0)
                .expect("Error sending reply");
        },
        ContractAction::AddTestVirtualContract => {
            state.virtual_contracts = basic_contract_test_correct();

            msg::reply(ContractEvent::VirtualContractSet, 0)
            .expect("Error sending reply");
        },
        ContractAction::Test(type_test) => {
            msg::reply(ContractEvent::VirtualContractSet, 0)
            .expect("Error sending reply");
        }
    }
}

// #[no_mangle]
// extern "C" fn state() {
//     msg::reply(state_mut())
//         .expect("Error sending reply");
// }

fn state_mut() -> &'static mut Contract {
    let state = unsafe { CONTRACT.as_mut() };
    debug_assert!(state.is_some(), "State isn't initialized");
    unsafe { state.unwrap_unchecked() }
}

fn basic_contract_test_correct() -> VirtualContract {
    VirtualContract {
        initialized: false,
        metadata: Metadata {
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
                    var_type: Types::Enum,
                    var_value: Types::EnumVal(
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
                    var_type: Types::Enum,
                    var_value: Types::EnumVal(
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
                            }  
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
                variants: vec!["Ping".to_string(), "Pong".to_string()]
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
                attributes: vec![
                    ContractTypes::VecActorId(
                        ContractVecActorId {
                            name: "last_calls".to_string(),
                            data: vec![]
                        }
                    )
                ]
            })
        ]),
        menssages_send: HashMap::new()
    }
}
