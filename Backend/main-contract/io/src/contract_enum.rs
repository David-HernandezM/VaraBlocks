use gstd::prelude::*;

pub type EnumName = String;
pub type EnumNameVariant = String;

#[derive(Encode, Decode, TypeInfo, Clone, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct EnumVal {
    pub enum_from: String,
    pub val: String
}


pub struct ContractEnum {
    pub enum_name: EnumName,
    pub enum_type: ContractEnumType, 
    pub variants: Vec<String>
}

pub enum ContractEnumType {
    ContractInitActions,
    ContractInitEvents,
    ContractActions,
    ContractEvents,
    ContractStateActions,
    ContractStateEvents,
    ContractEnum
}
