import "./DeleteButton.scss";


interface DeleteButtonProps {
    rounded?: boolean,
    onClickHandler: () => void
}

export function DeleteButton({onClickHandler, rounded = false}: DeleteButtonProps) {
    return (
        <button
            className="deletebutton"
            onClick={onClickHandler}
        >
            X
        </button>
    );
}