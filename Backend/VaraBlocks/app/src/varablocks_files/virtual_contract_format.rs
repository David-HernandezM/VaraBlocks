use sails_rtl::{
    prelude::*,
    ActorId
};

use super::{
    virtual_contract_struct::{
        StructName,
        ContractStruct,
        ContractStructFormat
    },
    virtual_contract_enum::{
        EnumName,
        ContractEnum
    },
    virtual_contract_utils::{
        VirtualContractMetadata,
        VirtualContract,
        UsersMessages
    },
    varablocks_types::CodeBlock
};


pub type VirtualContractStateFormatedType = Option<(StructName, Option<ContractStructFormat>)>;

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = sails_rtl::scale_codec)]
#[scale_info(crate = sails_rtl::scale_info)]
pub struct VirtualContractData {
    pub metadata: VirtualContractMetadata,
    pub initialized: bool,
    pub state: Option<(StructName, Option<ContractStructFormat>)>,
    pub enums: Vec<(EnumName, ContractEnum)>,
    pub structs: Vec<(StructName, ContractStructFormat)>,
    pub init_code: Vec<CodeBlock>,
    pub handle_code: Vec<CodeBlock>,
}

impl From<&VirtualContract> for VirtualContractData {
    fn from(value: &VirtualContract) -> Self {
        let VirtualContract {
            metadata,
            state,
            init_code: initial_code,
            handle_code: hndl_code,
            enums,
            structs,
            initialized,
            ..
        } = value;

        let state: VirtualContractStateFormatedType = match state {
            Some(state_data) => {
                let (struct_name, attributes_option) = state_data;
                match attributes_option {
                    Some(attributes) => {
                        Some((struct_name.clone(), Some(attributes.into())))
                    },
                    None => {
                        Some((struct_name.clone(), None))
                    }
                }
            },
            None => None
        };

        let enums = enums
            .iter()
            .map(|(enum_name, contract_enum)| (enum_name.clone(), contract_enum.clone()))
            .collect();

        let structs = structs
            .iter()
            .map(|(struct_name, contract_struct)| {
                (struct_name.clone(), contract_struct.into())
            })
            .collect();

        Self {
            metadata: metadata.clone(),
            state,
            initialized: *initialized,
            enums,
            structs,
            init_code: initial_code.clone(),
            handle_code: hndl_code.clone(),
        }
    }
}

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = sails_rtl::scale_codec)]
#[scale_info(crate = sails_rtl::scale_info)]
pub struct VirtualContractDataFromFrontend {
    pub metadata: VirtualContractMetadata,
    pub state: Option<(StructName, Option<ContractStructFormat>)>,
    pub init_code: Vec<CodeBlock>,
    pub handle_code: Vec<CodeBlock>,
    pub enums: Vec<(EnumName, ContractEnum)>,
    pub structs: Vec<(StructName, ContractStructFormat)>,
}

impl From<&VirtualContract> for VirtualContractDataFromFrontend {
    fn from(value: &VirtualContract) -> Self {
        let VirtualContract {
            metadata,
            state,
            init_code: initial_code,
            handle_code: hndl_code,
            enums,
            structs,
            ..
        } = value;

        let state: VirtualContractStateFormatedType = match state {
            Some(state_data) => {
                let (struct_name, attributes_option) = state_data;
                match attributes_option {
                    Some(attributes) => {
                        Some((struct_name.clone(), Some(attributes.into())))
                    },
                    None => {
                        Some((struct_name.clone(), None))
                    }
                }
            },
            None => None
        };

        let enums = enums
            .iter()
            .map(|(enum_name, contract_enum)| (enum_name.clone(), contract_enum.clone()))
            .collect();

        let structs = structs
            .iter()
            .map(|(struct_name, contract_struct)| {
                (struct_name.clone(), contract_struct.into())
            })
            .collect();

        Self {
            metadata: metadata.clone(),
            state,
            init_code: initial_code.clone(),
            handle_code: hndl_code.clone(),
            enums,
            structs
        }

    }
}

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = sails_rtl::scale_codec)]
#[scale_info(crate = sails_rtl::scale_info)]
pub struct VirtualContractState {
    pub metadata: VirtualContractMetadata,
    pub initialized: bool,
    pub state: Option<(StructName, Option<ContractStructFormat>)>,
    pub enums: Vec<(EnumName, ContractEnum)>,
    pub structs: Vec<(StructName, ContractStructFormat)>,
    pub init_code: Vec<CodeBlock>,
    pub handle_code: Vec<CodeBlock>,
    pub menssages_send: Vec<(ActorId, UsersMessages)>
}

impl From<&VirtualContract> for VirtualContractState {
    fn from(value: &VirtualContract) -> Self {
        let VirtualContract {
            metadata,
            state,
            init_code: initial_code,
            handle_code: hndl_code,
            initialized,
            enums,
            structs,
            menssages_send
        } = value;

        let state: VirtualContractStateFormatedType = match state {
            Some(state_data) => {
                let (struct_name, attributes_option) = state_data;
                match attributes_option {
                    Some(attributes) => {
                        Some((struct_name.clone(), Some(attributes.into())))
                    },
                    None => {
                        Some((struct_name.clone(), None))
                    }
                }
            },
            None => None
        };

        let enums = enums
            .iter()
            .map(|(enum_name, contract_enum)| (enum_name.clone(), contract_enum.clone()))
            .collect();

        let structs = structs
            .iter()
            .map(|(struct_name, contract_struct)| {
                (struct_name.clone(), contract_struct.into())
            })
            .collect();

        let menssages_send = menssages_send
            .iter()
            .map(|(address, user_message)| (address.clone(), user_message.clone()))
            .collect();

        Self {
            metadata: metadata.clone(),
            state,
            initialized: *initialized,
            enums,
            structs,
            init_code: initial_code.clone(),
            handle_code: hndl_code.clone(),
            menssages_send,
        }
    }
    
}