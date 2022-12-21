import { h, render, FunctionComponent } from "preact";
import type { ActivationFunction } from "vscode-notebook-renderer";
import { ChemicalRef, ComplexRef, PolymerlRef } from "./chemicals";
import { Reaction } from "./reaction";
import { Solution } from "./flowRxn";
import { FlowRun } from "./flowRxn";
import { Sample } from "./sample";
import "./style.css";

const App: FunctionComponent<{ data: any[] }> = ({ data }: { data: any[] }) => {
  const chemicals = data.filter(
    (el) =>
      el.type === "chemical" ||
      el.type === "fragment" ||
      el.type === "polymer" ||
      el.type === "complex"
  );

  return (
    <div>
      {chemicals.length ? (
        <div className="display-main">
          {chemicals.map((item: any, index: number) => {
            if (item.type === "chemical" || item.type === "fragment") {
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
        {data.map((item: any, index: number) => {
          if (item.type === "reaction") {
            return <Reaction key={`reaction-${index}`} reaction={item} />;
          } else if (item.type === "flow_reaction") {
            return <FlowRun key={`flow-run-${index}`} run={item} />;
          } else if (item.type === "solution") {
            return <Solution key={`solution-${index}`} solution={item} />;
          } else if (item.type === "sample") {
            return <Sample key={`sample-${index}`} sample={item} />;
          } else {
            return <div></div>;
          }
        })}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------
// This is the entrypoint to the notebook renderer's webview client-side code.
// This contains some boilerplate that calls the `render()` function when new
// output is available. You probably don't need to change this code; put your
// rendering logic inside of the `render()` function.
// ----------------------------------------------------------------------------

export const activate: ActivationFunction = (context) => {
  return {
    renderOutputItem(data, element) {
      render(<App data={data.json()} />, element);
    },
  };
};
