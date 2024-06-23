use sails_rtl::{
    prelude::*,
    ActorId
};

// [TODO]: change name of "InterpreterMessage" to "InterpreterMessage"


use super::{
    contract_types::{
        SignlessAccount,
        MessageFromVirtualContract
    },
    virtual_contract_enum::EnumVal,
    virtual_contract_format::{
        VirtualContractDataFromFrontend,
        VirtualContractData
    },
    virtual_contract_messages::InterpreterMessage,
    virtual_contract_format::VirtualContractState,
    virtual_contract_utils::VirtualContractMetadata,
    virtual_contract_struct::ContractStructFormat,
};

use crate::state_globals_variables::{
    virtual_contracts::VirtualContractId,
    signless_accounts::NoWalletSessionId
};


#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = sails_rtl::scale_codec)]
#[scale_info(crate = sails_rtl::scale_info)]
pub enum ContractAction {
    AddVirtualContractToAdress {
        user_account: Option<ActorId>,
        virtual_contract: VirtualContractDataFromFrontend,
        virtual_contract_id: VirtualContractId
    },
    AddVirtualContractToNoWalletAccount {
        no_wallet_account: String,
        virtual_contract: VirtualContractDataFromFrontend,
        virtual_contract_id: VirtualContractId
    },
    SendMessageToVirtualContractWithAddress {
        user_account: Option<ActorId>,
        message: EnumVal,
        virtual_contract_id: VirtualContractId
    }, // 💖
    SendMessageToVirtualContractWithNoWalletAccount {
        no_wallet_account: String,
        message: EnumVal,
        virtual_contract_id: VirtualContractId
    },
    BindSignlessAddressToAddress {
        user_account: ActorId,
        signless_data: SignlessAccount
    },
    BindSignlessAddressToNoWalletAccount {
        no_wallet_account: String,
        signless_data: SignlessAccount
    },
    MakeReservation,
    DeleteAllSignlessAccounts
}

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = sails_rtl::scale_codec)]
#[scale_info(crate = sails_rtl::scale_info)]
pub enum ContractEvent {
    MeesageOfVirtualContract(EnumVal),
    MessageOfInterpreter(InterpreterMessage),
    VirtualContractAdded,
    VirtualContractSet,
    VirtualContractIdDoesNotExists(VirtualContractId),
    AddressDoesNotHasVirtualContractId {
        address: ActorId,
        virtual_contract_id: VirtualContractId
    },
    NoWalletAccountDoesNotHasVirtualContractId {
        no_wallet_account: String,
        virtual_contract_id: VirtualContractId
    },
    SessionHasInvalidSignlessAccount,
    UserDoesNotHasSignlessAccount,
    NoVirtualContractStored,
    ReservationMade,
    NoReservationIdInContract,
    SignlessAccountSet,
    AccountAddressIsNotRegistered(ActorId),
    NoWalletAccountIsNotRegister,
    AllSignlessAccountDeleted, // Temp
    SignlessAccountHasInvalidSession,
    SignlessAccountNotApproved
}

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = sails_rtl::scale_codec)]
#[scale_info(crate = sails_rtl::scale_info)]
pub enum ContractStateQuery {
    LastVirtualContractSavedFromAddress(ActorId),
    LastVirtualContractSavedFromNoWalletAccount(String),
    AllVirtualContractsDataFromAddress(ActorId),
    AllVirtualContractsDataFromNoWalletAccount(String),
    VirtualContract(VirtualContractId),
    VirtualContractData(VirtualContractId),
    VirtualContractMetadata(VirtualContractId),
    VirtualContractState(VirtualContractId),
    MessagesFromVirtualContract(ActorId),
    SignlessAccountAddressForAddress(ActorId),
    SignlessAccountAddressForNoWalletAccount(NoWalletSessionId),
    SignlessAccountData(ActorId)
    
}

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = sails_rtl::scale_codec)]
#[scale_info(crate = sails_rtl::scale_info)]
pub enum ContractStateReply {
    LastVirtualContractFromUser(Option<VirtualContractData>),
    AllVirtualContractsDataFromUser(Vec<VirtualContractData>),
    VirtualContract(VirtualContractState),
    VirtualContractData(VirtualContractData),
    VirtualContractMetadata(VirtualContractMetadata),
    VirtualContractState(Option<ContractStructFormat>),
    MessagesFromVirtualContract(Vec<MessageFromVirtualContract>),
    SignlessAccountAddressForAddress(Option<ActorId>),
    SignlessAccountAddressForNoWalletAccount(Option<ActorId>),
    SignlessAccountData(Option<SignlessAccount>),
    VirtualContractIdDoesNotExists(VirtualContractId),
    UserIsNotRegistered
}