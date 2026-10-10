import { DemoProvider } from './demo/store';
import { DemoSection } from './demo/DemoSection';
import { Header } from './site/Header';
import { Hero } from './site/Hero';
import { Problem } from './site/Problem';
import { Cycle } from './site/Cycle';
import { Rules } from './site/Rules';
import { Method } from './site/Method';
import { Federation } from './site/Federation';
import { Team } from './site/Team';
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
        <Method />
        <Federation />
        <Team />
      </main>
      <Footer />
    </DemoProvider>
  );
}
