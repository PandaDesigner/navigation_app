import { FAMILY_MEMBER_ROLE, VISIBILITY_SCOPE } from "@/models/user-models";
import { describe, expect, it } from "@jest/globals";

describe("user domain constants", () => {
  it("defines the supported family roles", () => {
    expect(FAMILY_MEMBER_ROLE).toEqual({
      OWNER: "owner",
      ADMIN: "admin",
      MEMBER: "member",
    });
  });

  it("keeps the three visibility scopes distinct", () => {
    expect(Object.values(VISIBILITY_SCOPE)).toEqual([
      "private",
      "family",
      "members",
    ]);
  });
});
