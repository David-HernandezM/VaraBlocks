use gstd::{prelude::*, ActorId};

pub type Scope = u32;

use super::virtual_contract_enum::{
    EnumName,
    EnumVal
};
use super::virtual_contract_state_handlers::StateAttributeToModify;
use super::virtual_contract_types::VirtualContractTypes;

#[derive(Encode, Decode, TypeInfo, Clone, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum CodeBlock {
    ModifyState(StateAttributeToModify),
    ControlFlow(ControlFlow),
    Variable(Variable),
    Assignment {
        assignment: Assignment,
        scope: Scope
    },
    LoadMessage(Variable),
    SendMessage {
        message: EnumVal,
        to: ActorId
    },
    SendReply {
        message: EnumVal,
    },
    Return(VirtualContractTypes),
    Test(String),
    Test2(Variable),
    test3(ControlFlow),
}


#[derive(Encode, Decode, TypeInfo, Clone, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum BooleanExpressionTypes {
    Equal, 
    NotEqual,
    GreaterThan,
    LessThan,
    GreaterThanEqual,
    LessThanEqual
}

#[derive(Encode, Decode, TypeInfo, Clone, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum BooleanExpression {
    Simple {
        first: VirtualContractTypes,
        second: VirtualContractTypes,
        expression_type: BooleanExpressionTypes
    },
    FirstComplex {
        first: Variable,
        second: VirtualContractTypes,
        expression_type: BooleanExpressionTypes
    },
    SecondComplex {
        first: VirtualContractTypes,
        second: Variable,
        expression_type: BooleanExpressionTypes
    },
    Complex {
        first: Variable,
        second: Variable,
        expression_type: BooleanExpressionTypes
    },
    // ComplexExpression {
    //     first: Box<BooleanExpression>,
    //     second: Box<BooleanExpression>,
    //     expression_type: BooleanExpressionTypes
    // }
}

#[derive(Encode, Decode, TypeInfo, Clone, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum ControlFlow {
    If {
        boolean_expresion: BooleanExpression, 
        code_block: Vec<CodeBlock>
    },
    For {
        expression: String, 
        code_block: Vec<CodeBlock>
    },
    Match {
        variable_to_match: String,
        enum_to_match: EnumName, 
        code_block: Vec<Vec<CodeBlock>>
    },
    IfElse {
        boolean_expresion: BooleanExpression, 
        if_code_block: Vec<CodeBlock>, 
        else_code_block: Vec<CodeBlock>
    }
}


#[derive(Encode, Decode, TypeInfo, Clone, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum AssignmentType {
    Add(VirtualContractTypes),
    Subtract(VirtualContractTypes),
    Multiply(VirtualContractTypes),
    Divide(VirtualContractTypes),
    Module(VirtualContractTypes),
    NewValue(VirtualContractTypes)
}

#[derive(Encode, Decode, TypeInfo, Clone, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct Assignment {
    pub variable_name: String,
    pub assignment_type: VirtualContractTypes,
    pub assign: AssignmentType
}

#[derive(Encode, Decode, TypeInfo, Clone, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct Variable {
    pub variable_name: String,
    pub is_mutable: bool,
    pub var_value: VirtualContractTypes,
    pub var_type: VirtualContractTypes,
    pub is_parameter: bool
}

impl Variable {
    pub fn types_are_correct(&self) -> bool {
        let var_value = &self.var_value;
        match self.var_type {
            VirtualContractTypes::Enum => {
                if let VirtualContractTypes::EnumVal(_) = var_value {
                    return true;
                }
            },
            VirtualContractTypes::INum => {
                if let VirtualContractTypes::INumVal(_) = var_value {
                    return true;
                }
            },
            VirtualContractTypes::UNum => {
                if let VirtualContractTypes::INumVal(_) = var_value {
                    return true;
                }
            },
            VirtualContractTypes::String => {
                if let VirtualContractTypes::StringVal(_) = var_value {
                    return true;
                }
            },
            VirtualContractTypes::Boolean => {
                if let VirtualContractTypes::BooleanVal(_) = var_value {
                    return true;
                }
            },
            _ => {}
        }

        return false;
    }

    pub fn variable_type_is_enum(&self) -> bool {
        if let VirtualContractTypes::Enum = self.var_type {
            true
        } else {
            false
        }
    } 
}

#[derive(Debug)]
pub struct Function {
    pub function_name: String,
    pub parameters: Vec<Variable>,
    pub return_type: VirtualContractTypes,
    pub body: Vec<CodeBlock>
}
