use sails_rtl::{
    prelude::*,
    ActorId
};

pub static mut CONTRACT_GENERAL_DATA: Option<ContractGeneralData> = None;

pub struct ContractGeneralData {
    pub owner: ActorId
}

pub fn contrat_general_data_state_mut() -> &'static mut ContractGeneralData {
    let state = unsafe { CONTRACT_GENERAL_DATA.as_mut() };
    debug_assert!(state.is_some(), "State isn't initialized");
    unsafe { state.unwrap_unchecked() }
}

pub fn contrat_general_data_state_ref() -> &'static ContractGeneralData {
    let state = unsafe { CONTRACT_GENERAL_DATA.as_ref() };
    debug_assert!(state.is_some(), "State isn't initialized");
    unsafe { state.unwrap_unchecked() }
}