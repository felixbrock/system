import {Warning} from "../value-types/warning";

export interface WarningDto {
  selectorId: string;
  createdOn: number;
};

export const buildWarningDto = (warning: Warning): WarningDto => ({
  createdOn: warning.createdOn,
  selectorId: warning.selectorId
});