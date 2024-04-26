// [TODO]: Agregar todos los tipos faltantes

export type EnumName = string;
export type EnumNameVariant = string;
export type StructName = string;
export type StructAttributeName = string;

export type MetadataTypes =
    { In: [EnumName] } |
    { Out: [EnumName] } |
    { InOut: [EnumName, EnumName] } |
    { NoValue: null };

export interface VirtualContractMetadata {
    init: MetadataTypes,
    handle: MetadataTypes
}

export interface VirtualContractData {
    metadata: VirtualContractMetadata,
    state: [EnumName, ContractStruct | null] | null,
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






export interface ContractStruct {
    structName: StructName,
    attributes: StructAttribute[]
}

export interface StructAttribute {
    attributeName: StructAttributeName,
    attributeType: VirtualContractTypes,
    attributeVal: VirtualContractTypes
}









export interface EnumVal {
    enumFrom: EnumName,
    val: string
}

interface EnumVariant {
    [key: string]: string
}

export interface ContractEnum {
    enumName: EnumName,
    enumType: ContractEnumType,
    variants: EnumVariant
}

export type ContractEnumType =
    { ContractInitActions: null } |
    { ContractInitEvents: null } |
    { ContractActions: null } |
    { ContractEvents: null } |
    { ContractStateActions: null } |
    { ContractStateEvents: null } |
    { ContractEnum: null };








// [TODO]: Agregar valores faltantes
export type CodeBlock = 
    { ControlFlow: ControlFlow } |
    { Variable: Variable } |
    { LoadMessage: Variable } |
    { SendMessage: SendMessage } |
    { SendReply: SendReply };


// [TODO]: Agregar valores faltantes
export type ControlFlow = 
    { Match: Match };    

// [TODO]: Agregar valores faltantes
export type VirtualContractVecTypes = 
    { VecActorId: `0x${string}`[] } |
    { VecString: string[] } |
    { VecInt: number[] } |
    { VecNum: number[] } |
    { VecEnum: EnumVal[] };

export type VirtualContractTypes = 
    { VecVal: VirtualContractVecTypes } |
    { ActorIdVal: `0x${string}` } |
    { INumVal: number } |
    { UNumVal: number } |
    { TextVal: string } |
    { BooleanVal: boolean } |
    { EnumVal: EnumVal } |
    { VariableVal: string } |
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
 


export interface Match {
    variableToMatch: string,
    enumToMatch: string,
    codeBlock: CodeBlock[][]
}

export interface Variable {
    variableName: string,
    isMutable: boolean,
    varValue: VirtualContractTypes,
    varType: VirtualContractTypes
    isParameter: boolean
}




export interface SendMessage {
    message: EnumVal,
    to: `0x${string}`
}

export interface SendReply {
    message: EnumVal
}