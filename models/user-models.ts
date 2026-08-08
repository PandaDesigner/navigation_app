export const FAMILY_MEMBER_ROLE = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
} as const;

export type FamilyMemberRole =
  (typeof FAMILY_MEMBER_ROLE)[keyof typeof FAMILY_MEMBER_ROLE];

export const VISIBILITY_SCOPE = {
  PRIVATE: "private",
  FAMILY: "family",
  MEMBERS: "members",
} as const;

export type VisibilityScope =
  (typeof VISIBILITY_SCOPE)[keyof typeof VISIBILITY_SCOPE];

export interface UserProfile {
  id: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Family {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMembership {
  familyId: string;
  userId: string;
  role: FamilyMemberRole;
  createdAt: string;
  updatedAt: string;
}

export interface ShareTarget {
  ownerId: string;
  familyId: string | null;
  visibility: VisibilityScope;
  sharedWithUserIds: readonly string[];
}
