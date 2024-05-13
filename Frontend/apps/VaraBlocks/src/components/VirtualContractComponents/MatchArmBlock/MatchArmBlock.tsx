interface Props {
    matchArmBlockId: string
}

export function MatchArmBlock({ matchArmBlockId }: Props) {
    const matchArmData = matchArmBlockId.split(' ');

    return (
        <p>{matchArmData[2]}::{matchArmData[3]} ={'>'}</p>
    )
}
