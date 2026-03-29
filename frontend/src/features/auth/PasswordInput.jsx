import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import { IconButton, Input } from '../../components/ui/index.js';

export default function PasswordInput(props) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      startIcon={LockKeyhole}
      type={visible ? 'text' : 'password'}
      endAdornment={
        <IconButton
          label={visible ? 'Hide password' : 'Show password'}
          size="sm"
          variant="ghost"
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </IconButton>
      }
    />
  );
}
