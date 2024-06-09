use gstd::prelude::*;
use super::{
    EnumVal,
    VirtualContractErrors,
};

#[derive(Encode, Decode, TypeInfo, Clone)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum MessageFromVirtualContract {
    Message(EnumVal),
    Error(VirtualContractErrors)
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

