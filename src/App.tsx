import { DemoProvider } from './demo/store';
import { DemoSection } from './demo/DemoSection';
import { Header } from './site/Header';
import { Hero } from './site/Hero';
import { Problem } from './site/Problem';
import { Cycle } from './site/Cycle';
import { Rules } from './site/Rules';
import { Method } from './site/Method';
import { Federation } from './site/Federation';
import { Business } from './site/Business';
import { Finance } from './site/Finance';
import { Footer } from './site/Footer';

export function App() {
  return (
    <DemoProvider>
      <a className="skip" href="#demo">
        Saltar a la demo
      </a>
      <Header />
      <main>
        <Hero />
        <Problem />
        <Cycle />
        <Rules />
        <DemoSection />
        <Business />
        <Finance />
        <Federation />
        <Method />
      </main>
      <Footer />
    </DemoProvider>
  );
}
