import AbilityLines from './AbilityLines';

function SelectionStep({ title, options, selected, onSelect }) {
  return (
    <div className="selection-section">
      <h2>{title}</h2>
      <div className="card-grid">
        {options.map((option, index) => (
          <div
            key={index}
            className={`selection-card ${selected === option ? 'selected' : ''}`}
            onClick={() => onSelect(option)}
          >
            <h3>{option.name}</h3>
            <div className="card-level">
              <strong>Level 1:</strong>
              <AbilityLines level={option.level1} />
            </div>
            <div className="card-level">
              <strong>Level 2:</strong>
              <AbilityLines level={option.level2} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SelectionStep;
