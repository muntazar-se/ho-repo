import { Input } from 'antd';

export default function CurrencyInput({ value, onChange, placeholder, ...props }) {
  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    onChange?.(raw);
  };

  const displayValue = value ? `$${Number(value).toLocaleString()}` : '';

  return (
    <Input
      {...props}
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder || '$0'}
      onFocus={(e) => {
        if (e.target.value === '$0') {
          onChange?.('');
        }
      }}
    />
  );
}