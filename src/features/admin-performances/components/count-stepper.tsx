import './count-stepper.css'

type CountStepperProps = {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}

export function CountStepper({ label, value, min, max, onChange }: CountStepperProps) {
  return (
    <div className="count-stepper" role="group" aria-label={label}>
      <button
        className="count-stepper-button"
        type="button"
        aria-label={`${label} 줄이기`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <output className="count-stepper-value" aria-live="polite">{value}</output>
      <button
        className="count-stepper-button"
        type="button"
        aria-label={`${label} 늘리기`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  )
}
