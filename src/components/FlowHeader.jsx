import { useNavigate } from "react-router-dom";
import "./FlowHeader.css";

export default function FlowHeader({ title, step, totalSteps, onBack }) {
  const navigate = useNavigate();

  return (
    <header className="flow-header">
      <button
        type="button"
        className="flow-header__back"
        aria-label="Go back"
        onClick={() => (onBack ? onBack() : navigate(-1))}
      >
        ←
      </button>
      <div className="flow-header__titles">
        <h1 className="flow-header__title">{title}</h1>
        {step && totalSteps && (
          <span className="flow-header__step mono">
            Step {step} of {totalSteps}
          </span>
        )}
      </div>
      {step && totalSteps && (
        <div className="flow-header__progress">
          <div
            className="flow-header__progress-fill"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      )}
    </header>
  );
}
