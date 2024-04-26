use gstd::{prelude::*, ActorId};

// use std::collections::HashMap;
use super::virtual_contract_enum::EnumVal;


// NO SE PERMITEN DATOS RECURSIVOS EN VARA AUN QUE ESTOS TENGAN LA 
// FUNCIONALIDAD DE BOX O ESTEN EN DOS ENUMS DISTINTOS, CREAR
// TIPOS DISTINTOS PARA CADA COSA!!!


#[derive(Debug)]
pub enum VecActionsToModify {
    Add(VirtualContractTypes)
}


#[derive(Encode, Decode, TypeInfo, Clone, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum VirtualContractVecTypes {
    VecActorId(Vec<ActorId>),
    VecString(Vec<String>),
    VecInt(Vec<i64>),
    VecNum(Vec<u64>),
    VecEnum(Vec<EnumVal>),
    VecTupleStringActorId(Vec<(String, String)>),
    VecTupleStringString(Vec<(String, String)>),
}

#[derive(Encode, Decode, TypeInfo, Clone, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum VirtualContractTypes {
    // HashMapVal(HashMapTypes),
    VecVal(VirtualContractVecTypes),
    ActorIdVal(ActorId),
    INumVal(i64),
    UNumVal(u64),
    StringVal(String),
    BooleanVal(bool),
    EnumVal(EnumVal),
    VariableVal(String),
    // HashMap,
    Vec,
    ActorId,
    Variable,
    NoValue,
    ReceivedMessage,
    Enum,
    INum,
    UNum,
    String,
    Boolean,
    UnitValue
}

#[derive(Encode, Decode, TypeInfo, Clone, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum TypesVal {
    VecVal(VirtualContractVecTypes),
    ActorIdVal(ActorId),
    INumVal(i64),
    UNumVal(u64),
    StringVal(String),
    BooleanVal(bool),
    EnumVal(EnumVal),
    VariableVal(String),
    TupleStringActorId((String, ActorId)),
}

impl VirtualContractTypes {
    pub fn is_val(&self) -> bool {
        match self {
            // VirtualContractTypes::HashMap  => false,
            VirtualContractTypes::Vec => false,
            VirtualContractTypes::ActorId => false,
            VirtualContractTypes::Variable => false,
            VirtualContractTypes::NoValue => false,
            VirtualContractTypes::ReceivedMessage => false,
            VirtualContractTypes::Enum => false,
            VirtualContractTypes::INum => false,
            VirtualContractTypes::UNum => false,
            VirtualContractTypes::String => false,
            VirtualContractTypes::Boolean => false,
            VirtualContractTypes::UnitValue => false,
            _ => true
        }
    }
}

// #[derive(Clone, Debug)]
// pub enum ContractTypes {
//     HashMapActorIdKey(ContractHashMapActorIdKey),
//     HashMapStringKey(ContractHashMapStringKey),
//     HashMapIntKey(ContractHashMapIntKey),
//     HashMapNumKey(ContractHashMapNumKey),
//     VecActorId(ContractVecActorId),
//     VecString(ContractVecString),
//     VecInt(ContractVecInt),
//     VecNum(ContractVecNum),
//     String(ContractString),
//     Int(ContractInt),
//     Num(ContractNum)
// }

// #[derive(Clone, Debug)]
// pub struct ContractHashMapActorIdKey {
//     pub name: String,
//     pub data: HashMap<ActorId, VirtualContractTypes>
// }

// #[derive(Clone, Debug)]
// pub struct ContractHashMapStringKey {
//     pub name: String,
//     pub data: HashMap<String, VirtualContractTypes>
// }

// #[derive(Clone, Debug)]
// pub struct ContractHashMapIntKey {
//     pub name: String,
//     pub data: HashMap<i64, VirtualContractTypes>
// }

// #[derive(Clone, Debug)]
// pub struct ContractHashMapNumKey {
//     pub name: String,
//     pub data: HashMap<u64, VirtualContractTypes>
// }

// #[derive(Clone, Debug)]
// pub struct ContractVecActorId {
//     pub name: String,
//     pub data: Vec<ActorId>
// }

// #[derive(Clone, Debug)]
// pub struct ContractVecString {
//     pub name: String, 
//     pub data: Vec<String>
// }

// #[derive(Clone, Debug)]
// pub struct ContractVecInt {
//     pub name: String,
//     pub data: Vec<i64>
// }

// #[derive(Clone, Debug)]
// pub struct ContractVecNum {
//     pub name: String,
//     pub data: Vec<u64>
// }

// #[derive(Clone, Debug)]
// pub struct ContractActorId {
//     pub name: String,
//     pub data: ActorId
// }

// #[derive(Clone, Debug)]
// pub struct ContractString {
//     pub name: String,
//     pub data: String
// }

// #[derive(Clone, Debug)]
// pub struct ContractInt {
//     pub name: String,
//     pub data: i64
// }

// #[derive(Clone, Debug)]
// pub struct ContractNum {
//     pub name: String,
//     pub data: u64
// }

// #[derive(Debug, Clone)]
// pub enum HashMapTypes {
//     HashMapStringKey(HashMap<String, VirtualContractTypes>),
//     HashMapActorIdKey(HashMap<ActorId, VirtualContractTypes>),
//     HashMapIntKey(HashMap<i64, VirtualContractTypes>),
//     HashMapNumKey(HashMap<u64, VirtualContractTypes>)
// }

// #[derive(Debug, Clone)]
// pub enum HashMapAsVec {
//     HashMapStringKey(Vec<(String, VirtualContractTypes)>),
//     HashMapActorIdKey(HashMap<ActorId, VirtualContractTypes>),
//     HashMapIntKey(HashMap<i64, VirtualContractTypes>),
//     HashMapNumKey(HashMap<u64, VirtualContractTypes>)
// }

// impl HashMapTypes {
//     fn 

//     pub fn hashmap_string_key_to_vec(&self) -> HashMapAsVec {

//     }

    
// }