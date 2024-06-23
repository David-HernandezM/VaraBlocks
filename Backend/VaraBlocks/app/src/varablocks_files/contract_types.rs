use sails_rtl::prelude::*;

use super::{
    virtual_contract_enum::EnumVal,
    virtual_contract_messages::VirtualContractErrors
};


#[derive(Encode, Decode, TypeInfo, Clone)]
#[codec(crate = sails_rtl::scale_codec)]
#[scale_info(crate = sails_rtl::scale_info)]
pub enum MessageFromVirtualContract {
    Message(EnumVal),
    Error(VirtualContractErrors)
}


#[derive(Encode, Decode, TypeInfo, Clone)]
#[codec(crate = sails_rtl::scale_codec)]
#[scale_info(crate = sails_rtl::scale_info)]
pub struct SignlessAccount {
    address: String,
    encoded: String,
    encoding: SignlessEncodingData,
    meta: SignlessMetaData
}

#[derive(Encode, Decode, TypeInfo, Clone)]
#[codec(crate = sails_rtl::scale_codec)]
#[scale_info(crate = sails_rtl::scale_info)]
pub struct SignlessEncodingData {
    content: (String, String),
    encoding_type: (String, String),
    version: String
}

#[derive(Encode, Decode, TypeInfo, Clone)]
#[codec(crate = sails_rtl::scale_codec)]
#[scale_info(crate = sails_rtl::scale_info)]
pub struct SignlessMetaData {
    name: String
}

