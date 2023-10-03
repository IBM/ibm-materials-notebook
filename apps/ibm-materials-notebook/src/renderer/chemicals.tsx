import { h, FunctionComponent } from "preact";
import { useEffect } from "preact/hooks";
import { renderSMILES } from "./utils";
import { StructureTheme } from ".";

export const ChemicalStructure: FunctionComponent<{
  svgId: string;
  smiles: string;
  theme: "light" | "dark";
}> = ({ svgId, smiles, theme }) => {
  useEffect(() => {
    renderSMILES(smiles, svgId, theme);
  }, [svgId, smiles, theme]);

  return <svg id={svgId} width={150} height={150} />;
};

export const ChemicalRef: FunctionComponent<{
  chemical: any;
  index: number;
}> = ({ chemical, index }) => {
  return (
    <StructureTheme.Consumer>
      {(theme) => {
        return (
          <div className="reaction-item">
            <ChemicalStructure
              svgId={`${chemical.name}-${index}-${chemical.smiles}`}
              smiles={chemical.smiles}
              theme={theme}
            />
            <h4>{chemical.name}</h4>
          </div>
        );
      }}
    </StructureTheme.Consumer>
  );
};

export const ComplexRef: FunctionComponent<{
  complex: any;
  index: number;
}> = ({ complex, index }) => {
  return (
    <StructureTheme.Consumer>
      {(theme) => {
        return (
          <div className="reaction-item">
            <h3>{complex.name}</h3>
            {complex?.components &&
              complex.components.map((el: any, indx: any) => {
                return (
                  <ChemicalStructure
                    key={`complex-${complex.name}-${el.name}-${index}-${indx}`}
                    svgId={`complex-${complex.name}-${el.name}-${index}-${el.smiles}-${indx}`}
                    smiles={el.smiles}
                    theme={theme}
                  />
                );
              })}
          </div>
        );
      }}
    </StructureTheme.Consumer>
  );
};

export const PolymerlRef: FunctionComponent<{
  polymer: any;
  index: number;
}> = ({ polymer, index }) => {
  return (
    <StructureTheme.Consumer>
      {(theme) => {
        return (
          <div className="reaction-item">
            <ChemicalStructure
              svgId={`${polymer.name}-${index}-${polymer.smiles}`}
              smiles={polymer.smiles}
              theme={theme}
            />
            <h4>{polymer.name}</h4>
          </div>
        );
      }}
    </StructureTheme.Consumer>
  );
};
