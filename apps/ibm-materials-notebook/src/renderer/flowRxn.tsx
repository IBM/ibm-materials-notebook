import { h, FunctionComponent } from "preact";
import { ReactionTable, ReactionChemicals } from "./reaction";
import { ChemicalStructure } from "./chemicals";
import { StructureTheme } from ".";

export const FlowRun: FunctionComponent<{ run: any }> = ({ run }) => {
  return (
    <StructureTheme.Consumer>
      {(theme) => {
        return (
          <div>
            <h3>{run.name}</h3>
            <h4>Products:</h4>
            {run?.products && run.products.length
              ? run.products.map((el: any, index: any) => {
                  return (
                    <div className="reaction-item">
                      <ChemicalStructure
                        key={`product-${el.name}-${index}`}
                        svgId={`product-structure-${el.name}-${index}`}
                        smiles={el.smiles}
                        theme={theme}
                      />
                      <small>{el.name}</small>
                    </div>
                  );
                })
              : null}
            {run.reactions.map((el: any, index: number) => {
              return (
                <ReactorReaction
                  key={`reactor-${el.name}-${run.name}-${index}`}
                  reaction={el}
                />
              );
            })}
          </div>
        );
      }}
    </StructureTheme.Consumer>
  );
};

const ReactorReaction: FunctionComponent<{ reaction: any }> = ({
  reaction,
}) => {
  return (
    <div>
      <h4>{reaction.name}</h4>
      <p>Flow Rate: {`${reaction.flowRate.value} ${reaction.flowRate.unit}`}</p>
      <p>Volume: {`${reaction.volume.value} ${reaction.volume.unit}`}</p>
      <p>
        Residence Time:{" "}
        {`${reaction.residenceTime.value} ${reaction.residenceTime.unit}`}
      </p>
      <ReactionChemicals reaction={reaction} rxnName={reaction.name} />
      <ReactionTable reaction={reaction} rxnName={reaction.name} />
    </div>
  );
};

export const Solution: FunctionComponent<{ solution: any }> = ({
  solution,
}) => {
  return (
    <div>
      <h3>{solution.name}</h3>
      <ReactionChemicals reaction={solution} rxnName={solution.name} />
      <ReactionTable reaction={solution} rxnName={solution.name} />
    </div>
  );
};
