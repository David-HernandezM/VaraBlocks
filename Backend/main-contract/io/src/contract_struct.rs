use gstd::prelude::*;

use super::contract_types::*;

pub type StructName = String;

#[derive(Clone)]
pub struct ContractStruct {
    pub struct_name: StructName,
    pub attributes: Vec<ContractTypes>
}

impl ContractStruct {
    pub fn default() -> ContractStruct {
        Self {
            struct_name: "".to_string(),
            attributes: Vec::new()
        }
    }
}

pub struct StructAttribute {
    name: String,
    value: Types
}