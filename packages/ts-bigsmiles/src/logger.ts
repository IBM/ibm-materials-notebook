import { createLogger, transports, format, addColors } from "winston";

export const LEVELS = {
  error: 0,
  warn: 1,
  info: 2, //major processes called
  notice: 3, //events being fired
  verbose: 4, //execution start/stop with variables called
  debug: 5, //state of variables within execution
  silly: 6, //no state
};

export const COLORS = {
  error: "bold red",
  warn: "dim red",
  info: "italic yellow",
  notice: "black magentaBG",
  debug: "underline blue",
  verbose: "bold green",
  silly: "red cyanBG",
};

addColors(COLORS);

export const logger = createLogger({
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
        format.prettyPrint(),
        format.printf(({ timestamp, level, message, service, meta }) => {
          let metaData = "";
          if (meta) {
            metaData = `:\n${JSON.stringify(meta, null, 2)}`;
          }

          return `[${timestamp}]-${service}-${level}: ${message}${metaData}`;
        })
      ),
    }),
  ],
  defaultMeta: {
    service: "TS-BIG-SMILES",
  },
  levels: LEVELS,
  level: "info",
});
