use sails_rtl::{
    gstd::gservice,
    prelude::*
};


#[derive(Default)]
pub struct ContractGeneralDataService;

#[gservice]
impl ContractGeneralDataService {
    pub fn new() -> Self {
        Self
    }

    pub fn test(&self) -> String {
        "hola!".to_string()
    }
}