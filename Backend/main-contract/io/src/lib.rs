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
use virtual_contract_messages::{VirtualContractErrors, VirtualContractMessage};
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

pub struct ContractState {
    pub owner: ActorId,
    pub virtual_contracts: BTreeMap<ActorId, VirtualContract>,
    pub signless_accounts_by_owner: BTreeMap<ActorId, ActorId>,
    pub signless_accounts: BTreeMap<ActorId, SignlessAccount>,
    pub messages_of_virtual_contracts: BTreeMap<ActorId, Vec<VirtualContractMesssage>>,
    pub reservations: Vec<ReservationId>
}

impl ContractState {
    pub fn set_vc_to_address(&mut self, address: ActorId, virtual_contract: VirtualContract) {
        if self.virtual_contracts.contains_key(&address) {
            self.virtual_contracts
                .entry(address)
                .and_modify(|actual_virtual_contract| *actual_virtual_contract = virtual_contract);
        } else {
            self.virtual_contracts
                .insert(address, virtual_contract);
        }
    }

    pub fn set_signless_account_to_address(&mut self, user_address: ActorId, signless_account: SignlessAccount) {
        let caller = msg::source();

        self.signless_accounts
            .entry(caller)
            .and_modify(|current_signless_account| *current_signless_account = signless_account.clone())
            .or_insert(signless_account);
    
        self.signless_accounts_by_owner
            .entry(user_address)
            .and_modify(|current_signless_address| *current_signless_address = caller)
            .or_insert(caller);
    }

    pub fn get_user_address(&self, user_address: Option<ActorId>) -> Result<ActorId, ContractEvent> {
        let caller = msg::source();

        let address = match user_address {
            Some(address) => {
                let signless_account = self
                    .signless_accounts_by_owner
                    .get(&address)
                    .ok_or(ContractEvent::SignlessAccountHasInvalidSession)?;

                if *signless_account != caller {
                    return Err(ContractEvent::SignlessAccountNotApproved);
                }

                address
            },
            None => caller
        };

        Ok(address)
    }
}



#[derive(Encode, Decode, TypeInfo, Clone)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum VirtualContractMesssage {
    Message(EnumVal),
    Error(VirtualContractErrors)
}

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum ContractAction {
    SetVirtualContract {
        user_account: Option<ActorId>,
        virtual_contract: VirtualContractData
    },
    SetDefaultVirtualContract {
        user_account: Option<ActorId>,
    },
    SendMessageToVirtualContract {
        user_account: Option<ActorId>,
        message: EnumVal
    },
    BindSignlessAddressToAddress {
        user_account: ActorId,
        signless_data: SignlessAccount
    },
    MakeReservation,
    deleteAllSignlessAccounts
}


impl ContractAction {
    pub fn signless_account_owner(&self) -> Option<ActorId> {
        match self {
            ContractAction::BindSignlessAddressToAddress { user_account, .. } => Some(*user_account),
            ContractAction::SendMessageToVirtualContract { user_account, .. } => *user_account,
            ContractAction::SetDefaultVirtualContract { user_account } => *user_account,
            ContractAction::SetVirtualContract { user_account, .. } => *user_account,
            _ => None
        }
    }
}

// #[derive(Encode, Decode, TypeInfo)]
// #[codec(crate = gstd::codec)]
// #[scale_info(crate = gstd::scale_info)]
// pub enum ContractAction {
//     SetVirtualContract(VirtualContractData),
//     SetDefaultVirtualContract,
//     SendMessageToVirtualContract(EnumVal),
//     MakeReservation
// }

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum ContractEvent {
    MeesageOfVirtualContract(EnumVal),
    MessageOfInterpreter(VirtualContractMessage),
    VirtualContractSet,
    NoVirtualContractStored,
    ReservationMade,
    NoReservationIdInContract,
    SignlessAccountSet,
    AllSignlessAccountDeleted, // Temp
    SignlessAccountHasInvalidSession,
    SignlessAccountNotApproved
}

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum ContractStateQuery {
    VirtualContract(ActorId),
    VirtualContractMetadata(ActorId),
    VirtualContractState(ActorId),
    MessagesFromVirtualContract(ActorId),
    AddressSignlessAccountForAddress(ActorId),
    SignlessAccountData(ActorId)
}

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum ContractStateReply {
    VirtualContract(VirtualContractState),
    VirtualContractMetadata(VirtualContractMetadata),
    VirtualContractState(Option<ContractStructFormat>),
    MessagesFromVirtualContract(Vec<VirtualContractMesssage>),
    AddresDoesNotHaveVirtualContract(ActorId),
    AddressSignlessAccountForAddress(Option<ActorId>),
    SignlessAccountData(Option<SignlessAccount>)
}


#[derive(Encode, Decode, TypeInfo, Clone)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct SignlessAccount {
    address: String,
    encoded: String,
    encoding: SignlessEncodingData,
    meta: SignlessMetaData
}

#[derive(Encode, Decode, TypeInfo, Clone)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct SignlessEncodingData {
    content: (String, String),
    encoding_type: (String, String),
    version: String
}

#[derive(Encode, Decode, TypeInfo, Clone)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct SignlessMetaData {
    name: String
}

