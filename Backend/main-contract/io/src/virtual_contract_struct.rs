use gstd::{prelude::*, collections::HashMap};

use super::virtual_contract_types::{
    VirtualContractTypes,
    VirtualContractTypesVal
};

pub type StructName = String;
pub type StructAttributeName = String;

#[derive(Encode, Decode, TypeInfo, Clone)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct ContractStructFormat {
    pub struct_name: StructName,
    pub attributes: Vec<StructAttribute>
}

impl From<&ContractStruct> for ContractStructFormat {
    fn from(value: &ContractStruct) -> Self {
        let ContractStruct {
            struct_name,
            attributes: attributes_hash
        } = value;

        let attributes = attributes_hash.iter()
            .map(|(_, contract_struct)| {
                contract_struct.clone()
            })
            .collect();

        Self {
            struct_name: struct_name.clone(),
            attributes
        }
    }
}

#[derive(Clone)]
pub struct ContractStruct {
    pub struct_name: StructName,
    pub attributes: HashMap<StructAttributeName, StructAttribute>
}

impl From<ContractStructFormat> for ContractStruct {
    fn from(value: ContractStructFormat) -> Self {
        let ContractStructFormat {
            struct_name,
            attributes
        } = value;

        let attributes = attributes
            .into_iter()
            .map(|attribute| (attribute.attribute_name.clone(), attribute))
            .collect();

        Self {
            struct_name,
            attributes
        }
    }
}

impl ContractStruct {
    pub fn default() -> ContractStruct {
        Self {
            struct_name: "".to_string(),
            attributes: HashMap::new()
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
    pub attribute_val: VirtualContractTypesVal
}

impl StructAttribute {
    pub fn types_are_correct(&self) -> bool {
        let attribute_value = &self.attribute_val;
        match self.attribute_type {
            VirtualContractTypes::Enum => {
                if let VirtualContractTypesVal::EnumVal(_) = attribute_value {
                    return true;
                }
            },
            VirtualContractTypes::INum => {
                if let VirtualContractTypesVal::INumVal(_) = attribute_value {
                    return true;
                }
            },
            VirtualContractTypes::UNum => {
                if let VirtualContractTypesVal::INumVal(_) = attribute_value {
                    return true;
                }
            },
            VirtualContractTypes::String => {
                if let VirtualContractTypesVal::StringVal(_) = attribute_value {
                    return true;
                }
            },
            VirtualContractTypes::Boolean => {
                if let VirtualContractTypesVal::BooleanVal(_) = attribute_value {
                    return true;
                }
            },
            _ => {}
        }

        return false;
    }
}