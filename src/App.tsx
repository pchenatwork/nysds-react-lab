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

import PaginatedTableDemoPanel from "./features/paginated-table-demo/PaginatedTableDemoPanel";
import RegistrationFormDemoPanel from "./features/registration-form-demo/RegistrationFormDemoPanel";
import ThemePicker from "./features/theme/ThemePicker";
import "./App.css";

function App() {
  return (
    <>
      <NysSkipnav />
      <NysUnavHeader />
      <NysGlobalHeader
        appName="NYSDS React Lab (Application Name)"
        agencyName="NYS Office of Something (Agency Name)"
      />

      <main id="main-content" className="nys-flex-1">
        <div className="main-content">
          <div className="theme-picker-row">
            <ThemePicker />
          </div>

          <NysTabgroup name="ORE demos">
            <NysTab label="Paginated Table Demo" />
            <NysTab label="Form Controls Demo" />

            <NysTabpanel>
              <PaginatedTableDemoPanel />
            </NysTabpanel>
            <NysTabpanel>
              <RegistrationFormDemoPanel />
            </NysTabpanel>
          </NysTabgroup>
        </div>
      </main>

      <NysGlobalFooter agencyName="NYS Office of Something (Agency Name)">
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
