import {Warning} from "../value-types/warning";

export interface WarningDto {
  createdOn: number;
};

export const buildWarningDto = (warning: Warning): WarningDto => ({
  createdOn: warning.createdOn,
});