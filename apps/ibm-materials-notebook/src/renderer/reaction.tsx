import { h, FunctionComponent } from "preact";
// import { ChemicalStructure } from "./chemicals";
// import { StructureTheme } from ".";
import { TYPES } from "@ibm-materials/cmdl-types";

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

// const ReactionStructureItem: FunctionComponent<{
//   rxnName: string;
//   name: string;
//   index: number;
//   smiles: string;
//   type: "reactant" | "product";
// }> = ({ rxnName, name, index, smiles, type }) => {
//   return (
//     <StructureTheme.Consumer>
//       {(theme) => {
//         return (
//           <div className="reaction-item">
//             <ChemicalStructure
//               svgId={`${type}-structure-${rxnName}-${name}-${index}`}
//               smiles={smiles}
//               theme={theme}
//             />
//             <small>{name}</small>
//           </div>
//         );
//       }}
//     </StructureTheme.Consumer>
//   );
// };

// export const ReactionChemicals: FunctionComponent<{
//   reaction: any;
//   rxnName: any;
// }> = ({ reaction, rxnName }) => {
//   return (
//     <div className="reaction-scheme">
//       {reaction?.reactants && reaction.reactants.length
//         ? reaction.reactants.map((el: any, index: number) => {
//             if (el?.smiles) {
//               return (
//                 <ReactionStructureItem
//                   key={`reactant-${rxnName}-${el.name}-${index}`}
//                   smiles={el.smiles}
//                   name={el.name}
//                   rxnName={rxnName}
//                   index={index}
//                   type="reactant"
//                 />
//               );
//             } else {
//               return null;
//             }
//           })
//         : reaction?.components && reaction.components.length
//         ? reaction.components.map((el: any, index: number) => {
//             if (el?.smiles) {
//               return (
//                 <ReactionStructureItem
//                   key={`reactant-${rxnName}-${el.name}-${index}`}
//                   smiles={el.smiles}
//                   name={el.name}
//                   rxnName={rxnName}
//                   index={index}
//                   type="reactant"
//                 />
//               );
//             } else {
//               return null;
//             }
//           })
//         : null}
//       {reaction?.products && reaction.products.length
//         ? reaction.products.map((el: any, index: any) => {
//             if (el?.smiles) {
//               return (
//                 <ReactionStructureItem
//                   key={`reactant-${rxnName}-${el.name}-${index}`}
//                   smiles={el.smiles}
//                   name={el.name}
//                   rxnName={rxnName}
//                   index={index}
//                   type="product"
//                 />
//               );
//             } else if (el?.components && el.components.length) {
//               return (
//                 <div className="reaction-item">
//                   {el.components.map((comp: any, compIdx: number) => {
//                     if (comp?.smiles) {
//                       return (
//                         <ReactionStructureItem
//                           key={`reactant-${rxnName}-${el.name}-${index}`}
//                           smiles={el.smiles}
//                           name={el.name}
//                           rxnName={rxnName}
//                           index={index}
//                           type="product"
//                         />
//                       );
//                     }
//                   })}
//                   <small>{el.name}</small>
//                 </div>
//               );
//             } else {
//               return null;
//             }
//           })
//         : null}
//     </div>
//   );
// };

export const BatchReactionTableHeader: FunctionComponent<{
  reaction: TYPES.Reaction;
}> = ({ reaction }) => {
  return (
    <div>
      <h3>{reaction.name}</h3>
      {reaction?.reaction_time ? (
        <p>
          Time:{" "}
          {`${reaction.reaction_time.value} ${reaction.reaction_time.unit}`}
        </p>
      ) : null}
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
      {/* <ReactionChemicals reaction={reaction} rxnName={reaction.name} /> */}
    </div>
  );
};

export const Reaction: FunctionComponent<{ reaction: TYPES.Reaction }> = ({
  reaction,
}) => {
  return (
    <div>
      <BatchReactionTableHeader reaction={reaction} />
      <ReactionTable reaction={reaction} rxnName={reaction.name} />
      {reaction.protocol ? <p>{reaction.protocol}</p> : null}
    </div>
  );
};
