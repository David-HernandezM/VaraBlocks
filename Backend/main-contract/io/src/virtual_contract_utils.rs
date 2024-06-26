use gstd::{prelude::*, collections::HashMap, ActorId, msg};

use super::varablocks_types::{CodeBlock, ControlFlow, Variable};
use super::virtual_contract_struct::*;
use super::virtual_contract_enum::*;
use super::virtual_contract_messages::*;
use super::virtual_contract_state_handlers::*;
use super::virtual_contract_types::{
    VirtualContractTypes,
    VirtualContractTypesVal
};
use super::virtual_contract_format::VirtualContractData;
use crate::{ContractAction, ContractEvent};

pub type VirtualContractStateType = Option<(StructName, Option<ContractStruct>)>;

#[derive(Encode, Decode, TypeInfo, Clone)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum MetadataTypes {
    In(EnumName),
    Out(EnumName),
    InOut(EnumName, EnumName),
    NoValue,
}

#[derive(Encode, Decode, TypeInfo, Clone)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct VirtualContractMetadata {
    pub init: MetadataTypes,
    pub handle: MetadataTypes
}

#[derive(Encode, Decode, TypeInfo, Clone)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct UsersMessages {
    pub last_message_send: Option<(EnumName, EnumNameVariant)>,
    pub last_messages: Vec<(EnumName, EnumNameVariant)>
}

pub struct VirtualContract {
    pub metadata: VirtualContractMetadata,
    pub state: Option<(StructName, Option<ContractStruct>)>,
    pub init_code: Vec<CodeBlock>,
    pub handle_code: Vec<CodeBlock>,
    pub initialized: bool,
    pub enums: HashMap<EnumName, ContractEnum>,
    pub structs: HashMap<StructName, ContractStruct>,
    pub menssages_send: HashMap<ActorId, UsersMessages>
}

// Implement VirtualContractData, this works to send Virtual Contract to the contract and
// transform data to a new Virtual Contract.
impl From<VirtualContractData> for VirtualContract {
    fn from(value: VirtualContractData) -> Self {
        let VirtualContractData {
            metadata,
            state,
            init_code,
            handle_code,
            enums,
            structs
        } = value;

        let state = match state {
            Some(state_data) => {
                let (struct_name, _) = state_data;
                Some((struct_name, None))
            },
            None => None
        };

        let structs_data: Vec<(String, ContractStruct)> = structs
            .into_iter()
            .map(|(struct_name, struct_data)| (struct_name, struct_data.into()))
            .collect();
        
        let enums =  HashMap::from_iter(enums.into_iter());
        let structs = HashMap::from_iter(structs_data.into_iter());

        Self {
            metadata,
            state,
            init_code,
            handle_code,
            initialized: false,
            enums,
            structs,
            menssages_send: HashMap::new()
        }
    }
}






// Impl for related functios in struct
impl VirtualContract {
    fn struct_contract_from_state(contract_state: &mut VirtualContractStateType) -> &mut ContractStruct {
        contract_state
            .as_mut()
            .unwrap()
            .1
            .as_mut()
            .unwrap()
    }

    fn modify_string_state_attribute(struct_state: &mut ContractStruct, attribute_name_to_modify: &str, action: &StringActionsToModify) -> Result<(), InterpreterMessage> {
        // This method does not have checkers, because we need to check before that
        // all data is correct before do changes.


        let attribute_to_modify  = struct_state.attributes
            .get_mut(attribute_name_to_modify)
            .unwrap();

        match action {
            StringActionsToModify::ChangeTo(new_string) => {
                attribute_to_modify.attribute_val = VirtualContractTypesVal::StringVal(
                    new_string.clone()
                );
            },
            StringActionsToModify::ClearString => {
                attribute_to_modify.attribute_val = VirtualContractTypesVal::StringVal(
                    String::new()
                );
            },
            StringActionsToModify::ConcatString(string_to_concat) => {
                let VirtualContractTypesVal::StringVal(value) = attribute_to_modify.attribute_val.clone() else {
                    return Err(InterpreterMessage::Error(
                        VirtualContractErrors::BadAssingToStructAttribute { 
                            expected: VirtualContractTypes::String 
                        }
                    ));
                };

                attribute_to_modify.attribute_val = VirtualContractTypesVal::StringVal(
                    format!("{}{}", value, string_to_concat)
                );
            }
        }
        Ok(())
    }

    // This related function works to init the state of a virtual contract
    pub fn init_contract_state(virtual_contract: &mut VirtualContract) -> Result<(), InterpreterMessage> {
        // If contract does not have state, it ok
        if let None = virtual_contract.state {
            return Ok(());
        }

        // if contract has state, get the struct name of the state
        let struct_name = &virtual_contract
            .state
            .as_ref()
            .unwrap()
            .0;

        // if struct name does not have a nave, return an error and finish
        // the execution of virtual contract
        if struct_name == "" {
            return Err(InterpreterMessage::Error(
                VirtualContractErrors::StructNameCantBeEmpty
            ));
        }

        // Then, check if the name exists, if not, return an error, but if exists
        // it creates a new default instance of the enum.
        let new_struct_instance = match virtual_contract.create_intance_of_struct(struct_name) {
            Ok(new_struct) => new_struct,
            Err(error_message) => return Err(error_message)
        };

        // And, we put the struct on the state, with this, the virtual contract now
        // has a virtual state.
        virtual_contract
            .state
            .as_mut()
            .unwrap()
            .1 = Some(new_struct_instance);

        Ok(())
    }

    pub fn send_message_to(to: ActorId, message: EnumVal) {
        msg::send(to, ContractEvent::MeesageOfVirtualContract(message), 0)
            .expect("Error sending message");
    }
    
    pub fn send_message_reply(message: EnumVal) {
        msg::send(msg::source(), ContractEvent::MeesageOfVirtualContract(message), 0)
            .expect("Error sending message");
    }

    pub fn get_enum_name_in_metadata<'a>(virtual_contract: &'a VirtualContract, check_in: &str) -> Result<Option<&'a EnumName>, InterpreterMessage> {
        let metadata_to_check = match virtual_contract.virtual_metadata_in(check_in) {
            Ok(virtual_metadata) => virtual_metadata,
            Err(error_message) => return Err(error_message)
        };

        match metadata_to_check {
            MetadataTypes::In(enum_name) => {
                Ok(Some(enum_name))
            },
            MetadataTypes::InOut(enum_name, _) => {
                Ok(Some(enum_name))
            },
            _ => Ok(None)
        }
    }

    pub fn get_enum_name_out_metadata<'a>(virtual_contract: &'a VirtualContract, check_in: &str) -> Result<Option<&'a EnumName>, InterpreterMessage> {
        let metadata_to_check = match virtual_contract.virtual_metadata_in(check_in) {
            Ok(virtual_metadata) => virtual_metadata,
            Err(error_message) => return Err(error_message)
        };

        match metadata_to_check {
            MetadataTypes::Out(enum_name) => {
                Ok(Some(enum_name))
            },
            MetadataTypes::InOut(_, enum_name) => {
                Ok(Some(enum_name))
            },
            _ => Ok(None)
        }
    }

    pub fn add_variable_to_list(variables: &mut Vec<Vec<Variable>>, scopes_len: usize, variable: Variable) {
        VirtualContract::modify_variables_scope(
            variables, 
            scopes_len
        );

        variables
            .last_mut()
            .expect("Cant get last variable container scope")
            .push(variable.clone());

    }

    pub fn modify_variables_scope(variables: &mut Vec<Vec<Variable>>, len_of_scopes: usize) {
        while variables.len() < len_of_scopes {
            variables.push(Vec::new());
        }
    }

    pub fn enum_data_from_variable(variable: &Variable) -> Result<&EnumVal, InterpreterMessage> {
        if let VirtualContractTypes::Enum = variable.var_type {
            let VirtualContractTypesVal::EnumVal(enum_val) = &variable.var_value else {
                return Err(InterpreterMessage::Error(
                    VirtualContractErrors::VariableHasWrongTypes { 
                        variable_name: variable.variable_name.clone()
                    }
                ));
            };

            Ok(enum_val)
        } else {
            Err(InterpreterMessage::Error(
                VirtualContractErrors::VariableIsNotAnEnumForMatch {
                    variable_name: variable.variable_name.clone(),
                    variable_type: variable.var_type.clone()
                }
            ))
        }
    }

    pub fn find_variable_on_all_scopes<'a>(variables_scopes: &'a Vec<Vec< Variable>>, variable_name: &str) -> Option<&'a Variable> {
        for variables in variables_scopes.iter().rev() {
            let x = variables
                .iter()
                .find(|&variable| variable.variable_name == variable_name);

            if x.is_some() {
                return Some(x.unwrap());
            }
        }

        None
    }
}









// Impl for check contract data
impl VirtualContract {
    pub fn virtual_metadata_in(&self, check_in: &str) -> Result<&MetadataTypes, InterpreterMessage> {
        match check_in {
            "init" => {
                Ok(&self.metadata.init)
            },
            "handle" => {
                Ok(&self.metadata.handle)
            },
            _ => {
                return Err(InterpreterMessage::Error(
                    VirtualContractErrors::MetadataInContractDoesNotExists { 
                        metadata_variant_inexistent: check_in.to_string() 
                    }
                ))
            }
        }
    }

    pub fn check_message_to_send(&self, message: &EnumVal, where_to_check: &str) -> Result<(), InterpreterMessage> {
        if let Err(error_message) = self.enum_exist(&message.enum_from) {
            return Err(error_message);
        }

        if let Err(error_message) = self.enum_variant_exist(
            (&message.enum_from, &message.val)
        ) {
            return Err(error_message);
        }

        match VirtualContract::get_enum_name_out_metadata(self, where_to_check) {
            Ok(metadata_enum_tmp) => {
                let enum_name = match metadata_enum_tmp {
                    Some(metadata_enum_name) => {
                        metadata_enum_name
                    },
                        // Returns Ok because its valid that the contract does not have 
                        // VirtualContractMetadat, to prevent errors is checked before send the message.
                    _ => return Ok(())
                };

                if *enum_name != message.enum_from {
                    return Err(InterpreterMessage::Error(
                        VirtualContractErrors::MessageToSendDontHaveCorrectEnum { 
                            enum_of_message_received: message.enum_from.clone(), 
                            expected_enum: enum_name.clone()
                        }
                    ))
                }
            },
            Err(error_message) => return Err(error_message)
        }

        Ok(())
    }

    pub fn check_received_message(&self, message: &EnumVal, where_to_check: &str) -> Result<(), InterpreterMessage> {
        if let Err(error_message) = self.enum_exist(&message.enum_from) {
            return Err(error_message);
        }

        if let Err(error_message) = self.enum_variant_exist(
            (&message.enum_from, &message.val)
        ) {
            return Err(error_message);
        }

        match VirtualContract::get_enum_name_in_metadata(self, where_to_check) {
            Ok(metadata_enum_tmp) => {
                let enum_name = match metadata_enum_tmp {
                    Some(metadata_enum_name) => {
                        metadata_enum_name
                    },
                    _ => {
                        // Returns Ok because its valid that the contract does not have 
                        // VirtualContractMetadat.
                        return Ok(());
                    }
                };

                if *enum_name != message.enum_from {
                    return Err(InterpreterMessage::Error(
                        VirtualContractErrors::MessageReceivedDontHaveCorrectEnum { 
                            enum_of_message_received: message.enum_from.clone(), 
                            expected_enum: enum_name.clone()
                        }
                    ))
                }
            },
            Err(error_message) => return Err(error_message)
        }

        Ok(())
    }

    pub fn check_contract_metadata(&self) -> Result<(), InterpreterMessage> {
        // 1.- Check VirtualContractMetadat to see if theirs enums exists.

        if let Err(message) = self.check_metadata_variant(&self.metadata.init) {
            return Err(message);
        }

        if let Err(message) = self.check_metadata_variant(&self.metadata.handle) {
            return Err(message);
        }

        // 2.- Check if state enum exists
        if self.state.is_some() {
            if let Err(message) = self.enum_exist(&self.state.as_ref().unwrap().0) {
                return Err(message);
            }
        }

        Ok(())
    }

    fn check_metadata_variant(&self, metadata_variant: &MetadataTypes) -> Result<(), InterpreterMessage> {
        match metadata_variant {
            MetadataTypes::In(in_enum) => {
                if let Err(message) =  self.enum_exist(&in_enum) {
                    return Err(message);
                }
            },
            MetadataTypes::Out(out_enum) => {
                if let Err(message) =  self.enum_exist(&out_enum) {
                    return Err(message);
                }
            },
            MetadataTypes::InOut(in_enum, out_enum) => {
                if let Err(message) =  self.enum_exist(&in_enum) {
                    return Err(message);
                }
                
                if let Err(message) =  self.enum_exist(&out_enum) {
                    return Err(message);
                }
            },
            _ => {}
        }

        Ok(())
    }

    fn struct_exist(&self, struct_name: &StructName) -> Result<(), InterpreterMessage> {
        if !self.structs.contains_key(struct_name) {
            Err(InterpreterMessage::Error(
                VirtualContractErrors::ContractDontHaveStruct(
                    struct_name.clone()
                )
            ))
        } else {
            Ok(())
        }
    }

    fn struct_attribute_exists(&self, struct_name: &str, struct_attribute: &str) -> Result<(), InterpreterMessage> {
        let Some(struct_data) = self.structs.get(struct_name) else {
            return Ok(());
        };

        let has_attribute = struct_data.attributes.contains_key(struct_attribute);

        if !has_attribute {
            return Err(InterpreterMessage::Error(
                VirtualContractErrors::AttributeNotExistsInStruct { 
                    struct_name: struct_name.to_string(), 
                    attribute: struct_attribute.to_string() 
                }
            ))
        }

        Ok(())
    }

    fn struct_attribute_eq_to(&self, struct_name: &str, struct_attribute_name: &str, type_to_compare: VirtualContractTypes, error_message: &str) -> Result<(), InterpreterMessage> {
        match self.struct_attribute_is_of_type(struct_name, struct_attribute_name, type_to_compare) {
            Ok(type_is_correct) => {
                if !type_is_correct {
                    return Err(InterpreterMessage::Error(
                        VirtualContractErrors::CantChangeStateAttribute { 
                            reason: error_message.to_string(),
                            struct_state: struct_name.to_string(), 
                            struct_attribute: struct_attribute_name.to_string() 
                        }
                    ));
                }
            },
            Err(error_message) => {
                return Err(error_message);
            }
        }

        Ok(())
    }

    fn struct_attribute_is_of_type(&self, struct_name: &str, struct_attribute_name: &str, type_to_compare: VirtualContractTypes) -> Result<bool, InterpreterMessage> {
        if let Err(error_message) = self.struct_attribute_exists(struct_name, struct_attribute_name) {
            return Err(error_message);
        }

        // we can access the data, because we check before struct data
        let struct_data = self.structs
            .get(struct_name)
            .unwrap();

        let struct_attribute = struct_data.attributes
            .get(struct_attribute_name)
            .unwrap();

        Ok(struct_attribute.attribute_type == type_to_compare)
    }

    fn enum_exist(&self, variant: &EnumName) -> Result<(), InterpreterMessage> {
        if !self.enums.contains_key(variant) {
            Err(InterpreterMessage::Error(
                VirtualContractErrors::ContractDontHaveEnum(
                    variant.clone()
                )
            ))
        } else {
            Ok(())
        }
    }

    fn enum_variant_exist(&self, variant: (&EnumName, &EnumNameVariant)) -> Result<(), InterpreterMessage> {
        let Some(enum_data) = self.enums.get(variant.0) else {
            return Err(InterpreterMessage::Error(
                VirtualContractErrors::ContractDontHaveEnum(
                    variant.0.clone()
                )
            ));
        };

        let variant_exists = enum_data.variants
            .iter()
            .find(|&enum_variant| enum_variant == variant.1)
            .is_some();

        if !variant_exists {
            return Err(InterpreterMessage::Error(
                VirtualContractErrors::VariantNotExistsInEnum { 
                    enum_name: variant.0.clone(), 
                    variant: variant.1.clone() 
                }
            ));
        }

        Ok(())
    }
}









// Impl for logic in the virtual contract
impl VirtualContract {
    pub fn handle_message(&mut self, message: EnumVal, address_to_reply: ActorId) -> Result<(InterpreterMessage, Vec<MessageToSend>), InterpreterMessage> {
        // With this check, we are sure that the reveived message is correct.

        let codeblock_from = if self.initialized {
            "handle"
        } else {
            "init"
        };

        // [TODO]:
        // Poner por default automaticamente el struct del estado 
        // Del contrato, por si el usuario modifica datos en el init
        // Si no lo hace, se quedan con los datos por default.

        let can_process_message  = match VirtualContract::get_enum_name_in_metadata(self, codeblock_from) {
            Ok(enum_name_option) => {
                if let None = enum_name_option {
                    false
                } else {
                    true
                }
            },
            Err(error_message) => return Err(error_message)
        };

        let can_send_message = match VirtualContract::get_enum_name_out_metadata(self, codeblock_from) {
            Ok(enum_name_option) => {
                if let None = enum_name_option {
                    false
                } else {
                    true
                }
            },
            Err(error_message) => return Err(error_message)
        };

        if let Err(message_error) = self.check_received_message(&message, codeblock_from) {
            return Err(message_error);
        }


        let mut scopes = Vec::new();
        let mut variables_scopes: Vec<Vec<Variable>> = Vec::new();
        let mut messages_to_send = Vec::new();
        let mut reply_already_send = false;

        let mut virtual_contract_state = self.state.clone();
        let mut state_change = false;

        let code_block = if !self.initialized {
            if let Err(error_message) = VirtualContract::init_contract_state(self) {
                return Err(error_message);
            }

            &self.init_code
        } else {
            &self.handle_code
        };

        scopes.push(code_block.iter());

        while !scopes.is_empty() {
            let scopes_len = scopes.len();
            let code_block = scopes.last_mut().unwrap();
            let mut find_other_code_block = false;
            let mut iterator_of_other_code_block = None;

            for block in code_block {
                match block {
                    // Manage of the block of state change
                    CodeBlock::ModifyState(attribute_to_modify) => {

                        state_change = true;

                        // Obtain the name of the struct state of the contract, if its None, we cant
                        // change the state.
                        let state_struct_name = match self.contract_state_name() {
                                Some(contract_state_name) => contract_state_name,
                                None => return Err(InterpreterMessage::Error(
                                        VirtualContractErrors::ContractDontHaveState
                                    ))
                            };

                        // Obtain the attribute name to modify
                        let state_attribute_to_modify = attribute_to_modify
                            .attribute_name();

                        // // check if the attribute to change exists, if not, finish the program and
                        // if let Err(error_message) = self.struct_attribute_exists(state_struct_name, state_attribute_to_modify) {
                        //     return Err(error_message);
                        // }

                        
                        match attribute_to_modify {
                            StateAttributeToModify::Vec { 
                                action ,
                                ..
                            } => {
                                if let Err(error_message) = self.struct_attribute_eq_to(
                                    state_struct_name, 
                                    state_attribute_to_modify, 
                                    VirtualContractTypes::Vec,
                                    "Cant change state attribute, expected type: Vec"
                                ) {
                                    return Err(error_message);
                                }



                            },
                            StateAttributeToModify::String { 
                                action ,
                                ..
                            } => {
                                if let Err(error_message) = self.struct_attribute_eq_to(
                                    state_struct_name, 
                                    state_attribute_to_modify, 
                                    VirtualContractTypes::String,
                                    "Cant change state attribute, expected type: String"
                                ) {
                                    return Err(error_message);
                                }

                                
                                if let Err(error_message) = VirtualContract::modify_string_state_attribute(
                                    VirtualContract::struct_contract_from_state(&mut virtual_contract_state), 
                                    state_attribute_to_modify,
                                    action
                                ) {
                                    return Err(error_message);
                                }
                            },
                            StateAttributeToModify::INum { 
                                action,
                                ..
                            } => {
                                if let Err(error_message) = self.struct_attribute_eq_to(
                                    state_struct_name, 
                                    state_attribute_to_modify, 
                                    VirtualContractTypes::INum,
                                    "Cant change state attribute, expected type: INum"
                                ) {
                                    return Err(error_message);
                                }
                            },
                            StateAttributeToModify::UNum { 
                                action,
                                .. 
                            } => {
                                if let Err(error_message) = self.struct_attribute_eq_to(
                                    state_struct_name, 
                                    state_attribute_to_modify, 
                                    VirtualContractTypes::UNum,
                                    "Cant change state attribute, expected type: UNum"
                                ) {
                                    return Err(error_message);
                                }
                            },
                            StateAttributeToModify::Enum { 
                                variant,
                                ..
                            } => {
                                if let Err(error_message) = self.struct_attribute_eq_to(
                                    state_struct_name, 
                                    state_attribute_to_modify, 
                                    VirtualContractTypes::Enum,
                                    "Cant change state attribute, expected type: Enum"
                                ) {
                                    return Err(error_message);
                                }
                            }
                        }
                    },
                    CodeBlock::ControlFlow(control_flow) => {
                        match control_flow {
                            ControlFlow::If { 
                                boolean_expresion, 
                                code_block 
                            } => {

                            },
                            ControlFlow::For {
                                expression,
                                code_block
                            } => {

                            },
                            ControlFlow::Match { 
                                variable_to_match, 
                                enum_to_match, 
                                code_block 
                            } => {
                                let Some(variable) = VirtualContract::find_variable_on_all_scopes(
                                    &variables_scopes, 
                                    &variable_to_match
                                ) else {
                                    return Err(InterpreterMessage::Error(
                                        VirtualContractErrors::VariableDoesNotExixts { 
                                            variable_name: variable_to_match.clone()
                                        }
                                    ));
                                };

                                let match_arm_code_block = match self.get_codeblock_from_match(
                                    code_block, 
                                    enum_to_match,
                                    variable_to_match,
                                    variable
                                ) {
                                    Ok(code_block) => code_block,
                                    Err(error_message) => return Err(error_message)
                                };

                                iterator_of_other_code_block = Some(match_arm_code_block.iter());
                                find_other_code_block = true;

                                break;
                            },
                            ControlFlow::IfElse { 
                                boolean_expresion, 
                                if_code_block, 
                                else_code_block 
                            } => {

                            }
                        }
                    }, 
                    CodeBlock::Variable(variable) => {

                        if let Err(error_message) = self.check_variable(variable) {
                            return Err(error_message);
                        }

                        VirtualContract::add_variable_to_list(
                            &mut variables_scopes, 
                            scopes_len, 
                            variable.clone()
                        );

                    },
                    CodeBlock::Assignment { 
                        assignment, 
                        scope 
                    } => {

                    },
                    CodeBlock::LoadMessage(variable) => {

                        if !can_process_message {
                            let message = format!("{} - In", codeblock_from);
                            return Err(InterpreterMessage::Error(
                                VirtualContractErrors::CantProcessMessageNoEnumIn(message)
                            ));
                        }

                        let mut variable_to_storage = variable.clone();

                        variable_to_storage.var_value = VirtualContractTypesVal::EnumVal(
                            EnumVal {
                                enum_from: message.enum_from.clone(),
                                val: message.val.clone()
                            }
                        );

                        if let Err(error_message) = self.check_variable(&variable_to_storage) {
                            return Err(error_message);
                        }

                        VirtualContract::add_variable_to_list(
                            &mut variables_scopes, 
                            scopes_len, 
                            variable_to_storage
                        );

                    },
                    CodeBlock::SendMessage { 
                        message,
                        to 
                    } => {

                        if !can_send_message {
                            let message = format!("{} - Out", codeblock_from);
                            return Err(InterpreterMessage::Error(
                                VirtualContractErrors::CantSendMessageNoEnumIn(message)
                            ));
                        }

                        if let Err(error_message) = self.check_message_to_send(
                            message, 
                            codeblock_from
                        ) {
                            return Err(error_message);
                        }

                        messages_to_send.push(
                            MessageToSend {
                                to: to.clone(),
                                message: message.clone(),
                                message_type_to_send: MessageTypeToSend::Send
                            }
                        );
                    },
                    CodeBlock::SendReply { 
                        message 
                    } => {
                        if reply_already_send {
                            return Err(InterpreterMessage::Error(
                                VirtualContractErrors::ReplyMessageAlreadySend
                            ))
                        }

                        if let Err(error_message) = self.check_message_to_send(
                            message, 
                            codeblock_from
                        ) {
                            return Err(error_message);
                        }

                        messages_to_send.push(
                            MessageToSend {
                                to: address_to_reply,
                                message: message.clone(),
                                message_type_to_send: MessageTypeToSend::Send
                            }
                        );

                        reply_already_send = true;

                    },
                    CodeBlock::Return(return_type) => {
                        // Mejorar el tema del return
                    }
                }
            }

            if find_other_code_block {
                scopes.push(iterator_of_other_code_block.unwrap());
                // iterator_of_other_code_block = None;
                // find_other_code_block = false;
                continue;
            }

            if scopes.len() == variables_scopes.len() {
                // Delete variables stored in the current scope
                variables_scopes.pop();
            }

            // This delete last scope, and pass to the
            // last scope.
            scopes.pop();
        }


        for message in messages_to_send.iter() {
            if let MessageTypeToSend::Reply = message.message_type_to_send {
                VirtualContract::send_message_reply(message.message.clone());
            } else {
                VirtualContract::send_message_to(message.to.clone(), message.message.clone());
            }
        }

        if !self.initialized {
            self.initialized = true;
        }

        if state_change {
            self.state = virtual_contract_state;
        }

        Ok((InterpreterMessage::MessageProcessed, messages_to_send))
    }


    
    // [TODO]: 
    // pub fn execute_codeblock(&self, code_block: &Vec<CodeBlock>) {

    // }    

    pub fn get_codeblock_from_match<'a>(&'a self, code_block: &'a Vec<Vec<CodeBlock>>, enum_for_match: &str, variable_to_match: &str, variable: &Variable) -> Result<&'a Vec<CodeBlock>, InterpreterMessage> {
        // 1. get data from variable and Check if variable was spected for match
        let enum_data = match VirtualContract::enum_data_from_variable(variable) {
            Ok(val) => val,
            Err(error_message) => return Err(error_message)
        };

        if *variable_to_match != variable.variable_name {
            return Err(InterpreterMessage::Error(
                VirtualContractErrors::VariableDontFitInMatch { 
                    variable_name: variable.variable_name.clone(), 
                    expected_variable: variable_to_match.to_string()
                }
            ))
        }

        // 2. compare enum names.
        if *enum_for_match != enum_data.enum_from {
            return Err(InterpreterMessage::Error(
                VirtualContractErrors::VariableEnumIsNotTheSameForMatch { 
                    variable_name: variable.variable_name.clone(), 
                    variable_enum: enum_data.enum_from.clone(), 
                    match_enum: enum_for_match.to_string() 
                }
            ))
        }

        // 3. check if enum exists in virtual contract
        if let Err(error_message) = self.enum_exist(&enum_for_match.to_string()) {
            return Err(error_message);
        }

        // 4. check if the variant in the variable exists in the contract enum.
        if let Err(message_error) = self.enum_variant_exist((&enum_data.enum_from, &enum_data.val)) {
            return Err(message_error);
        }

        // 5. get the enum from contract to handle match
        let contract_enum = self.enums.get(enum_for_match).unwrap();

        // 6. Check if match handle all variants for enum
        if contract_enum.variants.len() != code_block.len() {
            return Err(InterpreterMessage::Error(
                VirtualContractErrors::MatchDoesNotHaveAllCases(enum_for_match.to_string())
            ));
        }

        // Find the arm that match the variable, we can unwrap it 
        // because we check the enum and enum variant before.
        let (_, arm_code_block) = code_block
            .iter()
            .enumerate()
            .find(|(index, _)| {
                contract_enum.variants[*index] == enum_data.val
            })
            .unwrap();

        Ok(arm_code_block)
    }

    pub fn check_variable(&self, variable: &Variable) -> Result<(), InterpreterMessage> {
        if !variable.types_are_correct() {
            return Err(InterpreterMessage::Error(
                VirtualContractErrors::VariableHasWrongTypes { 
                    variable_name: variable.variable_name.clone() 
                }
            ))
        }

        if variable.variable_name == "" {
            return Err(InterpreterMessage::Error(
                VirtualContractErrors::VariableDoesNotHaveName
            ));
        }

        if let VirtualContractTypes::Enum = variable.var_type {
            let VirtualContractTypesVal::EnumVal(EnumVal { enum_from, val }) = &variable.var_value else {
                return Err(InterpreterMessage::Error(
                    VirtualContractErrors::VariableHasWrongTypes { 
                        variable_name: variable.variable_name.clone() 
                    }
                ))
            };

            if enum_from == "" {
                return Err(InterpreterMessage::Error(
                    VirtualContractErrors::EnumNamenCantBeEmpty
                ));
            }

            if val == "" {
                return Err(InterpreterMessage::Error(
                    VirtualContractErrors::EnumVariantNameCantBeEmpty
                ));
            }
 
            if let Err(error_message) = self.enum_variant_exist((enum_from, val)) {
                return Err(error_message);
            }
        }

        Ok(())
    }

    fn create_intance_of_struct(&self, struct_name: &StructName) -> Result<ContractStruct, InterpreterMessage> {
        if let Err(error_message) = self.struct_exist(struct_name) {
            return Err(error_message);
        }

        let new_struct = self.structs.get(struct_name)
            .unwrap()
            .clone();

        Ok(new_struct)
    }

    pub fn avr(attribute: &mut StructAttribute) {

    }

    fn contract_state_name(&self) -> Option<&str> {
        if self.state.is_none() {
            return None;
        }

        let state_name = &self
        .state
        .as_ref()
        .unwrap()
        .0[..];

        Some(state_name)
    }
}




