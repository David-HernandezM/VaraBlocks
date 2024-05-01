import { useState } from "react";
import { generatePassword } from "@/app/utils";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { 
    removeEnumOfContract, 
    editEnumTitle, 
    editVariantToEnum, 
    addVariantToEnum, 
    removeVariantInEnum 
} from "@/app/SliceReducers";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/DeleteButton/DeleteButton";
import "./VirtualContractEnum.scss";

interface VirtualContractEnumProps {
    enumId: string
}

export function VirtualContractEnum({ enumId }: VirtualContractEnumProps) {
    const enumsData = useAppSelector((state) => state.VaraBlocksData.enums);
    const dispatch = useAppDispatch();

    return (
        <div className="virtualcontractenum">
            <div className="virtualcontractenum__title-container">
                <label 
                    htmlFor={enumId}
                    className="virtualcontractenum__label-title"
                >
                    Enum: 
                </label>
                <input 
                    type="text" 
                    name={enumId} 
                    id={enumId} 
                    className="virtualcontractenum__input-enum-name"
                    onChange={(e) => {
                        dispatch(editEnumTitle({
                            enumId: enumId,
                            newTitle: e.target.value
                        }));
                    }}
                    value={enumsData[enumId].enumName}
                    placeholder="EnumName"
                    autoComplete="off"
                    required
                />
            </div>
            <div className="virtualcontractenum__variants-enum">
                {
                    Object.keys(enumsData[enumId].variants).map((variantKey) => {
                        return (
                            <div className="virtualcontractenum__enum-variant" key={variantKey}>
                                <label htmlFor={variantKey}>Variant: </label>
                                <input 
                                    type="text" 
                                    name={variantKey} 
                                    id={variantKey} 
                                    className="virtualcontractenum__input-enum-name"
                                    onChange={(e) => {
                                        dispatch(editVariantToEnum({
                                            enumId: enumId,
                                            variantId: variantKey,
                                            variantVal: e.target.value
                                        }));
                                    }}
                                    placeholder="VariantName"
                                    value={enumsData[enumId].variants[variantKey]}
                                    required
                                />
                                <DeleteButton 
                                    onClickHandler={
                                        () =>  dispatch(removeVariantInEnum({
                                                    enumId,
                                                    variantId: variantKey
                                                }))
                                    }
                                />
                            </div>
                        );
                    })
                }
            </div>
            <div className="virtualcontractenum__config-buttons">
                <Button size={"small"} textSize={"medium"} textWeight={"weightBold"} rounded={"rounded4"} width={"normal"} onClick={() => {
                    dispatch(addVariantToEnum({
                        enumId,
                        variantId: generatePassword()
                    }));
                }}>
                    add variant
                </Button>
                <Button size={"small"} textSize={"medium"} textWeight={"weightBold"}     rounded={"rounded4"} width={"normal"} onClick={() => {
                    dispatch(removeEnumOfContract(enumId));
                }}>
                    delete enum
                </Button>
            </div>
            
            
        </div>
    );
}