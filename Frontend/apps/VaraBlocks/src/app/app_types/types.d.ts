// [TODO]: Agregar todos los tipos faltantes

import { HexString } from "@gear-js/api";

export type EnumName = string;
export type EnumNameVariant = string;
export type StructName = string;
export type StructAttributeName = string;



export type Result<T, E = Error> =
    { ok: true; value: T } |
    { ok: false; error: E };




export type MetadataTypes =
    { In: [EnumName] } |
    { Out: [EnumName] } |
    { InOut: [EnumName, EnumName] } |
    { NoValue: null };

export interface VirtualContractMetadata {
    init: MetadataTypes,
    handle: MetadataTypes
}

export type VirtualContractStateType = [EnumName, ContractStruct | null] | null;

export interface VirtualContractDataToSend {
    metadata: VirtualContractMetadata,
    state: VirtualContractStateType,
    initCode: CodeBlock[],
    handleCode: CodeBlock[],
    enums: [EnumName, ContractEnum][],
    structs: [StructName, ContractStruct][]
}

export interface VirtualContractState {
    metadata: VirtualContractMetadata,
    initialized: boolean,
    state: [EnumName, ContractStruct | null] | null,
    enums: [EnumName, ContractEnum][],
    structs: [StructName, ContractStruct][],
    menssagesSend: [`0x${string}`, UsersMessages][]
}

export interface UsersMessages {
    lastMessageSend: [EnumName, EnumNameVariant] | null,
    lastMessages: [EnumName, EnumNameVariant][]
}




interface StructAttributeI {
    [key: string]: StructAttribute
}

export interface ContractStructInterface {
    structName: StructName,
    attributes: StructAttributeI
}

export interface ContractStruct {
    structName: StructName,
    attributes: StructAttribute[]
}

export interface StructAttribute {
    attributeName: StructAttributeName,
    attributeType: VirtualContractTypes,
    attributeVal: VirtualContractTypesVal
}

export interface StructStringFormat {
    structName: string,
    attributes: {
        attributeName: string,
        attributeType: string,
        attributeVal: string[]
    }[]
}






interface EnumVariantI {
    [key: string]: string
}

export interface ContractEnumInterface {
    enumName: EnumName,
    enumType: ContractEnumType,
    variants: EnumVariantI
}


export interface EnumVal {
    enumFrom: EnumName,
    val: string
}

export interface ContractEnum {
    enumName: EnumName,
    enumType: ContractEnumType,
    variants: string[]
}

export type ContractEnumType =
    { ContractInitActions: null } |
    { ContractInitEvents: null } |
    { ContractActions: null } |
    { ContractEvents: null } |
    { ContractStateActions: null } |
    { ContractStateEvents: null } |
    { ContractEnum: null };






export type BlockType = 'variable' | 'match' | 'matcharm' | 'loadmessage' | 'sendmessage' | 'replymessage' | 'empty';

// [TODO]: Agregar valores faltantes
export type CodeBlock = 
    { ControlFlow: ControlFlow } |
    { Variable: Variable } |
    { VariableI: { data: Variable, variableInInit: boolean } } |
    { LoadMessage: Variable } |
    { LoadMessageI: { data: Variable, loadInInit: boolean } } |
    { SendMessage: SendMessage } |
    { SendMessageI: { data: SendMessage, sendMessageInInit: boolean } } |
    { SendReply: SendReply } |
    { SendReplyI: { data: SendReply, sendReplyInInit: boolean } };


// [TODO]: Agregar valores faltantes
export type ControlFlow = 
    { Match: Match } | 
    { Match: { data: Match, matchArmsIds: string[], matchInInit: boolean } };

// [TODO]: Agregar valores faltantes
export type VirtualContractVecTypes = 
    { VecActorId: `0x${string}`[] } |
    { VecString: string[] } |
    { VecInt: number[] } |
    { VecNum: number[] } |
    { VecEnum: EnumVal[] };

export type VirtualContractTypes = 
    { Vec: null } |
    { ActorId: null } |
    { NoValue: null } |
    { ReceivedMessage: null } |
    { Enum: null } |
    { INum: null } |
    { UNum: null } |
    { Text: null } |
    { Boolean: null } |
    { UnitValue: null };

export type VirtualContractTypesVal = 
    { VecVal: VirtualContractVecTypes } |
    { ActorIdVal: `0x${string}` } |
    { INumVal: number } |
    { UNumVal: number } |
    { TextVal: string } |
    { BooleanVal: boolean } |
    { EnumVal: EnumVal } |
    { VariableVal: string } |
    { NoValue: null };


export interface Match {
    variableToMatch: string,
    enumToMatch: string,
    codeBlock: CodeBlock[][]
}

export interface Variable {
    variableName: string,
    isMutable: boolean,
    varValue: VirtualContractTypesVal,
    varType: VirtualContractTypes
    isParameter: boolean
}




export interface SendMessage {
    message: EnumVal,
    // to: HexString
    to: string
}

export interface SendReply {
    message: EnumVal
}