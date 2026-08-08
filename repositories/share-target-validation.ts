import type { ShareTarget } from "../models/user-models";
import { VISIBILITY_SCOPE } from "../models/user-models";

export function validateShareTarget(
  target: Pick<
    ShareTarget,
    "familyId" | "visibility" | "sharedWithUserIds"
  >,
): void {
  if (
    target.visibility === VISIBILITY_SCOPE.PRIVATE &&
    target.sharedWithUserIds.length > 0
  ) {
    throw new Error("Private sharing cannot include selected members.");
  }

  if (target.visibility === VISIBILITY_SCOPE.FAMILY) {
    if (!target.familyId) {
      throw new Error("Family sharing requires a familyId.");
    }

    if (target.sharedWithUserIds.length > 0) {
      throw new Error("Family sharing cannot include selected members.");
    }
  }

  if (target.visibility === VISIBILITY_SCOPE.MEMBERS) {
    if (!target.familyId) {
      throw new Error("Selected-member sharing requires a familyId.");
    }

    if (target.sharedWithUserIds.length === 0) {
      throw new Error("Selected-member sharing requires at least one member.");
    }
  }
}
