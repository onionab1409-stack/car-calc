import { TelegramProvider } from '@/components/TelegramProvider';
import { Calculator } from '@/components/Calculator';

export default function Home() {
  return (
    <TelegramProvider>
      <Calculator />
    </TelegramProvider>
  );
}
