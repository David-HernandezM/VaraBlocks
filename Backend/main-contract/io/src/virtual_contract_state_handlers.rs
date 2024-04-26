use gstd::prelude::*;

use super::virtual_contract_types::TypesVal;
use super::virtual_contract_enum::EnumNameVariant;

#[derive(Encode, Decode, TypeInfo, Clone, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum StateAttributeToModify {
    Vec {
        attribute_name: String,
        action: VecActiosToModify
    },
    String {
        attribute_name: String,
        action: StringActionsToModify
    },
    INum {
        attribute_name: String,
        action: INumActionsToModify
    },
    Unum {
        attribute_name: String,
        action: UNumActionsToModify
    },
    Enum {
        attribute_name: String,
        variant: EnumNameVariant
    },
}

impl StateAttributeToModify {
    pub fn attribute_name(&self) -> &str {
        match self {
            StateAttributeToModify::Vec { attribute_name, ..} => attribute_name,
            StateAttributeToModify::String { attribute_name, ..} => attribute_name,
            StateAttributeToModify::INum { attribute_name, ..} => attribute_name,
            StateAttributeToModify::Unum { attribute_name, ..} => attribute_name,
            StateAttributeToModify::Enum { attribute_name, ..} => attribute_name,
        }
    }
}

#[derive(Encode, Decode, TypeInfo, Clone, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum VecActiosToModify {
    ClearVec,
    AddItem(TypesVal),

}

#[derive(Encode, Decode, TypeInfo, Clone, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum StringActionsToModify {
    ClearString,
    ConcatString(String),
    ChangeTo(String),
}

#[derive(Encode, Decode, TypeInfo, Clone, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum UNumActionsToModify {
    Add(u64),
    Sub(u64),
    Div(u64),
    Mult(u64),
    AddVariable(String),
    RestVariable(String),
    DivVariable(String),
    MultVariable(String)
}

#[derive(Encode, Decode, TypeInfo, Clone, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum INumActionsToModify {
    Add(u64),
    Sub(u64),
    Div(u64),
    Mult(u64),
    AddVariable(String),
    RestVariable(String),
    DivVariable(String),
    MultVariable(String)
}