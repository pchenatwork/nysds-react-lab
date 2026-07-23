import {
  NysSkipnav,
  NysUnavHeader,
  NysGlobalHeader,
  NysGlobalFooter,
  NysUnavFooter,
  NysBacktotop,
  NysTabgroup,
  NysTab,
  NysTabpanel,
} from "@nysds/components/react";

import FacilitiesTablePanel from "./features/facilities/FacilitiesTablePanel";
import A11yLabelDemoPanel from "./features/a11y-demo/A11yLabelDemoPanel";
import ThemePicker from "./features/theme/ThemePicker";
import "./App.css";

function App() {
  return (
    <>
      <NysSkipnav />
      <NysUnavHeader />
      <NysGlobalHeader
        appName="Recreation & Environment — Facilities Finder (Application Name)"
        agencyName="NYS Office of Recreation & Environment (Agency Name)"
      />

      <main id="main-content" className="nys-flex-1">
        <div className="main-content">
          <div className="theme-picker-row">
            <ThemePicker />
          </div>

          <NysTabgroup name="ORE demos">
            <NysTab label="Paginated Table Demo" />
            <NysTab label="Accessibility: Cross-Shadow Labels" />

            <NysTabpanel>
              <FacilitiesTablePanel />
            </NysTabpanel>
            <NysTabpanel>
              <A11yLabelDemoPanel />
            </NysTabpanel>
          </NysTabgroup>
        </div>
      </main>

      <NysGlobalFooter agencyName="NYS Office of Recreation & Environment">
        <ul>
          <li>
            <a href="https://ny.gov">NY.gov</a>
          </li>
          <li>
            <a href="https://designsystem.ny.gov">NYSDS</a>
          </li>
        </ul>
      </NysGlobalFooter>
      <NysUnavFooter />
      <NysBacktotop />
    </>
  );
}

export default App;
