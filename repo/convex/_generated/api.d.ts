/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as brandProfiles from "../brandProfiles.js";
import type * as creatorProfiles from "../creatorProfiles.js";
import type * as creators from "../creators.js";
import type * as lib_config from "../lib/config.js";
import type * as lib_r2 from "../lib/r2.js";
import type * as lib_roles from "../lib/roles.js";
import type * as lib_validation from "../lib/validation.js";
import type * as r2Check from "../r2Check.js";
import type * as sampleActions from "../sampleActions.js";
import type * as samples from "../samples.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  brandProfiles: typeof brandProfiles;
  creatorProfiles: typeof creatorProfiles;
  creators: typeof creators;
  "lib/config": typeof lib_config;
  "lib/r2": typeof lib_r2;
  "lib/roles": typeof lib_roles;
  "lib/validation": typeof lib_validation;
  r2Check: typeof r2Check;
  sampleActions: typeof sampleActions;
  samples: typeof samples;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  auth: import("@convex-dev/auth/_generated/component.js").ComponentApi<"auth">;
  authPassword: import("@convex-dev/auth/components/password/_generated/component.js").ComponentApi<"authPassword">;
  authUsername: import("@convex-dev/auth/components/username/_generated/component.js").ComponentApi<"authUsername">;
};
