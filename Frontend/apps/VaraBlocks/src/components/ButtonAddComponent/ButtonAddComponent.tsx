import "./ButtonAddComponent.scss";

interface ButtonAddComponentProps {
    
    onClickHandle: () => void,
    buttonText?: string,
    removeSymbol?: boolean
}

export function ButtonAddComponent({ onClickHandle, buttonText = "", removeSymbol = false }: ButtonAddComponentProps) {
    return (
        <button 
            className="buttonaddcomponent"
            onClick={onClickHandle}
        >
            {
                !removeSymbol &&
                <span
                    className=""
                >
                    +
                </span>
            }
        </button>
    );
}