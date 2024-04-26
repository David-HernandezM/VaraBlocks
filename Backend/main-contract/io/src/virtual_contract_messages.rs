use gstd::{prelude::*, ActorId};

use super::virtual_contract_types::VirtualContractTypes;
use super::virtual_contract_enum::{
    EnumName,
    EnumVal
};
use super::virtual_contract_struct::{
    StructName,
    StructAttributeName
};

#[derive(Encode, Decode, TypeInfo, Clone)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum MessageTypeToSend {
    Reply,
    Send
}

#[derive(Encode, Decode, TypeInfo, Clone)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct MessageToSend {
    pub to: ActorId,
    pub message: EnumVal,
    pub message_type_to_send: MessageTypeToSend
}

#[derive(Encode, Decode, TypeInfo, Clone)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum VirtualContractMessage {
    Error(VirtualContractErrors),
    MessageProcessed,
    MessagesToSend(Vec<MessageToSend>),
    VirtualContractCreated,
    VirtualContractMetadataChecked
}

#[derive(Encode, Decode, TypeInfo, Clone)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum VirtualContractErrors {
    ContractDontHaveEnum(String),
    ContractDontHaveStruct(String),
    ContractDontHaveState,
    InitMetadataNotDefinedAndUsed,
    InitMetadataContainsInexistentEnum(String),
    HandleMetadataNotDefinedAndUsed,
    MatchDoesNotHaveAllCases(EnumName),
    VariableDoesNotHaveName,
    VariableDoesNotExixts {
        variable_name: String
    },
    VariableEnumIsNotTheSameForMatch {
        variable_name: String,
        variable_enum: String,
        match_enum: String
    },
    VariableIsNotAnEnumForMatch {
        variable_name: String,
        variable_type: VirtualContractTypes
    },
    VariableHasWrongTypes {
        variable_name: String,
    },
    VariableDontFitInMatch {
        variable_name: String,
        expected_variable: String
    },
    VariantNotExistsInEnum {
        enum_name: String,
        variant: String
    },
    AttributeNotExistsInStruct {
        struct_name: StructName,
        attribute: StructAttributeName
    },
    ControlFlowDoesNotMatch {
        expected: String,
    },
    MessageReceivedDontHaveCorrectEnum {
        enum_of_message_received: EnumName,
        expected_enum: EnumName
    },
    MessageToSendDontHaveCorrectEnum {
        enum_of_message_received: EnumName,
        expected_enum: EnumName
    }, 
    CantProcessMessageNoEnumIn(String),
    CantSendMessageNoEnumIn(String),
    MetadataInContractDoesNotExists {
        metadata_variant_inexistent: String
    },
    ReplyMessageAlreadySend,
    EnumNamenCantBeEmpty,
    EnumVariantNameCantBeEmpty,
    StructNameCantBeEmpty,
    NameCantBeEmpty,
    ErrorGettingMessagesToSend
}
