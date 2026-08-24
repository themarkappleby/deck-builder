import { formatLevelLines } from '../abilityActions';

function AbilityLines({ level }) {
  return formatLevelLines(level).map((line, index) => (
    <p key={index}>{line}</p>
  ));
}

export default AbilityLines;
