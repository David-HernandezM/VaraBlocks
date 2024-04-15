use gstd::{prelude::*, ActorId};

pub type Scope = u32;
use super::contract_enum::{
    EnumName,
    EnumVal
};
use super::contract_types::Types;

pub enum CodeBlock {
    ModifyState(),
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
    Return(Types)
}


pub enum BooleanExpressionTypes {
    Equal, 
    NotEqual,
    GreaterThan,
    LessThan,
    GreaterThanEqual,
    LessThanEqual
}


pub enum BooleanExpression {
    Simple {
        first: Types,
        second: Types,
        expression_type: BooleanExpressionTypes
    },
    FirstComplex {
        first: Variable,
        second: Types,
        expression_type: BooleanExpressionTypes
    },
    SecondComplex {
        first: Types,
        second: Variable,
        expression_type: BooleanExpressionTypes
    },
    Complex {
        first: Variable,
        second: Variable,
        expression_type: BooleanExpressionTypes
    },
    ComplexExpression {
        first: Box<BooleanExpression>,
        second: Box<BooleanExpression>,
        expression_type: BooleanExpressionTypes
    }
}

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


pub enum AssignmentType {
    Add(Types),
    Subtract(Types),
    Multiply(Types),
    Divide(Types),
    Module(Types),
    NewValue(Types)
}

pub struct Assignment {
    pub variable_name: String,
    pub assignment_type: Types,
    pub assign: AssignmentType
}

#[derive(Clone)]
pub struct Variable {
    pub variable_name: String,
    pub is_mutable: bool,
    pub var_value: Types,
    pub var_type: Types,
    pub is_parameter: bool
}

impl Variable {
    pub fn types_are_correct(&self) -> bool {
        let var_value = &self.var_value;
        match self.var_type {
            Types::Enum => {
                if let Types::EnumVal(_) = var_value {
                    return true;
                }
            },
            Types::INum => {
                if let Types::INumVal(_) = var_value {
                    return true;
                }
            },
            Types::UNum => {
                if let Types::INumVal(_) = var_value {
                    return true;
                }
            },
            Types::String => {
                if let Types::StringVal(_) = var_value {
                    return true;
                }
            },
            Types::Boolean => {
                if let Types::BooleanVal(_) = var_value {
                    return true;
                }
            },
            _ => {}
        }

        return false;
    }

    pub fn variable_type_is_enum(&self) -> bool {
        if let Types::Enum = self.var_type {
            true
        } else {
            false
        }
    } 
}

pub struct Function {
    pub function_name: String,
    pub parameters: Vec<Variable>,
    pub return_type: Types,
    pub body: Vec<CodeBlock>
}
