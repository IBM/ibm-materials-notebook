import { loggers, transports, format } from "winston";
import { LEVELS } from "../../logger";

const CMDL_LOGGER = "CMDL";

loggers.add(CMDL_LOGGER, {
  level: "silly",
  defaultMeta: {
    service: CMDL_LOGGER,
  },
  transports: [new transports.Console()],
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
  levels: LEVELS,
});

export const cmdlLogger = loggers.get(CMDL_LOGGER);
