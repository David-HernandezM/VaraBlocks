use gstd::{prelude::*, collections::HashMap, ActorId};
use super::contract_enum::EnumVal;

pub enum ContractTypeToModify {
    HashMap,
    Vec,
    INum,
    Num
}

#[derive(Encode, Decode, TypeInfo, Clone, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum VecTypes {
    VecActorId(Vec<ActorId>),
    VecString(Vec<String>),
    VecInt(Vec<i64>),
    VecNum(Vec<u64>),
    VecEnum(EnumVal),
    VecVec(Vec<Box<VecTypes>>),
    VecTuple(Vec<(Types, Types)>)
}

#[derive(Encode, Decode, TypeInfo, Clone, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Types {
    // HashMapVal(HashMapTypes),
    // VecVal(VecTypes),
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
    VecVal(VecTypes),
    ActorIdVal(ActorId),
    INumVal(i64),
    UNumVal(u64),
    StringVal(String),
    BooleanVal(bool),
    EnumVal(EnumVal),
    VariableVal(String),
    Tuple((Types, Types)),

}


#[derive(Clone)]
pub enum ContractTypes {
    HashMapActorIdKey(ContractHashMapActorIdKey),
    HashMapStringKey(ContractHashMapStringKey),
    HashMapIntKey(ContractHashMapIntKey),
    HashMapNumKey(ContractHashMapNumKey),
    VecActorId(ContractVecActorId),
    VecString(ContractVecString),
    VecInt(ContractVecInt),
    VecNum(ContractVecNum),
    String(ContractString),
    Int(ContractInt),
    Num(ContractNum)
}

#[derive(Clone)]
pub struct ContractHashMapActorIdKey {
    pub name: String,
    pub data: HashMap<ActorId, Types>
}

#[derive(Clone)]
pub struct ContractHashMapStringKey {
    pub name: String,
    pub data: HashMap<String, Types>
}

#[derive(Clone)]
pub struct ContractHashMapIntKey {
    pub name: String,
    pub data: HashMap<i64, Types>
}

#[derive(Clone)]
pub struct ContractHashMapNumKey {
    pub name: String,
    pub data: HashMap<u64, Types>
}

#[derive(Clone)]
pub struct ContractVecActorId {
    pub name: String,
    pub data: Vec<ActorId>
}

#[derive(Clone)]
pub struct ContractVecString {
    pub name: String, 
    pub data: Vec<String>
}

#[derive(Clone)]
pub struct ContractVecInt {
    pub name: String,
    pub data: Vec<i64>
}

#[derive(Clone)]
pub struct ContractVecNum {
    pub name: String,
    pub data: Vec<u64>
}

#[derive(Clone)]
pub struct ContractActorId {
    pub name: String,
    pub data: ActorId
}

#[derive(Clone)]
pub struct ContractString {
    pub name: String,
    pub data: String
}

#[derive(Clone)]
pub struct ContractInt {
    pub name: String,
    pub data: i64
}

#[derive(Clone)]
pub struct ContractNum {
    pub name: String,
    pub data: u64
}