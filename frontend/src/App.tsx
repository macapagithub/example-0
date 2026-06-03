import { WaitlistFooter } from "./components/WaitlistFooter";
import { WaitlistForm } from "./components/WaitlistForm";
import { WaitlistHeader } from "./components/WaitlistHeader";
import { WaitlistHero } from "./components/WaitlistHero";
import "./App.css";

function App() {
  return (
    <div className="waitlist-app">
      <div className="waitlist-app__shell">
        <WaitlistHeader />
        <main className="waitlist-app__main">
          <WaitlistHero />
          <WaitlistForm />
        </main>
        <WaitlistFooter />
      </div>
    </div>
  );
}

export default App;
