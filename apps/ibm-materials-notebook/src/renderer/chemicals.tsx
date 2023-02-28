import { h, FunctionComponent } from "preact";
import { useEffect } from "preact/hooks";
import { renderSMILES } from "./utils";

export const ChemicalStructure: FunctionComponent<{
  svgId: string;
  smiles: string;
}> = ({ svgId, smiles }) => {
  useEffect(() => {
    renderSMILES(smiles, svgId);
  }, [svgId, smiles]);

  return <svg id={svgId} width={150} height={150} />;
};

export const ChemicalRef: FunctionComponent<{
  chemical: any;
  index: number;
}> = ({ chemical, index }) => {
  return (
    <div className="reaction-item">
      <h3>{chemical.name}</h3>
      <i>
        Molecular Weight:{" "}
        {`${chemical.molecular_weight.value} ${chemical.molecular_weight.unit}`}
      </i>
      {chemical?.density ? (
        <i>Density: {`${chemical.density.value} ${chemical.density.unit}`}</i>
      ) : null}
      <ChemicalStructure
        svgId={`${chemical.name}-${index}-${chemical.smiles}`}
        smiles={chemical.smiles}
      />
    </div>
  );
};

export const ComplexRef: FunctionComponent<{
  complex: any;
  index: number;
}> = ({ complex, index }) => {
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
            />
          );
        })}
    </div>
  );
};

export const PolymerlRef: FunctionComponent<{
  polymer: any;
  index: number;
}> = ({ polymer, index }) => {
  return (
    <div className="reaction-item">
      <h3>{polymer.name}</h3>
      <ChemicalStructure
        svgId={`${polymer.name}-${index}-${polymer.smiles}`}
        smiles={polymer.smiles}
      />
    </div>
  );
};
