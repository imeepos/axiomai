import { InjectionToken } from "tsyringe";

export const ApplicationInit: InjectionToken<
  () => Promise<void>
> = `ApplicationInit`;

export const WORKSPACE_ROOT: InjectionToken<string> = `WORKSPACE_ROOT`;
