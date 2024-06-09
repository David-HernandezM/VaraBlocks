#![no_std]
use gstd::{
    prelude::*, 
    ReservationId
};
use gmeta::{Metadata, InOut};

pub mod varablocks_types;
pub mod virtual_contract_utils;
pub mod virtual_contract_types;
pub mod virtual_contract_struct;
pub mod virtual_contract_enum;
pub mod virtual_contract_messages;
pub mod virtual_contract_format;
pub mod virtual_contract_state_handlers;
pub mod contract_state;
pub mod contracts_io_types;
pub mod contract_types;

use virtual_contract_enum::*;
use virtual_contract_utils::{
    VirtualContract,
    VirtualContractMetadata
};
use virtual_contract_messages::{VirtualContractErrors, InterpreterMessage};
use virtual_contract_format::{
    VirtualContractData,
    VirtualContractState
};
use virtual_contract_struct::*;
use contracts_io_types::*;
use contract_types::{
    SignlessAccount,
    MessageFromVirtualContract
};

pub type NoWalletSessionId = String;
pub type VirtualContractId = String;

pub struct ProgramMetadata;

impl Metadata for ProgramMetadata {
    type Init = (); // In<InitMainContract>;
    type Handle = InOut<ContractAction, ContractEvent>;
    type Others = (); 
    type Reply = ();
    type Signal = ();
    type State = InOut<ContractStateQuery, ContractStateReply>;
}

