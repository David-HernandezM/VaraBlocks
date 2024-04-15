export interface VirtualContractType {
 x: string   
}

export type VirtualContractType2 = 
    { INumVal: number } |
    { UNumVal: number }; 

export interface Variable {
    variableName: string,
    isMutable: boolean,
    varValue: VirtualContractType2
}