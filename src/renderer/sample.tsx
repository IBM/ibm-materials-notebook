import { h, FunctionComponent } from "preact";
import { ChemicalStructure } from "./chemicals";

function formatName(name: string) {
  return name.split(".").slice(1).join(".");
}

const Property: FunctionComponent<{ name: string; values: any }> = ({
  name,
  values,
}) => {
  const { unit, value, technique } = values;
  return <li>{`${name} (${technique}): ${value} ${unit ? unit : ""}`}</li>;
};

const PolymerTree: FunctionComponent<{
  tree: any;
  conn: any[];
  sampleId: string;
}> = ({ tree, conn, sampleId }) => {
  const connections = conn.concat(tree.connections);
  return (
    <div className="polymer-tree">
      {tree?.children
        ? tree.children.map((child: any, index: number) => {
            if ("smiles" in child) {
              const childConn = connections.filter((el: any) => {
                const sourceName = el.source.slice(0, -2);
                return sourceName === child.name;
              });
              return (
                <PolymerTreeNode
                  node={child}
                  conn={childConn}
                  index={index}
                  sampleId={sampleId}
                />
              );
            } else {
              return (
                <PolymerTree
                  tree={child}
                  conn={tree.connections}
                  sampleId={sampleId}
                />
              );
            }
          })
        : null}
    </div>
  );
};

const PolymerTreeNode: FunctionComponent<{
  node: any;
  conn: any[];
  sampleId: string;
  index: number;
}> = ({ node, conn, sampleId, index }) => {
  const name = formatName(node.name);
  return (
    <div className="polymer-tree-node">
      <div className="polymer-node-header">
        <h5>{name}</h5>
        <small>
          DP<sub>n</sub>: {node?.degree_poly ? node.degree_poly.value : 1}
        </small>
      </div>
      <ChemicalStructure
        smiles={node.smiles}
        svgId={`tree-node-${index}-${node.name}-${sampleId}`}
      />
      {conn.length
        ? conn.map((el) => {
            const targetName = formatName(el.target);
            const sourcePoint = el.source.slice(-1);
            return (
              <div className="connection">
                <h6>Connection</h6>
                <small>
                  source point: <strong>{sourcePoint}</strong>
                </small>
                <small>target: {targetName}</small>
                <small>weight: {el.weight}</small>
                <small>qty: {el.quantity}</small>
              </div>
            );
          })
        : null}
    </div>
  );
};

const PolymerResult: FunctionComponent<{ result: any }> = ({ result }) => {
  return (
    <li>
      <h3>{result.name}</h3>
      <PolymerTree tree={result.tree} conn={[]} sampleId={result.sampleId} />
      <ul>
        {result?.mn_avg
          ? result.mn_avg.map((el: any, index: number) => {
              return (
                <Property
                  name={"Mn (avg)"}
                  values={el}
                  key={`${el.name}-prop-${index}`}
                />
              );
            })
          : null}
        {result?.mw_avg
          ? result.mw_avg.map((el: any, index: number) => {
              return (
                <Property
                  name="Mw (avg)"
                  values={el}
                  key={`${el.name}-prop-${index}`}
                />
              );
            })
          : null}
        {result?.dispersity
          ? result.dispersity.map((el: any, index: number) => {
              return (
                <Property
                  name="Dispersity"
                  values={el}
                  key={`${el.name}-prop-${index}`}
                />
              );
            })
          : null}
      </ul>
    </li>
  );
};

const ChemicalResult: FunctionComponent<{ result: any }> = ({ result }) => {
  return (
    <li>
      <h3>{result.name}</h3>
      <ChemicalStructure
        smiles={result.smiles}
        svgId={`result-${result.name}-${result.sampleId}`}
      />
      <ul>
        {result?.conversion
          ? result.conversion.map((el: any, index: number) => {
              return (
                <Property
                  name="conversion"
                  values={el}
                  key={`${el.name}-prop-${index}`}
                />
              );
            })
          : null}
        {result?.yield
          ? result.yield.map((el: any, index: number) => {
              return (
                <Property
                  name="yield"
                  values={el}
                  key={`${el.name}-prop-${index}`}
                />
              );
            })
          : null}
      </ul>
    </li>
  );
};

const ComplexResult: FunctionComponent<{ result: any }> = ({ result }) => {
  return (
    <div>
      <h3>{result.name}</h3>
      <h4>Components</h4>
      {result?.components && result.components.length
        ? result.components.map((el: any, index: number) => {
            if (el.type === "polymer") {
              return (
                <PolymerResult
                  key={`result-${result.name}-${index}`}
                  result={el}
                />
              );
            } else if (el.type === "chemical") {
              return (
                <ChemicalResult
                  key={`result-${result.name}-${index}`}
                  result={el}
                />
              );
            }
          })
        : null}
      <ul>
        {Object.entries(result).map(([key, values]) => {
          if (
            key !== "components" &&
            key !== "name" &&
            key !== "type" &&
            key !== "sampleId" &&
            Array.isArray(values)
          ) {
            return values.map((value: any, index: number) => {
              return (
                <Property
                  name={key}
                  values={value}
                  key={`${key}-prop-${index}`}
                />
              );
            });
          }
        })}
      </ul>
    </div>
  );
};

export const Sample: FunctionComponent<{ sample: any }> = ({ sample }) => {
  return (
    <div>
      <h3>{sample.name}</h3>
      <ul>
        {sample.results.length
          ? sample.results.map((el: any, index: number) => {
              if (el.type === "polymer") {
                return (
                  <PolymerResult
                    key={`result-${sample.name}-${index}`}
                    result={el}
                  />
                );
              } else if (el.type === "chemical") {
                return (
                  <ChemicalResult
                    key={`result-${sample.name}-${index}`}
                    result={el}
                  />
                );
              } else if (el.type === "complex") {
                return (
                  <ComplexResult
                    key={`result-${sample.name}-${index}`}
                    result={el}
                  />
                );
              } else {
                return null;
              }
            })
          : null}
      </ul>
    </div>
  );
};
