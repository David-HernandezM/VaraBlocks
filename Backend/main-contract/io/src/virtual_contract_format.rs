use gstd::{prelude::*, ActorId};

use super::{
    virtual_contract_struct::{
        StructName,
        ContractStruct
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


// pub struct VirtualContract {
//     pub metadata: Metadata, -- 
//     pub state: Option<(StructName, Option<ContractStruct>)>, -- 
//     pub init_code: Vec<CodeBlock>, -- 
//     pub handle_code: Vec<CodeBlock>, -- 
//     pub initialized: bool, --
//     pub enums: HashMap<EnumName, ContractEnum>, -- 
//     pub structs: HashMap<StructName, ContractStruct>, -- 
//     pub menssages_send: HashMap<ActorId, UsersMessages>
// }

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct VirtualContractData {
    pub metadata: VirtualContractMetadata,
    pub state: Option<(StructName, Option<ContractStruct>)>,
    pub init_code: Vec<CodeBlock>,
    pub handle_code: Vec<CodeBlock>,
    pub enums: Vec<(EnumName, ContractEnum)>,
    pub structs: Vec<(StructName, ContractStruct)>,
}

pub struct VirtualContractState {
    pub metadata: VirtualContractMetadata,
    pub initialized: bool,
    pub state: Option<(StructName, Option<ContractStruct>)>,
    pub enums: Vec<(EnumName, ContractEnum)>,
    pub structs: Vec<(StructName, ContractStruct)>,
    pub menssages_send: Vec<(ActorId, UsersMessages)>
}

impl From<&VirtualContract> for VirtualContractState {
    fn from(value: &VirtualContract) -> Self {
        let VirtualContract {
            metadata,
            state,
            init_code,
            handle_code,
            initialized,
            enums,
            structs,
            menssages_send
        } = value;

        let enums = enums
            .iter()
            .map(|(enum_name, contract_enum)| (enum_name.clone(), contract_enum.clone()))
            .collect();

        let structs = structs
            .iter()
            .map(|(struct_name, contract_struct)| (struct_name.clone(), contract_struct.clone()))
            .collect();

        let menssages_send = menssages_send
            .iter()
            .map(|(address, user_message)| (address.clone(), user_message.clone()))
            .collect();

        Self {
            metadata: metadata.clone(),
            state: state.clone(),
            initialized: *initialized,
            enums,
            structs,
            menssages_send
        }
    }
}