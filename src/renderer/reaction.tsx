import { h, FunctionComponent } from "preact";
import { ChemicalStructure } from "./chemicals";

export function formatTemp(unit: string) {
  if (unit === "degC") {
    return "° C";
  } else {
    return "K";
  }
}

const ReactionItem: FunctionComponent<{ reactant: any }> = ({ reactant }) => {
  return (
    <tr>
      <td>{reactant.name}</td>
      <td>{reactant.mw || "–"}</td>
      <td>{reactant?.density ? reactant.density : "—"}</td>
      <td>{`${reactant.mass.value} ${reactant.mass.unit}`}</td>
      <td>
        {reactant?.volume
          ? `${reactant.volume.value} ${reactant.volume.unit}`
          : "—"}
      </td>
      <td>{`${reactant.moles.value} ${reactant.moles.unit}`}</td>
      <td>{reactant.ratio}</td>
      <td>{reactant.roles.join(", ")}</td>
      <td>{`${reactant.molarity.value} ${reactant.molarity.unit}`}</td>
      <td>{`${reactant.molality.value} ${reactant.molality.unit}`}</td>
      <td>{`${reactant.moles_vol.value} ${reactant.moles_vol.unit}`}</td>
    </tr>
  );
};

export const ReactionTable: FunctionComponent<{
  reaction: any;
  rxnName: any;
}> = ({ reaction, rxnName }) => {
  return (
    <table>
      <thead>
        <th>Name</th>
        <th>Mw</th>
        <th>Density</th>
        <th>Mass</th>
        <th>Volume</th>
        <th>Moles</th>
        <th>Ratio</th>
        <th>Roles</th>
        <th>Molarity</th>
        <th>Molality</th>
        <th>Mols/Vol</th>
      </thead>
      <tbody>
        {reaction?.reactants && reaction.reactants.length
          ? reaction.reactants.map((el: any, index: number) => {
              return (
                <ReactionItem
                  key={`reactant-${rxnName}-${el.name}-${index}`}
                  reactant={el}
                />
              );
            })
          : reaction?.components && reaction.components.length
          ? reaction.components.map((el: any, index: number) => {
              return (
                <ReactionItem
                  key={`component-${rxnName}-${el.name}-${index}`}
                  reactant={el}
                />
              );
            })
          : null}
      </tbody>
    </table>
  );
};

export const ReactionChemicals: FunctionComponent<{
  reaction: any;
  rxnName: any;
}> = ({ reaction, rxnName }) => {
  return (
    <div className="reaction-scheme">
      {reaction?.reactants && reaction.reactants.length
        ? reaction.reactants.map((el: any, index: number) => {
            if (el?.smiles) {
              return (
                <div className="reaction-item">
                  <ChemicalStructure
                    key={`reactant-${rxnName}-${el.name}-${index}`}
                    svgId={`reactant-structure-${rxnName}-${el.name}-${index}`}
                    smiles={el.smiles}
                  />
                  <small>{el.name}</small>
                </div>
              );
            } else {
              return null;
            }
          })
        : reaction?.components && reaction.components.length
        ? reaction.components.map((el: any, index: number) => {
            if (el?.smiles) {
              return (
                <div className="reaction-item">
                  <ChemicalStructure
                    key={`reactant-${rxnName}-${el.name}-${index}`}
                    svgId={`reactant-structure-${rxnName}-${el.name}-${index}`}
                    smiles={el.smiles}
                  />
                  <small>{el.name}</small>
                </div>
              );
            } else {
              return null;
            }
          })
        : null}
      {reaction?.products && reaction.products.length
        ? reaction.products.map((el: any, index: any) => {
            if (el?.smiles) {
              return (
                <div className="reaction-item">
                  <ChemicalStructure
                    key={`product-${el.name}-${index}`}
                    svgId={`product-structure-${el.name}-${index}`}
                    smiles={el.smiles}
                  />
                  <small>{el.name}</small>
                </div>
              );
            } else if (el?.components && el.components.length) {
              return (
                <div className="reaction-item">
                  {el.components.map((comp: any, compIdx: number) => {
                    if (comp?.smiles) {
                      return (
                        <div className="reaction-item">
                          <ChemicalStructure
                            key={`product-complex-${comp.name}-${index}-${compIdx}`}
                            svgId={`product-complex-component-${comp.name}-${index}-${compIdx}`}
                            smiles={comp.smiles}
                          />
                          <small>{comp.name}</small>
                        </div>
                      );
                    }
                  })}
                  <small>{el.name}</small>
                </div>
              );
            } else {
              return null;
            }
          })
        : null}
    </div>
  );
};

export const BatchReactionTableHeader: FunctionComponent<{ reaction: any }> = ({
  reaction,
}) => {
  return (
    <div>
      <h3>{reaction.name}</h3>
      {reaction?.temperature ? (
        <p>
          Temperature:{" "}
          {`${reaction.temperature.value} ${formatTemp(
            reaction.temperature.unit
          )}`}
        </p>
      ) : null}
      {reaction?.volume ? (
        <p>Volume: {`${reaction.volume.value} ${reaction.volume.unit}`}</p>
      ) : null}
      <ReactionChemicals reaction={reaction} rxnName={reaction.name} />
    </div>
  );
};

export const Reaction: FunctionComponent<{ reaction: any }> = ({
  reaction,
}) => {
  return (
    <div>
      <BatchReactionTableHeader reaction={reaction} />
      <ReactionTable reaction={reaction} rxnName={reaction.name} />
    </div>
  );
};
