import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { 
    addAttributeToStruct, 
    editStructTitle, 
    editStructAttributeName,
    editStructAttributeType,
    removeAttributeFromStruct, 
    removeStructOfContract
} from "@/app/SliceReducers";
import { Button } from "@/components/ui/button";
import { VirtualContractTypes } from "@/app/app_types/types";
import { DeleteButton } from "@/components/DeleteButton/DeleteButton";
import { generatePassword } from "@/app/utils";
import './VirtualContractStruct.scss';

interface VirtualContractStructProps {
    structId: string
}

// [TODO]: modify struct attribute when value is an enum.

export function VirtualContractStruct({ structId }: VirtualContractStructProps) {
    const structsData = useAppSelector((state) => state.VaraBlocksData.structs);
    const dispatch = useAppDispatch();

    return (
        <div className="virtualcontractstruct">
            <div className="virtualcontractstruct__title-container">
                <label 
                    htmlFor={structId}
                    className="virtualcontractstruct__label-title"
                >
                    Struct:
                </label>
                <input 
                    type="text" 
                    name={structId}
                    id={structId}
                    className="virtualcontractstruct__input-struct-name"
                    onChange={(e) => {
                        dispatch(editStructTitle({
                            structId,
                            newTitle: e.target.value
                        }));
                    }}
                    value={structsData[structId].structName}
                    placeholder="StructName"
                    autoComplete="off"
                    required
                />
            </div>
            <div className="virtualcontractstruct__attributes-struct">
                {
                    Object.keys(structsData[structId].attributes).map((structAttributeId) => 
                        <ContractStructAttribute structId={structId} structAttributeId={structAttributeId} key={structAttributeId}/>
                    )
                }
            </div>
            <div className="virtualcontractstruct__congif-buttons">
                <Button size={"small"} textSize={"medium"} textWeight={"weightBold"} rounded={"rounded4"} width={"normal"} onClick={() => {
                    dispatch(addAttributeToStruct({
                        structId,
                        attributeId: generatePassword()
                    }));
                }}>
                    add attribute
                </Button>
                <Button size={"small"} textSize={"medium"} textWeight={"weightBold"}     rounded={"rounded4"} width={"normal"} onClick={() => {
                    dispatch(removeStructOfContract(structId));
                }}>
                    delete struct
                </Button>
            </div>
        </div>
    );
}

interface ContractStructAttributeProps {
    structId: string,
    structAttributeId: string,
}

function ContractStructAttribute({ structId, structAttributeId }: ContractStructAttributeProps) {
    const structsData = useAppSelector((state) => state.VaraBlocksData.structs);
    const dispatch = useAppDispatch();    

    const getSelectOption = (typeToCompare: VirtualContractTypes): string => {
        const structAttributeString = Object.keys(typeToCompare)[0];
        
        switch (structAttributeString) {
            case 'Vec':
                return 'vec';
            case 'ActorId':
                return 'actorid';
            case 'Text':
                return 'string';
            case 'INum':
                return 'inum';
            case 'UNum':
                return 'unum';
            case 'Boolean': 
                return 'bool';
            default:
                return 'nadota';
        }
    };

    const selectOptionToContractType = (selection: string): VirtualContractTypes => {
        switch (selection) {
            case 'vec':
                return { Vec: null };
            case 'actorid':
                return { ActorId: null };
            case 'string':
                return { Text: null };
            case 'inum':
                return { INum: null };
            case 'unum':
                return { UNum: null };
            case 'bool':
                return { Boolean: null };
            default:
                return { NoValue: null };
        }
    };

    return (
        <div className="virtualcontractstruct__struct-attribute" key={structAttributeId}>
            <label htmlFor={structAttributeId}>Attribute: </label>
            <input 
                type="text" 
                name={structAttributeId} 
                id={structAttributeId}
                className="virtualcontractstruct__input-struct-name virtualcontractstruct__input-struct-name--short"
                onChange={(e) => {
                    dispatch(editStructAttributeName({
                        structId,
                        attributeId: structAttributeId,
                        attributeName: e.target.value
                    }));
                }}
                placeholder="AttributeName"
                value={structsData[structId].attributes[structAttributeId].attributeName}
            />
            <p>Type: </p>
            <select 
                name="testselect" 
                id="testselect"
                onChange={(e) => {
                    dispatch(editStructAttributeType({
                        structId,
                        attributeId: structAttributeId,
                        newType: selectOptionToContractType(e.target.value)
                    }))
                }}
                className="virtualcontractstruct__struct-attribute-type"
                value={
                    getSelectOption(structsData[structId].attributes[structAttributeId].attributeType)
                }
            >
                <option value="actorid" >ActorId</option>
                <option value="string">String</option>
                <option value="vec">Vec</option>
                <option value="inum">INum</option>
                <option value="unum">UNum</option>
                <option value="bool">Boolean</option>
            </select>
            <DeleteButton 
                onClickHandler={
                    () =>  dispatch(removeAttributeFromStruct({
                                structId,
                                attributeId: structAttributeId
                            }))
                }
            />
        </div>
    )
}



