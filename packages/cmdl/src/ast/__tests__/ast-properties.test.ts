import {
  CMDLBoolProp,
  CMDLListProp,
  CMDLNumProp,
  CMDLRefProp,
  CMDLAssignProp,
  CMDLRefListProp,
  CMDLEdgeProp,
} from "../properties";
import { CMDLReference } from "../collections";
import { CMDLToken } from "../../cmdl-cst-visitor";

describe("Unit tests for AST property node classes", () => {
  describe("CMDLRefProp", () => {
    it("initializes correctly from a series of tokens with no path", () => {});
    it("initializes correctly from a series of tokens with a path", () => {});
  });

  describe("CMDLListProp", () => {
    it("initializes correctly from a series of tokens with no path", () => {});
  });

  describe("CMDLNumProp", () => {
    it("initializes correctly from a unitless numerical value", () => {});
    it("initializes correctly from a unitless numerical value with uncertainty", () => {});
    it("initializes correctly from a numerical value with units and uncertainty", () => {});
  });

  describe("CMDLBoolProp", () => {
    it("initializes correctly", () => {});
  });

  describe("CMDLStrProp", () => {
    it("initializes correctly", () => {});
  });

  describe("CMDLAssignProp", () => {
    it("initializes correctly", () => {});
  });

  describe("CMDLEdgeProp", () => {
    it("initializes correctly", () => {});
  });

  describe("CMDLRefListProp", () => {
    it("initializes correctly", () => {});
  });
});
