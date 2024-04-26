use gstd::prelude::*;

use super::virtual_contract_types::*;

pub type StructName = String;
pub type StructAttributeName = String;

#[derive(Encode, Decode, TypeInfo, Clone)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct ContractStruct {
    pub struct_name: StructName,
    pub attributes: Vec<StructAttribute>
}

impl ContractStruct {
    pub fn default() -> ContractStruct {
        Self {
            struct_name: "".to_string(),
            attributes: Vec::new()
        }
    }

    pub fn to_string() {

    }
}

#[derive(Encode, Decode, TypeInfo, Clone)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct StructAttribute {
    pub attribute_name: StructAttributeName,
    pub attribute_type: VirtualContractTypes,
    pub attribute_val: VirtualContractTypes
}

impl StructAttribute {
    pub fn types_are_correct(&self) -> bool {
        let attribute_value = &self.attribute_val;
        match self.attribute_type {
            VirtualContractTypes::Enum => {
                if let VirtualContractTypes::EnumVal(_) = attribute_value {
                    return true;
                }
            },
            VirtualContractTypes::INum => {
                if let VirtualContractTypes::INumVal(_) = attribute_value {
                    return true;
                }
            },
            VirtualContractTypes::UNum => {
                if let VirtualContractTypes::INumVal(_) = attribute_value {
                    return true;
                }
            },
            VirtualContractTypes::String => {
                if let VirtualContractTypes::StringVal(_) = attribute_value {
                    return true;
                }
            },
            VirtualContractTypes::Boolean => {
                if let VirtualContractTypes::BooleanVal(_) = attribute_value {
                    return true;
                }
            },
            _ => {}
        }

        return false;
    }
}