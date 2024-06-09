use gstd::{
    prelude::*,
    ActorId
};

// [TODO]: change name of "InterpreterMessage" to "InterpreterMessage"

use crate::contract_types::MessageFromVirtualContract;

use super::{
    SignlessAccount,
    EnumVal,
    VirtualContractData,
    InterpreterMessage,
    VirtualContractState,
    VirtualContractMetadata,
    ContractStructFormat,
    VirtualContractId,
    NoWalletSessionId
};

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum ContractAction {
    AddVirtualContractToAdress {
        user_account: Option<ActorId>,
        virtual_contract: VirtualContractData,
        virtual_contract_id: VirtualContractId
    },
    AddVirtualContractToNoWalletAccount {
        no_wallet_account: String,
        virtual_contract: VirtualContractData,
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
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
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
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum ContractStateQuery {
    VirtualContract(VirtualContractId),
    VirtualContractMetadata(VirtualContractId),
    VirtualContractState(VirtualContractId),
    MessagesFromVirtualContract(ActorId),
    SignlessAccountAddressForAddress(ActorId),
    SignlessAccountAddressForNoWalletAccount(NoWalletSessionId),
    SignlessAccountData(ActorId)
    
}

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum ContractStateReply {
    VirtualContract(VirtualContractState),
    VirtualContractMetadata(VirtualContractMetadata),
    VirtualContractState(Option<ContractStructFormat>),
    MessagesFromVirtualContract(Vec<MessageFromVirtualContract>),
    SignlessAccountAddressForAddress(Option<ActorId>),
    SignlessAccountAddressForNoWalletAccount(Option<ActorId>),
    SignlessAccountData(Option<SignlessAccount>),
    VirtualContractIdDoesNotExists(VirtualContractId),
}