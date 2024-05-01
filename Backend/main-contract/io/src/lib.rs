#![no_std]
use gstd::{
    prelude::*, 
    Vec, 
    collections::{
        BTreeMap,
        HashMap
    }, 
    ActorId, 
    msg, 
    ReservationId
};
use gmeta::{Metadata, In, Out, InOut};

pub mod varablocks_types;
pub mod virtual_contract_utils;
pub mod virtual_contract_types;
pub mod virtual_contract_struct;
pub mod virtual_contract_enum;
pub mod virtual_contract_messages;
pub mod virtual_contract_format;
pub mod virtual_contract_state_handlers;

use virtual_contract_enum::*;
use virtual_contract_utils::{
    VirtualContract,
    MetadataTypes,
    VirtualContractMetadata
};
use virtual_contract_messages::VirtualContractMessage;
use virtual_contract_types::VirtualContractVecTypes;
use virtual_contract_format::{
    VirtualContractData,
    VirtualContractState
};
use virtual_contract_struct::*;

use varablocks_types::*;

pub struct ProgramMetadata;

impl Metadata for ProgramMetadata {
    type Init = (); // In<InitMainContract>;
    type Handle = InOut<ContractAction, ContractEvent>;
    type Others = (); 
    type Reply = ();
    type Signal = ();
    type State = InOut<ContractStateQuery, ContractStateReply>;
}

pub struct Contract {
    pub owner: ActorId,
    pub virtual_contracts: BTreeMap<ActorId, VirtualContract>,
    pub messages_of_virtual_contracts: BTreeMap<ActorId, Vec<EnumVal>>,
    pub reservations: Vec<ReservationId>
}

// impl Contract {
//     fn virtual_contract_of_user(self, )
// }


#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum ContractAction {
    SetVirtualContract(VirtualContractData),
    SetDefaultVirtualContract,
    SendMessageToVirtualContract(EnumVal),
    MakeReservation
}

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum ContractEvent {
    MeesageOfVirtualContract(EnumVal),
    MessageOfInterpreter(VirtualContractMessage),
    VirtualContractSet,
    NoVirtualContractStored,
    ReservationMade,
    NoReservationIdInContract
}

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum ContractStateQuery {
    VirtualContract(ActorId),
    VirtualContractMetadata(ActorId),
    VirtualContractState(ActorId),
    MessagesFromVirtualContract(ActorId)
}

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum ContractStateReply {
    VirtualContract(VirtualContractState),
    VirtualContractMetadata(VirtualContractMetadata),
    VirtualContractState(Option<ContractStructFormat>),
    MessagesFromVirtualContract(Vec<EnumVal>),
    AddresDoesNotHaveVirtualContract(ActorId)
}

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Test3 {
    Option1(Test1),
    Option2(Test2)
}

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Test1 {
    Variant1,
    Variant2(Box<Test2>)
}

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Test2 {
    Variant1,
    Variant2(Box<Test1>)
}

