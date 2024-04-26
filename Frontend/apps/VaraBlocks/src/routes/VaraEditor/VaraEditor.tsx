import { useState } from "react";
import { VirtualContractEnum } from "@/components";
import { generatePassword } from "@/app/utils"; 
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { addEnumToContract } from "@/app/SliceReducers";
import { Button } from "@/components/ui/button";
import "./VaraEditor.scss";

export default function VaraEditor() {
    const enumsData = useAppSelector((state) => state.VaraBlocksData.enums);
    const dispatch = useAppDispatch();
    const [structsEditorOpen, setStructsEditorOpen] = useState(false);
    const [enumsEditorOpen, setEnumsEditorOpen] = useState(false);
    const [contractEditorOpen, setContractEditorOpen] = useState(true);

    const configEditionButtonsPressed = (btn1: boolean, btn2: boolean, btn3: boolean) => {
        setContractEditorOpen(btn1);
        setStructsEditorOpen(btn2);
        setEnumsEditorOpen(btn3);
    }

    return (
        <div className="varaeditor">
            <ul className="varaeditor__edition-options">
                <li 
                    className={contractEditorOpen ? "varaeditor__edition-options--selected" : ""}
                    onClick={() => configEditionButtonsPressed(true, false, false)}
                >
                    Contract editor
                </li>
                <li 
                    className={structsEditorOpen ? "varaeditor__edition-options--selected" : ""}
                    onClick={() => configEditionButtonsPressed(false, true, false)}
                > 
                    Structs editor
                </li>
                <li 
                    className={enumsEditorOpen ? "varaeditor__edition-options--selected" : ""}
                    onClick={() => configEditionButtonsPressed(false, false, true)}
                >
                    Enums editor
                </li>
            </ul>
            <div className="varaeditor__container">
                {
                    contractEditorOpen && 
                    <div className="varaeditor__contract-editor">\
                        <div className="varaeditor__contract-editor-logic">

                        </div>
                        <div className="varaeditor__contract-editor-data">

                        </div>
                    </div>
                }
                {
                    structsEditorOpen && 
                    <div className="varaeditor__structs-editor">
                    
                    </div>
                }
                {
                    enumsEditorOpen && 
                    <div className="varaeditor__enums-editor">
                        {
                            Object.keys(enumsData).map((enumId, index) => {
                                return <VirtualContractEnum enumId={enumId} key={index}/>
                            })
                        }
                        <Button size={"small"} textSize={"large"} rounded={"rounded4"} width={"normal"} onClick={() => {
                            const newId = generatePassword();
                            console.log("Id generated: ", newId);
                            dispatch(addEnumToContract({ newEnumId: newId }));
                        }}>
                            Add Enum
                        </Button>
                    </div>
                }
            </div>
        </div>
    );
}