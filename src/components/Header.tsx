import MonthSelector from './MonthSelector';

interface Props {
  months: string[];
  activeMonth: string;
  onChange: (m: string) => void;
}

export default function Header({ months, activeMonth, onChange }: Props) {
  return (
    <header className="header">
      <div>
        <h1 className="header-title">
          Dashboard Financeiro
        </h1>
      </div>
      <MonthSelector months={months} activeMonth={activeMonth} onChange={onChange} />
    </header>
  );
}
