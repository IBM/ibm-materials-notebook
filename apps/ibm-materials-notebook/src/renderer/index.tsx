import { h, render, FunctionComponent, createContext } from "preact";
import type { ActivationFunction } from "vscode-notebook-renderer";
import { ChemicalRef, ComplexRef, PolymerlRef } from "./chemicals";
import { Reaction } from "./reaction";
import { Solution } from "./flowRxn";
import { FlowRun } from "./flowRxn";
import { CharData } from "./sample";
import "./style.css";
import { CellRenderOutput } from "@ibm-materials/cmdl";

/**
 * TODO: update render method
 */

export const StructureTheme = createContext<"light" | "dark">("dark");

const App: FunctionComponent<{
  data: CellRenderOutput;
  theme: "light" | "dark";
}> = ({ data, theme }: { data: CellRenderOutput; theme: "light" | "dark" }) => {
  const { chemicals, reactions, charData, solutions, flowReactions } = data;

  return (
    <StructureTheme.Provider value={theme}>
      <div>
        {chemicals.length ? (
          <div className="display-main">
            {chemicals.map((item: any, index: number) => {
              if (item.type === "chemical") {
                return (
                  <ChemicalRef
                    key={`${item.name}-${index}`}
                    chemical={item}
                    index={index}
                  />
                );
              } else if (item.type === "polymer") {
                return (
                  <PolymerlRef
                    key={`${item.name}-${index}`}
                    polymer={item}
                    index={index}
                  />
                );
              } else if (item.type === "complex") {
                return (
                  <ComplexRef
                    key={`${item.name}-${index}`}
                    complex={item}
                    index={index}
                  />
                );
              } else {
                return null;
              }
            })}
          </div>
        ) : null}
        <div>
          {reactions.length
            ? reactions.map((item, index) => (
                <Reaction key={`reaction-${index}`} reaction={item} />
              ))
            : null}
          {solutions.length
            ? solutions.map((item, index) => {
                return <Solution key={`solution-${index}`} solution={item} />;
              })
            : null}
          {flowReactions.map((item, index) => {
            return <FlowRun key={`flow-run-${index}`} run={item} />;
          })}
          {charData.length
            ? charData.map((item, index) => (
                <CharData key={`charaData-${index}`} charData={item} />
              ))
            : null}
        </div>
      </div>
    </StructureTheme.Provider>
  );
};

// ----------------------------------------------------------------------------
// This is the entrypoint to the notebook renderer's webview client-side code.
// This contains some boilerplate that calls the `render()` function when new
// output is available. You probably don't need to change this code; put your
// rendering logic inside of the `render()` function.
// ----------------------------------------------------------------------------

export const activate: ActivationFunction = () => {
  return {
    renderOutputItem(data, element) {
      const output = data.json();
      render(
        <App data={output.cellOutput} theme={output.structureTheme} />,
        element
      );
    },
  };
};
